import test from 'tape';
const fse = require('fs-extra');
import path from 'path';
const { Proskomma } = require('proskomma');
const { renderActions, renderStyles } = require('../../dist/render/sofria2web');
const { renderers } = require('../../dist/render/sofria2web/sofria2html');
const SofriaRenderFromProskomma = require('../../dist/SofriaRenderFromProskomma');
const cheerio = require('cheerio')

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

const testGroup = 'HTML';

test(`Basics with CSS classes (${testGroup})`, (t) => {
    t.plan(4);
    try {
        const pk6 = new Proskomma();
        const usfm = fse.readFileSync(path.resolve(path.join('./', 'test', 'test_data', 'usfms', 'titus.usfm'))).toString();
        pk6.importDocument({ 'lang': 'eng', 'abbr': 'lsg' }, 'usfm', usfm);
        const docId = pk6.gqlQuerySync('{documents { id } }').data.documents[0].id;
        const cl = new SofriaRenderFromProskomma({ proskomma: pk6, actions: renderActions.sofria2WebActions, debugLevel: 0 })
        const output = {}
        t.doesNotThrow(() => {
            cl.renderDocument({ docId, config, output })
        });
        t.ok("paras" in output);
        t.ok(output.paras.includes("de Dieu et la connaissance"));
        t.ok(output.paras.includes("class=\"paras_usfm_p\""));
    } catch (err) {
        console.log(err);
    }
});

test(`Table is render in (${testGroup})`, (t) => {
  t.plan(5);
  try {
    const pk6 = new Proskomma();
    const usfm = fse.readFileSync(path.resolve(path.join('./', 'test', 'test_data', 'usfms', 'table.usfm'))).toString();
    pk6.importDocument({ 'lang': 'eng', 'abbr': 'francl' }, 'usfm', usfm);
    const docId = pk6.gqlQuerySync('{documents { id } }').data.documents[0].id;
    const cl = new SofriaRenderFromProskomma({ proskomma: pk6, actions: renderActions.sofria2WebActions, debugLevel: 0 })
    const output = {}
    t.doesNotThrow(() => {
      cl.renderDocument({ docId, config, output })
    });
    t.ok("paras" in output);
    t.equal(output.paras.includes('<table'), true)
    t.equal(output.paras.includes('</table>'), true)
    t.equal(output.paras.includes('<td colspan=2'), true)
  } catch (err) {
    console.log(err);
  }
});

test(`Classes exist in  (${testGroup})`, (t) => {
  t.plan(1);
  try {
    const htmlPath = path.resolve("./test/test_data/html/test.html");
    const htmlContent = fse.readFileSync(htmlPath, "utf8");

    // Charger le contenu HTML avec cheerio
    const $ = cheerio.load(htmlContent);

    // Vérifier si la classe existe dans le code HTML
    const className = "marks_chapter_label";
    const elementsWithClass = $(`.${className}`);
    const classExists = elementsWithClass.length > 0;
    t.ok(classExists, `La classe "${className}" existe dans le code HTML.`);
  } catch (err) {
    console.log(err);
    t.fail("No class exists in Html");
  }
});

test(`wrapper ends in (${testGroup})`, (t) => {
  t.plan(2);
  try {
    const pk6 = new Proskomma();
    const usfm = fse.readFileSync(path.resolve(path.join('./', 'test', 'test_data', 'usfms', 'abba.usfm'))).toString();
    pk6.importDocument({ 'lang': 'eng', 'abbr': 'francl' }, 'usfm', usfm);
    const docId = pk6.gqlQuerySync('{documents { id } }').data.documents[0].id;
    const cl = new SofriaRenderFromProskomma({ proskomma: pk6, actions: renderActions.sofria2WebActions })
    const output = {}
    t.doesNotThrow(() => {
      cl.renderDocument({ docId, config, output })
    });
    t.ok("paras" in output);
  } catch (err) {
    console.log(err);
  }
});

test(`No extra commas around word markup (${testGroup})`, (t) => {
    t.plan(3);
    try {
        const pk7 = new Proskomma();
        const usfm = fse.readFileSync(path.resolve(path.join('./', 'test', 'test_data', 'usfms', 'titus_aligned.usfm'))).toString();
        pk7.importDocument({ 'lang': 'eng', 'abbr': 'francl' }, 'usfm', usfm);
        const docId = pk7.gqlQuerySync('{documents { id } }').data.documents[0].id;
        const cl = new SofriaRenderFromProskomma({ proskomma: pk7, actions: renderActions.sofria2WebActions })
        const output = {}
        t.doesNotThrow(() => {
            cl.renderDocument({ docId, config, output })
        });
        t.ok("paras" in output);
        t.ok(output.paras.includes("de Dieu et la connaissance"));
    } catch (err) {
        console.log(err);
    }
});

test(`Footnote (${testGroup})`, (t) => {
    t.plan(3);
    try {
        const pk8 = new Proskomma();
        const usfm = fse.readFileSync(path.resolve(path.join('./', 'test', 'test_data', 'usfms', 'eng_francl_mrk.usfm'))).toString();
        pk8.importDocument({ 'lang': 'eng', 'abbr': 'francl' }, 'usfm', usfm);
        const docId = pk8.gqlQuerySync('{documents { id } }').data.documents[0].id;
        const cl = new SofriaRenderFromProskomma({ proskomma: pk8, actions: renderActions.sofria2WebActions, debugLevel: 0 })
        const output = {}
        t.doesNotThrow(() => {
            cl.renderDocument({ docId, config, output })
        });
        t.ok("paras" in output);
        t.ok(output.paras.includes("span class=\"paras_usfm_f\""));
    } catch (err) {
        console.log(err);
    }
});

test(`Text braces (${testGroup})`, (t) => {
    t.plan(3);
    try {
        const pk8 = new Proskomma();
        const usfm = fse.readFileSync(path.resolve(path.join('./', 'test', 'test_data', 'usfms', 'text_braces.usfm'))).toString();
        pk8.importDocument({ 'lang': 'eng', 'abbr': 'francl' }, 'usfm', usfm);
        const docId = pk8.gqlQuerySync('{documents { id } }').data.documents[0].id;
        const cl = new SofriaRenderFromProskomma({ proskomma: pk8, actions: renderActions.sofria2WebActions, debugLevel: 0 })
        const output = {}
        t.doesNotThrow(() => {
            cl.renderDocument({ docId, config, output })
        });
        t.ok("paras" in output);
        t.ok(output.paras.includes("<i>beloved</i>"));
    } catch (err) {
        console.log(err);
    }
});


test("Generate CSS (${testGroup})", t => {
    t.plan(4);
    let styleCss;
    t.doesNotThrow(() => styleCss = renderStyles.styleAsCSS(renderStyles.styles));
    t.ok(styleCss.includes("paras CSS format"));
    t.ok(styleCss.includes("marks CSS format"));
    t.ok(styleCss.includes("wrappers CSS format"));
    }
)
