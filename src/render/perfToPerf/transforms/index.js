const { identity } = require('./identity');
const { justTheBible } = require('./justTheBible');
const { stripUwAlignment } = require('./stripUwAlignment');
const { mergePerfText, mergePerfTextCode } = require('./mergePerfText');

module.exports = {
    identity,
    justTheBible,
    mergePerfText,
    stripUwAlignment,
    mergePerfTextCode,
};
