const stripUwAlignmentActions = {
    startMilestone: [
        {
            description: "Ignore zaln startMilestone events",
            test: ({context}) => context.sequences[0].element.subType === "usfm:zaln",
            action: () => {
            }
        },
    ],
    endMilestone: [
        {
            description: "Ignore zaln endMilestone events",
            test: ({context}) => context.sequences[0].element.subType === "usfm:zaln",
            action: () => {
            }
        },
    ],
    startWrapper: [
        {
            description: "Ignore w startWrapper events",
            test: ({context}) => context.sequences[0].element.subType === "usfm:w",
            action: () => {
            }
        },
    ],
    endWrapper: [
        {
            description: "Ignore w endWrapper events",
            test: ({context}) => context.sequences[0].element.subType === "usfm:w",
            action: () => {
            }
        },
    ],
};

module.exports = { stripUwAlignmentActions };
