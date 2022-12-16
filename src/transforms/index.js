// import perf2perf from './perf2perf';
// import sofria2sofria from './sofria2sofria';
// import perf2x from './perf2x';
// import alignment from './alignment';
// import usfm2x from './usfm2x';

const alignment = require('./alignment');
const perf2perf = require('./perf2perf');
const sofria2sofria = require('./sofria2sofria');
const perf2x = require('./perf2x');
const usfm2x = require('./usfm2x');

module.exports = {
    perf2perf,
    perf2x,
    sofria2sofria,
    alignment,
    usfm2x,
};
