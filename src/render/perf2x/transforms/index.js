const { wordCount } = require('./wordCount');
const { calculateUsfmChapterPositions } = require('./calculateUsfmChapterPositions');
const { longVerseCheck } = require('./longVerseCheck');
const { perfToUsfm } = require('./perfToUsfm');

module.exports = {
    longVerseCheck,
    wordCount,
    perfToUsfm,
    calculateUsfmChapterPositions,
};
