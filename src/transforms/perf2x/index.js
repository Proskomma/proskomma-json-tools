// import longVerseCheckActions from "./longVerseCheckActions";
// import toUsfmActions from "./toUsfmActions";
// import perf2usfm from "./perf2usfm";
// import wordCountActions from "./wordCountActions";
// import wordSearchActions from "./wordSearchActions";
// import justTheBible from './justTheBible';
// import calculateUsfmChapterPositions from './calculateUsfmChapterPositions';

const {longVerseCheckActions, longVerseCheck } = require('./longVerseCheckTransform');
const {toUsfmActions} = require('./toUsfmActions');
const {perf2usfm} = require('./perf2usfm');
const {wordCountActions} = require('./wordCountActions');
const {wordSearchActions} = require('./wordSearchActions');
const {justTheBible} = require('./justTheBible');
const {calculateUsfmChapterPositions} = require('./calculateUsfmChapterPositions');

module.exports = {
    longVerseCheckActions,
    longVerseCheck,
    toUsfmActions,
    wordCountActions,
    wordSearchActions,
    justTheBible,
    perf2usfm,
    calculateUsfmChapterPositions,
};
