const toUsfmActions = {
    startDocument: [
        {
            description: "Set up environment",
            test: () => true,
            action: ({context, workspace}) => {
                workspace.usfmBits = [''];
                for (
                    let [key, value] of
                    Object.entries(context.document.metadata.document)
                        .filter(kv => !['tags', 'properties', 'bookCode'].includes(kv[0]))
                    ) {
                    if (['toc', 'toca'].includes(key)) {
                        key += '1';
                    }
                    workspace.usfmBits.push(`\\${key} ${value}\n`);
                };
            }
        },
    ],
    blockGraft: [
        {
            description: "Follow block grafts",
            test: ({context}) => ['title', 'heading', 'introduction'].includes(context.sequences[0].block.subType),
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
            test: () => false,
            action: (environment) => {
                const target = environment.context.sequences[0].element.target;
                if (target) {
                    environment.context.renderer.renderSequenceId(environment, target);
                }
            }
        }
    ],

    startParagraph: [
        {
            description: "Output paragraph tag",
            test: () => true,
            action: ({context, workspace}) => {
                workspace.usfmBits.push(`\n\\${context.sequences[0].block.subType.split(':')[1]}\n`);
            }
        }
    ],
    endParagraph: [
        {
            description: "Output nl",
            test: () => true,
            action: ({context, workspace}) => {
                workspace.usfmBits.push(`\n`);
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
    mark: [
        {
            description: "Output chapter or verses",
            test: () => true,
            action: ({config, context, workspace, output}) => {
                const element = context.sequences[0].element;
                if (element.subType === 'chapter') {
                    workspace.usfmBits.push(`\n\\c ${element.atts['number']}\n`);
                } else if (element.subType === 'verses') {
                    workspace.usfmBits.push(`\\v ${element.atts['number']} `);
                }
            }
        },
    ],
    endDocument: [
        {
            description: "Build output",
            test: () => true,
            action: ({workspace, output}) => {
                output.usfm = workspace.usfmBits.join('');
            }
        },
    ]
};

module.exports = toUsfmActions;
