import test from 'tape';

import { sofria2WebActions } from '../../dist/render/sofria2web/renderActions/sofria2web';
import { renderers } from '../../dist/render/sofria2web/sofria2html';

import { easySofriaRenderer } from '../lib/easyRender';
import findDif from '../lib/findDif';
import { eventActions } from '../lib/eventAction';
const testGroup = 'Test sofriaRenderer';



test(
    `test event with (${testGroup})`,
    async function (t) {
        try {

            t.plan(1);
            let pathDocument = 'test/test_data/usfms/titus.usfm'
            let outputs = easySofriaRenderer(eventActions, pathDocument)
            t.doesNotThrow(() => {
                findDif(outputs.outputJson.events, outputs.outputProskomma.events)
            })

        } catch (err) {
            console.log(err);
        }
    },
);

test(
    `test sofria2WebActions with sofria2html in (${testGroup})`,
    async function (t) {
        try {
            t.plan(3);
            let pathDocument = 'test/test_data/usfms/paragraphStyle.usfm'

            const config = {
                showWordAtts: false,
                showTitles: true,
                showHeadings: true,
                showIntroductions: true,
                showFootnotes: true,
                showXrefs: true,
                showParaStyles: false,
                showCharacterMarkup: true,
                showChapterLabels: true,
                showVersesLabels: true,
                selectedBcvNotes: [],
                bcvNotesCallback: (bcv) => {
                    setBcvNoteRef(bcv);
                },
                renderers,
            };
            let outputs = {}
            t.doesNotThrow(() => {
                outputs = easySofriaRenderer(eventActions, pathDocument)
            })
            t.doesNotThrow(() => {
                findDif(outputs.outputJson.events, outputs.outputProskomma.events)
            })
            outputs = easySofriaRenderer(sofria2WebActions, pathDocument, config)
            t.equal(JSON.stringify(outputs.outputProskomma.paras), JSON.stringify(outputs.outputJson.paras), 'output.paras of sofria renderers are the same with sofria2web action sofria2html renderer')
        } catch (err) {
            //console.log(err);
        }
    },
);
