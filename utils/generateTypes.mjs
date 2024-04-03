import { writeFileSync } from "fs";
import path from "path";
import Ajv from "ajv";
import fse from "fs-extra";
import { compile } from "json-schema-to-typescript";
import url from "url";
import { Project, SyntaxKind } from "ts-morph";

// SETUP
const ajv = new Ajv({
  loadSchema: async (uri) => {
    const newPath = path.resolve(
      path.join("src", uri.replace(/^(.*?)(?=\/schema\/)/, ""))
    );
    const file = await fse.readJSON(newPath);
    return file;
  },
  inlineRefs: 100,
});
const entryPointPath = path.resolve(
  path.join("src", "schema", "combined", "0_4_0", "perf_document_combined.json")
);

//EXECUTION
generateTypes(entryPointPath);

// IMPLEMENTATION

async function generateTypes(entryPointPath) {
  return await getSchema(entryPointPath)
    .then((schema) => compile(schema, "PerfDocument", { bannerComment: "" }))
    .then((ts) => {
      const typesPath = path.resolve(path.join("src", "types.ts"));

      //Remove duplicates
      const project = new Project();

      const regex = /([A-Z][A-Za-z0-9]*)(\d)/g;
      const sourceTs = ts.replace(regex, "$1");
      // Add the TypeScript string as a source file to the project
      const sourceFile = project.createSourceFile("temp.ts", sourceTs);

      const seenTypes = new Set();
      sourceFile.getStatements().forEach((statement, index) => {
        const text = statement.getText();
        if (!seenTypes.has(text)) {
          seenTypes.add(text);
        } else {
          statement.remove();
        }
      });

      sourceFile.formatText({
        indentSize: 2,
        convertTabsToSpaces: true,
        ensureNewLineAtEndOfFile: true,
        insertSpaceAfterCommaDelimiter: true,
        insertSpaceAfterSemicolonInForStatements: true,
        insertSpaceBeforeAndAfterBinaryOperators: true,
        newLineCharacter: "\n",
        placeOpenBraceOnNewLineForFunctions: false,
        placeOpenBraceOnNewLineForControlBlocks: false,
        insertSpaceAfterOpeningAndBeforeClosingNonemptyParenthesis: false,
        insertSpaceAfterKeywordsInControlFlowStatements: true,
        insertSpaceAfterFunctionKeywordForAnonymousFunctions: false,
        insertSpaceAfterOpeningAndBeforeClosingNonemptyBrackets: false,
        insertSpaceAfterOpeningAndBeforeClosingTemplateStringBraces: false,
        insertSpaceAfterOpeningAndBeforeClosingJsxExpressionBraces: false,
        insertSpaceAfterTypeAssertion: false,
      });

      const diagnostics = sourceFile.getPreEmitDiagnostics();
      if (diagnostics.length) {
        console.warn("\x1b[1m\x1b[33m", "\nError in generated types:\n"); // \x1b[31m sets the color to red
        console.log("\x1b[0m", ""); // \x1b[0m resets the color
        diagnostics.forEach((diagnostic) => {
          console.warn(
            "- ",
            diagnostic.getMessageText(),
            ", error found on line:",
            diagnostic.getLineNumber()
          ); // \x1b[31m sets the color to red
        });
      }
      // Get the updated TypeScript string
      const updatedTs = sourceFile.getFullText();

      writeFileSync(typesPath, updatedTs);
      return typesPath;
    });
}

async function getSchema(entryPointPath) {
  async function generateSchemaFromFile(entryPath) {
    const entryObject = fse.readJsonSync(entryPath);
    const validator = await ajv.compileAsync(entryObject, true);
    return validator.schema;
  }
  const schema = await generateSchemaFromFile(entryPointPath);
  async function getFullSchema(schema) {
    const defs = new Map();
    function buildSchema(sourceSchema, processed = new Set()) {
      const schema = { ...sourceSchema };
      const handleReferences = (subSchema) => {
        for (const key in subSchema) {
          if (key === "$ref") {
            const defName = convertToCamelCase(
              path.basename(subSchema[key]).split(".")[0]
            );
            if (!defs.has(defName)) {
              const schemaId = getAbsoluteUrl(schema.$id, subSchema[key]);
              const defSchema = ajv.getSchema(schemaId)?.schema;
              if (!processed.has(defSchema)) {
                processed.add(defSchema);
                const { $id, $comment, ...fullDefSchema } = buildSchema(
                  defSchema,
                  processed
                );
                defs.set(defName, fullDefSchema);
              }
            }
            subSchema[key] = `#/$defs/${defName}`;
          } else if (
            subSchema[key] &&
            typeof subSchema[key] === "object" &&
            !processed.has(subSchema[key])
          ) {
            processed.add(subSchema[key]);
            handleReferences(subSchema[key]);
          }
        }
      };
      handleReferences(schema);
      return schema;
    }
    const fullSchema = buildSchema(schema);
    const { $id, ...fullSchemaWithDefs } = {
      ...fullSchema,
      $defs: Object.fromEntries(defs),
    };
    return fullSchemaWithDefs;
  }
  return getFullSchema(schema);
}

function getAbsoluteUrl(baseUrl, relativeUrl) {
  return url.resolve(baseUrl, relativeUrl);
}

function convertToCamelCase(str) {
  return str
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join("");
}
