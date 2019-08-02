import puppeteer, { Browser } from 'puppeteer';

(async () => {

    const browser = await puppeteer.launch({ headless: false });

    const page = await browser.newPage();

    await page.goto('https://justjujubes.com');

    const hamburgerMenuText = await page.$eval('.menu-toggle.dashicons-before.dashicons-menu', element => element.textContent);
    console.log('menu text', hamburgerMenuText);

})();