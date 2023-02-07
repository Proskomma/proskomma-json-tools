const { wordCountActions } = require('./wordCount');
const { calculateUsfmChapterPositionsActions } = require('./calculateUsfmChapterPositions');
const { perfToUsfmActions } = require('./perfToUsfm');

module.exports = {
    wordCountActions,
    perfToUsfmActions,
    calculateUsfmChapterPositionsActions,
};
