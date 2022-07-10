/* =====================Modules===================== */
import fetch from 'node-fetch';
import fs from 'fs';
import path from 'path';
import * as cheerio from 'cheerio';
import nodemailer from 'nodemailer';
// 
import { fileURLToPath } from 'url';
import { dirname } from 'path';
// 
/* ===================== Globals ===================== */ 
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
// 

/* -------------- cheerio -------------- */
let htmlFile=fs.readFileSync(path.join(__dirname,'fetched-site','page.html'),{encoding:'utf8'});
const $=cheerio.load(htmlFile)

/* ===================== App ===================== */
let oldPrice=0;

setInterval(async ()=>{
    try{
      const text= await getData('https://www.amazon.eg/-/en/gp/product/B09889DLSD');
      mkFile(path.join('page.html'), text)
      let price=convNum($('.a-price-whole').first().text());
      console.log(oldPrice ,price);
      if(oldPrice < price){
        await sendEmail('alihamdyhamdy.27@mail.ru',`The product price Increased from: ${oldPrice} to ${price}`)
        console.log(1);
      }else if(oldPrice>price){
        await sendEmail('alihamdyhamdy.27@mail.ru',`The product price decreased from: ${oldPrice} to ${price}`)
        console.log(2);
      } else{
        await sendEmail('alihamdyhamdy.27@mail.ru',`The product price didn't change. 
        price: ${price}`)
        console.log(3);
      }
      oldPrice=price;
    }
    catch(e){
      console.log(e);
    }

},86400000) // 86400000 =>24h
/* ===================== Functions ===================== */
function mkFile(name,data){
    const dir=path.join(__dirname,'fetched-site')
    const filePath=path.join(dir, name);
    if(!fs.existsSync(dir)){
        fs.mkdirSync(dir)
    }
    fs.writeFileSync(filePath,data)
    // fs.appendFileSync(filePath,"<script src='../app.js'></script>")
}

async function getData(url){
    try{
        const response =await fetch(url);
        const data= await response.text();
        return data;
    }
    catch(e){
        console.log(e);
    }
}

function convNum(string){
    let num=parseInt(string.replace(/\D/g,''));
    return num
}

function sendEmail(reciever,message){
  const transporter=nodemailer.createTransport({
    service:'hotmail',
    auth:{
      user:'', //email
      pass:'' // password
    }
  })
  const options={
  from: 'amz-product_price@hotmail.com',
  to:reciever ,
  subject: "Amazon Product Price",
  text: message,
  }
  transporter.sendMail(options,(err,info)=>{
    if(err){
      console.log(err);
      return;
    }
    console.log(info.response);
  })
}