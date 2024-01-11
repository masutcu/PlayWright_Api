import { test, expect } from '@playwright/test';
import tags from '../test-data/tags.json'
import { request } from 'http';

test.beforeEach(async ({ page }) => {

  //Bir mock oluşturmak istediğinizde, tarayıcının belirli bir API'ye çağrı yapmasından önce bunu playwright çerçevesi içinde yapılandırmanız gerekir.

  await page.route('https://api.realworld.io/api/tags', async route => {

    await route.fulfill({
      body: JSON.stringify(tags)

    })
  })



  await page.goto('https://angular.realworld.how/')
  

})


test('has title', async ({ page }) => {
  await page.route('*/**/api/articles*', async route => {
    const response = await route.fetch()
    const responseBody = await response.json()
    responseBody.articles[0].title = "This is a MOCK test title"
    responseBody.articles[0].description = "This is a Mock description"

    await route.fulfill({
      body: JSON.stringify(responseBody)
    })
  })

  await page.getByText('Global Feed').click()
  await expect(page.locator('.navbar-brand')).toHaveText('conduit');
  await expect(page.locator('app-article-list h1').first()).toContainText('MOCK test title')
  await expect(page.locator('app-article-list p').first()).toContainText('Mock description')

});

test('post with api delete normal artice', async ({ page, request }) => {

  //önce beforeEach ile siteye gidip giriş yapıyoruz
  //sonra gönderdiğimiz requeste gelen cevaptan token alıyoruz.
  //sonra bir article oluşturmak için post request yapıyoruz. token ile 
  //sonra response statü kodunu  eşleştiriyoruz.
  //sonra article ı siliyoruz.



  

  const articleResponse = await request.post('https://api.realworld.io/api/articles/', {
    data: {
      "article": { "tagList": [], "title": "Test title", "description": "Test description", "body": "Test body" }
    },
  })
  expect(articleResponse.status()).toEqual(201) //kayıtlı olan silinmez ise hata verir

  await page.getByText('Global Feed').click()
  await page.getByText('Test title').click()
  await page.getByRole('button', { name: "Delete Article" }).first().click()
  await page.getByText('Global Feed').click()

})

test('create normal del with api article', async ({ page, request }) => {
  await page.getByText('New Article').click()
  await page.getByRole('textbox', { name: 'Article Title' }).fill('Playwright Deneme')
  await page.getByRole('textbox', { name: 'What\'s this article about?' }).fill('About the Playwright')
  await page.getByRole('textbox', { name: 'Write your article (in markdown)' }).fill('burayada bişeyler yazalım')
  await page.getByRole('button', { name: 'Publish Article' }).click()

  const articleResponse = await page.waitForResponse('https://api.realworld.io/api/articles/')
  const articleResponseBody = await articleResponse.json()
  const slugId = articleResponseBody.article.slug  //burada slug response bodyde id'nin key i

  await expect(page.locator('.article-page h1')).toContainText('Playwright Deneme')
  await page.getByText('Home').click()
  await page.getByText('Global Feed').click()

  await expect(page.locator('app-article-list h1').first()).toContainText('Playwright Deneme')
  

  const deleteArticleResponse = await request.delete(`https://api.realworld.io/api/articles/${slugId}`)
  expect(deleteArticleResponse.status()).toEqual(204)

})

/*We created a new file offset setups where we moved the step related to authentication. Authentication now is saved into the .auth/user.Json and then the state is shared across other tests Using this file, we set this configuration inside the playwright config and that the dependency on the setup project that will run the offset opts. And now every time we run the framework authentication will happen just once and all other tests will share this authentication state for the other tests.

and last update frame
we replaced the authentication process by just calling the API and saving our token inside of the user.Json because this is the way how our application is authenticated in this particular case. And also we know that our access token is needed to make an API calls and in order to reuse this value again and again inside of the test and avoid calling the authorization URL multiple times for every test, we save the value of access token in the process environment variable. Then we configure this process environment variable as authorization header globally for the framework and then we can simply remove all those instances of calling the authorization URL or headers inside of the API call, which is simplify the code, make it nicer and easier to read.*/



