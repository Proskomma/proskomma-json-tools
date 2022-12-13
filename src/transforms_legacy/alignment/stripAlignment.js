import PerfRenderFromJson from '../../PerfRenderFromJson';
import mergeActions from '../../mergeActions';
import transforms from '..';
import xre from "xregexp";

const localStripMarkupActions = {
    startDocument: [
        {
            description: "Set up",
            test: () => true,
            action: ({ workspace, output, context }) => {
                workspace.chapter = null;
                workspace.verses = null;
                workspace.lastWord = "";
                workspace.waitingMarkup = [];
                workspace.currentOccurrences = {};
                workspace.PendingStartMilestones = [];
                output.stripped = {};
                return true;
            },
        },
    ],
    startMilestone: [
        {
            description: "Ignore zaln startMilestone events",
            test: ({ context }) =>
                context.sequences[0].element.subType === "usfm:zaln",
            action: ({ context, workspace }) => {
                const payload = context.sequences[0].element;
                payload.subtype = payload.subType;
                delete payload.subType;
                workspace.waitingMarkup.push(payload);
                workspace.PendingStartMilestones.push(payload);

            },
        },
    ],
    endMilestone: [
        {
            description: "Ignore zaln endMilestone events",
            test: ({ context }) =>
                context.sequences[0].element.subType === "usfm:zaln",
            action: ({ context, workspace, output, config }) => {
                const { chapter, verses, lastWord: word } = workspace;
                const { verseWords: totalOccurrences } = config;
                const strippedKey = [
                    "after",
                    word,
                    workspace.currentOccurrences[word],
                    totalOccurrences[chapter][verses][word],
                ].join("--");
                const payload = { ...context.sequences[0].element };
                payload.subtype = payload.subType;
                delete payload.subType;
                const record = {
                    chapter: chapter,
                    verses: verses,
                    occurrence: workspace.currentOccurrences[word],
                    occurrences: totalOccurrences[chapter][verses][word],
                    position: "after",
                    word,
                    payload,
                    startMilestone: workspace.PendingStartMilestones.shift(),
                };
                if (
                    !output.stripped[workspace.chapter][workspace.verses][strippedKey]
                ) {
                    output.stripped[workspace.chapter][workspace.verses][strippedKey] = [
                        record,
                    ];
                } else {

                    output.stripped[workspace.chapter][workspace.verses][
                        strippedKey
                    ].push(record);
                }

                return false;
            },
        },
    ],
    startWrapper: [
        {
            description: "Ignore w startWrapper events",
            test: ({ context }) => context.sequences[0].element.subType === "usfm:w",
            action: ({ context, workspace }) => {
                const payload = { ...context.sequences[0].element };
                payload.subtype = payload.subType;
                delete payload.subType;
                workspace.waitingMarkup.push(payload);
            },
        },
    ],
    endWrapper: [
        {
            description: "Ignore w endWrapper events",
            test: ({ context }) => context.sequences[0].element.subType === "usfm:w",
            action: ({ context }) => { },
        },
    ],
    text: [
        {
            description: "Log occurrences",
            test: () => true,
            action: ({ context, workspace, output, config }) => {
                try {
                    const text = context.sequences[0].element.text;
                    const re = xre("([\\p{Letter}\\p{Number}\\p{Mark}\\u2060]{1,127})");
                    const words = xre.match(text, re, "all");
                    const { chapter, verses } = workspace;
                    const { verseWords: totalOccurrences } = config;
                    for (const word of words) {
                        workspace.currentOccurrences[word] ??= 0;
                        workspace.currentOccurrences[word]++;
                        while (workspace.waitingMarkup.length) {
                            const payload = workspace.waitingMarkup.shift();
                            const strippedKey = [
                                "before",
                                word,
                                workspace.currentOccurrences[word],
                                totalOccurrences[chapter][verses][word],
                            ].join("--");
                            const record = {
                                chapter: chapter,
                                verses: verses,
                                occurrence: workspace.currentOccurrences[word],
                                occurrences: totalOccurrences[chapter][verses][word],
                                position: "before",
                                word,
                                payload: {
                                    ...payload,
                                    ...(payload.subtype === "usfm:w" && { content: [word] }),
                                },
                            };
                            if (
                                !output.stripped[workspace.chapter][workspace.verses][
                                strippedKey
                                ]
                            ) {
                                output.stripped[workspace.chapter][workspace.verses][
                                    strippedKey
                                ] = [record];
                            } else {
                                output.stripped[workspace.chapter][workspace.verses][
                                    strippedKey
                                ].push(record);
                            }
                        }
                        workspace.lastWord = word;
                    }
                } catch (err) {
                    throw new Error(err);
                }
                return true;
            },
        },
    ],
    mark: [
        {
            description: "Update CV state",
            test: () => true,
            action: ({ context, workspace, output }) => {
                try {
                    const element = context.sequences[0].element;
                    if (element.subType === "chapter") {
                        workspace.chapter = element.atts["number"];
                        workspace.verses = 0;
                        workspace.lastWord = "";
                        workspace.currentOccurrences = {};
                        output.stripped[workspace.chapter] = {};
                        output.stripped[workspace.chapter][workspace.verses] = {};
                    } else if (element.subType === "verses") {
                        workspace.verses = element.atts["number"];
                        workspace.lastWord = "";
                        workspace.currentOccurrences = {};
                        output.stripped[workspace.chapter][workspace.verses] = {};
                    }
                } catch (err) {
                    throw new Error(err);
                    throw err;
                }
                return true;
            },
        },
    ],
};

const stripMarkupCode = function ({ perf, verseWords }) {
    const cl = new PerfRenderFromJson(
        {
            srcJson: perf,
            actions: mergeActions(
                [
                    localStripMarkupActions,
                    transforms.perf2perf.identityActions,
                ]
            )
        }
    );
    const output = {};
    cl.renderDocument({ docId: "", config: { verseWords }, output });
    return { perf: output.perf, strippedAlignment: output.stripped };
}

const stripAlignment = {
    name: "stripAlignment",
    type: "Transform",
    description: "PERF=>PERF: Strips alignment markup",
    inputs: [
        {
            name: "perf",
            type: "json",
            source: ""
        },
        {
            name: "verseWords",
            type: "json",
            source: ""
        },
    ],
    outputs: [
        {
            name: "perf",
            type: "json",
        },
        {
            name: "strippedAlignment",
            type: "json",
        }
    ],
    code: stripMarkupCode
}
export default stripAlignment;
