import {test as setup} from '@playwright/test'
import user from '../.auth/user.json'
import fs from 'fs'


const authFile='.auth/user.json'

setup('authentication', async({request})=>{
  

  const response = await request.post('https://api.realworld.io/api/users/login', {
    //playwright da request body data olarak isimlendirilir.  
    data: {

      "user": {
        "email": "masutcu@gmail.com",
        "password": "Litvanya"
      }
    }
  })
  const responseBody = await response.json()
  console.log(responseBody) //consola gelen body den token alacağız
  const accessToken = responseBody.user.token //token ı veriableye atadık
  user.origins[0].localStorage[0].value=accessToken
  fs.writeFileSync(authFile, JSON.stringify(user))

  process.env['ACCESS_TOKEN'] = accessToken
  

})