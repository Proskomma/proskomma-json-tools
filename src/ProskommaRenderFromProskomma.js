const ProskommaRender = require('./ProskommaRender');

class ProskommaRenderFromProskomma extends ProskommaRender {

    constructor(spec) {
        super(spec);
        if (!spec.proskomma) {
            throw new Error(`No Proskomma`)
        }
        this.pk = spec.proskomma;
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
        };
        const docSetResult = this.pk.gqlQuerySync(`{docSet(id: "${docSetId}") {selectors {key value}}}`);
        console.log(docSetResult)
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
        console.log(context.document);
        context.sequences = [];
    }

}

module.exports = ProskommaRenderFromProskomma;
