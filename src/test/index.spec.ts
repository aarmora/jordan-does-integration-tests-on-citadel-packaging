import puppeteer, { Browser, Page } from 'puppeteer';
import { getPropertyBySelector } from 'puppeteer-helpers';
import { expect } from 'chai';
import { fail } from 'assert';
import * as dotenv from 'dotenv';
import Webhook from 'webhook-discord';
const puppeteerFirefox = require('puppeteer-firefox');

dotenv.config();

const cliArgs = process.argv.slice(2);
const firefox = cliArgs.includes('firefox');
let browser: Browser;

describe('Citadel Packaging', async () => {
    let page: Page;

    before(async () => {
        browser = await setUpBrowser();
        await notify(`${firefox ? 'Firefox: ' : ''}Started integration tests`);
    });

    afterEach(async function () {
        if (this.currentTest && this.currentTest.state === 'failed') {
            await notify(`${firefox ? 'Firefox: ' : ''}${this.currentTest.title} - ${this.currentTest.state}`);
        }
    });
    describe('Base page layout', () => {
        it('should have 5 tabs', async () => {
            const context = await browser.createIncognitoBrowserContext();
            page = await context.newPage();

            const url = 'https://www.citadelpackaging.com/';
            await page.goto(url);

            await page.waitForSelector('#menu-main-menu > li');
            const tabs = await page.$$('#menu-main-menu > li');

            expect(tabs.length).to.equal(5);
            await context.close();
        });
    });


    describe('Add to cart', () => {
        it('should have woocomerce-message after adding to cart', async () => {
            const context = await browser.createIncognitoBrowserContext();
            page = await context.newPage();
            await page.setViewport({ width: 1920, height: 1080 });

            const url = 'https://www.citadelpackaging.com/product-category/glass-containers/glass-bottles/';

            await page.goto(url);

            await page.waitForSelector('.add_to_cart_button.ajax_add_to_cart');

            const addToCartButton = await page.$('.add_to_cart_button.ajax_add_to_cart');

            if (addToCartButton) {
                await addToCartButton.click();
            }

            await page.waitForSelector('.woocommerce-message');

            const woocommerceMessageElement = await page.$('.woocommerce-message');

            expect(woocommerceMessageElement).to.not.be.null;
            await context.close();
        });
    });

    describe('Cart actions', () => {
        it('should show items in the cart after they have been added', async () => {
            const context = await browser.createIncognitoBrowserContext();
            page = await context.newPage();
            await page.setViewport({ width: 1920, height: 1080 });

            const url = 'https://www.citadelpackaging.com/product-category/glass-containers/glass-bottles/';

            await page.goto(url);

            await page.waitForSelector('.add_to_cart_button.ajax_add_to_cart');

            const addToCartButton = await page.$('.add_to_cart_button.ajax_add_to_cart');

            if (addToCartButton) {
                await addToCartButton.click();
            }

            await page.waitForSelector('.woocommerce-message');

            let numberOfItemsInCart = await getPropertyBySelector(page, '.number-item .item', 'innerHTML');

            // Remove 'items' and parseInt
            if (numberOfItemsInCart) {
                numberOfItemsInCart = parseInt(numberOfItemsInCart.split(' ')[0]);
            }

            expect(numberOfItemsInCart).to.be.greaterThan(0);
            await context.close();


        });

        it('should have 0 items in the cart after clicking the "Remove this item" icon', async () => {
            const context = await browser.createIncognitoBrowserContext();
            page = await context.newPage();
            await page.setViewport({ width: 1920, height: 1080 });

            const url = 'https://www.citadelpackaging.com/product-category/glass-containers/glass-bottles/';

            await page.goto(url);

            await page.waitForSelector('.add_to_cart_button.ajax_add_to_cart');

            const addToCartButton = await page.$('.add_to_cart_button.ajax_add_to_cart');

            if (addToCartButton) {
                await addToCartButton.click();
            }

            await page.waitForSelector('.number-item .item');

            const topFormCart = await page.$('.top-form-minicart');

            if (topFormCart) {
                try {
                    await topFormCart.hover();
                }
                catch (err) {
                    console.log('hover err', err);
                }
            }
            else {
                fail('Top form cart should be there');
            }
            await page.waitForSelector('.btn-remove .fa', { visible: true });

            const removeButton = await page.$('.btn-remove .fa');

            if (removeButton) {
                await removeButton.click();
            }
            else {
                fail('No remove button found. Failing.');
            }
            await page.waitForNavigation({ waitUntil: 'domcontentloaded' });

            let numberOfItemsInCart = await getPropertyBySelector(page, '.number-item .item', 'innerHTML');

            // Remove 'items' and parseInt
            if (numberOfItemsInCart) {
                numberOfItemsInCart = parseInt(numberOfItemsInCart.split(' ')[0]);
            }

            expect(numberOfItemsInCart).to.equal(0);
            await context.close();
        });
    });

    describe('Search', () => {

        it('should have results when a search is done', async () => {
            const context = await browser.createIncognitoBrowserContext();
            page = await context.newPage();
            await page.setViewport({ width: 1920, height: 1080 });

            const url = 'https://www.citadelpackaging.com/';
            await page.goto(url);

            await page.waitForSelector('#s');
            const searchInput = await page.$('#s');

            if (searchInput) {
                await searchInput.type('Boston round');
            }
            else {
                fail('Should have searchInput');
            }

            await page.waitForSelector('#searchform_special button');
            const searchButton = await page.$('#searchform_special button');

            if (searchButton) {
                await searchButton.click();
            }
            else {
                fail('Should have search button');
            }

            await page.waitForSelector('.item');

            const products = await page.$$('.item');

            expect(products.length).to.be.greaterThan(0);
            await context.close();
        });

    });

    describe('Responsive', () => {

        it('should have a hamburger menu when viewport is 400 x 400', async () => {
            const context = await browser.createIncognitoBrowserContext();
            page = await context.newPage();

            await page.setViewport({ width: 400, height: 400 });

            const url = 'https://www.citadelpackaging.com/';
            await page.goto(url);

            await page.waitForSelector('.wrapper_vertical_menu.vertical_megamenu', { visible: true });

            const hamburgerMenu = await page.$('.wrapper_vertical_menu.vertical_megamenu');

            expect(hamburgerMenu).to.be.ok;
            await context.close();
        });

    });


});


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

async function notify(message: string) {

    return new Promise(async (resolve) => {

        if (process.env.discordWebhookURL) {
            const hook = new Webhook(process.env.discordWebhookURL);
            await hook.info('Citadel Packaging Testing', message);
        }
        else {
            console.log(message);
        }

        resolve();
    });
}