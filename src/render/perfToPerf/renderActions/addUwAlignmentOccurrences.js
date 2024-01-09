const addUwAlignmentOccurrencesActions = {
    startDocument: [
        {
            description: "Set up w counter",
            test: ({context}) => true,
            action: ({workspace}) => {
                workspace.wInVerse = 0;
                return true;
            }
        },
    ],
    mark: [
        {
            description: "Update CV state",
            test: () => true,
            action: ({context, workspace, output}) => {
                try {
                    const element = context.sequences[0].element;
                    if (element.subType === "chapter") {
                        workspace.chapter = element.atts["number"];
                        workspace.verses = null;

                    } else if (element.subType === "verses") {
                        workspace.verses = element.atts["number"];
                        workspace.verseWordOccurrences = {};
                        workspace.wInVerse = 0;
                    }
                } catch (err) {
                    console.error(err);
                    throw err;
                }
                return true;
            },
        },
    ],
    startWrapper: [
        {
            description: "Add occurrences to w wrapper",
            test: ({context}) => context.sequences[0].element.subType === "usfm:w",
            action: ({config, context, workspace, output}) => {
                const element = context.sequences[0].element;
                const wrapperRecord = {
                    type: element.type,
                    subtype: element.subType,
                    content: [],
                };
                if ('atts' in element && typeof (element.atts) === "object" && Object.keys(element.atts).length !== 0) {
                    wrapperRecord.atts = element.atts;
                }
                const occurrences = config.occurrences[workspace.chapter][workspace.verses][workspace.wInVerse];
                if (!occurrences) {
                    throw new Error(`No occurrences data for ${workspace.chapter}:${workspace.verses}#${workspace.wInVerse}`)
                }
                wrapperRecord.atts['x-occurrences'] = [occurrences];
                workspace.wInVerse++;
                workspace.outputContentStack[0].push(wrapperRecord);
                workspace.outputContentStack.unshift(wrapperRecord.content);
                return false;
            }
        }
    ],
};

module.exports = {addUwAlignmentOccurrencesActions};
