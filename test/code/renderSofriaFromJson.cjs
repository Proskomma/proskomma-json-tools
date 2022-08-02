import test from 'tape';

const fse = require('fs-extra');
import path from 'path';
import SofriaRenderFromJson from '../../src/SofriaRenderFromJson';
import PerfRenderFromJson from "../../src/PerfRenderFromJson";
import identityActions from "../../src/transforms/identityActions";
import equal from "deep-equal";

const testGroup = 'Render SOFRIA from JSON';

test(
    `Instantiate class (${testGroup})`,
    async function (t) {
        try {
            t.plan(1);
            t.doesNotThrow(() => new SofriaRenderFromJson({srcJson: {}}));
        } catch (err) {
            console.log(err);
        }
    },
);

test(
    `Render SOFRIA with empty actions (${testGroup})`,
    async function (t) {
        try {
            t.plan(1);
            const sofria = fse.readJsonSync(path.resolve(path.join(__dirname, '..', 'test_data', 'fra_lsg_mrk_sofria_doc.json')));
            const cl = new SofriaRenderFromJson({srcJson: sofria});
            t.doesNotThrow(() => cl.renderDocument({docId: "", config: {}, output: {}}));
        } catch (err) {
            console.log(err);
        }
    },
);

test(
    `Follow SOFRIA grafts (${testGroup})`,
    async function (t) {
        try {
            t.plan(1);
            const sofria = fse.readJsonSync(path.resolve(path.join(__dirname, '..', 'test_data', 'fra_lsg_mrk_sofria_doc.json')));
            const cl = new SofriaRenderFromJson({srcJson: sofria});
            cl.debugLevel = 0;
            cl.addRenderAction(
                'blockGraft',
                {
                    description: "Follow all block grafts",
                    action: (environment) => {
                        const context = environment.context;
                        const blockContext = context.sequences[0].block;
                        if (blockContext.target) {
                            context.renderer.renderSequence(environment, blockContext.sequence);
                        }
                    }
                }
            );
            cl.addRenderAction(
                'inlineGraft',
                {
                    description: "Follow all inline grafts",
                    action: (environment) => {
                        const context = environment.context;
                        const elementContext = context.sequences[0].element;
                        if (elementContext.target) {
                            context.renderer.renderSequence(environment, elementContext.sequence);
                        }
                    }
                }
            );
            t.doesNotThrow(() => cl.renderDocument({docId: "", config: {}, output: {}}));
        } catch (err) {
            console.log(err);
        }
    },
);

test(
    `Follow metaContent (${testGroup})`,
    async function (t) {
        try {
            t.plan(1);
            const sofria = fse.readJsonSync(path.resolve(path.join(__dirname, '..', 'test_data', 'fra_lsg_mrk_sofria_doc.json')));
            const cl = new SofriaRenderFromJson({srcJson: sofria});
            cl.debugLevel = 0;
            cl.addRenderAction(
                'metaContent',
                {
                    description: "Follow metaContent",
                    action: (environment) => {
                        const context = environment.context;
                        const elementContext = context.sequences[0].element;
                        context.renderer.renderContent(elementContext.metaContent, environment);
                    }
                }
            );
            t.doesNotThrow(() => cl.renderDocument({docId: "", config: {}, output: {}}));
        } catch (err) {
            console.log(err);
        }
    },
);
