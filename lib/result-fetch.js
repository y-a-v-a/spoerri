/**
 * Up until Sept 2021, Spoerri has been running on a VPS where it
 * created more than 26,000 images. This was about 1.3Gb. Many are
 * stored in AWS now and will be used as pool to get an image from
 * for the website.
 *
 * This module randomly gets an image from the S3 bucket.
 * Bucket: https://spoerri.s3.eu-central-1.amazonaws.com/
 *
 * Any uuid can be passed to listObjectsV2, and AWS S3 will take it
 * as a base point to get to the next existing uuid and return its key.
 *
 * In the next call, the object with that key is returned and its stream
 * is passed on to express's response object.
 *
 * Rename all files removing prefix "result-"
 * find . -name "*.jpg" -exec  sh -c 'x={}; mv "$x" $(echo $x | sed 's/result-//g')' \;
 */
const debug = require('debug')('spoerri:result-fetch');
const getS3Client = require('./aws').getS3Client;
const uuidv4 = require('uuid/v4');
const fs = require('fs');

const s3Client = getS3Client();

/**
 * Stream random queried image from AWS S3
 * @returns {ReadableStream}
 */
module.exports = async function getRandomResult() {
  const uuid = uuidv4();

  try {
    // first call listObjectsV2 to get random key
    const listResponse = await s3Client
      .listObjectsV2({
        Bucket: 'spoerri',
        MaxKeys: 1,
        StartAfter: `${uuid}.jpg`,
      })
      .promise();

    const Key = listResponse?.Contents?.[0]?.Key;
    debug(`S3 key for object: ${Key}`);
    if (Key) {
      // after obtaining key, get the bound object
      return s3Client.getObject({ Bucket: 'spoerri', Key }).createReadStream();
    }
  } catch (e) {
    debug(e.message);
    // fallback to static asset
    return fs.createReadStream('public/_spoerri.jpg');
  }
};
