const https = require('https');
const http = require('http');
const gd = require('node-gd');
const fs = require('fs');

const debug = require('debug')('image-fetch');

function getNoob() {
  return gd.createTrueColorSync(1, 1);
}

function fetchImage(url) {
  return new Promise((resolve, reject) => {
    const transport = isHttps(url) ? https : http;
    let imageExtension = getImageExtension(url);
    const gdMethodName = `createFrom${imageExtension}Ptr`;

    transport.get(url, (res) => {
      res.setEncoding('latin1');

      let rawData = '';
      res.on('data', chunk => rawData += chunk);

      res.on('end', () => {
        const gdMethod = gd[gdMethodName];
        const buffer = Buffer.from(rawData, 'latin1');

        if (!buffer.length) {
          resolve(getNoob());
          return;
        }

        try {
          const image = gdMethod(buffer);
          resolve(image);
        } catch (e) {
          debug(e);
          resolve(getNoob());
        }
      });
    }).on('error', (error) => {
      debug(error);
      resolve(getNoob());
    });
  });
}

function getImageExtension(url) {
  const extension = url.split('.').pop();
  const mimes = ['jpg', 'jpeg', 'png', 'bmp', 'gif'];
  if (!extension || mimes.indexOf(extension) === -1) {
    throw new Error('Url has no valid image extension');
  }
  return extension === 'jpg' ? 'Jpeg' : upperCaseFirst(extension);
}

function upperCaseFirst(someString) {
  return someString.replace(/^([a-z]{1})(.*)/, (match, p1, p2) => {
    return p1.toUpperCase() + p2;
  });
}

function isHttps(url) {
  const substring = url.substr(0, 5);

  if (!/^http/.test(url)) {
    throw new Error(`Unsupported protocol: ${substring}`);
  }

  return substring === 'https';
}

module.exports.fetch = fetchImage;
