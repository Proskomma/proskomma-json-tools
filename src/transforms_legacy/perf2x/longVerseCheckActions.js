const longVerseCheckActions = {
    startDocument: [
        {
            description: "Set up state variable",
            test: () => true,
            action: ({workspace}) => {
                workspace.verseWordCount = 0;
                return true;
            }
        },
    ],
    inlineGraft: [
        {
            description: "Do not follow grafts",
            test: () => true,
            action: () => null,
        }
    ],
    blockGraft: [
        {
            description: "Do not follow grafts",
            test: () => true,
            action: () => null,
        }
    ],
    mark: [
        {
            description: "Check verse length",
            test: () => true,
            action: ({context, workspace}) => {
                const element = context.sequences[0].element;
                if (element.subType === 'verses') {
                    if (workspace.verseWordCount >= 30) {
                        const metaContentRecord = {
                            type: "wrapper",
                            subtype: "meta_content",
                            meta_content: [`<== Long verse (${workspace.verseWordCount} words)`]
                        }
                        workspace.outputContentStack[0].push(metaContentRecord);
                    }
                    workspace.verseWordCount = 0;
                }
                return true;
            }
        },
    ],
    text: [
        {
            description: "Increment verse word count",
            test: () => true,
            action: ({context, workspace}) => {
                const text = context.sequences[0].element.text;
                workspace.verseWordCount += text.split(/\s+/)
                    .filter(s => s.length > 0)
                    .length;
                return true;
            }
        },
    ]
};

module.exports = longVerseCheckActions;
