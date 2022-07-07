const ProskommaRender = require('./ProskommaRender');

class ProskommaRenderFromProskomma extends ProskommaRender {

    constructor(spec) {
        super(spec);
        if (!spec.proskomma) {
            throw new Error(`No Proskomma`)
        }
        this.pk = spec.proskomma;
        this._tokens = [];
    }

    renderDocument1({docId, config, context, workspace, output}) {
        const environment = {config, context, workspace, output};
        context.renderer = this;
        const documentResult = this.pk.gqlQuerySync(`{document(id: "${docId}") {docSetId mainSequence { id } nSequences headers { key value } } }`);
        const docSetId = documentResult.data.document.docSetId;
        const mainId = documentResult.data.document.mainSequence.id;
        const nSequences = documentResult.data.document.nSequences;
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
                "structure_version": "0.2.0",
                "constraints": [
                    {
                        "name": "perf",
                        "version": "0.2.0"
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
            type: sequence.type,
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
        for (let inputBlockN = 0; inputBlockN < (sequence.nBlocks - 1); inputBlockN++) {
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
                    subType: blockGraft.subType,
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
        if (item.type === 'token') {
            this._tokens.push(item.payload.replace(/\s+/g, " "));
        } else {
            if (item.type === "graft") {
                this.maybeRenderText(environment);
                const graft = {
                    type: "graft",
                    subType: item.subType,
                    target: item.payload,
                    isNew: false,
                };
                environment.context.sequences[0].element = graft;
                this.renderEvent('inlineGraft', environment);
                delete environment.context.sequences[0].element;
            } else { // scope
                this.maybeRenderText(environment);
                const scopeBits = item.payload.split('/');
                if (["chapter", "verses"].includes(scopeBits[0])) {
                    if (item.subType === 'start') {
                        const mark = {
                            type: "mark",
                            subType: scopeBits[0],
                            atts: {
                                number: scopeBits[1]
                            }
                        };
                        environment.context.sequences[0].element = mark;
                        this.renderEvent('mark', environment);
                        delete environment.context.sequences[0].element;
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

}

module.exports = ProskommaRenderFromProskomma;
