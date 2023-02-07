const { wordCount } = require('./wordCount');
const { calculateUsfmChapterPositions } = require('./calculateUsfmChapterPositions');
const { perfToUsfm } = require('./perfToUsfm');

module.exports = {
    wordCount,
    perfToUsfm,
    calculateUsfmChapterPositions,
};
