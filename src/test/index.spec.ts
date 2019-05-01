import puppeteer, { Browser, Page } from 'puppeteer';
import { getPropertyBySelector, getPropertyByHandle } from 'puppeteer-helpers';
import { expect } from 'chai';
import { fail } from 'assert';
import * as dotenv from 'dotenv';
import Webhook from 'webhook-discord';

dotenv.config();

describe('Citadel Packaging', () => {
    let browser: Browser;
    let page: Page;

    before(async () => {
        browser = await puppeteer.launch({ headless: false });
        page = await browser.newPage();
        await page.setViewport({ width: 1920, height: 1080 });
    });

    if (process.env.discordWebhookURL) {
        afterEach(async function () {
            if (this.currentTest && this.currentTest.state === 'failed') {
                const hook = new Webhook(process.env.discordWebhookURL);
                await hook.info('Citadel Packaging Testing', `${this.currentTest.title} - ${this.currentTest.state}`);
            }
        });
    }

    after(async () => {
        await browser.close();
    });

    describe('Base page layout', () => {
        it('should have 5 tabs', async () => {

            const url = 'https://www.citadelpackaging.com/';
            await page.goto(url);

            await page.waitForSelector('#menu-main-menu > li');
            const tabs = await page.$$('#menu-main-menu > li');

            expect(tabs.length).to.equal(7);
        });
    });


    describe('Add to cart', () => {
        it('should have the "added" class when clicking add to cart button', async () => {
            const url = 'https://www.citadelpackaging.com/product-category/glass-containers/glass-bottles/';

            await page.goto(url);

            await page.waitForSelector('.add_to_cart_button.ajax_add_to_cart');

            const addToCartButton = await page.$('.add_to_cart_button.ajax_add_to_cart');

            let addToCartButtonClasses = '';
            if (addToCartButton) {
                await addToCartButton.click();

                await page.waitForSelector('.added');

                addToCartButtonClasses = await getPropertyByHandle(addToCartButton, 'className');
            }

            expect(addToCartButtonClasses).includes('added');
        });
    });


    // These tests will assume that the previous test (adding to cart) has been done

    describe('After adding to cart', () => {
        it('should show items in the cart after they have been aded', async () => {

            const url = 'https://www.citadelpackaging.com/product-category/glass-containers/glass-bottles/';

            await page.goto(url);

            await page.waitForSelector('.number-item .item');

            let numberOfItemsInCart = await getPropertyBySelector(page, '.number-item .item', 'innerHTML');

            // Remove 'items' and parseInt
            if (numberOfItemsInCart) {
                numberOfItemsInCart = parseInt(numberOfItemsInCart.split(' ')[0]);
            }

            expect(numberOfItemsInCart).to.be.greaterThan(0);
        });

        it('should have 0 items in the cart after clicking the "Remove this item" icon', async () => {

            const url = 'https://www.citadelpackaging.com/product-category/glass-containers/glass-bottles/';

            await page.goto(url);

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
        });
    });

    describe('Search', () => {

        it('should have results when a search is done', async () => {
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

            await page.waitForNavigation({ waitUntil: 'domcontentloaded' });

            const products = await page.$$('.item');

            expect(products.length).to.be.greaterThan(0);
        });

    });

    describe('Responsive', () => {

        it('should have a hamburger menu', async () => {
            await page.setViewport({ width: 400, height: 400 });

            const url = 'https://www.citadelpackaging.com/';
            await page.goto(url);

            await page.waitForSelector('.wrapper_vertical_menu.vertical_megamenu', { visible: true });

            const hamburgerMenu = await page.$('.wrapper_vertical_menu.vertical_megamenu');

            expect(hamburgerMenu).to.be.ok;

        });

    });


});