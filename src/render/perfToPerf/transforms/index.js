const { identity } = require('./identity');
const { justTheBible } = require('./justTheBible');
const { stripUwAlignment } = require('./stripUwAlignment');
const { mergeUwAlignment } = require('./mergeUwAlignment');
const { addUwAlignmentOccurrences } = require('./addUwAlignmentOccurrences');
const { mergePerfText, mergePerfTextCode } = require('./mergePerfText');

module.exports = {
    identity,
    justTheBible,
    mergePerfText,
    stripUwAlignment,
    mergeUwAlignment,
    addUwAlignmentOccurrences,
    mergePerfTextCode,
};
