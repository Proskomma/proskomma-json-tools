import PerfRenderFromJson from '../../PerfRenderFromJson';
import mergeActions from '../../mergeActions';
import transforms from '..';

const localJustTheBibleActions = {
    startMilestone: [
        {
            description: "Ignore startMilestone events",
            test: () => true,
            action: () => {
            }
        },
    ],
    endMilestone: [
        {
            description: "Ignore endMilestone events",
            test: () => true,
            action: () => {
            }
        },
    ],
    startWrapper: [
        {
            description: "Ignore startWrapper events",
            test: () => true,
            action: () => {
            }
        },
    ],
    endWrapper: [
        {
            description: "Ignore endWrapper events",
            test: () => true,
            action: () => {
            }
        },
    ],
    blockGraft: [
        {
            description: "Ignore blockGraft events, except for title (\\mt)",
            test: (environment) => environment.context.sequences[0].block.subType !== 'title',
            action: (environment) => {
            }
        },
    ],
    inlineGraft: [
        {
            description: "Ignore inlineGraft events",
            test: () => true,
            action: () => {
            }
        },
    ],
    mark: [
        {
            description: "Ignore mark events, except for chapter and verses",
            test: ({context}) => !['chapter', 'verses'].includes(context.sequences[0].element.subType),
            action: () => {
            }
        },
    ]
};

const justTheBibleCode = function ({perf}) {
    const cl = new PerfRenderFromJson(
        {
            srcJson: perf,
            actions: mergeActions(
                    [
                        localJustTheBibleActions,
                        transforms.perf2perf.identityActions
                    ]
                )
            }
    );
    const output = {};
    cl.renderDocument({docId: "", config: {}, output});
    return {perf: output.perf}; // identityActions currently put PERF directly in output
}

const justTheBible = {
    name: "justTheBible",
    type: "Transform",
    description: "PERF=>PERF: Strips most markup",
    documentation: "This transform removes milestones, wrappers and most marks. It has been used in several pipelines. It may also be stripping metaContent.",
    inputs: [
        {
            name: "perf",
            type: "json",
            source: ""
        },
    ],
    outputs: [
        {
            name: "perf",
            type: "json",
        }
    ],
    code: justTheBibleCode
}
export default justTheBible;
