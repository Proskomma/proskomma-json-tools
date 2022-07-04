const ProskommaRenderAction = require('../src/ProskommaRenderAction');

class ProskommaRender {

    constructor({debugLevel, actions}) {
        if(this.constructor === ProskommaRender){
            throw new Error("Abstract class ProskommaRender cannot be instantiated - make as subclass!");
        }
        actions = actions || {};
        debugLevel = debugLevel || 0;
        this.jsonRenderDebugLevel = debugLevel;
        this.jsonRenderActions = {};
        for (const event of [
            "startDocument",
            "endDocument",
            "startSequence",
            "endSequence",
            "blockGraft",
            "startParagraph",
            "endParagraph",
            "metaContent",
            "mark",
            "inlineGraft",
            "startWrapper",
            "endWrapper",
            "startMilestone",
            "endMilestone",
            "text"
        ]) {
            if (actions[event]) {
                this.jsonRenderActions[event] = actions[event].map(a => new ProskommaRenderAction(a));
            } else {
                this.jsonRenderActions[event] = [];
            }
        }
    }

    addRenderActionObject(event, actionOb) {
        if (!this.jsonRenderActions[event]) {
            throw new Error(`Unknown event '${event}`);
        }
        this.jsonRenderActions[event].push(actionOb);
    }

    addRenderAction(event, actionSpec) {
        this.addRenderActionObject(event, new ProskommaRenderAction(actionSpec));
    }

    describeRenderActions(event) {
        if (!this.jsonRenderActions[event]) {
            throw new Error(`Unknown event '${event}`);
        }
        const ret = [`**Actions for ${event}**\n`];
        for (const actionOb of this.jsonRenderActions[event]) {
            ret.push(`IF ${actionOb.test.toString()}:`);
            ret.push(`    DO ${actionOb.description}`);
        }
        return ret.join('\n');
    }

    renderDocument({docId, config, output}) {
        const context = {};
        const workspace = {};
        this.renderDocument1({
            docId,
            config,
            context,
            workspace,
            output
        });
        return output;
    }

    renderDocument1({docId, config, context, workspace, output}) {
        throw new Error(`Define renderDocument1() in subclass`);
    }

    // renderEnvironment => {config, context, workspace, output}
    renderEvent(event, renderEnvironment) {
        const context = renderEnvironment.context;
        if (this.jsonRenderDebugLevel > 1) {
            console.log(`${"    ".repeat(context.sequences.length)}EVENT ${event}`);
        }
        if (!this.jsonRenderActions[event]) {
            throw new Error(`Unknown event '${event}`);
        }
        let found = false;
        for (const actionOb of this.jsonRenderActions[event]) {
            if (actionOb.test(renderEnvironment)) {
                found = true;
                if (this.jsonRenderDebugLevel > 0) {
                    console.log(`${"    ".repeat(context.sequences.length)}    ${event} action: ${actionOb.description}`);
                }
                const actionResult = actionOb.action(renderEnvironment);
                if (!actionResult) {
                    break;
                }
            }
        }
        if (!found && this.jsonRenderDebugLevel > 1) {
            console.log(`${"    ".repeat(context.sequences.length)}    No matching action`);
        }
    };

}

module.exports = ProskommaRender;
