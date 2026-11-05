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
        workspace.events.push({
            event: name,
            sequenceId: context.sequences[0].id,
            sequenceType: context.sequences[0].type,
        });
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
        inlineGraft: [{
            description: 'Render inline grafts',
            test: ({ context }) => !!context.sequences[0].element.sequence,
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

// Returns a list of tables, in the order they end, as '<sequence type>:<number of rows>'.
// Tables may be nested (eg a table in a note in a table cell), so open tables
// are tracked per sequence. Throws if table events are unbalanced.
const tablesFromEvents = events => {
    const tables = [];
    const open = {};
    for (const { event, sequenceId, sequenceType } of events) {
        if (event === 'startTable') {
            if (open[sequenceId]) {
                throw new Error(`startTable while a table is already open in ${sequenceType}`);
            }
            open[sequenceId] = { sequenceType, rows: 0 };
        } else if (event === 'startRow') {
            if (!open[sequenceId]) {
                throw new Error(`startRow outside a table in ${sequenceType}`);
            }
            open[sequenceId].rows++;
        } else if (event === 'endTable') {
            if (!open[sequenceId]) {
                throw new Error(`endTable without startTable in ${sequenceType}`);
            }
            tables.push(`${sequenceType}:${open[sequenceId].rows}`);
            delete open[sequenceId];
        }
    }
    if (Object.keys(open).length > 0) {
        throw new Error(`table never ended in ${Object.values(open).map(t => t.sequenceType).join(', ')}`);
    }
    return tables;
};

const tablesOrError = usfm => {
    try {
        return tablesFromEvents(renderEvents(usfm));
    } catch (err) {
        return err.message;
    }
};

const rowCounts = tables => Array.isArray(tables) ? tables.map(t => Number(t.split(':')[1])) : tables;

for (const [label, separator] of [
    ['only a heading', ''],
    ['an empty \\p and a heading', '\\p\n'],
    ['a \\b and a heading', '\\b\n'],
]) {
    test(`Table followed by ${label} renders as two tables (${testGroup})`, t => {
        t.plan(1);
        t.same(rowCounts(tablesOrError(tablesUsfm(separator))), [8, 5], 'two tables, with 8 and 5 rows');
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
    // Which sequence the second table is in depends on the proskomma-core version
    t.same(rowCounts(tablesOrError(usfm)), [2, 1], 'two tables, with 2 and 1 rows');
});

test(`Table in a footnote is started and ended in the footnote (${testGroup})`, t => {
    t.plan(1);
    const usfm = `\\id GEN
\\c 1
\\p
\\v 1 Some text.\\f + \\fr 1:1 \\ft A table:
\\tr \\tc1 cubit \\tc2 18 inches
\\tr \\tc1 span \\tc2 9 inches\\f* More text.
\\p
\\v 2 After.
`;
    t.same(tablesOrError(usfm), ['footnote:2'], 'one table in the footnote, with 2 rows');
});

test(`Table in a footnote in a table cell does not end the enclosing table (${testGroup})`, t => {
    t.plan(1);
    const usfm = `\\id GEN
\\c 1
\\p
\\v 1 Some text.
\\tr \\tc1 cubit\\f + \\ft A table:
\\tr \\tc1 a \\tc2 b
\\tr \\tc1 c \\tc2 d\\f* \\tc2 18 inches
\\tr \\tc1 span \\tc2 9 inches
\\p
\\v 2 After.
`;
    t.same(
        tablesOrError(usfm),
        ['footnote:2', 'main:2'],
        'a 2-row table in the footnote, inside a 2-row table in main',
    );
});
