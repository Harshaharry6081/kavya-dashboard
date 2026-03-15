import puppeteer from 'puppeteer';

const wait = (ms) => new Promise(r => setTimeout(r, ms));

(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  
  page.on('pageerror', err => {
    console.error('PAGE ERROR:', err.message);
  });
  
  page.on('console', msg => {
    if (msg.type() === 'error') {
      console.error('CONSOLE ERROR:', msg.text());
    }
  });

  await page.goto('http://localhost:5173');
  await wait(2000);
  
  const addButtons = await page.$$('button');
  for (let btn of addButtons) {
     const text = await page.evaluate(el => el.textContent, btn);
     if (text === '+') {
         await btn.click();
         break;
     }
  }
  
  await wait(1000);
  
  await browser.close();
})();
