import {chromium} from '@playwright/test';
import {spawn,execFileSync} from 'node:child_process';
import {mkdir} from 'node:fs/promises';
const server=spawn(process.execPath,['server.mjs'],{stdio:'ignore'});
const browser=await chromium.launch({channel:process.env.PLAYWRIGHT_CHANNEL||'chrome',args:['--remote-debugging-port=9337','--remote-allow-origins=devtools://devtools']});
try {
 const page=await browser.newPage();
 for(const phase of ['before','after']) {
  if(phase==='before')await page.route('http://127.0.0.1:5173/**',async route=>{const path=new URL(route.request().url()).pathname.slice(1)||'index.html';try{await route.fulfill({body:execFileSync('git',['show','d069ef0:'+path]),contentType:path.endsWith('.css')?'text/css':path.endsWith('.js')?'text/javascript':'text/html'});}catch{await route.continue();}});
  else await page.unrouteAll();
  await page.goto('http://127.0.0.1:5173');
  const targets=await(await fetch('http://127.0.0.1:9337/json/list')).json();const target=targets.find(x=>x.url==='http://127.0.0.1:5173/');
  const ui=await browser.newPage({viewport:{width:1440,height:1100}});
  await ui.goto('devtools://devtools/bundled/inspector.html?ws=127.0.0.1:9337/devtools/page/'+target.id);
  await ui.waitForTimeout(1500);
  const sc=ui.getByRole('button',{name:'Toggle screencast',exact:true});if(await sc.count())await sc.first().click();
  await ui.waitForTimeout(300);
  await ui.mouse.move(1116,550);await ui.mouse.down();await ui.mouse.move(670,550,{steps:10});await ui.mouse.up();
  const folder=`reports/screenshots/${phase}`;await mkdir(folder,{recursive:true});
  for(const [name,selector,property] of [['primary','#buttons .ui-button--primary','background'],['danger-tag','.ui-card .ui-tag--danger','color'],['required','#user-email','border'],['danger-button','#buttons .ui-button--danger','background']]){
   await ui.evaluate(async selector=>{const SDK=await import('./core/sdk/sdk.js');const Common=await import('./core/common/common.js');const dm=SDK.TargetManager.TargetManager.instance().primaryPageTarget().model(SDK.DOMModel.DOMModel);const doc=await dm.requestDocument();const id=await dm.querySelector(doc.id,selector);await Common.Revealer.reveal(dm.nodeForId(id));},selector);
   await ui.getByRole('tab',{name:'Styles',exact:true}).first().click();
   await ui.locator('[aria-label="Filter"]').first().fill(property);
   await ui.waitForTimeout(300);await ui.screenshot({path:`${folder}/devtools-${name}-styles.png`});
   await ui.getByRole('tab',{name:'Computed',exact:true}).first().click();
   const filters=ui.locator('[aria-label="Filter"]');await filters.last().fill(property);
   await ui.waitForTimeout(300);await ui.screenshot({path:`${folder}/devtools-${name}-computed.png`});
  }
  await ui.close();
 }
} finally {await browser.close();server.kill();}
