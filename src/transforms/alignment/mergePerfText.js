import deepCopy from 'deep-copy-all';

const doMerge1 = content => {
    let ret = [];
    for (const element of content) {
        if (typeof element === 'string') {
            if (ret.length > 0 && typeof ret[ret.length - 1] === 'string') {
                ret[ret.length - 1] += element;
            } else {
                ret.push(element);
            }
        } else {
            if (element.content) {
                element.content = doMerge1(element.content);
            }
            if (element.metaContent) {
                element.metaContent = doMerge1(element.content);
            }
            ret.push(element);
        }
    }
    return ret;
}

const doMerge = perf => {
    const newPerf = deepCopy(perf);
    for (const seq of Object.values(newPerf.sequences)) {
        for (const block of seq.blocks) {
            if (block.content) {
                block.content = doMerge1(block.content);
            }
            if (block.metaContent) {
                block.metaContent = doMerge1(block.metaContent);
            }
        }
    }
    return newPerf;
}


const mergePerfTextCode = function ({perf}) {
    return {perf: doMerge(perf)};
}

const mergePerfText = {
    name: "mergePerfText",
    type: "Transform",
    description: "PERF=>PERF: Merge consecutive text strings",
    inputs: [
        {
            name: "perf",
            type: "json",
            source: ""
        },
     ],
    outputs: [
        {
            name: "perf",
            type: "json",
        }
    ],
    code: mergePerfTextCode
}

export default mergePerfText;
