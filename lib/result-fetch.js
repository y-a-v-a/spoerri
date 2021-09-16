/**
 * https://spoerri.s3.eu-central-1.amazonaws.com/
 *
 * Rename all files removing prefix "result-"
 * find . -name "*.jpg" -exec  sh -c 'x={}; mv "$x" $(echo $x | sed 's/result-//g')' \;
 */
const debug = require('debug')('spoerri:result-fetch');
const getS3Client = require('./aws').getS3Client;
const uuidv4 = require('uuid/v4');
const fs = require('fs');

const s3Client = getS3Client();

module.exports = async function getRandomResult() {
  const uuid = uuidv4();

  try {
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
      return s3Client.getObject({ Bucket: 'spoerri', Key }).createReadStream();
    }
  } catch (e) {
    debug(e.message);
    return fs.createReadStream('public/_spoerri.jpg');
  }
};
