const toUsfmActions = {
    startDocument: [
        {
            description: "Set up environment",
            test: () => true,
            action: ({workspace}) => {
                workspace.usfmBits = [];
                return true;
            }
        },
    ],
    startSequence: [
        {
            description: "Display sequence type",
            test: () => true,
            action: ({context, workspace}) => {
                workspace.usfmBits.push(`\n** START ${context.sequences[0].type.toUpperCase()} **`);
            }
        }
    ],
    endSequence: [
        {
            description: "Display sequence type",
            test: () => true,
            action: ({context, workspace}) => {
                workspace.usfmBits.push(`** End ${context.sequences[0].type.toUpperCase()} **\n`);
            }
        }
    ],
    blockGraft: [
        {
            description: "Follow block grafts",
            test: () => true,
            action: (environment) => {
                const target = environment.context.sequences[0].block.target;
                if (target) {
                    environment.context.renderer.renderSequenceId(environment, target);
                }
            }
        }
    ],
    inlineGraft: [
        {
            description: "Follow inline grafts",
            test: () => true,
            action: (environment) => {
                const target = environment.context.sequences[0].element.target;
                if (target) {
                    environment.context.renderer.renderSequenceId(environment, target);
                }
            }
        }
    ],
    text: [
        {
            description: "Output text",
            test: () => true,
            action: ({context, workspace}) => {
                const text = context.sequences[0].element.text;
                workspace.usfmBits.push(text);
            }
        },
    ],
    endDocument: [
        {
            description: "Build output",
            test: () => true,
            action: ({workspace, output}) => {
                output.usfm = workspace.usfmBits.join('\n');
                return true;
            }
        },
    ]
};

module.exports = toUsfmActions;
