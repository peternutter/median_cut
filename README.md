# Quantize image using median cut algorithm

## Usage
This application uses the median cut algorithm to construct a color palette from an image. 
The palette is then used to quantize the image. 
The result is a new image with a reduced number of colors.
Currently, jpeg and png images are supported.
The file is saved in the home directory of the user in new folder `electron-images`.

### Prerequisites
* Node.js
* npm
### Install
```bash
$ npm install
```
### Run for the first time to compile typescript to javascript
```bash
$ npm run build
```
### Run
```bash
$ npm start
```
### Keep the app running
```bash
$  npx electronmon .
```

### Extra info
There is an image resizer algorithm implemented the ui elements are commented out.
