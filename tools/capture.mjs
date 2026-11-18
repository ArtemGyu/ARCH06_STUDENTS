import { chromium } from '@playwright/test';
import { writeFile, mkdir } from 'node:fs/promises';
import { spawn, execFileSync } from 'node:child_process';
import { cases, widths, runCase } from './scenarios.mjs';
const phase=process.argv[2]||'after';
const server=spawn(process.execPath,['server.mjs'],{stdio:'ignore'});
try {
for(let n=0;n<60;n++){try{if((await fetch('http://127.0.0.1:5173')).ok)break;}catch{}await new Promise(r=>setTimeout(r,100));}
const browser=await chromium.launch({channel:process.env.PLAYWRIGHT_CHANNEL||'chrome'});
const page=await browser.newPage({viewport:{width:1440,height:900},deviceScaleFactor:1,baseURL:'http://127.0.0.1:5173'});
page.setDefaultTimeout(4000);
if(phase==='before')await page.route('http://127.0.0.1:5173/**',async route=>{const path=new URL(route.request().url()).pathname.slice(1)||'index.html';try{const body=execFileSync('git',['show','d069ef0:'+path]);await route.fulfill({body,contentType:path.endsWith('.css')?'text/css':path.endsWith('.js')?'text/javascript':'text/html'});}catch{await route.continue();}});
const folder=`reports/screenshots/${phase}`;await mkdir(folder,{recursive:true});
const output={phase,date:new Date().toISOString(),node:process.version,browser:browser.version(),cases:[],viewports:[],traces:[]};
for(const theme of ['light','dark']){
 for(const width of widths){await page.setViewportSize({width,height:900});await page.goto('http://127.0.0.1:5173');if(theme==='dark'){await page.locator('#theme-toggle').click();await page.waitForTimeout(250);}await page.screenshot({path:`${folder}/${theme}-${width}.png`,fullPage:true});if(width===375)for(const section of ['buttons','fields','cards'])await page.locator('#'+section).screenshot({path:`${folder}/${theme}-375-${section}.png`});const v=await page.evaluate(()=>({scrollWidth:document.documentElement.scrollWidth,innerWidth}));output.viewports.push({theme,width,...v,ok:v.scrollWidth<=v.innerWidth});}
}
await page.setViewportSize({width:1440,height:900});await page.goto('http://127.0.0.1:5173');await page.locator('#open-dialog').click();await page.screenshot({path:`${folder}/dialog.png`});
const cdp=await page.context().newCDPSession(page);await cdp.send('DOM.enable');await cdp.send('CSS.enable');await page.goto('http://127.0.0.1:5173');
for(const [name,selector,properties] of [['primary','#buttons .ui-button--primary',['background-color','padding-left']],['danger-tag','.ui-card .ui-tag--danger',['background-color','color','padding-left']],['required','#user-email',['border-top-color','background-color']],['danger-button','#buttons .ui-button--danger',['background-color']]]){
const doc=await cdp.send('DOM.getDocument');const {nodeId}=await cdp.send('DOM.querySelector',{nodeId:doc.root.nodeId,selector});const matched=await cdp.send('CSS.getMatchedStylesForNode',{nodeId});const computed=await cdp.send('CSS.getComputedStyleForNode',{nodeId});
const candidates=matched.matchedCSSRules.map(m=>({selector:m.rule.selectorList.text,origin:m.rule.origin,layers:m.rule.layers?.map(x=>x.text)||[],line:m.rule.style.range?.startLine+1,styleSheetId:m.rule.styleSheetId,declarations:m.rule.style.cssProperties.filter(x=>properties.includes(x.name)||['background','border','padding-inline'].includes(x.name)).map(x=>({name:x.name,value:x.value,important:!!x.important}))})).filter(x=>x.declarations.length);
output.traces.push({name,selector,computed:computed.computedStyle.filter(x=>properties.includes(x.name)||['background','border','padding-inline'].includes(x.name)),candidates});}
await writeFile(`reports/${phase}-traces.json`,JSON.stringify(output.traces,null,2));
for(const theme of ['light','dark'])for(const item of cases){let value;try{value=await runCase(page,item,theme);}catch(e){value={ok:false,fact:e.message.slice(0,300)};}if(['S11','S16','S25','S27','S31'].includes(item.id))await page.screenshot({path:`${folder}/${item.id}-${theme}.png`});output.cases.push({id:`${item.id}-${theme}`,family:item.family,variant:item.variant,state:item.state,width:item.width,theme,expected:item.expected,...value});process.stdout.write(`${phase} ${item.id}-${theme} ${value.ok?'OK':'FAIL'}\n`);}
await writeFile(`reports/${phase}.json`,JSON.stringify(output,null,2));await browser.close();
process.stdout.write(JSON.stringify({phase,passed:output.cases.filter(x=>x.ok).length,total:output.cases.length,overflow:output.viewports.filter(x=>!x.ok)}));
} finally {server.kill();}



