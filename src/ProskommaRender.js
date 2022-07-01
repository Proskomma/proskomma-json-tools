const ProskommaRenderAction = require('../src/ProskommaRenderAction');

class ProskommaRender {

    constructor() {
        if(this.constructor === ProskommaRender){
            throw new Error("Abstract class ProskommaRender cannot be instantiated - make as subclass!");
        }
        this.debugLevel = 0;
        this.jsonRenderActions = {};
        for (const action of [
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
            this.jsonRenderActions[action] = [];
        }
    }

    addRenderAction(event, actionSpec) {
        if (!this.jsonRenderActions[event]) {
            throw new Error(`Unknown event '${event}`);
        }
        this.jsonRenderActions[event].push(new ProskommaRenderAction(actionSpec));
    }

    describeRenderActions(event) {
        if (!this.jsonRenderActions[event]) {
            throw new Error(`Unknown event '${event}`);
        }
        const ret = [`**Actions for ${event}**\n`];
        for (const actionOb of this.jsonRenderActions[event]) {
            ret.push(`IF ${actionOb.test.toString()}:`);
            ret.push(`    DO ${actionOb.description}`);
            ret.push(`    AND ${actionOb.stopOnMatch ? "STOP" : "CONTINUE"}\n`);
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
        if (this.debugLevel > 1) {
            console.log(`${"    ".repeat(context.sequences.length)}EVENT ${event}`);
        }
        if (!this.jsonRenderActions[event]) {
            throw new Error(`Unknown event '${event}`);
        }
        let found = false;
        for (const actionOb of this.jsonRenderActions[event]) {
            if (actionOb.test(renderEnvironment)) {
                found = true;
                if (this.debugLevel > 0) {
                    console.log(`${"    ".repeat(context.sequences.length)}    ${event} action: ${actionOb.description}`);
                }
                actionOb.action(renderEnvironment);
                if (actionOb.stopOnMatch) {
                    break;
                }
            }
        }
        if (!found && this.debugLevel > 1) {
            console.log(`${"    ".repeat(context.sequences.length)}    No matching action`);
        }
    };

}

module.exports = ProskommaRender;
