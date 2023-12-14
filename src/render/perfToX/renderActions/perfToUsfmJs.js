// Put mt into headers

const perfToUsfmJsActions = {
    startDocument: [
        {
            description: "Setup",
            test: () => true,
            action: ({context, workspace, output}) => {
                workspace.chapter = null;
                workspace.verses = null;
                output.usfmJs = {headers: []};
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
    ]
};

module.exports = { perfToUsfmJsActions };
