const test = require('tape');
const { Proskomma } = require('proskomma-core');
const SofriaRenderFromProskomma = require('../../dist/render/renderers/SofriaRenderFromProskomma');

const testGroup = 'Table followed by heading (issue #69)';

// From https://github.com/Proskomma/proskomma-json-tools/issues/69
// Proskomma puts \tr rows that directly follow a heading into the heading sequence,
// so tables may start (and must end) in non-main sequences.
const tablesUsfm = separator => `\\id GLO
\\ms Table of Weights and Measures
\\s1 \\bd Weights \\bd*
\\tr \\th1 Biblical Unit \\th2 Approximate American Equivalent \\th3 Approximate Metric Equivalent
\\tr \\tc1 talent (60 minas) \\tc2 75 pounds \\tc3 34 kilograms
\\tr \\tc1 mina (50 shekels) \\tc2 1 1/4 pounds \\tc3 560 grams
\\tr \\tc1 shekel (2 bekas) \\tc2 2/5 ounce \\tc3 11.5 grams
\\tr \\tc1 pim (2/3 shekel) \\tc2 1/4 ounce \\tc3 7.8 grams
\\tr \\tc1 beka (10 gerahs) \\tc2 1/5 ounce \\tc3 5.7 grams
\\tr \\tc1 gerah \\tc2 1/50 ounce \\tc3 0.6 gram
\\tr \\tc1 daric \\tc2 1/3 ounce \\tc3 8.4 grams
${separator}\\s1 \\bd Length \\bd*
\\tr \\th1 Biblical Unit \\th2 Approximate American Equivalent \\th3 Approximate Metric Equivalent
\\tr \\tc1 cubit \\tc2 18 inches \\tc3 45 centimeters
\\tr \\tc1 span \\tc2 9 inches \\tc3 23 centimeters
\\tr \\tc1 handbreadth \\tc2 3 inches \\tc3 7.5 centimeters
\\tr \\tc1 stadion (pl. stadia) \\tc2 600 feet \\tc3 183 meters
`;

const recordingAction = name => ({
    description: `Record ${name}`,
    test: () => true,
    action: ({ workspace, context }) => {
        workspace.events.push({ event: name, sequenceId: context.sequences[0].id });
    },
});

const renderEvents = usfm => {
    const pk = new Proskomma();
    pk.importDocument({ lang: 'eng', abbr: 'tst' }, 'usfm', usfm);
    const docId = pk.gqlQuerySync('{documents { id } }').data.documents[0].id;
    const actions = {
        startDocument: [{
            description: 'Set up event log',
            test: () => true,
            action: ({ workspace }) => {
                workspace.events = [];
            },
        }],
        endDocument: [{
            description: 'Return event log',
            test: () => true,
            action: ({ workspace, output }) => {
                output.events = workspace.events;
            },
        }],
        blockGraft: [{
            description: 'Render block grafts',
            test: ({ context }) => !!context.sequences[0].block.sequence,
            action: environment => {
                environment.context.renderer.renderSequence(environment);
            },
        }],
        startTable: [recordingAction('startTable')],
        endTable: [recordingAction('endTable')],
        startRow: [recordingAction('startRow')],
    };
    const cl = new SofriaRenderFromProskomma({ proskomma: pk, actions });
    const output = {};
    cl.renderDocument({ docId, config: {}, output });
    return output.events;
};

// Returns a list of tables, each being the number of rows it contains,
// or throws if table events are unbalanced
const tablesFromEvents = events => {
    const tables = [];
    let open = null;
    for (const { event, sequenceId } of events) {
        if (event === 'startTable') {
            if (open) {
                throw new Error('startTable while a table is already open');
            }
            open = { sequenceId, rows: 0 };
        } else if (event === 'startRow') {
            if (!open) {
                throw new Error('startRow outside a table');
            }
            open.rows++;
        } else if (event === 'endTable') {
            if (!open) {
                throw new Error('endTable without startTable');
            }
            if (open.sequenceId !== sequenceId) {
                throw new Error('endTable in a different sequence from startTable');
            }
            tables.push(open.rows);
            open = null;
        }
    }
    if (open) {
        throw new Error('table never ended');
    }
    return tables;
};

for (const [label, separator] of [
    ['only a heading', ''],
    ['an empty \\p and a heading', '\\p\n'],
    ['a \\b and a heading', '\\b\n'],
]) {
    test(`Table followed by ${label} renders as two tables (${testGroup})`, t => {
        t.plan(1);
        const events = renderEvents(tablesUsfm(separator));
        let tables;
        try {
            tables = tablesFromEvents(events);
        } catch (err) {
            tables = err.message;
        }
        t.same(tables, [8, 5], 'two tables, with 8 and 5 rows');
    });
}

test(`Main-sequence table followed by a heading is ended before the heading (${testGroup})`, t => {
    t.plan(1);
    const usfm = `\\id GLO
\\c 1
\\p
\\v 1 Some text.
\\tr \\tc1 cubit \\tc2 18 inches
\\tr \\tc1 span \\tc2 9 inches
\\s1 Length
\\tr \\tc1 handbreadth \\tc2 3 inches
`;
    let tables;
    try {
        tables = tablesFromEvents(renderEvents(usfm));
    } catch (err) {
        tables = err.message;
    }
    t.same(tables, [2, 1], 'two tables, with 2 and 1 rows');
});
