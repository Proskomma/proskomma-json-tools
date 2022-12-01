const ProskommaRender = require('./ProskommaRender');

const camelCase2snakeCase = s => {
    const ret = [];
    for (const c of s.split("")) {
        if (c.toUpperCase() === c && c.toLowerCase() !== c) {
            ret.push(`_${c.toLowerCase()}`);
        } else {
            ret.push(c);
        }
    }
    return ret.join("");
}

class PerfRenderFromProskomma extends ProskommaRender {

    constructor(spec) {
        super(spec);
        if (!spec.proskomma) {
            throw new Error(`No Proskomma`)
        }
        this.pk = spec.proskomma;
        this._tokens = [];
        this._container = null;
    }

    renderDocument1({docId, config, context, workspace, output}) {
        const environment = {config, context, workspace, output};
        context.renderer = this;
        const documentResult = this.pk.gqlQuerySync(`{document(id: "${docId}") {docSetId mainSequence { id } nSequences sequences {id} headers { key value } } }`);
        const docSetId = documentResult.data.document.docSetId;
        const mainId = documentResult.data.document.mainSequence.id;
        const nSequences = documentResult.data.document.nSequences;
        const sequenceIds = documentResult.data.document.sequences.map(s => s.id);
        const headers = {};
        for (const header of documentResult.data.document.headers) {
            headers[header.key] = header.value;
        }
        const docSetResult = this.pk.gqlQuerySync(`{docSet(id: "${docSetId}") {selectors {key value}}}`);
        const selectors = {};
        for (const selector of docSetResult.data.docSet.selectors) {
            selectors[selector.key] = selector.value;
        }
        context.document = {
            id: docId,
            schema: {
                "structure": "flat",
                "structure_version": "0.2.1",
                "constraints": [
                    {
                        "name": "perf",
                        "version": "0.2.1"
                    }
                ]
            },

            metadata: {
                translation: {
                    id: docSetId,
                    selectors,
                    properties: {},
                    tags: []
                },
                document: {
                    ...headers,
                    properties: {},
                    tags: []
                }
            },
            mainSequenceId: mainId,
            nSequences,
        };
        context.sequences = [];
        this.renderEvent('startDocument', environment);
        this.renderSequenceId(environment, mainId);
        this.renderEvent('endDocument', environment);
    }

    sequenceContext(sequence, sequenceId) {
        return {
            id: sequenceId,
            type: camelCase2snakeCase(sequence.type),
            nBlocks: sequence.nBlocks,
            milestones: new Set([]),
        }
    }

    renderSequenceId(environment, sequenceId) {
        const context = environment.context;
        const documentResult = this.pk.gqlQuerySync(`{document(id: "${context.document.id}") {sequence(id:"${sequenceId}") {id type nBlocks } } }`);
        const sequence = documentResult.data.document.sequence;
        if (!sequence) {
            throw new Error(`Sequence '${sequenceId}' not found in renderSequenceId()`);
        }
        context.sequences.unshift(this.sequenceContext(sequence, sequenceId));
        this.renderEvent('startSequence', environment);
        let outputBlockN = 0;
        for (let inputBlockN = 0; inputBlockN < sequence.nBlocks; inputBlockN++) {
            const blocksResult = this.pk.gqlQuerySync(
                `{
               document(id: "${context.document.id}") {
                 sequence(id:"${sequenceId}") {
                   blocks(positions:${inputBlockN}) {
                     bg {subType payload}
                     bs {payload}
                     items {type subType payload}
                   }
                 }
               }
             }`
            );
            const blockResult = blocksResult.data.document.sequence.blocks[0];
            for (const blockGraft of blockResult.bg) {
                context.sequences[0].block = {
                    type: "graft",
                    subType: camelCase2snakeCase(blockGraft.subType),
                    blockN: outputBlockN,
                }
                context.sequences[0].block.target = blockGraft.payload;
                context.sequences[0].block.isNew = false;
                this.renderEvent('blockGraft', environment);
                outputBlockN++;
            }
            context.sequences[0].block = {
                type: "paragraph",
                subType: `usfm:${blockResult.bs.payload.split('/')[1]}`,
                blockN: outputBlockN,
                wrappers: []
            }
            this.renderEvent('startParagraph', environment);
            this._tokens = [];
            this.renderContent(blockResult.items, environment);
            this._tokens = [];
            this.renderEvent('endParagraph', environment);
            delete context.sequences[0].block;
            outputBlockN++;
        }
        this.renderEvent('endSequence', environment);
        context.sequences.shift();
    }

    renderContent(items, environment) {
        for (const item of items) {
            this.renderItem(item, environment);
        }
        this.maybeRenderText(environment);
    }

    renderItem(item, environment) {
        if (item.type === 'scope' && item.payload.startsWith('attribute')) {
            if (item.subType === "start") {
                if (!this._container) {
                    throw new Error(`Start attribute when no container set`);
                }
                const scopeBits = item.payload.split('/');
                if (scopeBits[3] in this._container.atts) {
                    this._container.atts[scopeBits[3]].push(scopeBits[5]);
                } else {
                    this._container.atts[scopeBits[3]] = [scopeBits[5]];
                }
            } else {
                const scopeBits = item.payload.split('/');
                if (!this._container) {
                    this._container = {
                        direction: "end",
                        subType: `usfm:${camelCase2snakeCase(scopeBits[2])}`,
                    };
                    if(scopeBits[1] === 'milestone') {
                        this._container.type = "end_milestone";
                    } else {
                        this._container.type = "wrapper";
                        this._container.atts = {};
                    }
                }
            }
        } else {
            if (this._container) {
                this.maybeRenderText(environment);
                this.renderContainer(environment);
            }
            if (item.type === 'token') {
                this._tokens.push(item.payload.replace(/\s+/g, " "));
            } else {
                if (item.type === "graft") {
                    this.maybeRenderText(environment);
                    const graft = {
                        type: "graft",
                        subType: camelCase2snakeCase(item.subType),
                        target: item.payload,
                        isNew: false,
                    };
                    environment.context.sequences[0].element = graft;
                    this.renderEvent('inlineGraft', environment);
                    delete environment.context.sequences[0].element;
                } else { // scope
                    this.maybeRenderText(environment);
                    const scopeBits = item.payload.split('/');
                    if (["chapter", "verses", "pubChapter", "pubVerse", "altChapter", "altVerse"].includes(scopeBits[0])) {
                        if (item.subType === 'start') {
                            const mark = {
                                type: "mark",
                                subType: camelCase2snakeCase(scopeBits[0]),
                                atts: {
                                    number: scopeBits[1]
                                }
                            };
                            environment.context.sequences[0].element = mark;
                            this.renderEvent('mark', environment);
                            delete environment.context.sequences[0].element;
                        }
                    } else if (scopeBits[0] === 'span') {
                        const wrapper = {
                            type: "wrapper",
                            subType: `usfm:${scopeBits[1]}`,
                            atts: {},
                        };
                        environment.context.sequences[0].element = wrapper;
                        if (item.subType === 'start') {
                            environment.context.sequences[0].block.wrappers.unshift(wrapper.subType);
                            this.renderEvent('startWrapper', environment);
                        } else {
                            this.renderEvent('endWrapper', environment);
                            environment.context.sequences[0].block.wrappers.shift();
                        }
                        delete environment.context.sequences[0].element;
                    } else if (scopeBits[0] === 'spanWithAtts') {
                        if (item.subType === 'start') {
                            this._container = {
                                direction: "start",
                                type: "wrapper",
                                subType: `usfm:${scopeBits[1]}`,
                                atts: {}
                            };
                        }
                    } else if (scopeBits[0] === 'milestone' && item.subType === "start") {
                        if (scopeBits[1] === 'ts') {
                            const mark = {
                                type: "mark",
                                subType: `usfm:${camelCase2snakeCase(scopeBits[1])}`,
                                atts: {},
                            };
                            environment.context.sequences[0].element = mark;
                            this.renderEvent('mark', environment);
                            delete environment.context.sequences[0].element;
                        } else {
                            this._container = {
                                type: "start_milestone",
                                subType: `usfm:${camelCase2snakeCase(scopeBits[1])}`,
                                atts: {},
                            }
                        }
                    }
                }
            }
        }
    }

    maybeRenderText(environment) {
        if (this._tokens.length === 0) {
            return;
        }
        const elementContext = {
            type: 'text',
            text: this._tokens.join(''),
        };
        environment.context.sequences[0].element = elementContext;
        this._tokens = [];
        this.renderEvent('text', environment);
        delete environment.context.sequences[0].element;
    }

    renderContainer(environment) {
        if (this._container.type === "wrapper") {
            const direction = this._container.direction;
            delete this._container.direction;
            if (direction === 'start') {
                environment.context.sequences[0].element = this._container;
                environment.context.sequences[0].block.wrappers.unshift(this._container.subType);
                this.renderEvent('startWrapper', environment);
                delete environment.context.sequences[0].element;
            } else {
                environment.context.sequences[0].element = this._container;
                this.renderEvent('endWrapper', environment);
                environment.context.sequences[0].block.wrappers.shift();
                delete environment.context.sequences[0].element;
            }
        } else if (this._container.type === "start_milestone") {
            environment.context.sequences[0].element = this._container;
            this.renderEvent('startMilestone', environment);
            delete environment.context.sequences[0].element;
        } else if (this._container.type === "end_milestone") {
            environment.context.sequences[0].element = this._container;
            this.renderEvent('endMilestone', environment);
            delete environment.context.sequences[0].element;
        }
        this._container = null;
    }

}

module.exports = PerfRenderFromProskomma;
