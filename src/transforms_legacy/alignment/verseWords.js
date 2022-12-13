import PerfRenderFromJson from '../../PerfRenderFromJson';
import xre from "xregexp";

const localVerseWordsActions = {
    startDocument: [
        {
            description: "Set up storage",
            test: () => true,
            action: ({workspace, output}) => {
                workspace.verseContent = [];
                workspace.chapter = null;
                workspace.verses = null;
                output.cv = {};
            }
        },
    ],
    mark: [
        {
            description: "Update CV state",
            test: () => true,
            action: ({ context, workspace, output }) => {
                const { element } = context.sequences[0];
                if (element.subType === 'chapter') {
                    workspace.chapter = element.atts['number'];
                    workspace.verses = 0
                    output.cv[workspace.chapter] = {};
                    output.cv[workspace.chapter][workspace.verses] = {};
                } else if (element.subType === 'verses') {
                    workspace.verses = element.atts['number'];
                    output.cv[workspace.chapter][workspace.verses] = {};
                }
            }
        },
    ],
    text: [
        {
            description: "Log occurrences",
            test: () => true,
            action: ({ context, workspace, output }) => {
                const { chapter, verses } = workspace;
                const { text } = context.sequences[0].element;
                const re = xre('([\\p{Letter}\\p{Number}\\p{Mark}\\u2060]{1,127})')
                const words = xre.match(text, re, "all");
                for (const word of words) {
                    output.cv[chapter][verses][word] ??= 0;
                    output.cv[chapter][verses][word] += 1;
                }
            }
        }
    ]
};

const verseWordsCode = function ({ perf }) {
    const cl = new PerfRenderFromJson(
        {
            srcJson: perf,
            actions: localVerseWordsActions
        }
    );
    const output = {};
    cl.renderDocument({ docId: "", config: {}, output });
    return { verseWords: output.cv };
}

const verseWords = {
    name: "verseWords",
    type: "Transform",
    description: "PERF=>JSON: Counts words occurrences",
    inputs: [
        {
            name: "perf",
            type: "json",
            source: ""
        },
    ],
    outputs: [
        {
            name: "verseWords",
            type: "json",
        }
    ],
    code: verseWordsCode
}
export default verseWords;
