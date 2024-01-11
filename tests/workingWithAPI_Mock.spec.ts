import { test, expect } from '@playwright/test';
import tags from '../test-data/tags.json'

test.beforeEach( async({page})=>{
  
  //Bir mock oluşturmak istediğinizde, tarayıcının belirli bir API'ye çağrı yapmasından önce bunu playwright çerçevesi içinde yapılandırmanız gerekir.

  await page.route('https://api.realworld.io/api/tags', async route=>{
   
  await route.fulfill({
    body:JSON.stringify(tags)

  })
  })

  await page.goto('https://angular.realworld.how/')
})


test('has title', async ({ page }) => {
  
  await expect(page.locator('.navbar-brand')).toHaveText('conduit');
});


