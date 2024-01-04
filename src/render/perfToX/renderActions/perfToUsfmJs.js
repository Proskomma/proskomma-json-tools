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
                workspace.zalns = [];
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
            description: "Output paragraph tag (main), currently always to front",
            test: ({
                       context,
                       workspace,
                       output
                   }) => context.sequences[0].type === "main" && output.usfmJs.chapters[workspace.chapter],
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
        },
        {
            description: "mt (title)",
            test: ({context, workspace, output}) => context.sequences[0].type === "title",
            action: ({context, output}) => {
                output.usfmJs.headers.push({
                    tag: oneifyTag(context.sequences[0].block.subType.split(':')[1]),
                    content: ""
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
            }
        }
    ],
    startMilestone: [
        {
            description: "Start zaln: make milestone and add to stack",
            test: ({context}) => context.sequences[0].element.subType === "usfm:zaln",
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
                if (workspace.zalns.length === 0) {
                    output.usfmJs.chapters[workspace.chapter][workspace.verses].verseObjects.push(milestoneOb);
                } else {
                    workspace.zalns[0].children.push(milestoneOb);
                }
                workspace.zalns.unshift(milestoneOb);
            }
        },

    ],
    endMilestone: [
        {
            description: "End zaln: pop stack",
            test: ({context}) => context.sequences[0].element.subType === "usfm:zaln",
            action: ({workspace}) => {
                workspace.zalns[0].endTag = "zaln-e\\*";
                workspace.zalns.shift();
            }
        },
    ],
    startWrapper: [
        {
            description: "w wrapper: make a new object with empty text",
            test: ({
                       context,
                       workspace
                   }) => context.sequences[0].element.subType === "usfm:w" && workspace.zalns.length > 0,
            action: ({context, workspace}) => {
                const wObject = {
                    tag: "w",
                    type: "word",
                    text: ""
                };
                const element = context.sequences[0].element;
                for (const attKey of ["occurrence", "occurrences", "content"]) {
                    if (element.atts[`x-${attKey}`]) {
                        wObject[attKey] = element.atts[`x-${attKey}`].join(',');
                    }
                }
                workspace.zalns[0].children.push(wObject);
            }
        },
    ],
    text: [
        {
            description: "Main sequence: add text either as text object or to existing word object in milestone",
            test: ({context}) => context.sequences[0].type === "main",
            action: ({context, workspace, output}) => {
                const text = context.sequences[0].element.text;
                const target = workspace.zalns[0] || output.usfmJs.chapters[workspace.chapter][workspace.verses].verseObjects.slice(-1)[0];
                if (!target) {
                } else if (target.type === "text") {
                    if ('text' in target) {
                        target.text = "";
                    }
                    target.text += text;
                } else if (target.type === "milestone") {
                    const children = target.children;
                    if (children.length === 0 || !('text' in children[children.length - 1])) {
                        children.push({type: "text", text: ""});
                    }
                    children[children.length - 1].text += text;
                } else {
                    throw new Error("Child is either text nor milestone");
                }
            }
        },
        {
            description: "Title sequence: add text to mt in header",
            test: ({context}) => context.sequences[0].type === "title",
            action: ({context, output}) => {
                const text = context.sequences[0].element.text;
                const headers = output.usfmJs.headers;
                headers[headers.length - 1].content += text;
            }
        }
    ],
    blockGraft: [
        {
            description: "Process title grafts",
            test: (environment) => environment.context.sequences[0].block.subType === "title",
            action: (environment) => {
                const currentBlock = environment.context.sequences[0].block;
                const graftRecord = {
                    type: currentBlock.type,
                    subtype: currentBlock.subType,
                };
                if (currentBlock.target) {
                    graftRecord.target = currentBlock.target;
                    environment.context.renderer.renderSequenceId(environment, graftRecord.target);
                }
                if (currentBlock.isNew) {
                    graftRecord.new = currentBlock.isNew;
                }
            }
        },
    ]
}

module.exports = {perfToUsfmJsActions};
