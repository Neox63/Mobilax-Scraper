const config = require('../config/config.json');

const api =  {
    async connect(browser, url) {
        const username = config.Mobilax.username;
        const password = config.Mobilax.password;

        const loginSelector = 'input[type="text"]';
        const passwordSelector = 'input[type="password"]';
        const submitButton = 'button[type="submit"]';
        
        let page = await browser.newPage();

        try {
            await page.goto(url);

            await page.waitForSelector('app-account-login-route');
    
            await page.type(loginSelector, username, { delay: 10 });
            await page.type(passwordSelector, password, { delay: 10 });
    
            await page.click(submitButton);

            console.log("I'm connected to https://mobilax.fr ! Let's get started !");

        } catch (e) {
            console.log(e);
            console.log("I failed to connect to https://mobilax.fr, make sure your credentials are right at '../config/config.json'");
        }
    }
}

module.exports = api;