const https = require('https');
const http = require('http');
const gd = require('node-gd');
const debug = require('debug')('spoerri:image-fetch');

/**
 * Return fallback image
 * @returns {gd.Image} Image of 1 x 1 pixel
 */
function getNoob() {
  debug('Noob image requested');
  const noob = gd.createTrueColorSync(1, 1);
  const color = gd.trueColor(234, 66, 103);
  noob.rectangle(0, 0, 1, 1, color);
  return noob;
}

/**
 * Fetch image data from a remote URL
 * @param {string} url URL of the image to fetch
 * @returns {Promise<gd.Image>}
 */
function fetchImage(url) {
  return new Promise((resolve, reject) => {
    const transport = isHttps(url) ? https : http;
    let imageExtension;
    try {
      imageExtension = getImageExtension(url);
    } catch (e) {
      debug(e.message);
      return resolve(getNoob());
    }

    const gdMethodName = `createFrom${imageExtension}Ptr`;

    transport
      .get(url, (res) => {
        debug(`Receiving image data for ${url}`);
        res.setEncoding('latin1');

        let rawData = '';
        res.on('data', (chunk) => (rawData += chunk));

        res.on('end', () => {
          const gdMethod = gd[gdMethodName];
          const buffer = Buffer.from(rawData, 'latin1');

          if (!buffer.length) {
            resolve(getNoob());
            return;
          }

          try {
            debug('Image complete');
            const image = gdMethod(buffer);
            resolve(image);
          } catch (e) {
            debug(e);
            resolve(getNoob());
          }
        });
      })
      .on('error', (error) => {
        debug(error);
        resolve(getNoob());
      });
  });
}

/**
 * Derive image mime type from URL
 * @param {string} url URL to get extension of
 * @returns {string}
 */
function getImageExtension(url) {
  const extension = url.split('.').pop();
  const mimes = ['jpg', 'jpeg', 'png', 'bmp', 'gif'];
  if (!extension || mimes.indexOf(extension) === -1) {
    throw new Error('Url has no valid image extension');
  }
  return extension === 'jpg' ? 'Jpeg' : upperCaseFirst(extension);
}

/**
 * Make first character upper case of a string
 * @param {string} someString String to upper case first character
 * @returns {string}
 */
function upperCaseFirst(someString) {
  return someString.replace(/^([a-z]{1})(.*)/, (match, p1, p2) => {
    return p1.toUpperCase() + p2;
  });
}

/**
 * Test if a given URL starts with https
 * @param {string} sUrl String to check if https
 * @returns {boolean}
 */
function isHttps(sUrl) {
  const substring = sUrl.substr(0, 5);

  if (!/^http/.test(sUrl)) {
    throw new Error(`Unsupported protocol: ${substring}`);
  }

  return substring === 'https';
}

module.exports.fetch = fetchImage;
