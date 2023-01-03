const initialBlockRecord = ct => ({
    type: ct.sequences[0].block.type,
    subType: ct.sequences[0].block.subType,
    pos: ct.sequences[0].block.blockN,
    perfChapter: null,
});

const calculateUsfmChapterPositionsActions = {
    startDocument: [
        {
            description: "Set up storage",
            test: () => true,
            action: ({workspace, output}) => {
                workspace.blockRecords = [];
                output.report = {};
            }
        },
    ],
    startParagraph: [
        {
            description: "Set up block record",
            test: () => true,
            action: ({context, workspace, output}) => {
                workspace.blockRecords.push(initialBlockRecord(context));
            }
        },
    ],
    blockGraft: [
        {
            description: "Set up block record",
            test: () => true,
            action: ({context, workspace, output}) => {
                workspace.blockRecords.push(initialBlockRecord(context));
            }
        },
    ],
    mark: [
        {
            description: "Add chapter number to block record",
            test: ({context}) => context.sequences[0].element.subType === "chapter",
            action: ({config, context, workspace, output}) => {
                workspace.blockRecords[workspace.blockRecords.length - 1].perfChapter = context.sequences[0].element.atts["number"];
            }
        }
    ],
    endDocument: [
        {
            description: "Populate report",
            test: () => true,
            action: ({workspace, output}) => {
                for (const [recordN, record] of Object.entries(workspace.blockRecords)) {
                    if (!record.perfChapter) {
                        continue;
                    }
                    let usfmChapterPos = recordN;
                    let found = false;
                    while (usfmChapterPos > 0 && !found) {
                        if (workspace.blockRecords[usfmChapterPos - 1].type === 'paragraph'
                            || workspace.blockRecords[usfmChapterPos - 1].subType === 'title') {
                            found = true;
                        } else {
                            usfmChapterPos--;
                        }
                    }
                    output.report[usfmChapterPos.toString()] = record.perfChapter;
                }
            }
        },
    ],
};

module.exports = { calculateUsfmChapterPositionsActions };