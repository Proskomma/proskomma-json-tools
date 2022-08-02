import test from 'tape';

const fse = require('fs-extra');
import path from 'path';
import SofriaRenderFromJson from '../../src/SofriaRenderFromJson';
import equal from "deep-equal";

const testGroup = 'Render SOFRIA from JSON';

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
                    environment.context.renderer.renderSequence(environment, currentBlock.sequence);
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
                };
                graftRecord.sequence = {};
                environment.workspace.outputContentStack[0].push(graftRecord);
                const currentContent = environment.workspace.outputContentStack[0];
                const cachedSequencePointer = environment.workspace.currentSequence;
                environment.workspace.currentSequence = graftRecord.sequence;
                environment.context.renderer.renderSequence(environment, element.sequence);
                environment.workspace.outputContentStack[0] = currentContent; // Probably need more for nesting!
                environment.workspace.currentSequence = cachedSequencePointer;
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

test(
    `Instantiate class (${testGroup})`,
    async function (t) {
        try {
            t.plan(1);
            t.doesNotThrow(() => new SofriaRenderFromJson({srcJson: {}}));
        } catch (err) {
            console.log(err);
        }
    },
);

test(
    `Render SOFRIA with empty actions (${testGroup})`,
    async function (t) {
        try {
            t.plan(1);
            const sofria = fse.readJsonSync(path.resolve(path.join(__dirname, '..', 'test_data', 'fra_lsg_mrk_sofria_doc.json')));
            const cl = new SofriaRenderFromJson({srcJson: sofria});
            t.doesNotThrow(() => cl.renderDocument({docId: "", config: {}, output: {}}));
        } catch (err) {
            console.log(err);
        }
    },
);

test(
    `Follow SOFRIA grafts (${testGroup})`,
    async function (t) {
        try {
            t.plan(1);
            const sofria = fse.readJsonSync(path.resolve(path.join(__dirname, '..', 'test_data', 'fra_lsg_mrk_sofria_doc.json')));
            const cl = new SofriaRenderFromJson({srcJson: sofria});
            cl.debugLevel = 0;
            cl.addRenderAction(
                'blockGraft',
                {
                    description: "Follow all block grafts",
                    action: (environment) => {
                        const context = environment.context;
                        const blockContext = context.sequences[0].block;
                        if (blockContext.target) {
                            context.renderer.renderSequence(environment, blockContext.sequence);
                        }
                    }
                }
            );
            cl.addRenderAction(
                'inlineGraft',
                {
                    description: "Follow all inline grafts",
                    action: (environment) => {
                        const context = environment.context;
                        const elementContext = context.sequences[0].element;
                        if (elementContext.target) {
                            context.renderer.renderSequence(environment, elementContext.sequence);
                        }
                    }
                }
            );
            t.doesNotThrow(() => cl.renderDocument({docId: "", config: {}, output: {}}));
        } catch (err) {
            console.log(err);
        }
    },
);

test(
    `Follow metaContent (${testGroup})`,
    async function (t) {
        try {
            t.plan(1);
            const sofria = fse.readJsonSync(path.resolve(path.join(__dirname, '..', 'test_data', 'fra_lsg_mrk_sofria_doc.json')));
            const cl = new SofriaRenderFromJson({srcJson: sofria});
            cl.debugLevel = 0;
            cl.addRenderAction(
                'metaContent',
                {
                    description: "Follow metaContent",
                    action: (environment) => {
                        const context = environment.context;
                        const elementContext = context.sequences[0].element;
                        context.renderer.renderContent(elementContext.metaContent, environment);
                    }
                }
            );
            t.doesNotThrow(() => cl.renderDocument({docId: "", config: {}, output: {}}));
        } catch (err) {
            console.log(err);
        }
    },
);

test(
    `Render SOFRIA with identity actions (${testGroup})`,
    async function (t) {
        try {
            t.plan(1);
            const sofria = fse.readJsonSync(path.resolve(path.join(__dirname, '..', 'test_data', 'fra_lsg_mrk_sofria_doc.json')));
            const cl = new SofriaRenderFromJson({srcJson: sofria, actions: identityActions});
            const output = {};
            t.doesNotThrow(() => cl.renderDocument({docId: "", config: {}, output}));
            console.log(JSON.stringify(output, null, 2));
            // t.ok(equal(perf, output.perf));
        } catch (err) {
            console.log(err);
        }
    },
);
