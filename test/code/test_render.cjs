import test from 'tape';
import ProskommaRender from '../../src/ProskommaRender';

const testGroup = 'Render';

test(
    `Cannot instantiate abstract class (${testGroup})`,
    async function (t) {
        try {
            t.plan(1);
            t.throws(() => new ProskommaRender({}), /cannot be instantiated/);
        } catch (err) {
            console.log(err);
        }
    },
);

test(
    `Instantiate subclass (${testGroup})`,
    async function (t) {
        try {
            t.plan(1);

            class MySubclass extends ProskommaRender {}
            t.doesNotThrow(() => new MySubclass({}));
        } catch (err) {
            console.log(err);
        }
    },
);

test(
    `Add and describe actions throws on bad event (${testGroup})`,
    async function (t) {
        try {
            t.plan(2);

            class MySubclass extends ProskommaRender {}
            const cl = new MySubclass({});
            t.throws(
                () => cl.addRenderAction(
                    'banana',
                    {description: 'Test Action'}
                ),
                /Unknown event/
            );
            t.throws(
                () => cl.describeRenderActions(
                    'banana',
                    /Unknown event/
                )
            );
        } catch (err) {
            console.log(err);
        }
    },
);

test(
    `Add and describe action (${testGroup})`,
    async function (t) {
        try {
            t.plan(8);

            class MySubclass extends ProskommaRender {}
            const cl = new MySubclass({});
            t.doesNotThrow(() => cl.addRenderAction('startDocument', {description: 'Test Action', test: () => false}));
            let desc = cl.describeRenderActions('startDocument');
            t.ok(desc.includes('DO Test Action'));
            t.ok(desc.includes('IF () => false'));
            t.doesNotThrow(() => cl.addRenderAction('startDocument', {description: 'Further Verifications'}));
            desc = cl.describeRenderActions('startDocument');
            t.ok(desc.includes('DO Test Action'));
            t.ok(desc.includes('DO Further Verifications'));
            t.ok(desc.includes('IF () => true'));
            t.ok(desc.includes('IF () => false'));
        } catch (err) {
            console.log(err);
        }
    },
);
