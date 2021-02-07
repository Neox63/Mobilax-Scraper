const browser = require('./utils/browser.js');
const controller = require('./controller/controller.js');

const browserInstance = browser.start();

controller(browserInstance);