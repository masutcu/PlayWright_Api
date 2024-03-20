import { test, expect } from '@playwright/test';
import tags from '../test-data/tags.json'

test.beforeEach(async ({ page }) => {

  //Bir mock oluşturmak istediğinizde, tarayıcının belirli bir API'ye çağrı yapmasından önce bunu playwright çerçevesi içinde yapılandırmanız gerekir.

  await page.route('https://api.realworld.io/api/tags', async route => {
    
  const tags1={
      "tags": [
        "Automation By",
        "Mehmet",
        "Ali",
        "Sütçü"
      ]
    }     
     
    await route.fulfill({
      body: JSON.stringify(tags)  // veya tags i test data klasörü içinde json dosyası olarak oluşturup ve import edebiliriz

    })    
  })

  
  await page.route('*/**/api/articles*', async route => {
    const response = await route.fetch()
    const responseBody = await response.json()
    responseBody.articles[0].title = "This is test title"
    responseBody.articles[0].description = "This is a mehmet sutcu articles about playwright automation"

    await route.fulfill({
      body: JSON.stringify(responseBody)
    })
  })

  await page.goto('https://angular.realworld.how/')
})


test('has title', async ({ page }) => {

  await expect(page.locator('.navbar-brand')).toHaveText('conduit');
  await expect(page.locator('app-article-list h1').first()).toContainText('This is test title')
  await expect(page.locator('app-article-list p').first()).toContainText('mehmet sutcu')

});


