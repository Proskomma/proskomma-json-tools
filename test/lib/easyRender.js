
const fse = require('fs-extra');
import { Proskomma } from 'proskomma';
import path from "path";
import SofriaRenderFromProskomma from '../../dist/SofriaRenderFromProskomma';
import SofriaRenderFromJson from '../../dist/SofriaRenderFromJson';
import { identityActions } from '../../dist/render/sofriaToSofria/renderActions/identity';
import { error } from 'console';


function easyRender(renderer, action, pathToFetchData, typeDoc) {
    let doc = {}
    let docId = ""
    let pk = {}

    if (typeDoc === 'proskomma') {
        pk = new Proskomma();
        doc = fse.readFileSync(path.resolve(pathToFetchData)).toString();
        pk.importDocument({ 'lang': 'eng', 'abbr': 'web' }, 'usfm', doc);
        docId = pk.gqlQuerySync('{documents { id } }').data.documents[0].id;
    }
    else {
        doc = fse.readJsonSync(
            pathToFetchData
        );
        docId = ""
    }
    const cl = new renderer({ srcJson: doc, proskomma: pk, actions: action });
    const output = {};
    try {
        cl.renderDocument(
            { docId, config: {}, output }

        )

    } catch { }
    return output
}

function easySofriaRenderer(action, pathToFetchData, config = {}) {


    //Getting Json from usfm via identityAction
    const pk = new Proskomma();
    let output = {}

    const doc = fse.readFileSync(path.resolve(pathToFetchData)).toString();
    pk.importDocument({ 'lang': 'eng', 'abbr': 'web' }, 'usfm', doc);

    let docId = pk.gqlQuerySync('{documents { id } }').data.documents[0].id;
    let cl = new SofriaRenderFromProskomma({ proskomma: pk, actions: identityActions })
    try {
        cl.renderDocument({ docId, config, output })
    } catch (err) {
        throw (err);
    }
    //extract json
    const json = JSON.parse(JSON.stringify(output.sofria));


    //Render sofriaFromProskomma
    output = {}

    cl = new SofriaRenderFromProskomma({ proskomma: pk, actions: action })
    try {
        cl.renderDocument({ docId, config, output })
    } catch (err) {
        throw (err);
    }
    const outputProskomma = JSON.parse(JSON.stringify(output));

    //Render sofriaRenderFromJson with Json
    output = {}
    cl = new SofriaRenderFromJson({ srcJson: json, actions: action })
    try {
        cl.renderDocument({ docId: "", config, output })
    } catch (err) {
        throw (err);
    }
    const outputJson = JSON.parse(JSON.stringify(output));

    return { outputJson, outputProskomma }
}

export { easyRender, easySofriaRenderer }