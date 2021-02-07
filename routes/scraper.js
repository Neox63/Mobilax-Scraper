const scraper = {
    index: 1,
    pageIndex: 2,

    async scraper(browser, url, hasPagination) {
        let page = await browser.newPage();

        await page.goto(url);

        let scrapedData = [];

        const scrapeCurrentPage = async () => {
            await page.waitForSelector('app-root');
            
            let urls = await page.$$eval('.products > div', links => {
                links = links.map(el => el.querySelector('div > a').href);

                return links;
            });

            const totalItems = await page.$eval('app-pagination > span', text => text.textContent.substring(text.textContent.indexOf('/') + 1));

            const totalPages = Math.ceil(totalItems / 50);

            const pagePromise = (link) => new Promise (async (resolve, reject) => {
                let dataObject = {};
                let newPage = await browser.newPage();
                let msAtStart = Date.now();

                await newPage.goto(link);

                try {
                    dataObject['title'] = await newPage.$eval('.name > h1', text => text.textContent);
                    
                } catch (e) {
                    console.log(e);
                    dataObject['title'] = "Titre non disponible";
                }

                try {
                    dataObject['reference'] = await newPage.$eval('.name > p', text => text.textContent.substring(5));

                } catch (e) {
                    console.log(e);
                    dataObject['reference'] = "Référence non disponible";
                }

                try {
                    dataObject['image'] = await newPage.$eval('picture > source:nth-child(2)', source => source.srcset);

                } catch (e) {
                    console.log(e);
                    dataObject['image'] = "Image non disponible";
                }

                try {
                    dataObject['description'] = await newPage.$eval('details:last-child > div', text => text.textContent);

                } catch (e) {
                    console.log(e);
                    dataObject['description'] = "Description non disponible";
                }

                try {
                    dataObject['specifications'] = await newPage.$eval('.specifications > div', text => text.textContent);

                } catch (e) {
                    console.log(e);
                    dataObject['specifications'] = "Caractéristiques non disponibles";
                }
 
                try {
                    dataObject['price'] = await newPage.$eval('.details > section:nth-child(4) > div > div > .app-typo-h2 > app-price-ht > app-price', text => text.textContent.substring(1, text.textContent.indexOf('€') - 1));

                } catch (e) {
                    console.log(e);
                    dataObject['price'] = "Prix non disponible";
                }

                console.log(`Product ${this.index} of ${totalItems} has been scrapped successfully [~${Date.now() - msAtStart} ms]`);
                this.index++;

                resolve(dataObject);

                await newPage.close();
            });

            for (link in urls) {
                const currentPageData = await pagePromise(urls[link]);
                scrapedData.push(currentPageData);
            }

            if (hasPagination) {
                let nextButtonExist = true;

                try {
                    const nextButton = await page.$eval('app-pagination > a.disabled:nth-child(9)', a => a.textContent);
                    nextButtonExist = false;
                    console.log("Nothing else to scrap there, going forward !");
                    this.index = 1;
                    this.pageIndex = 2;
    
                } catch (e) {
                    nextButtonExist = true;
                }
    
                if (nextButtonExist) {
                    await page.click('app-pagination > a:nth-child(9)');
                    this.pageIndex++;
                    console.log(`Navigating to the next page... (${this.pageIndex} of ${totalPages})`);
    
                    return scrapeCurrentPage();
                }
            }

            await page.close();

            return scrapedData;
        }

        let data = await scrapeCurrentPage();

        return data;
    }
}

module.exports = scraper;