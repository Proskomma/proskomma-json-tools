const { wordCount } = require('./wordCount');
const { calculateUsfmChapterPositions } = require('./calculateUsfmChapterPositions');
const { perfToUsfm } = require('./perfToUsfm');
const { perfToUsfmJs } = require('./perfToUsfmJs');

module.exports = {
    wordCount,
    perfToUsfm,
    perfToUsfmJs,
    calculateUsfmChapterPositions,
};
