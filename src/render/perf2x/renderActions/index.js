const { toUsfmActions } = require('./toUsfmActions');
const { wordCountActions } = require('./wordCount');
const { calculateUsfmChapterPositionsActions } = require('./calculateUsfmChapterPositions');
const { longVerseCheckActions } = require('./longVerseCheck');
const { perfToUsfmActions } = require('./perfToUsfm');

module.exports = {
    longVerseCheckActions,
    toUsfmActions,
    wordCountActions,
    perfToUsfmActions,
    calculateUsfmChapterPositionsActions,
};
