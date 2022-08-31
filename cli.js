#!/usr/bin/env node
/* eslint-disable no-undef */
/* eslint-disable no-param-reassign */
const fs = require('fs-extra');
const yargs = require('yargs');
const printMessage = require('print-message');
const {
  cleanUp,
  getStoragePath,
  zipResults,
  setHeadlessMode,
  generateRandomToken,
  setThresholdLimits,
} = require('./utils');
const { checkUrl, prepareData, isSelectorValid, isInputValid } = require('./constants/common');
const {
  bambooOptions,
  messageOptions,
  configureReportSetting,
} = require('./constants/cliFunctions');
const { scannerTypes } = require('./constants/constants');
const { consoleLogger } = require('./logs');
const { combineRun } = require('./combine');

setHeadlessMode(true);

cleanUp('apify_storage');

const options = yargs
  .usage('Usage: node cli.js -c <crawler> -u <url> OPTIONS')
  .strictOptions(true)
  .options(bambooOptions)
  .example([
    [`To scan sitemap of website:', 'node cli.js -c [ 1 | ${scannerTypes.sitemap} ] -u <url_link>`],
    [`To scan a website', 'node cli.js -c [ 2 | ${scannerTypes.website} ] -u <url_link>`]
  ])
  .coerce('c', option => {
    if (typeof option === 'number') {
      // Will also allow integer choices
      switch (option) {
        case 1:
          option = scannerTypes.sitemap;
          break;
        case 2:
          option = scannerTypes.website;
          break;
        default:
          printMessage(
            [
              'Invalid option',
              `Please choose to enter numbers (1,2) or keywords (${scannerTypes.sitemap}, ${scannerTypes.website}).`,
            ],
            messageOptions,
          );
          process.exit(1);
      }
    }

    return option;
  })
  .epilogue('').argv;

const randomToken = generateRandomToken();

const scanInit = async argvs => {
  // Set the parameters required to indicate whether to break down report
  configureReportSetting(argvs.reportbreakdown);

  // Set the parameters required to indicate threshold limits
  setThresholdLimits(argvs.warn);

  // Validate the URL
  const res = await checkUrl(argvs.scanner, argvs.url);
  if (res.status === 200) {
    // To take the final url from the validation
    argvs.url = res.url;

    const data = prepareData(argvs.scanner, argvs);
    data.randomToken = randomToken;

    printMessage(['Scanning website...'], messageOptions);
    await combineRun(data);
  } else {
    printMessage(
      [`Invalid ${argvs.scanner} page. Please provide a URL to start the ${argvs.scanner} scan.`],
      messageOptions,
    );
    process.exit(1);
  }
};

scanInit(options).then(async () => {
  const storagePath = getStoragePath(randomToken);
  const reportPath = `${storagePath}/reports`;
  const finalPath = `${reportPath}/${randomToken}.zip`;

  await fs
    .ensureDir(reportPath)
    .then(async () => {
      await zipResults(finalPath, reportPath);
      const messageToDisplay = [
        `Report of this run is ${randomToken}.zip under ${reportPath}.`,
      ];

      if (process.env.REPORT_BREAKDOWN === '1') {
        messageToDisplay.push(
          'Reports have been further broken down according to their respective impact level.',
        );
      }
      printMessage(messageToDisplay);
    })
    .catch(error => {
      printMessage([`Error in zipping results: ${error}`]);
    });
});
