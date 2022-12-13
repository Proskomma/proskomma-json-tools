import officialPipelines from '../pipelines';
import namespaceTransforms from '../transforms';

class PipelineHandler {
    /**
     * 
     * @param {Proskomma} proskomma - a proskomma instance
     * @param {JSON[]} pipelines - a list of the pipelines
     * @param {JSON[]} transforms - a list of the transforms
     * @param {boolean} verbose - print pipeline reading step by step
     */
    constructor({pipelines = null, transforms = null, proskomma = null, verbose=false}) {
        // TODO add namespaces [usfm, perf, sofria]
        if (proskomma !== null) {
            this.proskomma = proskomma;
            const query = '{ id }';
            const content = proskomma.gqlQuerySync(query) || {};
    
            if (!content || !content.data.id) {
                throw new Error('Provided Proskomma instance does not have any ID');
            }
        }

        this.pipelines = officialPipelines;
        this.namespaces = namespaceTransforms;
        this.transforms = {};

        if(pipelines != null) {
            for(let key of Object.keys(pipelines)) {
                this.pipelines[key] = pipelines[key];
            }
        }

        if(transforms != null) {
            for(let key of Object.keys(transforms)) {
                this.transforms[key] = transforms[key];
            }
        }
        this.verbose = verbose;
    }

    getProskomma() {
        return this.proskomma;
    }

    setProskomma(proskomma) {
        this.proskomma = proskomma;
    }

    listPipelinesNames() {
        console.log(Object.keys(this.pipelines).join('\n'));
    }

    /**
     * Gets pipeline by given name
     * @param {string} pipelineName - the pipeline name
     * @param {object} data input data
     * @return {pipeline} pipeline transforms
     * @private
     */
    getPipeline(pipelineName, data) {
        if (!this.pipelines[pipelineName]) {
            throw new Error(`Unknown pipeline name '${pipelineName}'`);
        }
        const pipeline = this.pipelines[pipelineName];
        const inputSpecs = pipeline[0].inputs;
        if (Object.keys(inputSpecs).length !== Object.keys(data).length) {
            throw new Error(`${Object.keys(inputSpecs).length} input(s) expected by ${pipelineName} but ${Object.keys(data).length} provided (${Object.keys(data).join(', ')})`);
        }
        for (const [inputSpecName, inputSpecType] of Object.entries(inputSpecs)) {
            if (!data[inputSpecName]) {
                throw new Error(`Input ${inputSpecName} not provided as input to ${pipelineName}`);
            }
            if ((typeof data[inputSpecName] === 'string') !== (inputSpecType === 'text')) {
                throw new Error(`Input ${inputSpecName} must be ${inputSpecType} but ${typeof data[inputSpecName] === 'string' ? 'text': 'json'} was provided`);
            }
        }
        return pipeline;
    }

    /**
     * Generates and returns a report via a transform pipeline
     * @async
     * @param {string} pipelineName
     * @param {object} data
     * @return {Promise<array>} A report
     */
    async runPipeline(pipelineName, data) {
        const pipeline = this.getPipeline(pipelineName, data);
        this.loadTransforms(pipeline, 'perf');
        return await this.evaluateSteps({specSteps: pipeline, inputValues: data});
    }

    loadTransforms(pipeline, namespace='perf') {
        const transformSteps = pipeline.filter(s => s.type==='Transform');
        if (transformSteps.length === 0) {
            throw new Error(`No Transform steps found in report steps`);
        }
        var names = Object.keys(transformSteps).map(val => transformSteps[val]['name']);
        if(namespace==='perf' || namespace ==='usfm') {
            for(const [key, tr] of Object.entries(this.namespaces)) {
                if(key !== 'sofria2sofria') {
                    for(const [k, t] of Object.entries(tr)) {
                        if(names.includes(k)) {
                            this.transforms[k] = t;
                        }
                    }
                }
            }
        }
    }

    evaluateSteps({specSteps, inputValues}) {
        this.verbose && console.log('** Evaluate **');
        // Find input, output and transforms
        const inputStep = specSteps.filter(s => s.type==='Inputs')[0];
        if (!inputStep) {
            throw new Error(`No Inputs step found in report steps`);
        }
        const outputStep = specSteps.filter(s => s.type==='Outputs')[0];
        if (!outputStep) {
            throw new Error(`No Outputs step found in report steps`);
        }
        const transformSteps = specSteps.filter(s => s.type==='Transform');
        if (transformSteps.length === 0) {
            throw new Error(`No Transform steps found in report steps`);
        }
        const transformInputs = {};
        const transformOutputs = {};
        for (const transformStep of Object.values(transformSteps)) {
            transformInputs[transformStep.id] = {};
            for (const input of transformStep.inputs) {
                transformInputs[transformStep.id][input.name] = null;
            }
            transformOutputs[transformStep.id] = {};
            for (const output of transformStep.outputs) {
                transformOutputs[transformStep.id][output] = null;
            }
        }
        // Copy inputs to transforms
        for (const [inputKey, inputValue] of Object.entries(inputValues)) {
            for (const transformStep of transformSteps) {
                for (const input of transformStep.inputs) {
                    if (input.source === `Input ${inputKey}`) {
                        this.verbose && console.log(`Copying Input ${inputKey} to Transform ${transformStep.id} ${input.name} input`);
                        transformInputs[transformStep.id][input.name] = inputValue;
                    }
                }
            }
        }
        // Propagate values between transforms until nothing changes
        let changed = true;
        let nWaitingTransforms = 0;
        while (changed) {
            changed = false;
            for (const transformStep of transformSteps) {
                if (
                    Object.values(transformInputs[transformStep.id]).filter(i => !i).length === 0 &&
                    Object.values(transformOutputs[transformStep.id]).filter(i => !i).length > 0
                ) {
                    this.verbose && console.log(`Evaluating Transform ${transformStep.id}`);
                    try {
                        transformOutputs[transformStep.id] = this.transforms[transformStep.name].code({...transformInputs[transformStep.id], proskomma:this.getProskomma()});
                    } catch (err) {
                        const errMsg = `Error evaluating Transform ${transformStep.id} (name=${transformStep.name}, type=${typeof transformStep.code}): ${err}`;
                        throw new Error(errMsg);
                    }
                    for (const consumingTransform of transformSteps) {
                        for (const consumingInput of consumingTransform.inputs) {
                            for (const resolvedOutput of Object.keys(transformOutputs[transformStep.id])) {
                                if (consumingInput.source === `Transform ${transformStep.id} ${resolvedOutput}`) {
                                    this.verbose && console.log(`Copying Transform ${transformStep.id} ${resolvedOutput} output to Transform ${consumingTransform.id} ${consumingInput.name} input`);
                                    transformInputs[consumingTransform.id][consumingInput.name] = transformOutputs[transformStep.id][resolvedOutput];
                                }
                            }
                        }
                    }
                    changed = true;
                }
            }
        }
        if (nWaitingTransforms) {
            throw new Error(`Inputs not satisfied for ${nWaitingTransforms} transform(s)`);
        }
        // Copy to output;
        const outputValues = {};
        for (const output of outputStep.outputs) {
            const transformN = output.source.split(' ')[1];
            this.verbose && console.log(`Copying Transform ${transformN} ${output.name} to Output ${output.name}`);
            outputValues[output.name] = transformOutputs[transformN][output.name];
        }
        this.verbose && console.log('****');
        return outputValues;
    }
}

module.exports = PipelineHandler;

/**
 * Proskomma instance
 * @typedef Proskomma
 * @see {@link https://github.com/mvahowe/proskomma-js}
 */