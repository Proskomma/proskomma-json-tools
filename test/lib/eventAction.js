const eventActions = {
    startDocument: [
        {
            description: "eventActions",
            test: () => true,
            action: ({ config, context, workspace, output }) => {
                output.events = []
                output.events.push(`startDocument`)
            }
        },
    ],
    endDocument: [
        {
            description: "identity",
            test: () => true,
            action: ({ config, context, workspace, output }) => {
                output.events.push(`endDocument`)
            }
        },
    ],
    startSequence: [
        {
            description: "identity",
            test: () => true,
            action: ({ context, workspace, output }) => {
                output.events.push(`startSequence`)
            }
        },
    ],
    endSequence: [
        {
            description: "identity",
            test: () => true,
            action: ({ workspace, output }) => {
                output.events.push('endSequence')
            }
        }
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
                environment.output.events.push('blockGraft')
            }
        },
    ],

    startParagraph: [
        {
            description: "identity",
            test: () => true,
            action: ({ context, workspace, output }) => {

                output.events.push('startParagraph')
            }
        },
    ],
    endParagraph: [
        {
            description: "identity",
            test: () => true,
            action: ({ workspace, output }) => { output.events.push('endParagraph') }
        },
    ],

    startRow: [
        {
            description: "identity",
            test: () => true,
            action: ({ context, workspace, output }) => {
                output.events.push('startRow')
            }
        },
    ],
    endRow: [
        {
            description: "identity",
            test: () => true,
            action: ({ workspace, output }) => { output.events.push('endRow') }
        },
    ],
    metaContent: [
        {
            description: "identity",
            test: () => true,
            action: ({ output }) => {
                output.events.push('metaContent')
            }
        },
    ],
    mark: [
        {
            description: "identity",
            test: () => true,
            action: ({ context, workspace, output }) => {
                output.events.push('mark')
            }
        },
    ],
    inlineGraft: [
        {
            description: "identity",
            test: () => true,
            action: (environment) => {
                if (!environment.workspace.outputContentStack) {
                    environment.workspace.outputContentStack = []
                }
                const cachedOutputContentStack = [...environment.workspace.outputContentStack];
                environment.context.renderer.renderSequence(environment);
                environment.workspace.outputContentStack = cachedOutputContentStack;
                environment.output.events.push('inlineGraft')
            }
        },
    ],
    startWrapper: [
        {
            description: "identity",
            test: () => true,
            action: ({ context, workspace, output }) => {
                output.events.push(`startWrapper: ${context.sequences[0].element.subType}`)
            }
        },
    ],
    endWrapper: [
        {
            description: "identity",
            test: () => true,
            action: ({ context, workspace, output }) => {

                output.events.push(`endWrapper : ${context.sequences[0].element.subType}`)
            }
        },
    ],
    startMilestone: [
        {
            description: "identity",
            test: () => true,
            action: ({ context, workspace, output }) => {
                output.events.push('startMilestone')
            }
        },
    ],
    endMilestone: [
        {
            description: "identity",
            test: () => true,
            action: ({ context, workspace, output }) => {
                output.events.push('endMilestone')
            }
        },
    ],
    text: [
        {
            description: "identity",
            test: () => true,
            action: ({ context, workspace, output }) =>
                output.events.push('text')

        },
    ],
    startTable: [
        {
            description: "identity",
            test: () => true,
            action: ({ context, workspace, output }) =>
                output.events.push('startTable')

        },
    ],
    endTable: [
        {
            description: "identity",
            test: () => true,
            action: ({ context, workspace, output }) =>
                output.events.push('endTable')

        },
    ],
};

module.exports = { eventActions };