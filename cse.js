const key = require('./key');
const https = require('https');
const http = require('http');

function getCseUrl(key, query, startIndex) {
  return `https://www.googleapis.com/customsearch/v1?key=${key}&imgType=face&imgSize=medium&fileType=jpg&q=${query}&searchType=image&safe=medium&cx=001019564263977871109:d0hasykupmy&start=${startIndex}`;
}

function getSpoerriJson(query, startIndex) {
  return new Promise(function(resolve, reject) {
    const cseUrl = getCseUrl(key, query, startIndex);
    let rawData = '';

    https.get(cseUrl, (res) => {
      const { statusCode } = res;
      if (statusCode !== 200) {
        reject(statusCode);
      }

      res.on('data', chunk => rawData += chunk);

      res.on('end', () => {
        resolve(rawData);
      });
    })
    .on('error', e => reject(e));
  });
}

module.exports.getSpoerriJson = getSpoerriJson;
