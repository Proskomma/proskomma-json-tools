// Put mt into headers

const oneifyTag = t => {
    if (['toc', 'toca', 'mt', 'imt', 's', 'ms', 'mte', 'sd'].includes(t)) {
        return t + '1';
    }
    return t;
}

const perfToUsfmJsActions = {
    startDocument: [
        {
            description: "Setup",
            test: () => true,
            action: ({context, workspace, output}) => {
                workspace.chapter = "front";
                workspace.verses = "front";
                workspace.contentStack = [];
                output.usfmJs = {
                    headers: [],
                    chapters: {}
                };
                for (const [k, v] of Object.entries(context.document.metadata.document)) {
                    if (['bookCode', 'properties', 'tags'].includes(k)) {
                        continue;
                    }
                    output.usfmJs.headers.push({
                        tag: k === "toc" ? "toc1" : k,
                        content: v
                    });

                }
            }
        }
    ],
    startParagraph: [
        {
            description: "Output paragraph tag (main)",
            test: ({workspace, output}) => output.usfmJs.chapters[workspace.chapter],
            action: ({context, workspace, output}) => {
                if (!output.usfmJs.chapters[workspace.chapter]["front"]) {
                    output.usfmJs.chapters[workspace.chapter]["front"] = {verseObjects: []};
                }
                output.usfmJs.chapters[workspace.chapter]["front"].verseObjects.push({
                    tag: oneifyTag(context.sequences[0].block.subType.split(':')[1]),
                    type: "paragraph",
                    nextChar: "\n",
                });
            }
        }
    ],
    mark: [
        {
            description: "Update chapter number",
            test: ({context}) => context.sequences[0].element.subType === "chapter",
            action: ({context, workspace, output}) => {
                workspace.chapter = context.sequences[0].element.atts["number"];
                workspace.verses = 'front';
                output.usfmJs.chapters[workspace.chapter] = {};
            }
        },
        {
            description: "Update verses number",
            test: ({context}) => context.sequences[0].element.subType === "verses",
            action: ({context, workspace, output}) => {
                workspace.verses = context.sequences[0].element.atts["number"];
                output.usfmJs.chapters[workspace.chapter][workspace.verses] = {verseObjects: []};
                workspace.contentStack = [];
            }
        }
    ],
    startMilestone: [
        {
            description: "Start zaln",
            test: ({context}) => context.sequences[0].element.subType = "usfm:zaln",
            action: ({context, workspace, output}) => {
                const element = context.sequences[0].element;
                const milestoneOb = {
                    tag: "zaln",
                    type: "milestone"
                };
                for (const attKey of ["strong", "lemma", "morph", "occurrence", "occurrences", "content"]) {
                    if (element.atts[`x-${attKey}`]) {
                        milestoneOb[attKey] = element.atts[`x-${attKey}`].join(',');
                    }
                }
                milestoneOb["children"] = [];
                milestoneOb['endTag'] = null; // Flag for "open"
                output.usfmJs.chapters[workspace.chapter][workspace.verses].verseObjects.push(milestoneOb);
            }
        },

    ],
    endMilestone: [
        {
            description: "End zaln",
            test: ({context}) => context.sequences[0].element.subType = "usfm:zaln",
            action: ({context, workspace, output}) => {
                const verseObjects = output.usfmJs.chapters[workspace.chapter][workspace.verses].verseObjects;
                verseObjects[verseObjects.length - 1].endTag = "zaln-e\\*";
            }
        },
    ],
    startWrapper: [
        {
            description: "w wrapper",
            test: ({context}) => context.sequences[0].element.subType = "usfm:w",
            action: ({context, workspace, output}) => {
                const verseObjects = output.usfmJs.chapters[workspace.chapter][workspace.verses].verseObjects;
                const wObject = {
                    tag: "w",
                    type: "word",
                    text: ""
                };
                const element = context.sequences[0].element;
                for (const attKey of ["occurrences", "content"]) {
                    if (element.atts[`x-${attKey}`]) {
                        wObject[attKey] = element.atts[`x-${attKey}`].join(',');
                    }
                }
                verseObjects[verseObjects.length -1].children.push(wObject);
            }
        },
    ],
    text: [
        {
            description: "Push text to output or stack",
            test: () => true,
            action: ({context, workspace, output}) => {
                const text = context.sequences[0].element.text;
                const verseObjects = output.usfmJs.chapters[workspace.chapter][workspace.verses].verseObjects;
                if (verseObjects.length === 0) {
                } else if (verseObjects.slice(-1)[0].type === "text") {
                    verseObjects.slice(-1)[0].text += text;
                } else if (verseObjects.slice(-1)[0].type === "milestone") {
                    const children = verseObjects.slice(-1)[0].children;
                    children[children.length - 1].text += text;
                } else {
                    verseObjects.push({type: "text", text});
                }
            }
        }
    ]
}

module.exports = {perfToUsfmJsActions};
