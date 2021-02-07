const pageScraper = require('../routes/scraper.js');
const fs = require('fs').promises;
const xlsx = require('json-as-xlsx');
const api = require('../routes/api.js');
const convert = require('../utils/convertTime.js');

const url = "https://mobilax.fr";

const scrapeAll = async (browserInstance) => {
    let browser;

    try {
        let timeAtStart = Date.now();
        let fileName = 'mobilax-scrapping';

        browser = await browserInstance;
        
        await api.connect(browser, 'https://mobilax.fr/login/');

        console.log("Scraping https://www.mobilax.fr/pieces-detachees...");
        const detail = await pageScraper.scraper(browser, 'https://www.mobilax.fr/pieces-detachees', true);

        console.log("Scraping https://www.mobilax.fr/protections...");
        const protections = await pageScraper.scraper(browser, 'https://www.mobilax.fr/protections', true);

        console.log("Scraping https://www.mobilax.fr/accessoires...");
        const accessories  = await pageScraper.scraper(browser, 'https://www.mobilax.fr/accessoires', true);

        console.log("Scraping https://www.mobilax.fr/outillages...");
        const tools  = await pageScraper.scraper(browser, 'https://www.mobilax.fr/outillages', true);

        console.log("Scraping https://www.mobilax.fr/phone...");
        const phone = await pageScraper.scraper(browser, 'https://www.mobilax.fr/phone', false);

        let timeAtEnd = Date.now();
        let totalTime = timeAtEnd - timeAtStart;

        const time = convert(totalTime);
  
        console.log(`Scrapping finished in ${time}`);

        await fs.writeFile('scrap-result-detail.json', JSON.stringify(detail), 'utf-8', (err) => { if (err) return console.log(err); });

        await fs.writeFile('scrap-result-protections.json', JSON.stringify(protections), 'utf-8', (err) => { if (err) return console.log(err); });

        await fs.writeFile('scrap-result-accessories.json', JSON.stringify(accessories), 'utf-8', (err) => { if (err) return console.log(err); });

        await fs.writeFile('scrap-result-tools.json', JSON.stringify(tools), 'utf-8', (err) => { if (err) return console.log(err); });

        await fs.writeFile('scrap-result-phone.json', JSON.stringify(phone), 'utf-8', (err) => { if (err) return console.log(err); });

        const json_detail = require('../scrap-result-detail.json');
        const json_protections = require('../scrap-result-protections.json');
        const json_accessories = require('../scrap-result-accessories.json');
        const json_tools = require('../scrap-result-tools.json');
        const json_phone = require('../scrap-result-phone.json');

        const columns = [
            { label: 'Titre', value: 'title' },
            { label: 'EAN', value: 'reference' },
            { label: 'Image', value: row => url + row.image },
            { label: 'Description', value: 'description' },
            { label: 'Caractéristiques', value: 'specifications' },
            { label: 'HT Price', value: 'price' }
        ];

        const content = [ ...json_detail, ...json_protections, ...json_accessories, ...json_tools, ...json_phone ];

        const settings = {
            sheetName: 'Sheet',
            fileName: fileName,
            extraLength: 3,
            writeOptions: {}
        }

        const download = true;

        xlsx(columns, content, settings, download);
        
        console.log(`Data has been converted to .xlsx at './${fileName}.xlsx'`);

        browser.close();

    } catch (e) {
        console.log(e);
    }

    return browser;
}

module.exports = (browserInstance) => scrapeAll(browserInstance)