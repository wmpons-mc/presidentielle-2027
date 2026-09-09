import { test,expect } from '@playwright/test';
for(const width of [375,1280]) test(`keyboard navigation and layout at ${width}px`,async({page})=>{
  await page.setViewportSize({width,height:900});
  const requests:string[]=[];
  page.on('request',request=>requests.push(request.url()));
  await page.goto('/');
  await page.screenshot({path:test.info().outputPath('home.png'),fullPage:true});
  await expect(page.locator('html')).toHaveAttribute('lang','fr');
  await expect(page).toHaveTitle(/Présidentielle 2027/);
  await expect(page.getByText(/Données entièrement fictives/)).toBeVisible();
  await page.keyboard.press('Tab');
  await expect(page.getByRole('link',{name:'Aller au contenu'})).toBeFocused();
  await page.keyboard.press('Enter');
  await expect(page.locator('main')).toBeFocused();
  await page.goto('/');
  for(let i=0;i<3;i++) await page.keyboard.press('Tab');
  const questions=page.getByRole('navigation',{name:'Navigation principale'}).getByRole('link',{name:'Questions',exact:true});
  await expect(questions).toBeFocused();
  expect(await questions.evaluate(el=>getComputedStyle(el).outlineStyle)).not.toBe('none');
  await page.keyboard.press('Enter');
  await expect(page).toHaveURL(/\/questions\/$/);
  await expect(questions).toHaveAttribute('aria-current','page');
  await page.getByRole('link',{name:'Fictional question 4',exact:false}).click();
  await expect(page.getByRole('heading',{level:1})).toHaveText('Fictional question 4');
  await page.getByRole('link',{name:'Lien permanent vers cette version'}).click();
  await expect(page).toHaveURL(/\/versions\/1\/$/);
  for(const route of ['/','/questions/','/candidats/','/themes/fiction.topic.4/','/sources/','/methode/']) {
    await page.goto(route);
    expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
    await expect(page.locator('main h1')).toHaveCount(1);
  }
  expect(requests.every(url=>url.startsWith('http://127.0.0.1:4173/'))).toBe(true);
  expect(await page.locator('script:not([src^="/_astro/"])').count()).toBe(0);
});
test('empty coverage and missing pages give explicit recovery',async({page})=>{
  await page.goto('/questions/fiction.question.3/');
  await expect(page.getByRole('heading',{name:'Aucune proposition documentée pour cette question'})).toBeVisible();
  const response=await page.goto('/missing-page/');
  expect(response?.status()).toBe(404);
  await expect(page.getByRole('heading',{level:1})).toHaveText('Cette page est introuvable.');
  await page.getByRole('link',{name:'Retrouver les questions'}).click();
  await expect(page).toHaveURL(/\/questions\/$/);
});
