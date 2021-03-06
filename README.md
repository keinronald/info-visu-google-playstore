# Information Visualization of the Google Playstore Data
This is a visualization of the google playstore [data](https://www.kaggle.com/lava18/google-play-store-apps).

The final result can be seen [here](http://dataviz-keinberger.surge.sh/).

### Technologie
* HTML
* SASS
* D3.js
* webpack
* Jupyter Notebook
* Panda and Numpy in Python

### What i learned:
* How to prepare the data (Jupyter Notebook)
* How to visualize data
* working with D3.js

### Installation
* If you haven't already, install [npm](https://www.npmjs.com/).
* Clone this repository to your local machine.
* `npm install`

### How to use
* `npm start` starts a local server. If you change any of the files in `src/`, the browser will reflect the changes automatically ("autorefresh", "autoreload").
* `npm run build` builds a production bundle in `dist/`

### Features
* uses sass (supporting the scss-syntax), minifies and auto-prefixes your css for production
* auto-prefixing depending on your choice of browsers you want to support in `.browserslist.rc`
* uses hashes for the js/css-filenames to prevent caching problems
* autorefreshes browsers (autoreloads)
* concatenates and minifies your js-files using webpack's intelligent dependency graph
* ES6 support via babel out of the box
* creates all the files needed for production in the build directory
* minifies images (jpg, png, jpg, svg)
* includes various icon references for touch devices
