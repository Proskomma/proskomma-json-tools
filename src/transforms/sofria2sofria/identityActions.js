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
            action: ({config, context, workspace, output}) => {
                workspace.currentSequence.type = context.sequences[0].type;
                workspace.currentSequence.blocks = [];
            }
        },
    ],
    endSequence: [
        {
            description: "identity",
            test: () => true,
            action: ({config, context, workspace, output}) => {
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
            action: ({config, context, workspace, output}) => {
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
            }
        },
    ],
    endParagraph: [
        {
            description: "identity",
            test: () => true,
            action: ({config, context, workspace, output}) => {
            }
        },
    ],
    metaContent: [
        {
            description: "identity",
            test: () => true,
            action: (environment) => {
                const {config, context, workspace, output} = environment;
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
            action: ({config, context, workspace, output}) => {
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
            action: ({config, context, workspace, output}) => {
                const element = context.sequences[0].element;
                const wrapperRecord = {
                    type: element.type,
                    subtype: element.subType,
                    content: [],
                };
                if ('atts' in element) {
                    wrapperRecord.atts = {...element.atts};
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
            action: ({config, context, workspace, output}) => {
                workspace.outputContentStack.shift();
            }
        },
    ],
    startMilestone: [
        {
            description: "identity",
            test: () => true,
            action: ({config, context, workspace, output}) => {
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
            action: ({config, context, workspace, output}) => {
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
            action: ({config, context, workspace, output}) => {
                const element = context.sequences[0].element;
                workspace.outputContentStack[0].push(element.text);
            }
        },
    ]
};

export default identityActions;
