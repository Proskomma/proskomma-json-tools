const inlineGrafts = ['xref'];
const inlineStyles = ['x'];

const processBlock = (sequences, sequenceStack, block, ret) => {
    // Output each item in turn, but chapter goes first if present
    let itemNo = 0;
    for (const item of block.content.filter(i => i !== "")) {
        if (typeof item === 'string') {
            if (itemNo === 0) {
                ret.push(`\n\\${block.subType}`);
                if (inlineStyles.includes(block.subType)) {
                    ret.push(' ');
                } else {
                    ret.push('\n');
                }
            }
            ret.push(item);
        } else if (item.type === 'chapter') {
            ret.push(`\n\\c ${item.number}\n`);
            ret.push(`\n\\${block.subType}\n`);
        } else if (item.type === 'verses') {
            ret.push(`\n\\v ${item.number}\n`);
        } else if (item.type === 'graft') {
            sequenceStack.unshift(item.target);
            processSequence(sequences, sequenceStack, ret);
            if (inlineGrafts.includes(item.subType)) {
                ret.push(`\\${sequences[item.target].blocks[0].subType}*`);
            }
        }
        itemNo++;
    }
}

const processSequence = (sequences, sequenceStack, ret) => {
    for (const blockOrGraft of sequences[sequenceStack[0]].blocks) {
        if (blockOrGraft.type === 'graft') {
            sequenceStack.unshift(blockOrGraft.target);
            processSequence(sequences, sequenceStack, ret);
         } else {
            processBlock(sequences, sequenceStack, blockOrGraft, ret);
        }
    }
    sequenceStack.shift();
}

const perf2usfm = perf => {
    let ret = [];
    // Headers - add 1 where necessary
    const headers = perf.headers;
    for (const headerKey of ['id', 'ide', 'sts', 'h', 'toc', 'toc2', 'toc3', 'toca', 'toca2', 'toca3']) {
        if (headerKey in headers) {
            ret.push(`\\${['toc', 'toca'].includes(headerKey) ? headerKey + '1' : headerKey} ${headers[headerKey]}\n`);
        }
    }
    ret.push('\\usfm 3.0\n');
    // Walk sequence stack
    const sequenceStack = [perf.mainSequence];
    while (sequenceStack.length > 0) {
        processSequence(perf.sequences, sequenceStack, ret);
    }
    return ret.join('').replace(/\n+/g, '\n');
};

export default perf2usfm;
