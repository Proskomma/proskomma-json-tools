import PerfRenderFromJson from '../../../PerfRenderFromJson';
const { verseWordsActions } = require('../renderActions/verseWords');

const verseWordsCode = function ({ perf }) {
    const cl = new PerfRenderFromJson(
        {
            srcJson: perf,
            actions: verseWordsActions
        }
    );
    const output = {};
    cl.renderDocument({ docId: "", config: {}, output });
    return { verseWords: output.cv };
}

const verseWords = {
    name: "verseWords",
    type: "Transform",
    description: "PERF=>JSON: Counts words occurrences",
    inputs: [
        {
            name: "perf",
            type: "json",
            source: ""
        },
    ],
    outputs: [
        {
            name: "verseWords",
            type: "json",
        }
    ],
    code: verseWordsCode
}

module.exports = { verseWords };
