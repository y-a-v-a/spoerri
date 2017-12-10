const gd = require('node-gd');
const https = require('https');
const http = require('http');
const spoerri = require('./cse');


const plateKeywords = [
  'finished plate',
  'empty dinner plate'
];

const tableClothKeywords = [
  'table cloth patterns',
  'table cloth'
];



var csePromise = spoerri.getSpoerriJson(plateKeywords[0], 1)
.then((data) => {
  console.log(data);
}).catch((error) => {
  console.log(error);
});
