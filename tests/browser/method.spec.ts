import { test,expect } from '@playwright/test';

for(const width of [375,1280]) test(`method, coverage, dates and correction evidence at ${width}px`,async({page})=>{
  await page.setViewportSize({width,height:900});
  await page.goto('/methode/');
  await expect(page.getByRole('heading',{name:'Définitions fictives'})).toBeVisible();
  await expect(page.getByRole('heading',{name:'Responsabilité fictive'})).toBeVisible();
  const dates=page.getByRole('region',{name:'Dates de suivi'});
  await expect(dates).toContainText('2026-01-04T09:00:00Z');
  await expect(dates).toContainText('2026-01-05T12:00:00Z');
  await page.getByRole('link',{name:'Couverture par question et personnalité'}).focus();
  await page.keyboard.press('Enter');
  await expect(page).toHaveURL(/\/couverture\/$/);
  const question=page.locator('section[id="fiction.question.4"]');
  await expect(question.locator('[data-coverage-actor]')).toHaveCount(7);
  await expect(question.locator('[data-coverage-actor="fiction.actor.b"]')).toContainText('Couverture non renseignée');
  await expect(page.locator('section[id="fiction.question.3"]')).toContainText('Aucune mesure trouvée dans les sources examinées');
  await page.getByRole('link',{name:'Corrections publiées',exact:true}).first().click();
  await expect(page.getByRole('heading',{name:'Correction éditoriale'})).toBeVisible();
  await page.getByRole('link',{name:'Avant — version 1'}).click();
  await expect(page).toHaveURL(/propositions\/fiction.proposition.a\/versions\/1\/$/);
  await expect(page.getByText('Citation exacte',{exact:true})).toBeVisible();
  await page.goBack();
  await page.getByRole('link',{name:'Après — version 2'}).click();
  await expect(page).toHaveURL(/propositions\/fiction.proposition.a\/versions\/2\/$/);
  for(const route of ['/methode/','/couverture/','/corrections/']) {
    await page.goto(route);
    expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
    await expect(page.locator('main h1')).toHaveCount(1);
  }
  await page.screenshot({path:test.info().outputPath('corrections.png'),fullPage:true});
});
