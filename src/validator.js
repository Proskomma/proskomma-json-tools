import Ajv from 'ajv';
import documentStructureSchema_0_1_0 from './schema/structure/document/document_structure_0_1_0.json';
import sequenceStructureSchema_0_1_0 from './schema/structure/sequence/sequence_structure_0_1_0.json';
import blockStructureSchema_0_1_0 from './schema/structure/subSchema/block_structure_0_1_0.json';
import contentElementStructureSchema_0_1_0 from './schema/structure/subSchema/contentElement_structure_0_1_0.json';

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
                        new Ajv()
                            .addSchema(contentElementStructureSchema_0_1_0)
                            .addSchema(blockStructureSchema_0_1_0)
                            .addSchema(sequenceStructureSchema_0_1_0)
                            .compile(documentStructureSchema_0_1_0)
                    ]
                }
            ],
            [
                'sequence',
                {
                    "0.1.0": [
                        new Ajv()
                            .addSchema(contentElementStructureSchema_0_1_0)
                            .addSchema(blockStructureSchema_0_1_0)
                            .compile(sequenceStructureSchema_0_1_0)
                    ]
                }
            ],
        ]) {
            this.schema.structure[key] = schemaOb;
        }
        for (const [key, schemaOb] of []) {
            this.schema.constraint[key] = schemaOb;
        }
    }

    validate(schemaType, schemaKey, schemaVersion, data) {
        if (!(data)) {
            throw new Error(`Usage: validate(schemaType, schemaKey, schemaVersion, data)`);
        }
        if(!["structure", "constraint"].includes(schemaType)) {
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
        for (const validator of validators) {
            result = {
                isValid: validator(data),
                errors: validator.errors
            };
            if (!result.isValid) {
                break;
            }
        }
        return {
            schemaType,
            schemaKey,
            schemaVersion,
            isValid: result.isValid,
            errors: result.errors,
        };
    }


};

export default Validator;
