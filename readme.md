# Spoerri

Will probably be visible on http://www.bij-ons-aan-tafel.nl any time soon.

Tableau Piège - Snare Picture

A "Snare Picture" online results in a "Web Snare"

## License

GNU GPL v3, copyright 2017-2018 ax710.org && y-a-v-a.org

```javascript
app.get('/spoerri2.jpg', (req, res, next) => {
  const files = glob('./tmp/**.jpg', {}, (error, files) => {
    if (error) {
      throw error;
    }

    const randomIndex = Math.floor(Math.random() * files.length);
    const fileName = files[randomIndex];
    debug(fileName);

    if (!fileName) {
      return next();
    }

    res.sendFile(
      fileName,
      {
        root: __dirname,
        dotfiles: 'deny',
        headers: {
          'Content-Type': 'image/jpeg',
        },
      },
      (error) => {
        if (error) {
          next(error);
        }
      }
    );
  });
});
```
