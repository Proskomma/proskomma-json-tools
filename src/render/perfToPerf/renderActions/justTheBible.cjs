const justTheBibleActions = {
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

module.exports = { justTheBibleActions };
