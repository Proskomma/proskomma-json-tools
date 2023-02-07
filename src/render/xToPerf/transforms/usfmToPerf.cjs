const usfmToPerfCode = function ({usfm, selectors, proskomma}) {
    proskomma.importDocuments(selectors, 'usfm', [usfm]);
    const perfResultDocument = proskomma.gqlQuerySync('{documents {id docSetId perf} }').data.documents[0];
    const docId = perfResultDocument.id;
    const docSetId = perfResultDocument.docSetId;
    proskomma.gqlQuerySync(`mutation { deleteDocument(docSetId: "${docSetId}", documentId: "${docId}") }`);
    const perf = JSON.parse(perfResultDocument.perf);
    return {perf};
}

const usfmToPerf = {
    name: "usfmToPerf",
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
    code: usfmToPerfCode
}

module.exports = {
    usfmToPerf,
    usfmToPerfCode,
};
