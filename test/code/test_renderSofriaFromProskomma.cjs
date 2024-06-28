import test from 'tape';

import path from 'path';
import fse from 'fs-extra';
import SofriaRenderFromProskomma from '../../dist/render/renderers/SofriaRenderFromProskomma';
import SofriaRenderFromJson from '../../dist/render/renderers/SofriaRenderFromJson';
import { identityActions } from '../../dist/render/sofriaToSofria/renderActions/identity';
import { Proskomma } from 'proskomma-core';
import { Validator } from '../../dist/';
import {sofria2WebActions} from '../../src/render/sofria2web/renderActions/sofria2web';
import { renderers } from '../../src/render/sofria2web/sofria2html';

const testGroup = 'Render SOFRIA from Proskomma';

const pk = new Proskomma();

test(
    `Instantiate class (${testGroup})`,
    async function (t) {
        try {
            t.plan(1);
            t.doesNotThrow(() => new SofriaRenderFromProskomma({ proskomma: pk }));
        } catch (err) {
            console.log(err);
        }
    },
);

test(
    `Render SOFRIA via identity actions (${testGroup})`,
    async function (t) {
        try {
            t.plan(4);
            const usfm = fse.readFileSync(path.resolve(path.join('test', 'test_data', 'usfms', 'webbe_mrk.usfm'))).toString();
            pk.importDocument({ 'lang': 'eng', 'abbr': 'web' }, 'usfm', usfm);
            const docId = pk.gqlQuerySync('{documents { id } }').data.documents[0].id;
            const cl = new SofriaRenderFromProskomma({ proskomma: pk, actions: identityActions });
            const output = {};
            t.doesNotThrow(
                () => cl.renderDocument(
                    { docId, config: {}, output }
                )
            );

            // console.log(JSON.stringify(output, null, 2));
            const validator = new Validator();
            const validation = validator.validate(
                'constraint',
                'sofriaDocument',
                '0.4.0',
                output.sofria
            );

            t.ok(validation.isValid);
            t.equal(validation.errors, null);
            t.equal(validation.errors, null);

        } catch (err) {
            console.log(err);
        }
    },
);

test(
    `Render 1 chapter of SOFRIA (${testGroup})`,
    async function (t) {
        try {
            t.plan(3);
            const docId = pk.gqlQuerySync('{documents { id } }').data.documents[0].id;
            const cl = new SofriaRenderFromProskomma({ proskomma: pk, actions: identityActions });
            const output = {};
            t.doesNotThrow(
                () => cl.renderDocument(
                    { docId, config: { chapters: ['2'] }, output }
                )
            );
            // console.log(JSON.stringify(output, null, 2));
            const validator = new Validator();
            const validation = validator.validate(
                'constraint',
                'sofriaDocument',
                '0.4.0',
                output.sofria
            );
            t.ok(validation.isValid);
            t.equal(validation.errors, null);
        } catch (err) {
            console.log(err);
        }
    },
);

test(
    `Render SOFRIA with atts via identity actions (${testGroup})`,
    async function (t) {
        try {
            t.plan(3);
            const pk2 = new Proskomma();
            const usfm = fse.readFileSync(path.resolve(path.join('test', 'test_data', 'usfms', 'ult_uw_mrk.usfm'))).toString();
            pk2.importDocument({ 'lang': 'eng', 'abbr': 'ult' }, 'usfm', usfm);
            const docId = pk2.gqlQuerySync('{documents { id } }').data.documents[0].id;
            const cl = new SofriaRenderFromProskomma({ proskomma: pk2, actions: identityActions });
            const output = {};
            t.doesNotThrow(() => cl.renderDocument({ docId, config: {}, output }));
            // console.log(JSON.stringify(output, null, 2));
            const validator = new Validator();
            const validation = validator.validate(
                'constraint',
                'sofriaDocument',
                '0.4.0',
                output.sofria
            );
            t.ok(validation.isValid);
            t.equal(validation.errors, null);
        } catch (err) {
            console.log(err);
        }
    },
);

test(
    `Render SOFRIA with multi-para verses (${testGroup})`,
    async function (t) {
        try {
            t.plan(3);
            const pk3 = new Proskomma();
            const usfm = fse.readFileSync(path.resolve(path.join('test', 'test_data', 'usfms', 'verse_over_para_boundary.usfm'))).toString();
            pk3.importDocument({ 'lang': 'eng', 'abbr': 'web' }, 'usfm', usfm);
            const docId = pk3.gqlQuerySync('{documents { id } }').data.documents[0].id;
            const cl = new SofriaRenderFromProskomma({ proskomma: pk3, actions: identityActions });
            const output = {};
            t.doesNotThrow(
                () => cl.renderDocument(
                    { docId, config: {}, output }
                )
            );
            // console.log(JSON.stringify(output, null, 2));
            const validator = new Validator();
            const validation = validator.validate(
                'constraint',
                'sofriaDocument',
                '0.4.0',
                output.sofria
            );
            t.ok(validation.isValid);
            t.equal(validation.errors, null);
        } catch (err) {
            console.log(err);
        }
    },
);

test(
    `Check for xrefs and wj in SOFRIA (${testGroup})`,
    async function (t) {
        try {
            t.plan(5);
            const pk4 = new Proskomma();
            const usfm = fse.readFileSync(path.resolve(path.join('test', 'test_data', 'usfms', 'webbe_mrk.usfm'))).toString();
            pk4.importDocument({ 'lang': 'eng', 'abbr': 'web' }, 'usfm', usfm);
            const docId = pk4.gqlQuerySync('{documents { id } }').data.documents[0].id;
            const cl = new SofriaRenderFromProskomma({ proskomma: pk4, actions: identityActions });
            const output = {};
            t.doesNotThrow(
                () => cl.renderDocument(
                    { docId, config: {}, output }
                )
            );
            // console.log(JSON.stringify(output.sofria, null, 2));
            const validator = new Validator();
            const validation = validator.validate(
                'constraint',
                'sofriaDocument',
                '0.4.0',
                output.sofria
            );
            t.ok(validation.isValid);
            t.equal(validation.errors, null);
            const sofriaString = JSON.stringify(output.sofria);
            t.ok(sofriaString.includes('footnote'));
            t.ok(sofriaString.includes('usfm:wj'));
        } catch (err) {
            console.log(err);
        }
    },
);

test(
    `Handle conjunction of note and straddle para for SOFRIA (${testGroup})`,
    async function (t) {
        try {
            const usxLeaves = ['sofria_note', 'sofria_verse_straddles_para', 'sofria_note_plus_verse_straddles_paras'];
            t.plan(usxLeaves.length);
            for (const usxLeaf of usxLeaves) {
                const pk5 = new Proskomma();
                const usx = fse.readFileSync(path.resolve(path.join('test', 'test_data', 'sofria_export_usx', `${usxLeaf}.usx`))).toString();
                pk5.importDocument({ 'lang': 'eng', 'abbr': 'foo' }, 'usx', usx);
                const docId = pk5.gqlQuerySync('{documents { id } }').data.documents[0].id;
                const cl = new SofriaRenderFromProskomma({ proskomma: pk5, actions: identityActions });
                const output = {};
                t.doesNotThrow(
                    () => {
                        cl.renderDocument(
                            { docId, config: {}, output }
                        );
                        // console.log(JSON.stringify(output.sofria, null, 2));
                    }
                );
            }
        } catch (err) {
            console.log(err);
        }
    },
);

test(
    `SOFRIA rems (${testGroup})`,
    async function (t) {
        try {
            t.plan(3);
            const usfm = fse.readFileSync(path.resolve(path.join('test', 'test_data', 'usfms', 'rems.usfm'))).toString();
            const pk6 = new Proskomma();
            pk6.importDocument({ 'lang': 'eng', 'abbr': 'web' }, 'usfm', usfm);
            const docId = pk6.gqlQuerySync('{documents { id } }').data.documents[0].id;
            const cl = new SofriaRenderFromProskomma({ proskomma: pk6, actions: identityActions });
            const output = {};
            t.doesNotThrow(
                () => cl.renderDocument(
                    { docId, config: {}, output }
                )
            );
            // console.log(JSON.stringify(output, null, 2));
            const validator = new Validator();
            const validation = validator.validate(
                'constraint',
                'sofriaDocument',
                '0.4.0',
                output.sofria
            );
            t.ok(validation.isValid);
            t.equal(validation.errors, null);
        } catch (err) {
            console.log(err);
        }
    },
);

test(
    `Handle alternative chapter/verse for SOFRIA (${testGroup})`,
    async function (t) {
        try {
            const usxLeaves = ['sofria_ca'];
            t.plan(usxLeaves.length * 6);
            for (const usxLeaf of usxLeaves) {
                const pk5 = new Proskomma();
                const usx = fse.readFileSync(path.resolve(path.join('test', 'test_data', 'sofria_export_usx', `${usxLeaf}.usx`))).toString();
                pk5.importDocument({ 'lang': 'eng', 'abbr': 'foo' }, 'usx', usx);
                const docId = pk5.gqlQuerySync('{documents { id } }').data.documents[0].id;
                // console.log(pk5.gqlQuerySync(`{ document(id: '${docId}') { mainSequence { blocks { dump } } } }`).data.document.mainSequence);
                const cl = new SofriaRenderFromProskomma({ proskomma: pk5, actions: identityActions });
                const output = {};
                t.doesNotThrow(
                    () => {
                        cl.renderDocument(
                            { docId, config: {}, output }
                        );
                        // console.log(JSON.stringify(output.sofria, null, 2));
                    }
                );
                const validator = new Validator();
                const validation = validator.validate(
                    'constraint',
                    'sofriaDocument',
                    '0.4.0',
                    output.sofria
                );
                t.ok(validation.isValid);
                t.equal(validation.errors, null);
                const sofriaString = JSON.stringify(output.sofria);
                t.ok(sofriaString.includes('alt_chapter'));
                t.ok(sofriaString.includes('alt_verse'));
                t.ok(sofriaString.includes('pub_verse'));
            }
        } catch (err) {
            console.log(err);
        }
    },
);

test(
    `Render francl SOFRIA via identity actions (${testGroup})`,
    async function (t) {
        try {
            t.plan(4);
            const pk6 = new Proskomma();
            const usfm = fse.readFileSync(path.resolve(path.join('test', 'test_data', 'usfms', 'eng_francl_mrk.usfm'))).toString();
            pk6.importDocument({ 'lang': 'eng', 'abbr': 'francl' }, 'usfm', usfm);
            const docId = pk6.gqlQuerySync('{documents { id } }').data.documents[0].id;
            const cl = new SofriaRenderFromProskomma({ proskomma: pk6, actions: identityActions });
            const output = {};
            t.doesNotThrow(
                () => cl.renderDocument(
                    { docId, config: {}, output }
                )
            );
            const validator = new Validator();
            const validation = validator.validate(
                'constraint',
                'sofriaDocument',
                '0.4.0',
                output.sofria
            );
            t.ok(validation.isValid);
            t.equal(validation.errors, null);
            const cl2 = new SofriaRenderFromJson({ srcJson: output.sofria, actions: identityActions });
            const output2 = {};
            t.doesNotThrow(() => cl2.renderDocument({ docId: "", config: {}, output: output2 }));
        } catch (err) {
            console.log(err);
        }
    },

);
test(`Getting only one Chapter to render (${testGroup})`,
    async function (t) {
        try {
            const docId = pk.gqlQuerySync('{documents { id }}').data.documents[0].id;
            let currentChapterContext = pk.gqlQuerySync(`{document(id: "${docId}") {cIndex(chapter: 1) {
                startBlock
                endBlock
              }}}`)
            const renderer = new SofriaRenderFromProskomma({ proskomma: pk, actions: identityActions });
            const output = {};
            const context = {};
            const workspace = {};
            const state = 'begin';
            const config = {
                showWordAtts: false,
                showTitles: true,
                showHeadings: true,
                showIntroductions: true,
                showFootnotes: true,
                showXrefs: true,
                showParaStyles: true,
                showCharacterMarkup: true,
                showChapterLabels: true,
                showVersesLabels: true,
                selectedBcvNotes: [],
                chapters: ['1'],
                displayPartOfText: { state },
                bcvNotesCallback: (bcv) => {
                    setBcvNoteRef(bcv);
                },

            };
            renderer.renderDocument1({
                docId: docId,
                config,
                context,
                workspace,
                output,


            });


            t.equal(output.paras.filter(b => b.type === 'paragraph').length, currentChapterContext.data.document.cIndex.endBlock + 1, "The number of block paragraph render is 1 ");
        } catch (err) {
            console.log(err)
        }
    }


);

test(`Getting only multiple Chapter to render (${testGroup})`,
    async function (t) {
        try {
            const docId = pk.gqlQuerySync('{documents { id }}').data.documents[0].id;
            const renderer = new SofriaRenderFromProskomma({ proskomma: pk, actions: identityActions });
            const output = {};
            const context = {};
            const workspace = {};
            const numberBlocks = 10;
            let numberOfBlocks = 0
            let currentChapterContext = pk.gqlQuerySync(`{document(id: "${docId}") {cIndex(chapter: 1) {
                startBlock
                endBlock
              }}}`)
            numberOfBlocks += currentChapterContext.data.document.cIndex.endBlock - currentChapterContext.data.document.cIndex.startBlock + 1
            currentChapterContext = pk.gqlQuerySync(`{document(id: "${docId}") {cIndex(chapter: 3) {
                startBlock
                endBlock
              }}}`)
            numberOfBlocks += currentChapterContext.data.document.cIndex.endBlock - currentChapterContext.data.document.cIndex.startBlock + 1
            let state = 'begin';
            const config = {
                showWordAtts: false,
                showTitles: true,
                showHeadings: true,
                showIntroductions: true,
                showFootnotes: true,
                showXrefs: true,
                showParaStyles: true,
                showCharacterMarkup: true,
                showChapterLabels: true,
                showVersesLabels: true,
                selectedBcvNotes: [],
                chapters: [`1`, '3'],
                displayPartOfText: { numberBlocks, state },
                bcvNotesCallback: (bcv) => {
                    setBcvNoteRef(bcv);
                },

            };
            renderer.renderDocument1({
                docId: docId,
                config,
                context,
                workspace,
                output,
            });


            config.displayPartOfText.state = 'continue';

            renderer.renderDocument1({
                docId: docId,
                config,
                context,
                workspace,
                output,
            });

            t.equal(output.paras.filter(b => b.type === 'paragraph').length, numberOfBlocks, "The number of block paragraph render is 20 ");
        } catch (err) {
            console.log(err)
        }
    }

);
test(
    `Render tr/tc/th via SOFRIA (${testGroup})`,
    async function (t) {
        try {
            t.plan(5);
            const pk = new Proskomma();
            const usfm = fse.readFileSync(path.resolve(path.join('test', 'test_data', 'usfms', 'table.usfm'))).toString();
            pk.importDocument({ 'lang': 'eng', 'abbr': 'web' }, 'usfm', usfm);
            const docId = pk.gqlQuerySync('{documents { id } }').data.documents[0].id;
            const cl = new SofriaRenderFromProskomma({ proskomma: pk, actions: identityActions });
            const output = {};
            t.doesNotThrow(
                () => cl.renderDocument(
                    { docId, config: {}, output }
                )
            );
            const numberOfRows = 5;
            const numberOfCells = 2;
            t.equal(output.paras.filter(b => b.type === 'row').length, numberOfRows, `The number of row is not ${numberOfRows}`);
            t.equal(output.paras.filter(b => b.type === 'row')[2].content[0].content.filter(c => c.subtype === 'cell').length, numberOfCells, `The number of cells render in the 2th row is not ${numberOfCells} `);
            const validator = new Validator();
            const validation = validator.validate(
                'constraint',
                'sofriaDocument',
                '0.4.0',
                output.sofria
            );
            t.ok(validation.isValid);
            t.equal(validation.errors, null);
        } catch (err) {
            console.log(err);
        }
    },
);

test(
    `test View (${testGroup})`,
    async function (t) {
        try {
            const config = {
                showWordAtts: false,
                showTitles: false,
                showHeadings: true,
                showIntroductions: true,
                showFootnotes: true,
                showXrefs: true,
                showParaStyles: true,
                showCharacterMarkup: true,
                showChapterLabels: true,
                showVersesLabels: true,
                selectedBcvNotes: [],
                bcvNotesCallback: (bcv) => {
                    setBcvNoteRef(bcv);
                },
                renderers,
            };
            t.plan(1);
            const pk = new Proskomma();
            const usfm = fse.readFileSync(path.resolve(path.join('test', 'test_data', 'usfms', 'titus.usfm'))).toString();
            pk.importDocument({ 'lang': 'eng', 'abbr': 'web' }, 'usfm', usfm);
            const docId = pk.gqlQuerySync('{documents { id } }').data.documents[0].id;
            const cl = new SofriaRenderFromProskomma({ proskomma: pk, actions: sofria2WebActions });
            const output = {};
            t.doesNotThrow(
                () => cl.renderDocument(
                    { docId, config, output }
                )
            );
            return;
        } catch (err) {
            console.log(err);
        }
    },
);
test(`Multiple para in verse Start End events in (${testGroup})`, (t) => {
    t.plan(2);
    try {
        const pk6 = new Proskomma();
        const usfm = fse.readFileSync(path.resolve(path.join('./', 'test', 'test_data', 'usfms', 'startEndVerse.usfm'))).toString();
        pk6.importDocument({ 'lang': 'eng', 'abbr': 'francl' }, 'usfm', usfm);
        const docId = pk6.gqlQuerySync('{documents { id } }').data.documents[0].id;
        const actions = {
            startVerses: [
                {
                    description: "startVerses",
                    test: () => true,
                    action: ({ config, context, workspace, output }) => {
                        workspace.inVersesMileStone = true;
                    }
                },
            ],
            endVerses: [
                {
                    description: "endVerses",
                    test: () => true,
                    action: ({ config, context, workspace, output }) => {
                        workspace.inVersesMileStone = false;

                    }
                },
            ],
            startWrapper: [
                {
                    description: "startWrapper",
                    test: ({ context }) => context.sequences[0].element.subType === "verses",
                    action: ({ config, context, workspace, output }) => {
                        workspace.inVersesWrapper = true;


                    }
                },
            ],
            endWrapper: [
                {
                    description: "endWrapper",
                    test: ({ context }) => context.sequences[0].element.subType === "verses",
                    action: ({ config, context, workspace, output }) => {
                        workspace.inVersesWrapper = false;

                    }
                },
            ],
            endParagraph: [
                {
                    description: "endParagraph",
                    test: () => true,
                    action: ({ config, context, workspace, output }) => {
                        output.versesTextWrapper += " ";
                        output.versesTextMileStone += " ";

                    }
                },
            ],
            text: [
                {
                    description: "identity",
                    test: () => true,
                    action: ({ context, workspace }) => {
                        const element = context.sequences[0].element;
                        if (workspace.inVersesWrapper) {
                            output.versesTextWrapper += element.text;
                        }
                        if (workspace.inVersesMileStone) {
                            output.versesTextMileStone += element.text;
                        }
                    }
                },
            ]



        }
        const cl = new SofriaRenderFromProskomma({ proskomma: pk6, actions: actions })
        const output = { versesTextMileStone: "", versesTextWrapper: "" }
        const workspace = { inVersesWrapper: false, inVersesMileStone: false }
        t.doesNotThrow(() => {
            cl.renderDocument1({ docId, context: {}, workspace, config: {}, output })
        });
        t.equal(output.versesTextMileStone, output.versesTextWrapper)
    } catch (err) {
        console.log(err);
    }
});

test(`Empty milestone events (${testGroup})`, (t) => {
    t.plan(21);
    try {
        const pk7 = new Proskomma();
        const usfm = fse.readFileSync(path.resolve(path.join('./', 'test', 'test_data', 'usfms', 'empty_milestone.usfm'))).toString();
        pk7.importDocument({ 'lang': 'ara', 'abbr': 'xxa' }, 'usfm', usfm);
        const result = pk7.gqlQuerySync('{documents { id mainSequence {blocks {dump } } } }').data.documents[0];
        const docId = result.id;
        t.ok(result.mainSequence.blocks[0].dump.includes("-milestone/zvideo-"));
        const actions = {
            startDocument: [
                {
                    description: "startDocument",
                    test: () => true,
                    action: ({output}) => {
                        output.events = [];
                        return true;
                    }
                }
            ],
            startMilestone: [
                {
                    description: "startMilestone",
                    test: () => true,
                    action: ({ context, output }) => {
                        output.events.push(["startMS", context.sequences[0].element.subType]);
                        return true;
                    }
                },
            ],
            endMilestone: [
                {
                    description: "endMilestone",
                    test: () => true,
                    action: ({ context, output }) => {
                        output.events.push(["endMS", context.sequences[0].element.subType]);
                        return true;
                    }
                },
            ],
            startParagraph: [
                {
                    description: "startParagraph",
                    test: () => true,
                    action: ({ context, output }) => {
                        output.events.push(["startPara", context.sequences[0].block.subType]);
                        return true;
                    }
                },
            ],
            endParagraph: [
                {
                    description: "endParagraph",
                    test: () => true,
                    action: ({ context, output }) => {
                        output.events.push(["endPara", context.sequences[0].block.subType]);
                        return true;
                    }
                },
            ],
            text: [
                {
                    description: "text",
                    test: () => true,
                    action: ({ context, output }) => {
                        output.events.push(["text", context.sequences[0].element.text]);
                        return true;
                    }
                },
            ]
        }
        const cl = new SofriaRenderFromProskomma({ proskomma: pk7, actions: actions })
        const output = { events: [] };
        t.doesNotThrow(() => {
            cl.renderDocument1({ docId, context: {}, config: {}, workspace: {}, output })
        });
        t.ok(output.events.length === 9);
        const expected = [
            [ 'startPara', 'usfm:p' ],
            [ 'startMS', 'usfm:zvideo' ],
            [ 'endPara', 'usfm:p' ],
            [ 'startPara', 'usfm:q' ],
            [ 'endMS', 'usfm:zvideo' ],
            [ 'startMS', 'usfm:zweblink' ],
            [ 'text', 'سایت اینترنتی' ],
            [ 'endMS', 'usfm:zweblink' ],
            [ 'endPara', 'usfm:q' ]
        ];
        for (const [n, expectedEvent] of expected.entries()) {
            t.equal(expectedEvent[0], output.events[n][0]);
            t.equal(expectedEvent[1], output.events[n][1]);
        }
    } catch (err) {
        console.log(err);
    }
});

test(
    `Weird uW milestone (${testGroup})`,
    async function (t) {
        try {
            t.plan(1);
            const pk2 = new Proskomma();
            const usfm = fse.readFileSync(path.resolve(path.join('test', 'test_data', 'usfms', '51-PHP.usfm'))).toString();
            pk2.importDocument({ 'lang': 'eng', 'abbr': "web" }, "usfm", usfm);
            const docId = pk2.gqlQuerySync('{documents { id } }').data.documents[0].id;
            const cl = new SofriaRenderFromProskomma({ proskomma: pk2, actions: sofria2WebActions });
            const output = {};
            t.doesNotThrow(() => cl.renderDocument({ docId, config: {renderers, selectedBcvNotes: []}, output }));
        } catch (err) {
            console.log(err);
        }
    },
);
test(
    `Weird ACT uW milestone (${testGroup})`,
    async function (t) {
        try {
            t.plan(2);
            const pk2 = new Proskomma();
            const usfm = fse.readFileSync(path.resolve(path.join('test', 'test_data', 'usfms', 'ULT_ACT.usfm'))).toString();
            pk2.importDocument({ 'lang': 'eng', 'abbr': "web" }, "usfm", usfm);
            const docId = pk2.gqlQuerySync('{documents { id } }').data.documents[0].id;
            const cl = new SofriaRenderFromProskomma({ proskomma: pk2, actions: sofria2WebActions });
            let output = {};
            t.doesNotThrow(() => cl.renderDocument({ docId, config: {renderers, selectedBcvNotes: []}, output }));
            output = {};
            t.doesNotThrow(() => cl.renderDocument({ docId, config: {renderers, selectedBcvNotes: [], chapters: ['5', '10', '50']}, output }));
        } catch (err) {
            console.log(err);
        }
    },
);
