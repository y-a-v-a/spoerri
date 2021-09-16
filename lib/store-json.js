/**
 * In DynamoDB, for each found search result, an item will be written.
 * Regardless of item already exists it is written.
 * Minimal data is used from CSE result: search keyword with hash of URL, and URL
 */
const md5 = require('./md5').md5;
const debug = require('debug')('spoerri:store-cse');
const getDynamoDBClient = require('./aws').getDynamoDBClient;

/**
 * Parse CSE JSON, get image URLs out of it and store them in AWS DynamoDB
 * @param {string} sSource JSON data to get image URLs from
 * @returns {Promise<ojbect>}
 */
function store(sSource) {
  let searchResults;
  try {
    searchResults = JSON.parse(sSource);
  } catch (e) {
    debug('Invalid CSE JSON received');
    return Promise.reject();
  }

  // search keyword
  const query = searchResults?.queries?.request?.[0]?.searchTerms;

  // create DynamoDB consumable objects containing URL to an image
  const dataItems = searchResults?.items?.map((item) => {
    const queryPart = query.replace(/[ ]+/g, '-');
    const imageUrl = item.link;
    const hash = md5(imageUrl);

    // prepare batchable items
    const PutRequest = {
      PutRequest: {
        Item: {
          id: {
            S: hash,
          },
          name: {
            S: `${queryPart}-${hash}`,
          },
          imageUrl: {
            S: imageUrl,
          },
        },
      },
    };
    return PutRequest;
  });

  // AWS DynamoDB params for batch write
  const params = {
    RequestItems: {
      spoerri: dataItems,
    },
  };

  return new Promise((resolve, reject) => {
    debug('AWS DynamoDB batchWriteItem');
    const dynamoDbClient = getDynamoDBClient();

    // initiate batchWriteItem
    dynamoDbClient.batchWriteItem(params, function (error, data) {
      if (error) reject(error);
      if (data) {
        debug(`AWS DynamoDB success`);
        resolve(data);
      }
    });
  });
}

module.exports = {
  store,
};
