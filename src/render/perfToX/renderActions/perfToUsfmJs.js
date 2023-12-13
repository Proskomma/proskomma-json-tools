const perfToUsfmJsActions = {
    startDocument: [
        {
            description: "Setup",
            test: () => true,
            action: (environment) => {
                environment.output.usfmJs = {};
            }
        }
    ]
};

module.exports = { perfToUsfmJsActions };
