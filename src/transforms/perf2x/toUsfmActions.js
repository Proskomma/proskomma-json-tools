import usfmHelps from '../../usfmHelps';

const initNestedLevel = (workspace,level) => {
    workspace.nestInx=level
    workspace.usfmBits[level] = [];
}

const wsPushStrAtLevel = (workspace,str,level = 0) => {
    str && workspace.usfmBits[level].push(str);
}

const wsPushStr = (workspace,str) =>
    wsPushStrAtLevel(workspace,str,workspace.nestInx)

const upNestingLevel = (workspace,saveEl) => {
    workspace.savedEl.push(saveEl)
    initNestedLevel(workspace,workspace.nestInx+1)
}
const wsCheckAndPushTag = (workspace,tag,str) => {
    const checkTags = ['ts', 'c', ...usfmHelps.bodyTags]
    // Strategy - delay output and wait until able to keep the strict order
    // unless tag is outside of valid list
    // then output all delayed items and current one (while keeping the order)
    if (checkTags.includes(tag)) {
        if (usfmHelps.bodyTags.includes(tag)) {
            workspace.strictTagOrderStore.usfmBits.push(str)
        } else {
            workspace.strictTagOrderStore[tag] = str
        }
    } else {
        wsPushStr(workspace,workspace.strictTagOrderStore.ts)
        wsPushStr(workspace,workspace.strictTagOrderStore.c)
        wsPushStr(workspace,workspace.strictTagOrderStore.usfmBits.join())
        wsPushStr(workspace,str)
        workspace.strictTagOrderStore = {usfmBits: []}
    }
}

const popNestedElement = (workspace) => workspace.savedEl.pop()

const popNestedUsfmBits = (workspace) => {
    // To do: probably first output all content in "strictTagOrder"
    const retArr = workspace.usfmBits[workspace.nestInx]
    workspace.usfmBits[workspace.nestInx] = [];
    return retArr
}

const downNestingLevel = workspace => {
    const tempArr = popNestedUsfmBits(workspace)
    if (workspace.nestInx>0){
        workspace.nestInx--
    }
    workspace.usfmBits[workspace.nestInx].push(...tempArr)
}

const oneifyTag = t => {
    if (['toc', 'toca', 'mt'].includes(t)) {
        return t + '1';
    }
    return t;
}

const toUsfmActions = {
    startDocument: [
        {
            description: "Set up environment",
            test: () => true,
            action: ({context, workspace}) => {
                workspace.usfmBits = [];
                workspace.savedEl = [];
                workspace.strictTagOrderStore = {usfmBits: []}
                initNestedLevel(workspace,0);
                for (
                    let [key, value] of
                    Object.entries(context.document.metadata.document)
                        .filter(kv => !['tags', 'properties', 'bookCode'].includes(kv[0]))
                    ) {
                    wsCheckAndPushTag(workspace,key,`\\${oneifyTag(key)} ${value}\n`);
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
                const tag = context.sequences[0].block.subType.split(':')[1]
                wsCheckAndPushTag(workspace,tag,`\n\\${oneifyTag(tag)}\n`);
            }
        }
    ],
    endParagraph: [
        {
            description: "Output nl",
            test: () => true,
            action: ({workspace}) => {
                wsPushStr(workspace,`\n`);
            }
        }
    ],
    text: [
        {
            description: "Output text",
            test: () => true,
            action: ({context, workspace}) => {
                const text = context.sequences[0].element.text;
                wsPushStr(workspace,text);
            }
        },
    ],
    mark: [
        {
            description: "Output chapter or verses",
            test: () => true,
            action: ({context, workspace}) => {
                const element = context.sequences[0].element;
                if (element.subType === 'chapter') {
                    wsCheckAndPushTag(workspace,'c',`\n\\c ${element.atts['number']}\n`);
                } else if (element.subType === 'verses') {
                    wsCheckAndPushTag(workspace,'v',`\\v ${element.atts['number']}\n`);
                }
            }
        },
    ],
    endDocument: [
        {
            description: "Build output",
            test: () => true,
            action: ({workspace, output}) => {
                const reorderedChapters = workspace.usfmBits[0]
                output.usfm = reorderedChapters.join('');
            }
        },
    ],
    startMilestone: [
        {
            description: "Output start of milestone",
            test: () => true,
            action: ({context,workspace}) => {
                const element = context.sequences[0].element;
                if (element && element.atts) {
                    if (Object.keys(element.atts).length>0) {
                        wsPushStr(workspace,`\\zaln-s |`);
                        let separatorCh = "";
                        Object.keys(element.atts).forEach(key => {
                            wsPushStr(workspace,`${separatorCh}${key}="${element.atts[key]}"`);
                            separatorCh = " "
                        })
                        wsPushStr(workspace,`\\*`);
                    } else if (element.subType === "usfm:ts") {
                        wsCheckAndPushTag(workspace,'ts',`\n\n\\ts\\* `)
                    }
                }
            }
        }
    ],
    endMilestone: [
        {
            description: "Output end of milestone",
            test: () => true,
            action: ({workspace}) => {
                wsPushStr(workspace,`\\zaln-e\\*`);
            }
        }
    ],
    startWrapper: [
        {
            description: "Handle start of wrapper",
            test: () => true,
            action: ({context,workspace}) => {
                upNestingLevel(workspace,context.sequences[0].element)
            }
        }
    ],
    endWrapper: [
        {
            description: "Output start and end of wrapper, incl. wrapped text",
            test: () => true,
            action: ({context,workspace}) => {
                const savedStartEl = popNestedElement(workspace)
                const nestedUsfmBits = popNestedUsfmBits(workspace)
                downNestingLevel(workspace)
                if (savedStartEl
                    && savedStartEl.atts
                    && Object.keys(savedStartEl.atts).length>0)
                {
                    wsPushStr(workspace,`\\w ${nestedUsfmBits.join('')}|`);
                    let separatorCh = "";
                    Object.keys(savedStartEl.atts).forEach(key => {
                        wsPushStr(workspace,
                            `${separatorCh}${key}="${savedStartEl.atts[key]}"`);
                        separatorCh = " "
                    })
                }
                wsPushStr(workspace,`\\w*`);
            }
        }
    ],
};
module.exports = toUsfmActions;
