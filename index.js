const fs = require('fs');
const imageFetch = require('./image-fetch');
const fetchRunner = require('./fetch-runner');
const imageUrl = require('./image-url');
const gd = require('node-gd');

const oSearchKeywords = {
  plate: [
    'finished plate',
    'empty dinner plate',
    'finished dinner plate'
  ],
  cloth: [
    'table cloth patterns',
    'table cloth',
    'table cloth detail'
  ]
};

const CLOTH = 'cloth';
const PLATE = 'plate';

// fetchRunner.run(oSearchKeywords);

const pImageUrls = [
  imageUrl.retrieve(CLOTH),
  imageUrl.retrieve(PLATE),
  imageUrl.retrieve(PLATE),
  imageUrl.retrieve(PLATE),
  imageUrl.retrieve(PLATE),
  imageUrl.retrieve(PLATE),
  imageUrl.retrieve(PLATE)
];

Promise.all(pImageUrls).then((aImageUrls) => {
  const pImagesFetched = [];
  aImageUrls.forEach((sImageUrl) => {
    pImagesFetched.push(imageFetch.fetch(sImageUrl));
  })

  Promise.all(pImagesFetched).then((aImages) => {
    const gdCloth = aImages.shift();
    const nTotal = aImages.length
    const nGridsize = nTotal % 2 === 0 ? nTotal / 2 :((nTotal * 2) + 2) / 4;
    const nResultWidth = 250 * nGridsize;

    let img = gd.createTrueColorSync(nResultWidth, 500);
    gdCloth.copyResized(img, 0, 0, 0, 0, nResultWidth, 500, gdCloth.width, gdCloth.height);

    aImages.forEach((gdImage, nIndex) => {
      gdImage.alphaBlending(1);
      const nColor = gdImage.getPixel(10, 10);
      gdImage.colorReplaceThreshold(nColor, nColor, 50);
      gdImage.colorTransparent(nColor);

      const x = (nIndex > (nGridsize - 1) ? nIndex - nGridsize : nIndex) * 250;
      const y = nIndex > Math.ceil(nGridsize / 2) ? 250 : 0;

      const dx = Math.min(250, gdImage.width);
      const dy = Math.min(250, gdImage.height);

      if (nIndex > Math.ceil(nGridsize / 2)) {
        gdImage.copyResized(img, x, y, 0, 0, dx, dy, gdImage.width, gdImage.height);
      } else {
        gdImage.copyRotated(img, x + 125, y + 125, 0, 0, gdImage.width, gdImage.height, 180);
      }
    });

    img.saveJpeg(`./tmp/result${Date.now()}.jpg`, 49, (error) => {
      if (error) {
        console.log(error);
      }
    });
    img.destroy();

    aImages.forEach(gdImage => gdImage.destroy());
  });
});

// grab random image from plate result
// grab random image from cloth result

// overlay them




/*

var csePromise = cse.getSearchResults(plateKeywords[0], 1)
.then((data) => {
  const searchResult = JSON.parse(data);
  if (searchResult.items) {
    const url = searchResult.items[2].link;

    imageFetch.fetch(url).then((image) => {
      image.saveJpeg(`./tmp/test${Date.now()}.jpg`, 90, (error) => {
        if (error) {
          throw error;
        }
      });
    }).catch((error) => {
      console.log(error);
    })
  }
}).catch((error) => {
  console.log(error);
});


let retrievePromise = new Promise((resolve, reject) => {
  // retrieve 2 images
})
retrievePromise.then((plateImage, clothImage) => {
  let img = gd.createTrueColorSync(500, 500);
  plateImage.copyResized(img, 0, 0, 0, 0, plateImage.width, plateImage.height,plateImage.width, plateImage.height );
  clothImage.copyResized(img, 250, 250, 0, 0, clothImage.width, clothImage.height,clothImage.width, clothImage.height );
  img.saveJpeg(`./tmp/result${Date.now()}.jpg`, 100)
}).catch((error) => {
  console.log(error);
})
*/
