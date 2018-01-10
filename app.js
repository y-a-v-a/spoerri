const fetchRunner = require('./lib/fetch-runner');
const spoerriRunner = require('./lib/spoerri-runner');

const glob = require('glob');
const debug = require('debug')('app');

const express = require('express');
const app = express();

const oSearchKeywords = require('./keywords');
// fetchRunner.run(oSearchKeywords);

// spoerriRunner.run();

app.get('/spoerri.jpg', (req, res, next) => {
  const files = glob('./tmp/**.jpg', {}, (error, files) => {
    if (error) {
      throw error;
    }

    const randomIndex = Math.floor(Math.random() * files.length);
    const fileName = files[randomIndex];
    debug(fileName);

    res.sendFile(fileName, {
      root: __dirname,
      dotfiles: 'deny',
      headers: {
        'Content-Type': 'image/jpeg'
      }
    }, (error) => {
      if (error) {
        next(error);
      }
    });
  });
});

app.get('/favicon.png', (req, res, next) => {
  res.sendFile('./public/favicon.png', {
    root: __dirname,
    dotfiles: 'deny',
    headers: {
      'Content-Type': 'image/png'
    }
  }, (error) => {
    if (error) next(error);
  });
});

app.get('/robots.txt', (req, res, next) => {
  res.sendFile('./public/robots.txt', {
    root: __dirname,
    dotfiles: 'deny',
    headers: {
      'Content-Type': 'text/plain'
    }
  }, (error) => {
    if (error) next(error);
  });
});

app.get('/style.css', (req, res, next) => {
  res.sendFile('./public/style.css', {
    root: __dirname,
    dotfiles: 'deny',
    headers: {
      'Content-Type': 'text/css'
    }
  }, (error) => {
    if (error) next(error);
  });
});

app.get('/', (req, res, next) => {
  res.sendFile('./public/index.html', {
    root: __dirname,
    dotfiles: 'deny',
    headers: {
      'Content-Type': 'text/html'
    }
  }, (error) => {
    if (error) next(error);
  })
});


app.listen(3000, () => console.log('Example app listening on port 3000!'));
