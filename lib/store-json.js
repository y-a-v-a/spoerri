const md5 = require('./md5').md5;
const debug = require('debug')('spoerri:store-cse');
const getDynamoDBClient = require('./aws').getDynamoDBClient;

function store(sSource) {
  let searchResults;
  try {
    searchResults = JSON.parse(sSource);
  } catch (e) {
    debug('Invalid CSE JSON received');
    return Promise.reject();
  }

  const query = searchResults?.queries?.request?.[0]?.searchTerms;
  const dataItems = searchResults?.items?.map((item) => {
    const queryPart = query.replace(/[ ]+/g, '-');
    const imageUrl = item.link;
    const hash = md5(imageUrl);

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

  // AWS DynamoDB params
  const params = {
    RequestItems: {
      spoerri: dataItems,
    },
  };

  return new Promise((resolve, reject) => {
    debug('AWS DynamoDB batchWriteItem');
    const dynamoDbClient = getDynamoDBClient();

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
