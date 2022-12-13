const usfm2perfCode = function ({usfm, selectors, proskomma}) {
    proskomma.importDocuments(selectors, 'usfm', [usfm]);
    const perfResultDocument = proskomma.gqlQuerySync('{documents {id docSetId perf} }').data.documents[0];
    const docId = perfResultDocument.id;
    const docSetId = perfResultDocument.docSetId;
    proskomma.gqlQuerySync(`mutation { deleteDocument(docSetId: "${docSetId}", documentId: "${docId}") }`);
    const perf = JSON.parse(perfResultDocument.perf);
    return {perf};
}

const usfm2perf = {
    name: "usfm2perf",
    type: "Transform",
    description: "USFM=>PERF: Conversion via Proskomma",
    inputs: [
        {
            name: "usfm",
            type: "text",
            source: ""
        },
        {
            name: "selectors",
            type: "json",
            source: ""
        }
    ],
    outputs: [
        {
            name: "perf",
            type: "json",
        }
    ],
    code: usfm2perfCode
}

module.exports = usfm2perf;
