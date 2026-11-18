import { test, expect } from '@playwright/test';
import { cases, runCase, contrast } from '../../tools/scenarios.mjs';
for (const theme of ['light','dark']) {
  for (const scenario of cases) test(`${scenario.id} ${theme}: ${scenario.family}/${scenario.variant}/${scenario.state}`, async ({page}) => {
    const actual = await runCase(page, scenario, theme);
    expect(actual.ok, actual.fact).toBe(true);
  });
  test(`${theme}: paused extension preserves neighbouring families and contrast`, async ({page}) => {
    await page.goto('/'); if (theme === 'dark') { await page.locator('#theme-toggle').click(); await page.waitForTimeout(200); }
    const danger = page.locator('#buttons .ui-button--danger');
    const before = await danger.evaluate(e=>getComputedStyle(e).backgroundColor);
    const tag = page.locator('#paused-example .ui-tag--paused');
    const alert = page.locator('#paused-example .ui-alert--paused');
    for (const item of [tag,alert]) {
      const colors = await item.evaluate(e=>({fg:getComputedStyle(e).color,bg:getComputedStyle(e).backgroundColor}));
      expect(contrast(colors.fg,colors.bg)).toBeGreaterThanOrEqual(4.5);
    }
    const alertColor = await alert.evaluate(e=>getComputedStyle(e).backgroundColor);
    await tag.evaluate(e=>e.className='ui-tag ui-tag--danger');
    expect(await alert.evaluate(e=>getComputedStyle(e).backgroundColor)).toBe(alertColor);
    expect(await danger.evaluate(e=>getComputedStyle(e).backgroundColor)).toBe(before);
  });
  test(`${theme}: vendor v2 remains scoped and layered`, async ({page}) => {
    await page.goto('/'); if (theme === 'dark') { await page.locator('#theme-toggle').click(); await page.waitForTimeout(200); }
    const primary = page.locator('#buttons .ui-button--primary').first();
    expect(parseFloat(await primary.evaluate(e=>getComputedStyle(e).borderRadius))).toBeGreaterThan(0);
    expect(await page.locator('.legacy-action').evaluate(e=>getComputedStyle(e).borderRadius)).toBe('0px');
    expect(await primary.evaluate(e=>getComputedStyle(e).backgroundColor)).toBe(await page.evaluate(()=>{const s=document.createElement('i');s.style.color='var(--color-accent)';document.body.append(s);const c=getComputedStyle(s).color;s.remove();return c;}));
    const response = await page.request.get('/css/vendor-v2.css'); expect(response.ok()).toBe(true);
  });
  test(`${theme}: container query uses card width and preserves outside buttons`, async ({page}) => {
    await page.goto('/'); if(theme==='dark')await page.locator('#theme-toggle').click();
    await page.evaluate(()=>document.querySelector('#cards').insertAdjacentHTML('beforeend','<article class="ui-card" id="container-probe" style="width:500px;max-width:100%"><button class="ui-button ui-button--primary">Действие</button></article>'));
    const dimensions=()=>page.locator('#container-probe').evaluate(e=>{const s=getComputedStyle(e);return {inner:e.clientWidth-parseFloat(s.paddingLeft)-parseFloat(s.paddingRight),button:e.querySelector('button').getBoundingClientRect().width};});
    const wide=await dimensions();expect(wide.button).toBeLessThan(wide.inner);
    const outside=await page.locator('#buttons .ui-button--primary').first().evaluate(e=>e.getBoundingClientRect().width);
    await page.locator('#container-probe').evaluate(e=>e.style.width='350px');const small=await dimensions();expect(Math.abs(small.button-small.inner)).toBeLessThanOrEqual(1);
    expect(await page.locator('#buttons .ui-button--primary').first().evaluate(e=>e.getBoundingClientRect().width)).toBe(outside);
  });
}

