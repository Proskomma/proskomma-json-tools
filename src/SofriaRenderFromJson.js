const ProskommaRender = require('./ProskommaRender');

class SofriaRenderFromJson extends ProskommaRender {

    constructor(spec) {
        super(spec);
        if (!spec.srcJson) {
            throw new Error(`Must provide srcJson`);
        }
        this.srcJson = spec.srcJson;
        this.cachedSequences = [];
    }

    renderDocument1({docId, config, context, workspace, output}) {
        const environment = {config, context, workspace, output};
        context.renderer = this;
        context.document = {
            id: docId,
            schema: this.srcJson.schema,
            metadata: this.srcJson.metadata,
        };
        context.sequences = [];
        this.renderEvent('startDocument', environment);
        this.renderSequence(environment, this.srcJson.sequence);
        this.renderEvent('endDocument', environment);
    }

    sequenceContext(sequence) {
        return {
            type: sequence.type,
            nBlocks: sequence.blocks.length,
            milestones: new Set([]),
        }
    }

    renderSequence(environment, providedSequence) {
        let sequence;
        if (!providedSequence) {
            if (this.cachedSequences.length === 0) {
                throw new Error("No sequence provided and no sequences cached");
            }
            sequence = this.cachedSequences[0];
        } else {
            sequence = providedSequence;
        }
        const context = environment.context;
        context.sequences.unshift(sequence);
        this.renderEvent('startSequence', environment);
        for (const [blockN, block] of sequence.blocks.entries()) {
            context.sequences[0].block = {
                type: block.type,
                blockN,
                wrappers: []
            }
            if (block.type === 'graft') {
                context.sequences[0].block.sequence = this.sequenceContext(block.sequence);
                this.cachedSequences.unshift(block.sequence);
                this.renderEvent('blockGraft', environment);
                this.cachedSequences.shift();
            } else {
                this.renderEvent('startParagraph', environment);
                this.renderContent(block.content, environment);
                this.renderEvent('endParagraph', environment);
            }
            delete context.sequences[0].block;
        }
        this.renderEvent('endSequence', environment);
        this.cachedSequence = null;
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
        if (element.sequence) {
            elementContext.sequence = this.sequenceContext(element.sequence);
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
            this.cachedSequences.unshift(element.sequence);
            this.renderEvent('inlineGraft', environment);
            this.cachedSequences.shift();
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

module.exports = SofriaRenderFromJson;
