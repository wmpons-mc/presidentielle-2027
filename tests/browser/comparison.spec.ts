import { test,expect } from '@playwright/test';

for(const width of [375,1280]) test(`comparison selection, extension and proofs at ${width}px`,async({page})=>{
  await page.setViewportSize({width,height:900});
  const errors:string[]=[]; const requests:string[]=[];
  page.on('pageerror',error=>errors.push(error.message));
  page.on('request',request=>requests.push(request.url()));
  await page.goto('/questions/fiction.question.1/');
  const rows=page.locator('[data-actor]:visible');
  await expect(rows).toHaveCount(7);
  await expect(rows.first()).toHaveAttribute('data-actor','fiction.actor.a');
  await expect(page.locator('[data-actor="fiction.actor.c"]')).toContainText('Only if the fictional assembly agrees');
  await expect(page.locator('[data-actor="fiction.actor.a"]')).toContainText('Only if the fictional reserve permits');
  await expect(page.getByRole('heading',{name:'Contexte distinct des réponses personnelles'})).toBeVisible();
  await page.getByRole('button',{name:'Tout désélectionner'}).click();
  await expect(rows).toHaveCount(0);
  await page.getByRole('checkbox',{name:'Fictional Person B',exact:true}).check();
  await page.getByRole('button',{name:'Appliquer la sélection'}).click();
  await expect(rows).toHaveCount(1);
  await expect(page).toHaveURL(/candidate=fiction.actor.b$/);
  const shared=await page.getByRole('link',{name:'Lien vers cette sélection'}).getAttribute('href');
  await page.goto(shared!);
  await expect(rows).toHaveCount(1);
  await page.getByLabel('Thème', {exact:true}).selectOption('fiction.topic.4');
  await page.getByLabel('Question', {exact:true}).selectOption('/questions/fiction.question.4/');
  await page.getByRole('button',{name:'Afficher la question'}).click();
  await expect(page).toHaveURL(/fiction.question.4\/\?candidate=fiction.actor.b$/);
  await expect(rows).toHaveCount(1);
  await page.getByRole('link',{name:'Voir le détail et les preuves'}).click();
  await expect(page).toHaveURL(/propositions\/fiction.proposition.b\/versions\/1\/$/);
  await expect(page.getByText('Citation exacte',{exact:true})).toBeVisible();
  await expect(page.getByRole('link',{name:'Consulter le document original'})).toHaveAttribute('href','https://example.org/fiction/b');
  await page.getByRole('link',{name:/Fictional source B — source version 1/}).click();
  await expect(page).toHaveURL(/sources\/fiction.source.b\/versions\/1\/$/);
  await page.goto('/propositions/fiction.proposition.a/versions/2/');
  await expect(page.getByText(/Correction éditoriale/).first()).toBeVisible();
  await page.getByRole('link',{name:'Version 1',exact:true}).click();
  await expect(page.getByRole('heading',{level:1})).toContainText('30 tokens monthly');
  for(const route of ['/questions/fiction.question.1/','/propositions/fiction.proposition.a/versions/2/']) {
    await page.goto(route);
    expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
    await page.screenshot({path:test.info().outputPath(route.includes('/questions/')?'comparison.png':'proof.png'),fullPage:true});
  }
  expect(errors).toEqual([]);
  expect(requests.every(url=>url.startsWith('http://127.0.0.1:4173/'))).toBe(true);
});
test('back navigation, unavailable candidates and keyboard filters remain explicit',async({page})=>{
  await page.goto('/questions/fiction.question.1/?candidate=old-id');
  await expect(page.locator('[data-unavailable]')).toBeVisible();
  await expect(page.locator('[data-actor]:visible')).toHaveCount(0);
  await page.getByRole('button',{name:'Tout sélectionner'}).focus();
  await page.keyboard.press('Enter');
  await expect(page.locator('[data-actor]:visible')).toHaveCount(7);
  await page.goBack();
  await expect(page.locator('[data-unavailable]')).toBeVisible();
  await expect(page.locator('[data-actor]:visible')).toHaveCount(0);
});
test('without JavaScript the complete comparison and source details remain usable',async({browser})=>{
  const context=await browser.newContext({javaScriptEnabled:false});
  const page=await context.newPage();
  await page.goto('http://127.0.0.1:4173/questions/fiction.question.4/?candidate=fiction.actor.b');
  await expect(page.locator('[data-actor]:visible')).toHaveCount(7);
  await expect(page.getByText(/Les filtres du lien nécessitent JavaScript/)).toBeVisible();
  await page.getByRole('link',{name:'Voir le détail et les preuves'}).click();
  await expect(page.getByText('Citation exacte',{exact:true})).toBeVisible();
  await context.close();
});
