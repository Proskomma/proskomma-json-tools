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
            "unresolvedBlockGraft",
            "blockGraft",
            "startParagraph",
            "endParagraph",
            "metaContent",
            "mark",
            "unresolvedInlineGraft",
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
            let testResult = false;
            try {
                testResult = actionOb.test(renderEnvironment);
            } catch (err) {
                const msg = `Exception from test of action '${actionOb.description}' for event ${event} in ${context.sequences.length > 0 ? context.sequences[0].type : "no"} sequence: ${err}`;
                throw new Error(msg);
            }
            if (testResult) {
                found = true;
                if (this.debugLevel > 0) {
                    console.log(`${"    ".repeat(context.sequences.length)}    ${event} action: ${actionOb.description}`);
                }
                let actionResult = false;
                try {
                    actionResult = actionOb.action(renderEnvironment);
                } catch (err) {
                    throw new Error(`Exception from action '${actionOb.description}' for event ${event} in ${context.sequences.length > 0 ? context.sequences[0].type : "no"} sequence: ${err}`);
                }
                if (!actionResult) {
                    break;
                }
            }
        }
        if (['unresolvedBlockGraft', 'unresolvedInlineGraft'].includes(event) && this.actions[event].length === 0) {
            throw new Error(`No action for ${event} graft event in ${context.sequences.length > 0 ? context.sequences[0].type : "no"} sequence: add an action or fix your data!`)
        }
        if (!found && this.debugLevel > 1) {
            console.log(`${"    ".repeat(context.sequences.length)}    No matching action`);
        }
    };

}

module.exports = ProskommaRender;
