import test from 'tape';
import ProskommaJsonRender from '../../src/ProskommaJsonRender';

const testGroup = 'Render';

test(
    `Cannot instantiate abstract class (${testGroup})`,
    async function (t) {
        try {
            t.plan(1);
            t.throws(() => new ProskommaJsonRender(), /cannot be instantiated/);
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
            class MySubclass extends ProskommaJsonRender {};
            t.doesNotThrow(() => new MySubclass());
        } catch (err) {
            console.log(err);
        }
    },
);
