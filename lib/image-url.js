const md5 = require('./md5').md5;
const debug = require('debug')('spoerri:aws-get-img-url');
const getDynamoDBClient = require('./aws').getDynamoDBClient;

/**
 * Retrieve images of a type
 * @param {string} sType CLOTH or PLATE
 * @returns {Promise<string>}
 */
function retrieve(sType) {
  debug('Retrieving random image URL');
  return fnGetRandomUrl(sType);
}

async function fnGetRandomUrl(sType, resolve, reject) {
  const oSearchResult = await fnGetSearchResultAws(sType);
  const aItems = oSearchResult?.Items || [];
  if (!aItems.length) {
    debug('Empty results');
    return '';
  }

  const rMime = /\.(jpg|png|gif|bmp)$/;
  let sUrl = '';
  let tries = 0;
  do {
    const nRandomIndex = Math.round(Math.random() * (aItems.length - 1));
    sUrl = fnSanitizeUrl(aItems[nRandomIndex].imageUrl.S);
    if (tries++ >= aItems.length) {
      break;
    }
  } while (!rMime.test(sUrl));

  debug(`Continuing with ${sUrl}`);
  return sUrl;
}

/**
 * Perform a scan on a dynamodb in aws containing image URLs
 * @see https://bahr.dev/2021/01/07/serverless-random-records/
 * @todo implement use of sType
 * @param {string} sType Type CLOTH or PLATE
 * @returns {object}
 */
async function fnGetSearchResultAws(sType) {
  debug('Initiate DynamoDB scan');
  const dynamoDBClient = getDynamoDBClient();

  const oResult = await dynamoDBClient
    .scan({
      TableName: 'spoerri',
      ConsistentRead: false,
      FilterExpression: 'contains(#6ae90, :6ae90)',
      Limit: 6,
      ExclusiveStartKey: {
        id: { S: md5(Math.random().toString(36)) },
        name: { S: 'a' },
      },
      ExpressionAttributeValues: {
        ':6ae90': {
          S: sType,
        },
      },
      ExpressionAttributeNames: {
        '#6ae90': 'name',
      },
    })
    .promise();

  if (oResult?.Items?.length) {
    return oResult;
  }
  debug('Received no results...?');
}

/**
 * Remove query part of image url
 * @param {string} sUrl link to image
 * @returns {string}
 */
function fnSanitizeUrl(sUrl) {
  let sReturnUrl = sUrl;
  const rSanitizer = /(\.)(jpg|png|bmp|gif|jpeg)(.+)/;

  if (rSanitizer.test(sUrl)) {
    sReturnUrl = sUrl.replace(rSanitizer, function (match, p1, p2, p3) {
      return p1 + p2;
    });
  }
  return sReturnUrl;
}

module.exports = {
  retrieve,
};
