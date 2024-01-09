const { identityActions } = require('./identity');
const { justTheBibleActions } = require('./justTheBible');
const { stripUwAlignmentActions } = require('./stripUwAlignment');
const { mergeUwAlignmentActions } = require('./mergeUwAlignment');
const { addUwAlignmentOccurrences } = require('./addUwAlignmentOccurrences');

module.exports = {
    identityActions,
    justTheBibleActions,
    stripUwAlignmentActions,
    mergeUwAlignmentActions,
    addUwAlignmentOccurrences
};
