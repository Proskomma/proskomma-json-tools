import test from 'tape';
const fse = require('fs-extra');
import path from 'path';
const fs = require('fs');
const { Proskomma } = require('proskomma');
const { sofria2WebActions } = require('../../dist/render/sofria2web/renderActions/sofria2web');
const { renderers } = require('../../dist/render/sofria2web/sofria2html');
const SofriaRenderFromProskomma = require('../../dist/SofriaRenderFromProskomma');




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



function saveStringAsHTMLFile(stringContent, fileName) {
  fs.writeFile(fileName, stringContent, (err) => {
    if (err) {
      console.error(err);
    } else {
      console.log('File saved successfully.');
    }
  });
}

const testGroup = 'HTML';


test(`Table is render in  (${testGroup})`, (t) => {
  t.plan(1);
  try {
    const pk6 = new Proskomma();
    const usfm = fse.readFileSync(path.resolve(path.join('./', 'test', 'test_data', 'usfms', 'table.usfm'))).toString();
    pk6.importDocument({ 'lang': 'eng', 'abbr': 'francl' }, 'usfm', usfm);
    const docId = pk6.gqlQuerySync('{documents { id } }').data.documents[0].id;
    const cl = new SofriaRenderFromProskomma({ proskomma: pk6, actions: sofria2WebActions })
    const output = {}
    t.doesNotThrow(() => {
      cl.renderDocument({ docId, config, output })
    });
    saveStringAsHTMLFile(output.paras, 'test.html')
  } catch (err) {
    console.log(err);
  }
});
