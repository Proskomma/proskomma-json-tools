
const defaultSettings = {
    showWordAtts: false,
    showTitles: true,
    showHeadings: true,
    showFootnotes: true,
    showXrefs: true,
    showChapterLabels: true,
    showVersesLabels: true,
    showCharacterMarkup: true,
    showParaStyles: true,
    selectedBcvNotes: []
}

const sofria2WebActions = {
    startDocument: [
        {
            description: "Set up",
            test: () => true,
            action: ({ config, context, workspace, output }) => {

                if (config.displayPartOfText != null) {
                    if (!['begin', 'continue'].includes(config.displayPartOfText.state)) {

                        throw new Error('state must be typeof string and one of begin or continue');
                    }
                }
                workspace.settings = { ...defaultSettings, ...config }
                workspace.webParas = [];
                output.sofria = {};
                output.sofria.sequence = {};
                workspace.currentSequence = output.sofria.sequence;
                workspace.paraContentStack = [];
                workspace.footnoteNo = 1;
                workspace.bookCode = context.document.metadata.document.bookCode;
                workspace.chapter = 0;

            },
        }
    ],

    startSequence: [
        {
            description: "startSequence",
            test: () => true,
            action: ({ context, workspace }) => {
                workspace.currentSequence.type = context.sequences[0].type;
                workspace.currentSequence.blocks = []
            }
        },
    ],
    endSequence: [
        {
            description: "endSequence",
            test: () => true,
            action: ({ config, context, workspace }) => {
                if (context.inTable && context.sequences[0].type.includes(['main'])) {
                    context.inTable = false
                    workspace.webParas.push(config.renderers.table(workspace.paraContentStack[0].content))
                }
                if (workspace.currentSequence.type === 'footnote') {
                    workspace.footnoteNo++;
                }
                workspace.currentSequence = {};
            }
        },
    ],
    startRow: [
        {
            description: "Initialise content stack",
            test: () => true,
            action: ({ context, workspace }) => {
                const block = context.sequences[0].block;


                if (!context.inTable) {
                    context.inTable = true

                    workspace.paraContentStack = [
                        {
                            subType: 'table',
                            content: []
                        }

                    ]
                }
                workspace.paraContentStack.unshift(
                    {
                        subType: block.subType,
                        content: []
                    }
                );
            }
        },
    ],

    endRow: [
        {
            description: "Add completed table to webParas",
            test: () => true,
            action: ({ config, context, workspace }) => {

                const popped = workspace.paraContentStack.shift();
                workspace.paraContentStack[0].content.push(config.renderers.row(
                    (workspace.settings.showWordAtts ? popped.atts : {}),
                    popped.content
                ));
            }
        },
    ],
    blockGraft: [
        {
            description: "Process block grafts",
            test: () => true,
            action: (environment) => {

                const currentBlock = environment.context.sequences[0].block;
                if (
                    currentBlock.subType !== "remark" &&
                    !(["title", "endTitle"].includes(currentBlock.subType) && !environment.workspace.settings.showTitles) &&
                    !(["heading"].includes(currentBlock.subType) && !environment.workspace.settings.showHeadings) &&
                    !(["introduction"].includes(currentBlock.subType) && !environment.workspace.settings.showIntroductions)
                ) {
                    const graftRecord = {
                        type: currentBlock.type,
                    };
                    if (currentBlock.sequence) {
                        graftRecord.sequence = {};
                        const cachedSequencePointer = environment.workspace.currentSequence;
                        environment.workspace.currentSequence = graftRecord.sequence;
                        const cachedParaContentStack = environment.workspace.paraContentStack;
                        environment.context.renderer.renderSequence(environment);
                        environment.workspace.paraContentStack = cachedParaContentStack;
                        environment.workspace.currentSequence = cachedSequencePointer;
                    }
                    environment.workspace.currentSequence.blocks.push(graftRecord);
                }
            }
        },
    ],
    inlineGraft: [
        {
            description: "inlineGraft",
            test: ({ context, workspace }) => context.sequences[0].element.subType !== "note_caller" &&
                !(["footnote"].includes(context.sequences[0].element.subType) && !workspace.settings.showFootnotes) &&
                !(["xref"].includes(context.sequences[0].element.subType) && !workspace.settings.showXrefs),
            action: (environment) => {
                const element = environment.context.sequences[0].element;

                const graftRecord = {
                    type: element.type,
                };
                if (element.sequence) {
                    graftRecord.sequence = {};
                    const cachedSequencePointer = environment.workspace.currentSequence;
                    const cachedParaContentStack = [...environment.workspace.paraContentStack];
                    const cachedWebParas = environment.workspace.webParas;
                    environment.workspace.webParas = [];
                    environment.workspace.currentSequence = graftRecord.sequence;
                    environment.context.renderer.renderSequence(environment);
                    const sequencePseudoParas = environment.workspace.webParas;
                    environment.workspace.webParas = cachedWebParas;
                    environment.workspace.paraContentStack = cachedParaContentStack;
                    environment.workspace.paraContentStack[0].content.push(sequencePseudoParas);
                    environment.workspace.currentSequence = cachedSequencePointer;

                }
            }
        },
    ],
    startParagraph: [
        {
            description: "Initialise content stack",
            test: () => true,
            action: ({ config, context, workspace }) => {

                if (context.inTable && context.sequences[0].type.includes(['main'])) {
                    context.inTable = false
                    workspace.webParas.push(config.renderers.table(workspace.paraContentStack[0].content))
                }
                const block = context.sequences[0].block;
                workspace.paraContentStack = [
                    {
                        subType: block.subType,
                        content: []
                    }
                ]
            }
        },
    ],
    endParagraph: [
        {
            description: "Add completed para to webParas",
            test: () => true,
            action: ({ config, context, workspace }) => {
                workspace.webParas.push(
                    config.renderers.paragraph(
                        workspace.settings.showParaStyles || ['footnote', 'xref'].includes(context.sequences[0].type) ?
                            workspace.paraContentStack[0].subType :
                            "usfm:m",
                        workspace.paraContentStack[0].content,
                        workspace.footnoteNo,
                    )
                );
            }
        },
    ],
    startWrapper: [
        {
            description: "Skip usfm:w outside main sequence",
            test: ({ context }) => context.sequences[0].element.subType === "usfm:w" && context.sequences[0].type !== "main",
            action: () => { }
        },
        {
            description: "Handle standard w attributes",
            test: ({ context }) => context.sequences[0].element.subType === "usfm:w",
            action: ({ context, workspace }) => {

                const atts = context.sequences[0].element.atts;
                const standardAtts = {};
                for (const [key, value] of Object.entries(atts)) {
                    if (["strong", "lemma", "gloss"].includes(key)) {
                        standardAtts[key] = value;
                    }
                }
                workspace.paraContentStack.unshift(
                    {
                        atts: standardAtts,
                        content: []
                    }
                );
                return false;
            }
        },
        {
            description: "Push to paraContent Stack",
            test: ({ context, workspace }) => !["chapter", "verses"].includes(context.sequences[0].element.subType) && workspace.settings.showCharacterMarkup,
            action: ({ context, workspace }) => {
                const pushed = {
                    subType: context.sequences[0].element.subType,
                    content: []
                };
                if (context.sequences[0].element.subType === 'cell') {
                    pushed.atts = context.sequences[0].element.atts
                };


                workspace.paraContentStack.unshift(
                    pushed
                );
            }
        },
    ],
    endWrapper: [
        {
            description: "Skip usfm:w outside main sequence",
            test: ({ context }) => context.sequences[0].element.subType === "usfm:w" && context.sequences[0].type !== "main",
            action: () => { }
        },
        {
            description: "Handle standard w attributes",
            test: ({ context }) => context.sequences[0].element.subType === "usfm:w",
            action: ({ config, workspace }) => {

                const popped = workspace.paraContentStack.shift();

                workspace.paraContentStack[0].content.push(config.renderers.wWrapper(
                    (workspace.settings.showWordAtts ? popped.atts : {}),
                    popped.content
                ));
                return false;
            }
        },
        {
            description: "Collapse one level of paraContent Stack",
            test: ({ context, workspace }) => {

                return (!["chapter", "verses"].includes(context.sequences[0].element.subType) && workspace.settings.showCharacterMarkup)

            },
            action: ({ config, workspace }) => {

                const popped = workspace.paraContentStack.shift();
                workspace.paraContentStack[0].content.push(config.renderers.wrapper(popped.subType === 'cell' ? popped.atts : {}, popped.subType, popped.content));
            }
        },
    ],
    startMilestone: [
        {
            description: "Handle zaln word-like atts",
            test: ({ context }) => context.sequences[0].element.subType === "usfm:zaln",
            action: ({ context, workspace }) => {

                const atts = context.sequences[0].element.atts;
                const standardAtts = {};
                for (const [key, value] of Object.entries(atts)) {
                    if (["x-strong", "x-lemma", "x-morph", "x-content"].includes(key)) {
                        standardAtts[key.split('-')[1]] = value;
                    }
                }
                workspace.paraContentStack.unshift(
                    {
                        atts: standardAtts,
                        content: []
                    }
                );
                return false;
            }
        },
    ],
    endMilestone: [
        {
            description: "Handle zaln word-like atts",
            test: ({ context }) => context.sequences[0].element.subType === "usfm:zaln",
            action: ({ config, workspace }) => {
                const popped = workspace.paraContentStack.shift();
                workspace.paraContentStack[0].content.push(config.renderers.wWrapper(
                    (workspace.settings.showWordAtts ? popped.atts : {}),
                    popped.content
                ));
                return false;
            }
        },
    ],
    text: [
        {
            description: "Push text to para",
            test: () => true,
            action: ({ config, context, workspace }) => {

                const element = context.sequences[0].element;
                //const renderedText = config.renderers.text(element.text);
                //workspace.paraContentStack[0].content.push(renderedText);
                element.text.split(" ").map((w, id) => {

                    const renderedText = config.renderers.text((id === element.text.split(" ") - 1) ? w : w + " ")
                    workspace.paraContentStack[0].content.push(renderedText);
                })

            }
        },
    ],
    mark: [
        {
            description: "Show chapter/verse markers",
            test: () => true,
            action: ({ config, context, workspace }) => {
                const element = context.sequences[0].element;
                if (element.subType === "chapter_label" && workspace.settings.showChapterLabels) {
                    workspace.chapter = element.atts.number;
                    workspace.paraContentStack[0].content.push(config.renderers.chapter_label(element.atts.number));
                } else if (element.subType === "verses_label" && workspace.settings.showVersesLabels) {
                    let bcv = [];
                    if (config.selectedBcvNotes.length > 0) {
                        bcv = [workspace.bookCode, workspace.chapter, element.atts.number]
                    }
                    workspace.paraContentStack[0].content.push(config.renderers.verses_label(element.atts.number, bcv, config.bcvNotesCallback));
                }
            }
        },
    ],
    endDocument: [
        {
            description: "Build JSX",
            test: () => true,
            action: ({ config, workspace, output }) => {

                output.paras = config.renderers.mergeParas(workspace.webParas);
            }
        }
    ],
};

module.exports = { sofria2WebActions };