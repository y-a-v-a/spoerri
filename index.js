const fs = require('fs');
const imageFetch = require('./lib/image-fetch');
const fetchRunner = require('./lib/fetch-runner');
const imageUrl = require('./lib/image-url');
const gd = require('node-gd');
const debug = require('debug')('app');

const oSearchKeywords = {
  plate: [
    'finished plate',
    'finished plate of food',
    'finished dinner plate',
    'finished dinner',
    'empty plate of food',
    'finished plate on table',
    'finished plate dinner',
    'finished plate lunch',
    'just finished plate of food'
  ],
  cloth: [
    'table cloth patterns',
    'table cloth',
    'table cloth detail',
    'table cloth design',
    'tablecloth painting',
    'tablecloth background',
    'tablecloth textture',
    'tablecloth plastic',
    'tablecloth design embroidery'
  ]
};

debug('Starting...');

fetchRunner.run(oSearchKeywords);

function createTable() {
  debug('About to create a table...');
  const CLOTH = 'cloth';
  const PLATE = 'plate';

  const nTableGuests = Math.round(Math.random() * 10) + 2;

  const pImageUrls = [
    imageUrl.retrieve(CLOTH)
  ];

  for(let i = 0; i < nTableGuests; i++) {
    pImageUrls.push(imageUrl.retrieve(PLATE));
  }

  Promise.all(pImageUrls).then((aImageUrls) => {
    debug('%d image URLs fetched.', aImageUrls.length);
    const pImagesFetched = [];
    aImageUrls.forEach((sImageUrl) => {
      pImagesFetched.push(imageFetch.fetch(sImageUrl));
    })

    Promise.all(pImagesFetched).then((aImages) => {
      const gdClothImage = aImages.shift();
      const nTotal = aImages.length
      const nGridsize = nTotal % 2 === 0 ? nTotal / 2 :((nTotal * 2) + 2) / 4;
      const nResultWidth = 250 * nGridsize;

      let gdTargetImage = gd.createTrueColorSync(nResultWidth, 500);
      gdClothImage.copyResized(gdTargetImage, 0, 0, 0, 0, nResultWidth, 500, gdClothImage.width, gdClothImage.height);

      aImages.forEach((gdImage, nIndex) => {
        gdImage.alphaBlending(1);
        const nColor = gdImage.getPixel(10, 10);
        const nColor2 = gd.trueColor(255, 0, 0);
        const nThreshold = Math.random() * 3;

        gdImage.colorReplaceThreshold(nColor, nColor2, nThreshold);
        gdImage.colorTransparent(nColor2);

        const x = (nIndex > (nGridsize - 1) ? nIndex - nGridsize : nIndex) * 250;
        const y = nIndex > Math.ceil(nGridsize / 2) ? 250 : 0;

        const dx = Math.min(250, gdImage.width);
        const dy = Math.min(250, gdImage.height);

        if (nIndex <= Math.ceil(nGridsize / 2)) {
          gdImage.flipVertical();
        }
        gdImage.copyResized(gdTargetImage, x, y, 0, 0, dx, dy, gdImage.width, gdImage.height);
      });

      gdTargetImage.saveJpeg(`./tmp/result${Date.now()}.jpg`, Math.round(Math.random() * 100), (error) => {
        if (error) {
          console.log(error);
        }
        debug('Stored newly created table!');
      });
      gdTargetImage.destroy();

      aImages.forEach(gdImage => gdImage.destroy());
    }).catch((message) => {
      debug('Error %s', message);
    });
  });
}

setInterval(createTable, 20 * 1000);
