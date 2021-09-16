/**
 * Google Custom Search Engine API interface
 *
 * Given a search keyword and an offset, this will request a Google CSE for
 * search results. Requires a .env file containing an API key.
 *
 * @author Vincent Bruijn <vebruijn@gmail.com>
 */
const https = require('https');
const debug = require('debug')('spoerri:cse');

/**
 * Build the URL for the CSE query
 * @param {string} sKey CSE key to be able to query
 * @param {strin} sQuery Keyword(s) to search fo
 * @param {number} nStartIndex Start index of pagination
 * @returns {string} URL
 */
function getCseUrl(sKey, sQuery, nStartIndex) {
  const sUrl =
    `https://www.googleapis.com/customsearch/v1?key=${sKey}&imgType=face&imgSize=medium&` +
    `fileType=jpg&q=${sQuery}&searchType=image&safe=medium&cx=001019564263977871109:d0hasykupmy&start=${nStartIndex}`;

  return sUrl;
}

/**
 * Use https module to fetch JSON from CSE
 * @param {string} sQuery Search keyword(s)
 * @param {number} nStartIndex Start index of pagination
 * @returns {Promise<string>} JSON response
 */
function queryCustomSearchEngine(sQuery, nStartIndex) {
  return new Promise((resolve, reject) => {
    const sKey = process.env.KEY;
    const sCseUrl = getCseUrl(sKey, sQuery, nStartIndex);
    let sRawData = '';

    https
      .get(sCseUrl, (response) => {
        debug('Retrieving search results for "%s"', sQuery);
        response.setEncoding('utf8');

        const { statusCode } = response;
        if (statusCode !== 200) {
          reject(statusCode);
        }

        response.on('data', (chunk) => (sRawData += chunk));

        response.on('end', () => resolve(sRawData));
      })
      .on('error', (error) => reject(error));
  });
}

module.exports = { queryCustomSearchEngine };
