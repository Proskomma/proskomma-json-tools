import test from "tape";
const fse = require("fs-extra");
import path from "path";
import SofriaRenderFromJson from "../../dist/render/renderers/SofriaRenderFromJson";
import { identityActions } from "../../dist/render/sofriaToSofria/renderActions/identity";
import { Validator } from "../../dist";

const testGroup = "Render SOFRIA from JSON";

test(`Instantiate class (${testGroup})`, async function (t) {
    try {
        t.plan(1);
        t.doesNotThrow(() => new SofriaRenderFromJson({ srcJson: {} }));
    } catch (err) {
        console.log(err);
    }
});

test(`Render SOFRIA with empty actions (${testGroup})`, async function (t) {
    try {
        t.plan(1);
        const sofria = fse.readJsonSync(
            path.resolve(
                path.join(
                    __dirname,
                    "..",
                    "test_data",
                    "perfs",
                    "fra_lsg_mrk_sofria_doc.json"
                )
            )
        );
        const cl = new SofriaRenderFromJson({ srcJson: sofria });
        t.doesNotThrow(() =>
            cl.renderDocument({ docId: "", config: {}, output: {} })
        );
    } catch (err) {
        console.log(err);
    }
});

test(`Follow SOFRIA grafts (${testGroup})`, async function (t) {
    try {
        t.plan(1);
        const sofria = fse.readJsonSync(
            path.resolve(
                path.join(
                    __dirname,
                    "..",
                    "test_data",
                    "perfs",
                    "fra_lsg_mrk_sofria_doc.json"
                )
            )
        );
        const cl = new SofriaRenderFromJson({ srcJson: sofria });
        cl.debugLevel = 0;
        cl.addRenderAction("blockGraft", {
            description: "Follow all block grafts",
            action: (environment) => {
                const context = environment.context;
                const blockContext = context.sequences[0].block;
                if (blockContext.target) {
                    context.renderer.renderSequence(environment, blockContext.sequence);
                }
            },
        });
        cl.addRenderAction("inlineGraft", {
            description: "Follow all inline grafts",
            action: (environment) => {
                const context = environment.context;
                const elementContext = context.sequences[0].element;
                if (elementContext.target) {
                    context.renderer.renderSequence(environment, elementContext.sequence);
                }
            },
        });
        t.doesNotThrow(() =>
            cl.renderDocument({ docId: "", config: {}, output: {} })
        );
    } catch (err) {
        console.log(err);
    }
});

test(`Follow metaContent (${testGroup})`, async function (t) {
    try {
        t.plan(1);
        const sofria = fse.readJsonSync(
            path.resolve(
                path.join(
                    __dirname,
                    "..",
                    "test_data",
                    "perfs",
                    "fra_lsg_mrk_sofria_doc.json"
                )
            )
        );
        const cl = new SofriaRenderFromJson({ srcJson: sofria });
        cl.debugLevel = 0;
        cl.addRenderAction("metaContent", {
            description: "Follow metaContent",
            action: (environment) => {
                const context = environment.context;
                const elementContext = context.sequences[0].element;
                context.renderer.renderContent(elementContext.metaContent, environment);
            },
        });
        t.doesNotThrow(() =>
            cl.renderDocument({ docId: "", config: {}, output: {} })
        );
    } catch (err) {
        console.log(err);
    }
});

test(`Render SOFRIA with identity actions (${testGroup})`, async function (t) {
    try {
        t.plan(2);
        const sofria = fse.readJsonSync(
            path.resolve(
                path.join(
                    __dirname,
                    "..",
                    "test_data",
                    "perfs",
                    "fra_lsg_mrk_sofria_doc.json"
                )
            )
        );
        const cl = new SofriaRenderFromJson({
            srcJson: sofria,
            actions: identityActions,
        });
        const output = {};
        t.doesNotThrow(() => cl.renderDocument({ docId: "", config: {}, output }));
        // console.log(JSON.stringify(output, null, 2));
        const validator = new Validator();
        let validation = validator.validate(
            "constraint",
            "sofriaDocument",
            "0.2.1",
            output.sofria
        );
        // console.log(validation)
        t.ok(validation.isValid);
    } catch (err) {
        console.log(err);
    }
});
test(`Render SOFRIA with identity actions with a Json containing Row/Cells(${testGroup})`, async function (t) {
    try {
        t.plan(3);
        const sofria = fse.readJsonSync(
            path.resolve(
                path.join(__dirname, "..", "test_data", "perfs", "tableJson.json")
            )
        );
        const cl = new SofriaRenderFromJson({
            srcJson: sofria,
            actions: identityActions,
            debugLevel: 0
        });
        const output = {};
        t.doesNotThrow(() => cl.renderDocument({ docId: "", config: {}, output }));
        const numberOfRows = 4;
        const numberOfCells = 2;
        t.equal(
            output.paras.filter((b) => b.type === "row").length,
            numberOfRows,
            `The number of row is ${numberOfRows}`
        );
        t.equal(
            output.paras
                .filter((b) => b.type === "row")[1]
                .content[0].content.filter((c) => c.subtype === "cell").length,
            numberOfCells,
            `The number of cells render in the 2th row is ${numberOfCells} `
        );
        return;
    } catch (err) {
        console.log(err);
    }
});
