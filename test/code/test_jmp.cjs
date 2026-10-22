const test = require('tape');
const { Proskomma } = require('proskomma-core');
const { renderActions } = require('../../dist/render/sofria2web');
const { renderers } = require('../../dist/render/sofria2web/sofria2html');
const SofriaRenderFromProskomma = require('../../dist/render/renderers/SofriaRenderFromProskomma');

const testGroup = 'jmp (issue #45)';

// From https://github.com/Proskomma/proskomma-json-tools/issues/45
const usfm = `\\id MAT
\\c 4
\\p
\\v 15 “The land of Zebulun and the land of Naphtali,
\\q2 toward the sea, beyond the Jordan,
\\q2 Galilee of the Gentiles, \\jmp RSV|link-href="prj:RSV52 GEN 1:1" link-title="Revised Standard Version"\\jmp*
\\q1
\\v 16 more text
`;

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
    bcvNotesCallback: () => {},
    renderers,
};

const renderHtml = usfmContent => {
    const pk = new Proskomma();
    pk.importDocument({ lang: 'eng', abbr: 'tst' }, 'usfm', usfmContent);
    const docId = pk.gqlQuerySync('{documents { id } }').data.documents[0].id;
    const cl = new SofriaRenderFromProskomma({ proskomma: pk, actions: renderActions.sofria2WebActions, debugLevel: 0 });
    const output = {};
    cl.renderDocument({ docId, config, output });
    return output.paras;
};

const verseHtml = verseContent => renderHtml(`\\id MAT\n\\c 1\n\\p\n\\v 1 Galilee, ${verseContent} end.\n`);

test(`Proskomma imports jmp as a span with attributes (${testGroup})`, t => {
    t.plan(3);
    const pk = new Proskomma();
    pk.importDocument({ lang: 'eng', abbr: 'tst' }, 'usfm', usfm);
    const items = pk.gqlQuerySync('{documents {mainSequence {blocks {items {type subType payload}}}}}')
        .data.documents[0].mainSequence.blocks.map(b => b.items).flat();
    const payloads = items.map(i => i.payload);
    t.ok(payloads.includes('spanWithAtts/jmp'), 'jmp scope is present');
    t.ok(payloads.includes('attribute/spanWithAtts/jmp/link-href/0/prj:RSV52 GEN 1:1'), 'link-href attribute is present');
    t.notOk(items.some(i => i.type === 'token' && i.payload.includes('link-href')), 'attributes are not leaked as text tokens');
});

test(`sofria2html marks up jmp and does not leak attributes as text (${testGroup})`, t => {
    t.plan(2);
    const html = renderHtml(usfm);
    t.ok(html.includes('<span class="wrappers_usfm_jmp">RSV</span>'), 'jmp is rendered as a span');
    t.notOk(html.includes('link-href'), 'raw attribute text is not rendered');
});

test(`sofria2html closes jmp without attributes and empty jmp (${testGroup})`, t => {
    t.plan(2);
    t.ok(verseHtml('\\jmp RSV\\jmp*').includes('Galilee, <span class="wrappers_usfm_jmp">RSV</span> end.'), 'jmp without attributes');
    t.ok(verseHtml('\\jmp |link-id="article-x"\\jmp*').includes('Galilee, <span class="wrappers_usfm_jmp"></span> end.'), 'empty jmp with link-id');
});
