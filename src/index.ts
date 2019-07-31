import puppeteer, { Browser } from 'puppeteer';
const puppeteerFirefox = require('puppeteer-firefox');


(async () => {
    await goGoPuppeteer();
    await goGoPuppeteer(true);


})();

async function goGoPuppeteer(firefox?: boolean) {
    let browser: Browser;
    if (firefox) {
        browser = await puppeteerFirefox.launch({ headless: false });
    }
    else {
        browser = await puppeteer.launch({ headless: false });
    }

    const page = await browser.newPage();
    await page.goto('https://citadelpackaging.com');

    const logoText = await page.$eval('.onemall-logo img', element => element.getAttribute('alt'));
    const myAccountText = await page.$eval('.menu-my-account .menu-title', element => element.textContent);

    console.log('logo text', logoText);
    console.log('my account text', myAccountText);

    await browser.close();
}