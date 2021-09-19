/**
 * This module acutually makes the Spoerri inspired table images
 * by merging several images of "plates" on top of an image of
 * a "table cloth".
 * @author Vincent Bruijn <vebruijn@gmail.com>
 */
const imageFetch = require('./image-fetch');
const imageUrl = require('./image-url');
const gd = require('node-gd');
const debug = require('debug')('spoerri:spoerri-builder');
const uuidv4 = require('uuid/v4');
const getS3Client = require('./aws').getS3Client;
const { getFallback } = require('./noob');

/**
 * A worker function that builds an image out of
 * a collection of other images
 */
async function createTableImage() {
  debug('Starting...');

  const uuid = uuidv4();
  debug(`About to create a spoerri table: ${uuid}`);

  const CLOTH = 'cloth';
  const PLATE = 'plate';

  const nTableGuests = Math.round(Math.random() * 8) + 4;

  // 1 table cloth URL from DynamoDB
  const pImageUrls = [imageUrl.retrieve(CLOTH)];

  // multiple plate images URLs from DynamoDB
  for (let i = 0; i < nTableGuests; i++) {
    pImageUrls.push(imageUrl.retrieve(PLATE));
  }

  Promise.all(pImageUrls)
    .then((aImageUrls) => {
      debug(`%d image URLs fetched for ${uuid}`, aImageUrls.length);

      const pImagesFetched = [];
      aImageUrls.forEach((sImageUrl, idx) => {
        pImagesFetched.push(imageFetch.fetch(sImageUrl, idx));
      });

      Promise.all(pImagesFetched)
        .then(async (aImages) => {
          debug(`%d images fetched for ${uuid}`, aImages.length);

          const gdClothImage = aImages.shift() || (await getFallback());
          const nTotal = aImages.length;
          const nGridsize =
            nTotal % 2 === 0 ? nTotal / 2 : (nTotal * 2 + 2) / 4;
          const nResultWidth = 250 * nGridsize;

          let gdTargetImage = gd.createTrueColorSync(nResultWidth, 500);
          gdClothImage.copyResized(
            gdTargetImage,
            0,
            0,
            0,
            0,
            nResultWidth,
            500,
            gdClothImage.width,
            gdClothImage.height
          );

          aImages.forEach((gdImage, nIndex) => {
            if (gdImage === null) {
              return;
            }
            gdImage.alphaBlending(1);

            let offset = gdImage.width > 10 && gdImage.height > 10 ? 10 : 1;
            const nColor = gdImage.getTrueColorPixel(offset, offset);
            const nColor2 = gd.trueColor(255, 0, 0);
            const nThreshold = Math.random() * 3;

            gdImage.colorReplaceThreshold(nColor, nColor2, nThreshold);
            gdImage.colorTransparent(nColor2);

            let x =
              (nIndex > nGridsize - 1 ? nIndex - nGridsize : nIndex) * 250;
            let y = nIndex > Math.ceil(nGridsize / 2) ? 250 : 0;

            x += Math.round(Math.abs(gdImage.width - 250) * Math.random());
            y += Math.round(Math.abs(gdImage.height - 250) * Math.random());

            x += Math.round(Math.random() * 20 - 10);
            y += Math.round(Math.random() * 20 - 10);

            const dx = Math.min(250, gdImage.width);
            const dy = Math.min(250, gdImage.height);

            if (nIndex <= Math.ceil(nGridsize / 2)) {
              gdImage.flipVertical();
            }
            gdImage.copyResized(
              gdTargetImage,
              x,
              y,
              0,
              0,
              dx,
              dy,
              gdImage.width,
              gdImage.height
            );
          });

          const newFileName = `${uuid}.jpg`;
          const compressionLevel = Math.round(Math.random() * 70);
          await saveToS3(newFileName, gdTargetImage.jpegPtr(compressionLevel));
          // try {
          //   await gdTargetImage.saveJpeg(`./${newFileName}`, compressionLevel);
          // } catch {}

          gdTargetImage.destroy();

          aImages
            .filter((element) => !!element)
            .forEach((gdImage) => {
              try {
                gdImage.destroy();
              } catch {}
            });
        })
        .catch((message) => {
          debug(`Error image fetch for ${uuid}: %s`, message);
        });
    })
    .catch((message) => {
      debug(`Error URLs fetch for ${uuid}: %s`, message);
    });
}

async function saveToS3(name, jpegData) {
  const s3Client = getS3Client();

  try {
    const response = await s3Client
      .putObject({
        Bucket: 'spoerri',
        Key: name,
        Body: jpegData,
      })
      .promise();
    return response;
  } catch (error) {
    debug(`Unable to store image to S3: ${error.message}`);
    return;
  }
}

module.exports.createTableImage = createTableImage;
