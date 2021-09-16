/**
 * Wrapper around the aws-sdk
 * Initiated connections will be cached
 */
const AWS = require('aws-sdk');
const debug = require('debug')('spoerri:aws');

AWS.config.update({
  region: 'eu-central-1',
});

let dynamoDBClient;
let s3Client;

module.exports.getDynamoDBClient = function () {
  debug('DynamoDB connection requested');

  if (!dynamoDBClient) {
    debug('DynamoDB connection initiated');
    dynamoDBClient = new AWS.DynamoDB({
      apiVersion: '2012-08-10',
      accessKeyId: process.env.AWS_ACCESS_KEY,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    });
  }

  return dynamoDBClient;
};

module.exports.getS3Client = function () {
  debug('S3 client requested');

  if (!s3Client) {
    debug('S3 client initiated');
    s3Client = new AWS.S3({
      accessKeyId: process.env.AWS_ACCESS_KEY,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    });
  }
  return s3Client;
};
