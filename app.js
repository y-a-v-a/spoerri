require('dotenv').config();

const fetchRunner = require('./lib/fetch-runner');
// const spoerriRunner = require('./lib/spoerri-runner'); // @todo
const getRandomResult = require('./lib/result-fetch');

const debug = require('debug')('spoerri:app');

const express = require('express');
const app = express();

const oSearchKeywords = require('./keywords');
fetchRunner.run(oSearchKeywords);

// spoerriRunner.run();

app.get('/spoerri.jpg', async (req, res, next) => {
  return (await getRandomResult()).pipe(res);
});

app.get('/favicon.png', (req, res, next) => {
  res.sendFile(
    './public/favicon.png',
    {
      root: __dirname,
      dotfiles: 'deny',
      headers: {
        'Content-Type': 'image/png',
      },
    },
    (error) => {
      if (error) next(error);
    }
  );
});

app.get('/robots.txt', (req, res, next) => {
  res.sendFile(
    './public/robots.txt',
    {
      root: __dirname,
      dotfiles: 'deny',
      headers: {
        'Content-Type': 'text/plain',
      },
    },
    (error) => {
      if (error) next(error);
    }
  );
});

app.get('/style.css', (req, res, next) => {
  res.sendFile(
    './public/style.css',
    {
      root: __dirname,
      dotfiles: 'deny',
      headers: {
        'Content-Type': 'text/css',
      },
    },
    (error) => {
      if (error) next(error);
    }
  );
});

app.get('/', (req, res, next) => {
  res.sendFile(
    './public/index.html',
    {
      root: __dirname,
      dotfiles: 'deny',
      headers: {
        'Content-Type': 'text/html',
      },
    },
    (error) => {
      if (error) next(error);
    }
  );
});

app.listen(3000, () =>
  console.log('Example app listening on port http://localhost:3000 !')
);
