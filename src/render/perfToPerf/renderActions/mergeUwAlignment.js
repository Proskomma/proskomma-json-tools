const usfmJsHelps = require('../../../usfmJsHelps');
const xre = require("xregexp");

const mergeUwAlignmentActions = {

    startDocument: [
        {
            description: "Make alignment lookup",
            test: () => true,
            action: ({config, context, workspace, output}) => {
                workspace.chapter = null;
                workspace.verses = null;
                workspace.verseWordOccurrences = {};
                workspace.alignmentLookup = usfmJsHelps.alignmentLookupFromUsfmJs(config.usfmJs);
                workspace.zalnNesting = 0;
                console.log(JSON.stringify(workspace.alignmentLookup["1"]["1"], null, 2))
                output.perf = {};
                output.occurrences = {};
                return true;
            }
        },
    ],
    mark: [
        {
            description: "Update CV state",
            test: () => true,
            action: ({context, workspace, output}) => {
                try {
                    const element = context.sequences[0].element;
                    if (element.subType === "chapter") {
                        workspace.chapter = element.atts["number"];
                        workspace.verses = null;
                        output.occurrences[workspace.chapter] = {};

                    } else if (element.subType === "verses") {
                        workspace.verses = element.atts["number"];
                        workspace.verseWordOccurrences = {};
                        output.occurrences[workspace.chapter][workspace.verses] = [];
                    }
                } catch (err) {
                    console.error(err);
                    throw err;
                }
                return true;
            },
        },
    ],
    text: [
        {
            description: "Maintain occurrences, add alignment when match found",
            test: ({context}) => context.sequences[0].type === "main",
            action: ({context, workspace, output}) => {
                const regexes = {
                    wordlike: xre('([\\p{Letter}\\p{Number}\\p{Mark}\\u2060]{1,127})'),
                    unwordlike: xre('(([\\p{Separator}\t]{1,127})|([\\p{Punctuation}\\p{Math_Symbol}\\p{Currency_Symbol}\\p{Modifier_Symbol}\\p{Other_Symbol}]))+')
                }
                regexes.all = xre.union([regexes.wordlike, regexes.unwordlike]);
                const texts = context.sequences[0].element.text;
                const textBits = xre.match(texts, regexes.all, 'all');
                for (const text of textBits) {
                    const text = texts;
                    if (xre.test(text, regexes.wordlike)) {
                        if (!workspace.verseWordOccurrences[text]) {
                            workspace.verseWordOccurrences[text] = 0;
                        }
                        workspace.verseWordOccurrences[text]++;
                        output.occurrences[workspace.chapter][workspace.verses].push(workspace.verseWordOccurrences[text]);
                        const alignmentKey = `${text}_${workspace.verseWordOccurrences[text]}`;
                        const alignmentStartRecord = workspace.alignmentLookup[workspace.chapter][workspace.verses].before[alignmentKey];
                        if (alignmentStartRecord) {
                            for (const alignment of alignmentStartRecord) {
                                const milestone = {
                                    "type": "start_milestone",
                                    "subtype": "usfm:zaln",
                                    "atts": {
                                        "x-strong": [alignment.strong],
                                        "x-lemma": [alignment.lemma],
                                        "x-morph": [alignment.morph.split(',')],
                                        "x-occurrence": [`${alignment.occurrence}`],
                                        "x-occurrences": [`${alignment.occurrences}`],
                                        "x-content": [alignment.content]
                                    }
                                }
                                workspace.outputContentStack[0].push(milestone);
                                workspace.zalnNesting++;
                            }
                            if (workspace.zalnNesting > 0) {
                                const wrapper = {
                                    "type": "wrapper",
                                    "subtype": "usfm:w",
                                    "content": [text],
                                    "atts": {
                                        "x-occurrence": [`${workspace.verseWordOccurrences[text]}`],
                                        "x-occurrences": ["0"]
                                    }
                                };
                                workspace.outputContentStack[0].push(wrapper);
                            } else {
                                workspace.outputContentStack[0].push(text);
                            }
                            const alignmentEndRecord = workspace.alignmentLookup[workspace.chapter][workspace.verses].after[alignmentKey];
                            if (alignmentEndRecord) {
                                for (const alignment of alignmentEndRecord) {
                                    const milestone = {
                                        "type": "end_milestone",
                                        "subtype": "usfm:zaln",
                                        "atts": {
                                            "x-strong": [alignment.strong],
                                            "x-lemma": [alignment.lemma],
                                            "x-morph": [alignment.morph.split(',')],
                                            "x-occurrence": [`${alignment.occurrence}`],
                                            "x-occurrences": [`${alignment.occurrences}`],
                                            "x-content": [alignment.content]
                                        }
                                    }
                                    workspace.outputContentStack[0].push(milestone);
                                    console.log(text);
                                    if (text.startsWith("Dieu")) {
                                        console.log(alignmentKey)
                                        console.log(alignmentEndRecord)
                                        process.exit(1)
                                    }
                                    workspace.zalnNesting--;
                                }
                            }
                            /*
                                                                                    console.log(
                                                                                        (alignmentStartRecord && alignmentStartRecord.map(r => r.strong).join(', ')) || "-",
                                                                                        `'${alignmentKey}'`,
                                                                                        (alignmentEndRecord && alignmentEndRecord.map(r => r.strong).join(', ')) || "-"
                                                                                    );

                             */
                        }

                    } else {
                        workspace.outputContentStack[0].push(text);
                    }
                }
                return false; // Override identity
            }
        }
    ]
};

module.exports = {mergeUwAlignmentActions};
