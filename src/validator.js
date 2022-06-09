const Ajv = require('ajv');
const documentStructureSchema_0_1_0 = require('./schema/structure/document/document_structure_0_1_0.json');
const sequenceStructureSchema_0_1_0 = require('./schema/structure/sequence/sequence_structure_0_1_0.json');
const blockStructureSchema_0_1_0 = require('./schema/structure/subSchema/block_structure_0_1_0.json');
const contentElementStructureSchema_0_1_0 = require('./schema/structure/subSchema/contentElement_structure_0_1_0.json');
const perfDocumentConstraintSchema_0_1_0 = require('./schema/constraint/document/perf_document_constraint_0_1_0.json');
const perfSequenceConstraintSchema_0_1_0 = require('./schema/constraint/sequence/perf_sequence_constraint_0_1_0.json');
const perfBlockConstraintSchema_0_1_0 = require('./schema/constraint/subSchema/perf_block_constraint_0_1_0.json');
const perfContentElementConstraintSchema_0_1_0 = require('./schema/constraint/subSchema/perf_contentElement_constraint_0_1_0.json');

class Validator {

    constructor() {
        this.schema = {
            structure: {},
            constraint: {}
        };
        for (const [key, schemaOb] of [
            [
                'document',
                {
                    "0.1.0": [
                        {
                            "name": "Document Structure",
                            "validator": new Ajv()
                                .addSchema(contentElementStructureSchema_0_1_0)
                                .addSchema(blockStructureSchema_0_1_0)
                                .addSchema(sequenceStructureSchema_0_1_0)
                                .compile(documentStructureSchema_0_1_0)
                        }
                    ]
                }
            ],
            [
                'sequence',
                {
                    "0.1.0": [
                        {
                            "name": "Sequence Structure",
                            "validator": new Ajv()
                                .addSchema(contentElementStructureSchema_0_1_0)
                                .addSchema(blockStructureSchema_0_1_0)
                                .compile(sequenceStructureSchema_0_1_0)
                        }
                    ]
                }
            ],
        ]) {
            this.schema.structure[key] = schemaOb;
        }
        for (const [key, schemaOb] of [
            [
                'perfDocument',
                {
                    "0.1.0": [
                        {
                            "name": "Document Structure",
                            "validator": new Ajv()
                                .addSchema(contentElementStructureSchema_0_1_0)
                                .addSchema(blockStructureSchema_0_1_0)
                                .addSchema(sequenceStructureSchema_0_1_0)
                                .compile(documentStructureSchema_0_1_0)
                        },
                        {
                            "name": "PERF Document",
                            "validator": new Ajv()
                                .addSchema(perfContentElementConstraintSchema_0_1_0)
                                .addSchema(perfBlockConstraintSchema_0_1_0)
                                .addSchema(perfSequenceConstraintSchema_0_1_0)
                                .compile(perfDocumentConstraintSchema_0_1_0)
                        }
                    ]
                }
            ],
            [
                'perfSequence',
                {
                    "0.1.0": [
                        {
                            "name": "Sequence Structure",
                            "validator": new Ajv()
                                .addSchema(contentElementStructureSchema_0_1_0)
                                .addSchema(blockStructureSchema_0_1_0)
                                .compile(sequenceStructureSchema_0_1_0)
                        },
                        {
                            "name": "PERF Sequence",
                            "validator": new Ajv()
                                .addSchema(perfContentElementConstraintSchema_0_1_0)
                                .addSchema(perfBlockConstraintSchema_0_1_0)
                                .compile(perfSequenceConstraintSchema_0_1_0)
                        }
                    ]
                }
            ]
        ]) {
            this.schema.constraint[key] = schemaOb;
        }
    }

    schemaInfo() {
        const ret = {};
        for (const [schemaType, schemas] of Object.entries(this.schema)) {
            ret[schemaType] = {};
            for (const [schemaLabel, schemaVersions] of Object.entries(schemas)) {
                ret[schemaType][schemaLabel] = {};
                for (const [version, versionSteps] of Object.entries(schemaVersions)) {
                    ret[schemaType][schemaLabel][version] = versionSteps.map(vs =>vs.name);
                }
            }
        }
        return ret;
    }

    validate(schemaType, schemaKey, schemaVersion, data) {
        if (!(data)) {
            throw new Error(`Usage: validate(schemaType, schemaKey, schemaVersion, data)`);
        }
        if (!["structure", "constraint"].includes(schemaType)) {
            throw new Error(`Schema type must be 'structure' or 'constraint' not '${schemaType}'`)
        }
        if (!this.schema[schemaType][schemaKey]) {
            throw new Error(`Unknown ${schemaType} schema key ${schemaKey}`);
        }
        if (!this.schema[schemaType][schemaKey][schemaVersion]) {
            throw new Error(`Unknown version ${schemaVersion} for ${schemaType} schema key ${schemaKey}`);
        }
        const validators = this.schema[schemaType][schemaKey][schemaVersion];
        let result;
        for (const {name: validatorName, validator} of validators) {
            result = {
                validatorName,
                isValid: validator(data),
                errors: validator.errors
            };
            if (!result.isValid) {
                break;
            }
        }
        return {
            requested: {
                schemaType,
                schemaKey,
                schemaVersion,
            },
            lastSchema: result.validatorName,
            isValid: result.isValid,
            errors: result.errors,
        };
    }

}

module.exports = Validator;
