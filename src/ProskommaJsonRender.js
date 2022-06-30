const ProskommaJsonRenderAction = require('../src/ProskommaJsonRenderAction');

class ProskommaJsonRender {

    constructor() {
        if(this.constructor === ProskommaJsonRender){
            throw new Error("Abstract class ProskommaJsonRender cannot be instantiated - make as subclass!");
        }
        this.jsonRenderActions = {};
        for (const action of [
            "startDocument",
            "endDocument",
            "startSequence",
            "endSequence",
            "startBlockGraft",
            "endBlockGraft",
            "startParagraph",
            "endParagraph",
            "startContent",
            "endContent",
            "startMetaContent",
            "endMetaContent",
            "mark",
            "startInlineGraft",
            "endInlineGraft",
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
        if (!event in this.jsonRenderActions) {
            throw new Error(`Unknown event '${event}`);
        }
        this.jsonRenderActions[event].push(new ProskommaJsonRenderAction(actionSpec));
    }

    describeRenderActions(event) {
        if (!event in this.jsonRenderActions) {
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
        if (!event in this.jsonRenderActions) {
            throw new Error(`Unknown event '${event}`);
        }
        for (const actionOb of this.jsonRenderActions[event]) {
            if (actionOb.test(renderEnvironment)) {
                actionOb.action(renderEnvironment);
                if (actionOb.stopOnMatch) {
                    break;
                }
            }
        }
    };

}

module.exports = ProskommaJsonRender;
