const wordCountActions = {
    startDocument: [
        {
            description: "Set up word object",
            test: () => true,
            action: ({config, context, workspace, output}) => {
                workspace.words = {}
            }
        },
    ],
    text: [
        {
            description: "Split strings and add words to word object",
            test: () => true,
            action: ({config, context, workspace, output}) => {
                for (let word of context.sequences[0].element.text.split(/[\s:;,.]+/).filter(w => w.length > 0)) {
                    word = word.toLowerCase();
                    if (word in workspace.words) {
                        workspace.words[word] += 1;
                    } else {
                        workspace.words[word] = 1;
                    }
                }
            }
        }
    ],
    endDocument: [
        {
            description: "Sort words",
            test: () => true,
            action: ({config, context, workspace, output}) => {
                output.words = [...Object.entries(workspace.words)]
                    .sort((a, b) => b[1] - a[1])
            }
        },
    ],
};

module.exports = wordCountActions;
