const ProskommaRenderAction = require('./ProskommaRenderAction');

class ProskommaRender {

    constructor(spec) {
        if(this.constructor === ProskommaRender){
            throw new Error("Abstract class ProskommaRender cannot be instantiated - make as subclass!");
        }
        const actions = spec.actions || {};
        this.debugLevel = spec.debugLevel || 0;
        this.actions = {};
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
                this.actions[event] = actions[event].map(a => new ProskommaRenderAction(a));
            } else {
                this.actions[event] = [];
            }
        }
    }

    addRenderActionObject(event, actionOb) {
        if (!this.actions[event]) {
            throw new Error(`Unknown event '${event}`);
        }
        this.actions[event].push(actionOb);
    }

    addRenderAction(event, actionSpec) {
        this.addRenderActionObject(event, new ProskommaRenderAction(actionSpec));
    }

    describeRenderActions(event) {
        if (!this.actions[event]) {
            throw new Error(`Unknown event '${event}`);
        }
        const ret = [`**Actions for ${event}**\n`];
        for (const actionOb of this.actions[event]) {
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
        if (this.debugLevel > 1) {
            console.log(`${"    ".repeat(context.sequences.length)}EVENT ${event}`);
        }
        if (!this.actions[event]) {
            throw new Error(`Unknown event '${event}`);
        }
        let found = false;
        for (const actionOb of this.actions[event]) {
            if (actionOb.test(renderEnvironment)) {
                found = true;
                if (this.debugLevel > 0) {
                    console.log(`${"    ".repeat(context.sequences.length)}    ${event} action: ${actionOb.description}`);
                }
                const actionResult = actionOb.action(renderEnvironment);
                if (!actionResult) {
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
