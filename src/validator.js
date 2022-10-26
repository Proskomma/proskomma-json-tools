const Ajv = require('ajv');

const succinctSchema_0_2_0 = require('./schema/succinct/0_2_0/proskomma_succinct.json');

const documentStructureSchema_0_2_1 = require('./schema/structure/0_2_1/document_structure.json');
const sequenceStructureSchema_0_2_1 = require('./schema/structure/0_2_1/sequence_structure.json');
const blockStructureSchema_0_2_1 = require('./schema/structure/0_2_1/block_structure.json');
const contentElementStructureSchema_0_2_1 = require('./schema/structure/0_2_1/contentElement_structure.json');
const perfDocumentConstraintSchema_0_2_1 = require('./schema/constraint/0_2_1/perf_document_constraint.json');
const perfSequenceConstraintSchema_0_2_1 = require('./schema/constraint/0_2_1/perf_sequence_constraint.json');
const perfBlockConstraintSchema_0_2_1 = require('./schema/constraint/0_2_1/perf_block_constraint.json');
const perfContentElementConstraintSchema_0_2_1 = require('./schema/constraint/0_2_1/perf_contentElement_constraint.json');
const sofriaDocumentConstraintSchema_0_2_1 = require('./schema/constraint/0_2_1/sofria_document_constraint.json');
const sofriaSequenceConstraintSchema_0_2_1 = require('./schema/constraint/0_2_1/sofria_sequence_constraint.json');
const sofriaBlockConstraintSchema_0_2_1 = require('./schema/constraint/0_2_1/sofria_block_constraint.json');
const sofriaContentElementConstraintSchema_0_2_1 = require('./schema/constraint/0_2_1/sofria_contentElement_constraint.json');

const documentStructureSchema_0_3_0 = require('./schema/structure/0_3_0/document_structure.json');
const sequenceStructureSchema_0_3_0 = require('./schema/structure/0_3_0/sequence_structure.json');
const blockStructureSchema_0_3_0 = require('./schema/structure/0_3_0/block_structure.json');
const contentElementStructureSchema_0_3_0 = require('./schema/structure/0_3_0/contentElement_structure.json');
const hookStructureSchema_0_3_0 = require('./schema/structure/0_3_0/hooks_structure.json');
const perfDocumentConstraintSchema_0_3_0 = require('./schema/constraint/0_3_0/perf_document_constraint.json');
const perfSequenceConstraintSchema_0_3_0 = require('./schema/constraint/0_3_0/perf_sequence_constraint.json');
const perfBlockConstraintSchema_0_3_0 = require('./schema/constraint/0_3_0/perf_block_constraint.json');
const perfContentElementConstraintSchema_0_3_0 = require('./schema/constraint/0_3_0/perf_contentElement_constraint.json');
const sofriaDocumentConstraintSchema_0_3_0 = require('./schema/constraint/0_3_0/sofria_document_constraint.json');
const sofriaSequenceConstraintSchema_0_3_0 = require('./schema/constraint/0_3_0/sofria_sequence_constraint.json');
const sofriaBlockConstraintSchema_0_3_0 = require('./schema/constraint/0_3_0/sofria_block_constraint.json');
const sofriaContentElementConstraintSchema_0_3_0 = require('./schema/constraint/0_3_0/sofria_contentElement_constraint.json');

class Validator {

    constructor() {
        this.schema = {
            structure: {},
            constraint: {},
            proskomma: {},
        };
        for (const [key, schemaOb] of [
            [
                'succinct',
                {
                    "0.2.0": [
                        {
                            "name": "Proskomma Serialized Succinct",
                            "validator": new Ajv()
                                .compile(succinctSchema_0_2_0)
                        }
                    ],
                }
            ]
        ]) {
            this.schema.proskomma[key] = schemaOb;
        }
        for (const [key, schemaOb] of [
            [
                'document',
                {
                    "0.2.1": [
                        {
                            "name": "Document Structure",
                            "validator": new Ajv()
                                .addSchema(contentElementStructureSchema_0_2_1)
                                .addSchema(blockStructureSchema_0_2_1)
                                .addSchema(sequenceStructureSchema_0_2_1)
                                .compile(documentStructureSchema_0_2_1)
                        }
                    ],
                    "0.3.0": [
                        {
                            "name": "Document Structure",
                            "validator": new Ajv()
                                .addSchema(hookStructureSchema_0_3_0)
                                .addSchema(contentElementStructureSchema_0_3_0)
                                .addSchema(blockStructureSchema_0_3_0)
                                .addSchema(sequenceStructureSchema_0_3_0)
                                .compile(documentStructureSchema_0_3_0)
                        }
                    ]
                }
            ],
            [
                'sequence',
                {
                    "0.2.1": [
                        {
                            "name": "Sequence Structure",
                            "validator": new Ajv()
                                .addSchema(contentElementStructureSchema_0_2_1)
                                .addSchema(blockStructureSchema_0_2_1)
                                .compile(sequenceStructureSchema_0_2_1)
                        }
                    ],
                    "0.3.0": [
                        {
                            "name": "Sequence Structure",
                            "validator": new Ajv()
                                .addSchema(hookStructureSchema_0_3_0)
                                .addSchema(contentElementStructureSchema_0_3_0)
                                .addSchema(blockStructureSchema_0_3_0)
                                .compile(sequenceStructureSchema_0_3_0)
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
                    "0.2.1": [
                        {
                            "name": "Document Structure",
                            "validator": new Ajv()
                                .addSchema(contentElementStructureSchema_0_2_1)
                                .addSchema(blockStructureSchema_0_2_1)
                                .addSchema(sequenceStructureSchema_0_2_1)
                                .compile(documentStructureSchema_0_2_1)
                        },
                        {
                            "name": "PERF Document",
                            "validator": new Ajv()
                                .addSchema(perfContentElementConstraintSchema_0_2_1)
                                .addSchema(perfBlockConstraintSchema_0_2_1)
                                .addSchema(perfSequenceConstraintSchema_0_2_1)
                                .compile(perfDocumentConstraintSchema_0_2_1)
                        }
                    ],
                    "0.3.0": [
                        {
                            "name": "Document Structure",
                            "validator": new Ajv()
                                .addSchema(hookStructureSchema_0_3_0)
                                .addSchema(contentElementStructureSchema_0_3_0)
                                .addSchema(blockStructureSchema_0_3_0)
                                .addSchema(sequenceStructureSchema_0_3_0)
                                .compile(documentStructureSchema_0_3_0)
                        },
                        {
                            "name": "PERF Document",
                            "validator": new Ajv()
                                .addSchema(hookStructureSchema_0_3_0)
                                .addSchema(perfContentElementConstraintSchema_0_3_0)
                                .addSchema(perfBlockConstraintSchema_0_3_0)
                                .addSchema(perfSequenceConstraintSchema_0_3_0)
                                .compile(perfDocumentConstraintSchema_0_3_0)
                        }
                    ]
                }
            ],
            [
                'perfSequence',
                {
                    "0.2.1": [
                        {
                            "name": "Sequence Structure",
                            "validator": new Ajv()
                                .addSchema(contentElementStructureSchema_0_2_1)
                                .addSchema(blockStructureSchema_0_2_1)
                                .compile(sequenceStructureSchema_0_2_1)
                        },
                        {
                            "name": "PERF Sequence",
                            "validator": new Ajv()
                                .addSchema(perfContentElementConstraintSchema_0_2_1)
                                .addSchema(perfBlockConstraintSchema_0_2_1)
                                .compile(perfSequenceConstraintSchema_0_2_1)
                        }
                    ],
                    "0.3.0": [
                        {
                            "name": "Sequence Structure",
                            "validator": new Ajv()
                                .addSchema(hookStructureSchema_0_3_0)
                                .addSchema(contentElementStructureSchema_0_3_0)
                                .addSchema(blockStructureSchema_0_3_0)
                                .compile(sequenceStructureSchema_0_3_0)
                        },
                        {
                            "name": "PERF Sequence",
                            "validator": new Ajv()
                                .addSchema(hookStructureSchema_0_3_0)
                                .addSchema(perfContentElementConstraintSchema_0_3_0)
                                .addSchema(perfBlockConstraintSchema_0_3_0)
                                .compile(perfSequenceConstraintSchema_0_3_0)
                        }
                    ]
                }
            ],
            [
                'sofriaDocument',
                {
                    "0.2.1": [
                        {
                            "name": "Document Structure",
                            "validator": new Ajv()
                                .addSchema(contentElementStructureSchema_0_2_1)
                                .addSchema(blockStructureSchema_0_2_1)
                                .addSchema(sequenceStructureSchema_0_2_1)
                                .compile(documentStructureSchema_0_2_1)
                        },
                        {
                            "name": "SOFRIA Document",
                            "validator": new Ajv()
                                .addSchema(sofriaContentElementConstraintSchema_0_2_1)
                                .addSchema(sofriaBlockConstraintSchema_0_2_1)
                                .addSchema(sofriaSequenceConstraintSchema_0_2_1)
                                .compile(sofriaDocumentConstraintSchema_0_2_1)
                        }
                    ],
                    "0.3.0": [
                        {
                            "name": "Document Structure",
                            "validator": new Ajv()
                                .addSchema(hookStructureSchema_0_3_0)
                                .addSchema(contentElementStructureSchema_0_3_0)
                                .addSchema(blockStructureSchema_0_3_0)
                                .addSchema(sequenceStructureSchema_0_3_0)
                                .compile(documentStructureSchema_0_3_0)
                        },
                        {
                            "name": "SOFRIA Document",
                            "validator": new Ajv()
                                .addSchema(hookStructureSchema_0_3_0)
                                .addSchema(sofriaContentElementConstraintSchema_0_3_0)
                                .addSchema(sofriaBlockConstraintSchema_0_3_0)
                                .addSchema(sofriaSequenceConstraintSchema_0_3_0)
                                .compile(sofriaDocumentConstraintSchema_0_3_0)
                        }
                    ]
                }
            ],
            [
                'sofriaSequence',
                {
                    "0.2.1": [
                        {
                            "name": "Sequence Structure",
                            "validator": new Ajv()
                                .addSchema(contentElementStructureSchema_0_2_1)
                                .addSchema(blockStructureSchema_0_2_1)
                                .compile(sequenceStructureSchema_0_2_1)
                        },
                        {
                            "name": "SOFRIA Sequence",
                            "validator": new Ajv()
                                .addSchema(sofriaContentElementConstraintSchema_0_2_1)
                                .addSchema(sofriaBlockConstraintSchema_0_2_1)
                                .compile(sofriaSequenceConstraintSchema_0_2_1)
                        }
                    ],
                    "0.3.0": [
                        {
                            "name": "Sequence Structure",
                            "validator": new Ajv()
                                .addSchema(hookStructureSchema_0_3_0)
                                .addSchema(contentElementStructureSchema_0_3_0)
                                .addSchema(blockStructureSchema_0_3_0)
                                .compile(sequenceStructureSchema_0_3_0)
                        },
                        {
                            "name": "SOFRIA Sequence",
                            "validator": new Ajv()
                                .addSchema(hookStructureSchema_0_3_0)
                                .addSchema(sofriaContentElementConstraintSchema_0_3_0)
                                .addSchema(sofriaBlockConstraintSchema_0_3_0)
                                .compile(sofriaSequenceConstraintSchema_0_3_0)
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
                    ret[schemaType][schemaLabel][version] = versionSteps.map(vs => vs.name);
                }
            }
        }
        return ret;
    }

    validate(schemaType, schemaKey, schemaVersion, data) {
        if (!(data)) {
            throw new Error(`Usage: validate(schemaType, schemaKey, schemaVersion, data)`);
        }
        const knownSchemaTypes = Object.keys(this.schema);
        if (!knownSchemaTypes.includes(schemaType)) {
            throw new Error(`Schema type must be one of ${knownSchemaTypes.map(s => `'${s}'`).join(', ')}, not '${schemaType}'`)
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
