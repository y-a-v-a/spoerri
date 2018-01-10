/*
 * Google Custom Search Engine API interface
 *
 * Given a search keyword and an offset, this will request a Google CSE for
 * search results. Requires a ../key.js containing an API key.
 *
 * @author Vincent Bruijn <vebruijn@gmail.com>
 */
const key = require('../key');
const https = require('https');
const http = require('http');

function getCseUrl(sKey, sQuery, startIndex) {
  const sUrl = `https://www.googleapis.com/customsearch/v1?key=${sKey}&imgType=face&imgSize=medium&` +
    `fileType=jpg&q=${sQuery}&searchType=image&safe=medium&cx=001019564263977871109:d0hasykupmy&start=${startIndex}`;

  return sUrl;
}

function getSearchResults(sQuery, startIndex) {
  return new Promise(function(resolve, reject) {
    const sCseUrl = getCseUrl(key, sQuery, startIndex);
    let rawData = '';

    https.get(sCseUrl, (res) => {
      res.setEncoding('utf8');

      const { statusCode } = res;
      if (statusCode !== 200) {
        reject(statusCode);
      }

      res.on('data', chunk => rawData += chunk);

      res.on('end', () => resolve(rawData));
    })
    .on('error', error => reject(error));
  });
}

module.exports.getSearchResults = getSearchResults;
