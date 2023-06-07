import puppeteer from 'puppeteer';
import cheerio from "cheerio";
import {saveToDb} from "../models/LinkedinUsers.js";

const pagesToScrape = [
    // {
    //     name: "Rajia Abdelaziz",
    //     url: "https://www.linkedin.com/in/rajiaabdelaziz"
    // },
    // {
    //     name: "Darian Bhathena",
    //     url: "https://www.linkedin.com/in/darian-bhathena/"
    // },
    // {
    //     name: "Danilo Lucari",
    //     url: "https://www.linkedin.com/in/danilolucari/"
    // },
    // {
    //     name: "Nicklas Gellner",
    //     url: "https://www.linkedin.com/in/ngellner/"
    // },
    // {
    //     name: "Mathias Sixten Pedersen",
    //     url: "https://www.linkedin.com/in/sixped/"
    // },
    // {
    //     name: "David Ezequiel Granados",
    //     url: "https://www.linkedin.com/in/davidezequielgranados/"
    // },
    // {
    //     name: "Andrej Vajagic",
    //     url: "https://www.linkedin.com/in/andrejvajagic/"
    // },
    // {
    //     name: "SAHIL BHATIYA",
    //     url: "https://www.linkedin.com/in/sahilbhatiya/"
    // },
    // {
    //     name: "Sten Roger Sandvik",
    //     url: "https://www.linkedin.com/in/stenrs/"
    // },
    {
        name: "Alex Ghattas",
        url: "https://www.linkedin.com/in/alexghattas"
    }
]

const EMAIL_SELECTOR = '#username';
const PASSWORD_SELECTOR = '#password';

const LINKEDIN_LOGIN_URL = 'https://www.linkedin.com/login?fromSignIn=true&trk=guest_homepage-basic_nav-header-signin';

const NAME_SELECTOR = 'div.ph5.pb5 > div.mt2.relative > div:nth-child(1) > div:nth-child(1) > h1';
const IMG_SELECTOR = '.pv-top-card-profile-picture__image';

const CONTACT_BTN = 'div.pvs-profile-actions > button.artdeco-button';

const delay = (time) => {
    return new Promise((resolve, reject) => {
        setTimeout(resolve, time);
    })
}
export const job = async () => {
    //TODO to separate com
    const email = process.env.EMAIL;
    const pass = process.env.PASS;

    puppeteer.launch({headless: false})
        .then(async (browser) => {
            let page = await browser.newPage()
            await page.setViewport({width: 1366, height: 768});
            await page.goto(LINKEDIN_LOGIN_URL, {waitUntil: 'domcontentloaded'})
            await page.click(EMAIL_SELECTOR);
            await page.keyboard.type(email);
            await page.click(PASSWORD_SELECTOR);
            await page.keyboard.type(pass);
            const [button] = await page.$x("//button[contains(text(), 'Sign in')]");
            if (button) {
                await button.click();
            }

            try {
                await page.waitForSelector('.feed-identity-module')
                for (const {name, url} of pagesToScrape) {
                    await page.goto(url, { waitUntil: 'domcontentloaded' });
                    const content = await page.content()
                    await delay(100);
                    const $ = cheerio.load(content)
                    const nameLastname = $(NAME_SELECTOR).text();
                    const img = $(IMG_SELECTOR).attr();
                    const [name, lastname] = nameLastname.split(' ');
                    const imgSrc = img.src;
                    console.log(name, lastname);
                    console.log(imgSrc)
                    await page.waitForSelector(CONTACT_BTN)
                    await page.click(CONTACT_BTN);
                    await delay(100);
                    if (await page.$('div.artdeco-modal') !== null) {
                        const buttonSelector = await page.evaluateHandle(() => {
                            const div = document.querySelector('div.artdeco-modal');
                            const buttonText = 'Send';
                            const button =
                                Array.from(div.querySelectorAll('button')).find(btn => btn.textContent.trim() === buttonText);
                            return button;
                        });
                        if (buttonSelector && buttonSelector.click) {
                            await buttonSelector.click();
                        }

                        await saveToDb(url,name,lastname,imgSrc)

                    }
                }
            } catch (e) {
                console.error(e)
            }

            await page.close()
            await browser.close();
        })
        .catch((err) => {
            console.log(" CAUGHT WITH AN ERROR ", err);
        })
}
