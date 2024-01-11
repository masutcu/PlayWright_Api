import { test, expect } from '@playwright/test';
import tags from '../test-data/tags.json'

test.beforeEach(async ({ page }) => {

  //Bir mock oluşturmak istediğinizde, tarayıcının belirli bir API'ye çağrı yapmasından önce bunu playwright çerçevesi içinde yapılandırmanız gerekir.

  await page.route('https://api.realworld.io/api/tags', async route => {

    await route.fulfill({
      body: JSON.stringify(tags)

    })
  })
  


  await page.goto('https://angular.realworld.how/')
  await page.getByText('Sign in').click()
  await page.getByRole('textbox', {name: "Email"}).fill('masutcu@gmail.com')
  await page.getByRole('textbox', {name: "Password"}).fill('Litvanya')
  await page.getByRole('button').click()

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
  await expect(page.locator('app-article-list h1').first()).toContainText('Mock test title')
  await expect(page.locator('app-article-list p').first()).toContainText('Mock description')

});

test('delete artice', async({page, request})=>{

  //önce beforeEach ile siteye gidip giriş yapıyoruz
  //sonra gönderdiğimiz requeste gelen cevaptan token alıyoruz.
  //sonra bir article oluşturmak için post request yapıyoruz. token ile 
  //sonra response statü kodunu  eşleştiriyoruz.
  //sonra article ı siliyoruz.



  const response=await request.post('https://api.realworld.io/api/users/login', {
  //playwright da request body data olarak isimlendirilir.  
  data:{
    
      "user": {
         
          "email": "masutcu@gmail.com",
          "password": "Litvanya"
      }
  }
  })
  const responseBody=await response.json()
  console.log(responseBody) //consola gelen body den token alacağız
  const accessToken = responseBody.user.token //token ı veriableye atadık

  const articleResponse=await request.post('https://api.realworld.io/api/articles/', {
    data:{
      "article":{"tagList":[], "title": "Test title", "description": "Test description", "body": "Test body"}
    },
    headers:{
      Authorization: `Token ${accessToken}`
    }
  })
  expect(articleResponse.status()).toEqual(201) //kayıtlı olan silinmez ise hata verir

  await page.getByText('Global Feed').click()
  await page.getByText('Test title').click()
  await page.getByRole('button', {name:"Delete Article"}).first().click()
  await page.getByText('Global Feed').click()

})
  




