const identityActions = {
    startDocument: [
        {
            description: "identity",
            test: () => true,
            action: ({config, context, workspace, output}) => {
                output.sofria = {};
                output.sofria.schema = context.document.schema;
                output.sofria.metadata = context.document.metadata;
                output.sofria.sequence = {};
                workspace.currentSequence = output.sofria.sequence;
                workspace.chapter = null;
                workspace.verses = null;
                workspace.cachedChapter = null;
                workspace.cachedVerses = null;
            }
        },
    ],
    endDocument: [
        {
            description: "identity",
            test: () => true,
            action: ({config, context, workspace, output}) => {
            }
        },
    ],
    startSequence: [
        {
            description: "identity",
            test: () => true,
            action: ({context, workspace}) => {
                workspace.currentSequence.type = context.sequences[0].type;
                workspace.currentSequence.blocks = [];
            }
        },
    ],
    endSequence: [
        {
            description: "identity",
            test: () => true,
            action: ({workspace}) => {
                if (workspace.currentSequence.type === 'main') {
                    workspace.chapter = null;
                    workspace.verses = null;
                }
                workspace.currentSequence = null;
            }
        },
    ],
    blockGraft: [
        {
            description: "identity",
            test: () => true,
            action: (environment) => {
                const currentBlock = environment.context.sequences[0].block;
                const graftRecord = {
                    type: currentBlock.type,
                };
                if (currentBlock.sequence) {
                    graftRecord.sequence = {};
                    const cachedSequencePointer = environment.workspace.currentSequence;
                    environment.workspace.currentSequence = graftRecord.sequence;
                    environment.context.renderer.renderSequence(environment);
                    environment.workspace.currentSequence = cachedSequencePointer;
                }
                environment.workspace.currentSequence.blocks.push(graftRecord);
            }
        },
    ],

    startParagraph: [
        {
            description: "identity",
            test: () => true,
            action: ({context, workspace}) => {
                const currentBlock = context.sequences[0].block;
                const paraRecord = {
                    type: currentBlock.type,
                    subtype: currentBlock.subType,
                    content: []
                };
                workspace.currentSequence.blocks.push(paraRecord);
                workspace.currentContent = paraRecord.content;
                workspace.outputBlock = workspace.currentSequence.blocks[workspace.currentSequence.blocks.length - 1];
                workspace.outputContentStack = [workspace.outputBlock.content];
                if (workspace.currentSequence.type === "main") {
                    for (const cv of ['chapter', 'verses']) {
                        if (workspace[cv]) {
                            const wrapperRecord = {
                                type: 'wrapper',
                                subtype: cv,
                                content: [],
                                atts: {number: workspace[cv]}
                            };
                            workspace.outputContentStack[0].push(wrapperRecord);
                            workspace.outputContentStack.unshift(wrapperRecord.content);
                        }
                    }
                }
            }
        },
    ],
    endParagraph: [
        {
            description: "identity",
            test: () => true,
            action: ({workspace}) => {}
        },
    ],
    metaContent: [
        {
            description: "identity",
            test: () => true,
            action: (environment) => {
                const {context, workspace} = environment;
                const element = context.sequences[0].element;
                workspace.currentContent = element.metaContent;
                const lastOutputItem = workspace.outputContentStack[1][workspace.outputContentStack[1].length - 1];
                lastOutputItem.meta_content = [];
                workspace.outputContentStack.unshift(lastOutputItem.meta_content);
                context.renderer.renderContent(workspace.currentContent, environment);
                workspace.outputContentStack.shift();
            }
        },
    ],
    mark: [
        {
            description: "identity",
            test: () => true,
            action: ({context, workspace}) => {
                const element = context.sequences[0].element;
                const markRecord = {
                    type: element.type,
                    subtype: element.subType,
                };
                if (element.atts) {
                    markRecord.atts = element.atts;
                }
                workspace.outputContentStack[0].push(markRecord);
            }
        },
    ],
    inlineGraft: [
        {
            description: "identity",
            test: () => true,
            action: (environment) => {
                const element = environment.context.sequences[0].element;
                const graftRecord = {
                    type: element.type,
                    subtype: element.subType,
                    sequence: {},
                };
                const cachedSequencePointer = environment.workspace.currentSequence;
                const cachedOutputContentStack = [...environment.workspace.outputContentStack];
                environment.workspace.currentSequence = graftRecord.sequence;
                environment.context.renderer.renderSequence(environment);
                environment.workspace.outputContentStack = cachedOutputContentStack;
                environment.workspace.currentSequence = cachedSequencePointer;
                environment.workspace.outputContentStack[0].push(graftRecord);
            }
        },
    ],
    startWrapper: [
        {
            description: "identity",
            test: () => true,
            action: ({context, workspace}) => {
                const element = context.sequences[0].element;
                // console.log(element)
                if (element.subType === "chapter") {
                    workspace.chapter = element.atts.number;
                    workspace.cachedChapter = workspace.chapter;
                } else if (element.subType === "verses") {
                    workspace.verses = element.atts.number;
                    workspace.cachedVerses = workspace.verses;
                }
                const wrapperRecord = {
                    type: element.type,
                    subtype: element.subType,
                    content: [],
                };
                if ('atts' in element) {
                    wrapperRecord.atts = {...element.atts};
                }
                if (workspace.outputContentStack.length === 0) {
                    throw new Error(`outputContentStack is empty before pushing to its first element, near ${context.document.metadata.document.bookCode} ${workspace.cachedChapter}:${workspace.cachedVerses}`);
                }
                workspace.outputContentStack[0].push(wrapperRecord);
                workspace.outputContentStack.unshift(wrapperRecord.content);
            }
        },
    ],
    endWrapper: [
        {
            description: "identity",
            test: () => true,
            action: ({context, workspace}) => {
                const element = context.sequences[0].element;
                if (element.subType === "chapter") {
                    workspace.chapter = null;
                } else if (element.subType === "verses") {
                    workspace.verses = null;
                }
                workspace.outputContentStack.shift();
            }
        },
    ],
    startMilestone: [
        {
            description: "identity",
            test: () => true,
            action: ({context, workspace}) => {
                const element = context.sequences[0].element;
                const milestoneRecord = {
                    type: element.type,
                    subtype: element.subType,
                };
                if (element.atts) {
                    milestoneRecord.atts = element.atts;
                }
                workspace.outputContentStack[0].push(milestoneRecord);
            }
        },
    ],
    endMilestone: [
        {
            description: "identity",
            test: () => true,
            action: ({context, workspace}) => {
                const element = context.sequences[0].element;
                const milestoneRecord = {
                    type: element.type,
                    subtype: element.subType,
                };
                workspace.outputContentStack[0].push(milestoneRecord);
            }
        },
    ],
    text: [
        {
            description: "identity",
            test: () => true,
            action: ({context, workspace}) => {
                const element = context.sequences[0].element;
                workspace.outputContentStack[0].push(element.text);
            }
        },
    ]
};

export default identityActions;
