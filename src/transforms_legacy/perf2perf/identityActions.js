const identityActions = {
    startDocument: [
        {
            description: "identity",
            test: () => true,
            action: ({config, context, workspace, output}) => {
                output.perf = {};
                output.perf.schema = context.document.schema;
                output.perf.metadata = context.document.metadata;
                output.perf.sequences = {};
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
                output.perf.sequences[context.sequences[0].id] = {
                    type: context.sequences[0].type,
                    blocks: []
                }
                workspace.outputSequence = output.perf.sequences[context.sequences[0].id];
                if (context.sequences[0].type === 'main') {
                    output.perf.main_sequence_id = context.sequences[0].id;
                }
            }
        },
    ],
    endSequence: [
        {
            description: "identity",
            test: () => true,
            action: ({config, context, workspace, output}) => {
                if (context.sequences.length > 1) {
                    workspace.outputSequence = output.perf.sequences[context.sequences[1].id];
                }
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
                    subtype: currentBlock.subType,
                };
                if (currentBlock.target) {
                    graftRecord.target = currentBlock.target;
                    environment.context.renderer.renderSequenceId(environment, graftRecord.target);
                }
                if (currentBlock.isNew) {
                    graftRecord.new = currentBlock.isNew;
                }
                environment.workspace.outputSequence.blocks.push(graftRecord);
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
                workspace.outputSequence.blocks.push(paraRecord);
                workspace.currentContent = paraRecord.content;
                workspace.outputBlock = workspace.outputSequence.blocks[workspace.outputSequence.blocks.length - 1];
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
                if (element.atts && typeof(element.atts) === "object" && Object.keys(element.atts).length !== 0) {
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
                };
                if (element.target) {
                    graftRecord.target = element.target;
                    const currentContent = environment.workspace.outputContentStack[0];
                    environment.context.renderer.renderSequenceId(environment, element.target);
                    environment.workspace.outputContentStack[0] = currentContent; // Probably need more for nesting!
                }
                if (element.isNew) {
                    graftRecord.new = element.isNew;
                }
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
                if ('atts' in element && typeof(element.atts) === "object" && Object.keys(element.atts).length !== 0) {
                    wrapperRecord.atts = element.atts;
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
                if (element.atts && typeof(element.atts) === "object" && Object.keys(element.atts).length !== 0) {
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
