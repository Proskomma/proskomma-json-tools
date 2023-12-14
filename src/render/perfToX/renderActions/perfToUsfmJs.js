// Put mt into headers

const perfToUsfmJsActions = {
    startDocument: [
        {
            description: "Setup",
            test: () => true,
            action: ({context, workspace, output}) => {
                workspace.chapter = null;
                workspace.verses = null;
                output.usfmJs = {
                    headers: [],
                    chapters: {}
                };
                for (const [k,v] of Object.entries(context.document.metadata.document)) {
                    if (['bookCode', 'properties', 'tags'].includes(k)) {
                        continue;
                    }
                    output.usfmJs.headers.push({
                        tag: k === "toc" ? "toc1" : k,
                        content: v
                    });

                }
            }
        }
    ],
    mark: [
        {
            description: "Update chapter number",
            test: ({context}) => context.sequences[0].element.subType === "chapter",
            action: ({context, workspace, output}) => {
                workspace.chapter = context.sequences[0].element.atts["number"];
                workspace.verses = null;
                output.usfmJs.chapters[workspace.chapter] = {};
            }
        },
        {
            description: "Update verses number",
            test: ({context}) => context.sequences[0].element.subType === "verses",
            action: ({context, workspace, output}) => {
                workspace.verses = context.sequences[0].element.atts["number"];
                output.usfmJs.chapters[workspace.chapter][workspace.verses] = {verseObjects: []};
            }
        }
    ],
};

module.exports = { perfToUsfmJsActions };
