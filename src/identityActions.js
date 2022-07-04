const ProskommaRenderAction = require('../src/ProskommaRenderAction');

const identityActions = {
    startDocument: [
        new ProskommaRenderAction({
            description: "identity",
            test: () => true,
            action: ({config, context, workspace, output}) => {
                output.schema = context.document.schema;
                output.metadata = context.document.metadata;
                output.sequences = {};
            }
        }),
    ],
    endDocument: [
        new ProskommaRenderAction({
            description: "identity",
            test: () => true,
            action: ({config, context, workspace, output}) => {}
        }),
    ],
    startSequence: [
        new ProskommaRenderAction({
            description: "identity",
            test: () => true,
            action: ({config, context, workspace, output}) => {
                workspace.currentSequence = context.sequences[0];
                output.sequences[context.sequences[0].id] = {
                    type: workspace.currentSequence.type,
                    blocks: []
                }
                workspace.outputSequence = output.sequences[context.sequences[0].id];
                if (workspace.currentSequence.type === 'main') {
                    output.main_sequence_id = workspace.currentSequence.id;
                }
            }
        }),
    ],
    endSequence: [
        new ProskommaRenderAction({
            description: "identity",
            test: () => true,
            action: ({config, context, workspace, output}) => {}
        }),
    ],
    blockGraft: [
        new ProskommaRenderAction({
            description: "identity",
            test: () => true,
            action: ({config, context, workspace, output}) => {
                workspace.currentBlock = workspace.currentSequence.block;
                const graftRecord = {
                    type: workspace.currentBlock.type,
                    sub_type: workspace.currentBlock.subType,
                };
                if (workspace.currentBlock.target) {
                    graftRecord.target = workspace.currentBlock.target;
                }
                if (workspace.currentBlock.isNew) {
                    graftRecord.new = workspace.currentBlock.isNew;
                }
                workspace.outputSequence.blocks.push(graftRecord);
            }
        }),
    ],
    startParagraph: [
        new ProskommaRenderAction({
            description: "identity",
            test: () => true,
            action: ({config, context, workspace, output}) => {
                workspace.currentBlock = workspace.currentSequence.block;
                const paraRecord = {
                    type: workspace.currentBlock.type,
                    sub_type: workspace.currentBlock.subType,
                    content: []
                };
                workspace.outputSequence.blocks.push(paraRecord);
                workspace.currentContent = paraRecord.content;
                workspace.outputBlock = workspace.outputSequence.blocks[workspace.outputSequence.blocks.length - 1];
                workspace.outputContentStack = [workspace.outputBlock.content];
            }
        }),
    ],
    endParagraph: [
        new ProskommaRenderAction({
            description: "identity",
            test: () => true,
            action: ({config, context, workspace, output}) => {}
        }),
    ],
    metaContent: [
        new ProskommaRenderAction({
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
        }),
    ],
    mark: [
        new ProskommaRenderAction({
            description: "identity",
            test: () => true,
            action: ({config, context, workspace, output}) => {
                const element = context.sequences[0].element;
                const markRecord = {
                    type: element.type,
                    sub_type: element.subType,
                };
                if (element.atts) {
                    markRecord.atts = element.atts;
                }
                workspace.outputContentStack[0].push(markRecord);
            }
        }),
    ],
    inlineGraft: [
        new ProskommaRenderAction({
            description: "identity",
            test: () => true,
            action: ({config, context, workspace, output}) => {
                const element = context.sequences[0].element;
                const graftRecord = {
                    type: element.type,
                    sub_type: element.subType,
                };
                if (element.target) {
                    graftRecord.target = element.target;
                }
                if (element.isNew) {
                    graftRecord.new = element.isNew;
                }
                workspace.outputContentStack[0].push(graftRecord);
            }
        }),
    ],
    startWrapper: [
        new ProskommaRenderAction({
            description: "identity",
            test: () => true,
            action: ({config, context, workspace, output}) => {
                const element = context.sequences[0].element;
                const wrapperRecord = {
                    type: element.type,
                    sub_type: element.subType,
                    content: [],
                };
                workspace.outputContentStack[0].push(wrapperRecord);
                workspace.outputContentStack.unshift(wrapperRecord.content);
            }
        }),
    ],
    endWrapper: [
        new ProskommaRenderAction({
            description: "identity",
            test: () => true,
            action: ({config, context, workspace, output}) => {
                workspace.outputContentStack.shift();
            }
        }),
    ],
    startMilestone: [
        new ProskommaRenderAction({
            description: "identity",
            test: () => true,
            action: ({config, context, workspace, output}) => {
                const element = context.sequences[0].element;
                const milestoneRecord = {
                    type: element.type,
                    sub_type: element.subType,
                };
                if (element.atts) {
                    milestoneRecord.atts = element.atts;
                }
                workspace.outputContentStack[0].push(milestoneRecord);
            }
        }),
    ],
    endMilestone: [
        new ProskommaRenderAction({
            description: "identity",
            test: () => true,
            action: ({config, context, workspace, output}) => {
                const element = context.sequences[0].element;
                const milestoneRecord = {
                    type: element.type,
                    sub_type: element.subType,
                };
                workspace.outputContentStack[0].push(milestoneRecord);
            }
        }),
    ],
    text: [
        new ProskommaRenderAction({
            description: "identity",
            test: () => true,
            action: ({config, context, workspace, output}) => {
                const element = context.sequences[0].element;
                workspace.outputContentStack[0].push(element.text);
            }
        }),
    ]
};

module.exports = identityActions;
