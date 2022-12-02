const ProskommaRender = require('./ProskommaRender');

class PerfRenderFromJson extends ProskommaRender {

    constructor(spec) {
        super(spec);
        if (!spec.srcJson) {
            throw new Error(`Must provide srcJson`);
        }
        this.srcJson = spec.srcJson;
    }

    renderDocument1({docId, config, context, workspace, output}) {
        const environment = {config, context, workspace, output};
        context.renderer = this;
        context.document = {
            id: docId,
            schema: this.srcJson.schema,
            metadata: this.srcJson.metadata,
            mainSequenceId: this.srcJson.main_sequence_id,
            nSequences: Object.keys(this.srcJson.sequences).length,
        };
        context.sequences = [];
        this.renderEvent('startDocument', environment);
        this.renderSequenceId(environment, this.srcJson.main_sequence_id);
        this.renderEvent('endDocument', environment);
    }

    sequenceContext(sequence, sequenceId) {
        return {
            id: sequenceId,
            type: sequence.type,
            nBlocks: sequence.blocks.length,
            milestones: new Set([]),
        }
    }

    renderSequenceId(environment, sequenceId) {
        const context = environment.context;
        const sequence = this.srcJson.sequences[sequenceId];
        if (!sequence) {
            throw new Error(`Sequence '${sequenceId}' not found in renderSequenceId()`);
        }
        context.sequences.unshift(this.sequenceContext(sequence, sequenceId));
        this.renderEvent('startSequence', environment);
        for (const [blockN, block] of sequence.blocks.entries()) {
            context.sequences[0].block = {
                type: block.type,
                subType: block.subtype,
                blockN,
                wrappers: []
            }
            if (block.type === 'graft') {
                if (block.target && !this.srcJson.sequences[block.target]) {
                    context.sequences[0].block.target = block.target;
                    this.renderEvent('unresolvedBlockGraft', environment);
                } else {
                    context.sequences[0].block.target = block.target;
                    context.sequences[0].block.isNew = block.new || false;
                    this.renderEvent('blockGraft', environment);
                }
            } else {
                this.renderEvent('startParagraph', environment);
                this.renderContent(block.content, environment);
                this.renderEvent('endParagraph', environment);
            }
            delete context.sequences[0].block;
        }
        this.renderEvent('endSequence', environment);
        context.sequences.shift();
    }

    renderContent(content, environment) {
        for (const element of content) {
            this.renderElement(element, environment);
        }
    }

    renderElement(element, environment) {

        const maybeRenderMetaContent = (elementContext) => {
            if (element.meta_content) {
                elementContext.metaContent = element.meta_content;
                this.renderEvent('metaContent', environment);
            }
        }

        const context = environment.context;
        const elementContext = {
            type: element.type || 'text'
        };
        if (element.subtype) {
            elementContext.subType = element.subtype;
        }
        if (element.atts) {
            elementContext.atts = element.atts;
          } else if (elementContext.type !== "end_milestone" && elementContext.type !== "meta_content") {
            elementContext.atts = {};
          }
        if (element.target) {
            elementContext.target = element.target;
        }
        if (element.type === 'graft') {
            elementContext.isNew = element.new || false
        }
        if (elementContext.type === 'text') {
            elementContext.text = element;
        }
        context.sequences[0].element = elementContext;
        if (elementContext.type === "text") {
            this.renderEvent('text', environment);
            maybeRenderMetaContent(elementContext);
        } else if (elementContext.type === "mark") {
            this.renderEvent('mark', environment);
            maybeRenderMetaContent(elementContext);
        } else if (elementContext.type === "start_milestone") {
            this.renderEvent('startMilestone', environment);
            maybeRenderMetaContent(elementContext);
        } else if (elementContext.type === "end_milestone") {
            this.renderEvent('endMilestone', environment);
            maybeRenderMetaContent(elementContext);
        } else if (elementContext.type === "graft") {
            if (element.target) {
                if (element.target && !this.srcJson.sequences[element.target]) {
                    this.renderEvent('unresolvedInlineGraft', environment);
                    return;
                }
            }
            this.renderEvent('inlineGraft', environment);
            maybeRenderMetaContent(elementContext);
        } else if (elementContext.type === "wrapper") {
            context.sequences[0].block.wrappers.unshift(elementContext.subType);
            this.renderEvent('startWrapper', environment);
            this.renderContent(element.content, environment);
            context.sequences[0].element = elementContext;
            maybeRenderMetaContent(elementContext);
            this.renderEvent('endWrapper', environment);
            context.sequences[0].block.wrappers.shift();
        } else {
            throw new Error(`Unexpected element type '${elementContext.type}`);
        }
        delete context.sequences[0].element;
    }

}

module.exports = PerfRenderFromJson;
