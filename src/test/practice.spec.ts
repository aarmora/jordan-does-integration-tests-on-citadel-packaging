import puppeteer, { Browser, Page } from 'puppeteer';
import { expect } from 'chai';
const puppeteerFirefox = require('puppeteer-firefox');
let browser: Browser;

describe('Boise Code Works', async () => {
    let page: Page;

    before(async () => {
        browser = await setUpBrowser();
    });

    describe('Home page', () => {
        it('should have a calendar icon', async () => {
            const context = await browser.createIncognitoBrowserContext();
            page = await context.newPage();

            const url = 'https://javascriptwebscrapingguy.com/';
            // const url = 'https://boisecodeworks.com/';
            await page.goto(url);

            const calendarIcon = await page.$eval('#f__container__fab', element => element.textContent);

            expect(calendarIcon).to.be.ok;
        });

    });

});





const cliArgs = process.argv.slice(2);

async function setUpBrowser() {
    let browser: Browser;

    let ubuntu = cliArgs.includes('ubuntu');
    let headless = cliArgs.includes('headless');
    let firefox = cliArgs.includes('firefox');

    if (!headless && process.env.hasOwnProperty("PPTR_HEADLESS") && String(process.env.PPTR_HEADLESS) === 'true') {
        headless = true;
    }

    console.log('puppeteer: ');
    console.log(`    headless: ${headless}`);
    console.log(`    ubuntu: ${ubuntu}`);
    console.log(`    firefox: ${firefox}`);

    if (ubuntu && !firefox) {
        const pptrArgs: puppeteer.LaunchOptions = {
            headless: true,
            ignoreHTTPSErrors: true,
            args: [
                '--no-sandbox',
                '--disable-setuid-sandbox',
                '--disable-infobars',
                '--window-position=0,0',
                '--ignore-certifcate-errors',
                '--ignore-certifcate-errors-spki-list',
                '--user-agent="Mozilla/5.0 (Macintosh; Intel Mac OS X 10_12_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/65.0.3312.0 Safari/537.36"'
            ]
        };

        if (process.env.hasOwnProperty("PPTR_EXEC_PATH")) {
            pptrArgs.executablePath = process.env.PPTR_EXEC_PATH;
        }

        browser = await puppeteer.launch(pptrArgs);
    }
    else if (ubuntu && firefox) {
        const pptrArgs: puppeteer.LaunchOptions = {
            headless: true,
            ignoreHTTPSErrors: true,
            args: [
                '--no-sandbox',
                '--disable-setuid-sandbox',
                '--disable-infobars',
                '--window-position=0,0',
                '--ignore-certifcate-errors',
                '--ignore-certifcate-errors-spki-list',
                '--user-agent="Mozilla/5.0 (Macintosh; Intel Mac OS X 10_12_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/65.0.3312.0 Safari/537.36"'
            ]
        };

        if (process.env.hasOwnProperty("PPTR_EXEC_PATH")) {
            pptrArgs.executablePath = process.env.PPTR_EXEC_PATH;
        }

        browser = await puppeteerFirefox.launch();

    }
    else if (firefox) {
        const pptrArgs: puppeteer.LaunchOptions = {
            headless,
            args: [`--window-size=${1800},${1200}`]
        };

        if (process.env.hasOwnProperty("PPTR_EXEC_PATH")) {
            pptrArgs.executablePath = process.env.PPTR_EXEC_PATH;
        }

        browser = await puppeteerFirefox.launch(pptrArgs);

    }
    else {
        const pptrArgs: puppeteer.LaunchOptions = {
            headless,
            args: [`--window-size=${1800},${1200}`]
        };

        if (process.env.hasOwnProperty("PPTR_EXEC_PATH")) {
            pptrArgs.executablePath = process.env.PPTR_EXEC_PATH;
        }

        browser = await puppeteer.launch(pptrArgs);
    }

    return Promise.resolve(browser);
}