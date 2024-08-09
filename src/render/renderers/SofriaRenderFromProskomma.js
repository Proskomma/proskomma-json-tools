const ProskommaRender = require("./ProskommaRender");

const camelCaseToSnakeCase = (s) => {
  const ret = [];
  for (const c of s.split("")) {
    if (c.toUpperCase() === c && c.toLowerCase() !== c) {
      ret.push(`_${c.toLowerCase()}`);
    } else {
      ret.push(c);
    }
  }
  return ret.join("");
};

class SofriaRenderFromProskomma extends ProskommaRender {
  constructor(spec) {
    super(spec);
    if (!spec.proskomma) {
      throw new Error(`No Proskomma`);
    }
    this.pk = spec.proskomma;
    this._tokens = [];
    this._container = null;
    this.cachedSequenceIds = [];
    this.sequences = null;
    this.currentCV = {
      chapter: null,
      verses: null,
    };
  }
  renderDocument1({ docId, config, context, workspace, output }) {
    const environment = { config, context, workspace, output };
    context.renderer = this;
    const documentResult = this.pk.gqlQuerySync(`{
          document(id: "${docId}") {
            docSetId
            mainSequence { id }
            nSequences
            sequences {
              id
              type
              nBlocks
            }
            headers {
              key
              value
            }
          } 
        }`);
    const docSetId = documentResult.data.document.docSetId;
    const mainId = documentResult.data.document.mainSequence.id;
    const nSequences = documentResult.data.document.nSequences;
    this.sequences = {};

    for (const seq of documentResult.data.document.sequences) {
      this.sequences[seq.id] = seq;
    }

    const headers = {};
    for (const header of documentResult.data.document.headers) {
      headers[header.key] = header.value;
    }
    const docSetResult = this.pk.gqlQuerySync(
      `{docSet(id: "${docSetId}") {selectors {key value}}}`
    );
    const selectors = {};
    for (const selector of docSetResult.data.docSet.selectors) {
      selectors[selector.key] = selector.value;
    }
    context.document = {
      id: docId,
      schema: {
        structure: "nested",
        structure_version: "0.2.1",
        constraints: [
          {
            name: "sofria",
            version: "0.2.1",
          },
        ],
      },

      metadata: {
        translation: {
          id: docSetId,
          selectors,
          properties: {},
          tags: [],
        },
        document: {
          ...headers,
          properties: {},
          tags: [],
        },
      },
      mainSequenceId: mainId,
      nSequences,
    };
  
    context.sequences = [{}];

    this.renderEvent("startDocument", environment);
    this.cachedSequenceIds.unshift(mainId);
    if (environment.config.nbBlock) {
      environment.workspace.nbBlock = environment.config.nbBlock;
    }

    if (config.chapters) {
      if (workspace.chapters) {
        if (workspace.chapters.length === 0) {
          workspace.chapters = [...config.chapters];
        }
      } else {
        workspace.chapters = [...config.chapters];
      }
    }
    if (config.verses) {
      if (workspace.verses) {
        if (workspace.verses.length === 0) {
          workspace.verses = [...config.verses];
        }
      } else {
        workspace.verses = [...config.verses];

      }
    }

    if (workspace.chapters) {
      context.document.metadata.document.properties.chapters =
        workspace.chapters[0];
    }
    if (workspace.verses) {
      context.document.metadata.document.properties.verses =
        workspace.verses[0];
    }


    this.renderSequence(environment);

    this.cachedSequenceIds.shift();
    this.renderEvent("endDocument", environment);
  }

  sequenceContext(sequence, sequenceId) {
    return {
      id: sequenceId,
      type: camelCaseToSnakeCase(sequence.type),
      nBlocks: sequence.nBlocks,
      milestones: new Set([]),
    };
  }

  renderSequence(environment) {
    const context = environment.context;
    const sequenceId = this.cachedSequenceIds[0];
    const sequenceType = this.pk.gqlQuerySync(
      `{document(id: "${context.document.id}") {sequence(id:"${sequenceId}") {type} } }`
    ).data.document.sequence.type;
    let documentResult = {};
    let currentChapter = null;
    let currentChapterContext = null;
    let currentVerse = null;
    let blocksIdsToRender = [];
    if (sequenceType === "main") {
      if (environment.workspace.blockId) {
        blocksIdsToRender = environment.workspace.blockId;
      }
    }

    let numberBlockTorender = 0;
    if (sequenceType === "main") {
      if (environment.workspace.chapters) {
        while (environment.workspace.chapters.length > 0) {
          currentChapter = environment.workspace.chapters.shift();

          if (environment.workspace.verses) {

            while (environment.workspace.verses.length > 0) {

              currentVerse = environment.workspace.verses.shift();
              if (currentChapter && currentVerse) {
                currentChapterContext = this.pk
                  .gqlQuerySync(
                    `{document(id: "${context.document.id}") {cvIndex(chapter: ${currentChapter}) {
                              verses {
                                verse {
                                    startBlock
                                    endBlock
                                    verseRange}}}}}`
                  )
                  .data.document.cvIndex.verses.filter((e) =>
                    e.verse.some((v) => v.verseRange === currentVerse)
                  );
              }
            
              if (currentChapter && currentVerse && currentChapterContext) {
                if (
                  typeof currentChapterContext[0].verse[0].startBlock ===
                    typeof 0 &&
                  typeof currentChapterContext[0].verse[0].endBlock === typeof 0
                ) {
                  for (
                    let i = currentChapterContext[0].verse[0].startBlock;
                    i < currentChapterContext[0].verse[0].endBlock + 1;
                    i++
                  ) {
                    blocksIdsToRender.push(i);
                  }
                } else {
                  throw new Error(
                    `Chapter '${currentChapter} with ${currentVerse}' not found in document`
                  );
                }
              }

              environment.workspace.blockId = blocksIdsToRender;
            }
            environment.workspace.verses = [...environment.config.verses];
          } else {
            if (currentChapter) {
              currentChapterContext = this.pk
                .gqlQuerySync(`{document(id: "${context.document.id}") {cIndex(chapter: ${currentChapter}) {
                          startBlock
                          endBlock
                        }}}`);
            }

            if (currentChapter && currentChapterContext) {
              if (
                typeof currentChapterContext.data.document.cIndex.startBlock ===
                  typeof 0 &&
                typeof currentChapterContext.data.document.cIndex.endBlock ===
                  typeof 0
              ) {
                for (
                  let i = currentChapterContext.data.document.cIndex.startBlock;
                  i < currentChapterContext.data.document.cIndex.endBlock + 1;
                  i++
                ) {
                  blocksIdsToRender.push(i);
                }
              } else {
                throw new Error(
                  `Chapter '${currentChapter}' not found in document`
                );
              }
            }

            environment.workspace.blockId = blocksIdsToRender;
          }
        }
      } else {
        let nb = this.pk.gqlQuerySync(
          `{document(id: "${context.document.id}") {sequence(id:"${sequenceId}") {nBlocks} }}`
        ).data.document.sequence.nBlocks;
        for (let i = 0; i < nb; i++) {
          blocksIdsToRender.push(i);
        }
      }
      blocksIdsToRender.sort((a, b) => b - a);

      if (!environment.workspace.nbBlock) {
        environment.workspace.nbBlock = blocksIdsToRender.length;
      }
    } else {
      let nb = this.pk.gqlQuerySync(
        `{document(id: "${context.document.id}") {sequence(id:"${sequenceId}") {nBlocks} }}`
      ).data.document.sequence.nBlocks;
      for (let i = 0; i < nb; i++) {
        blocksIdsToRender.push(i);
      }
    }

    if (sequenceType === "main") {
      numberBlockTorender = environment.workspace.nbBlock;
    } else {
      numberBlockTorender = blocksIdsToRender.length;
    }
    documentResult = this.pk.gqlQuerySync(
      `{document(id: "${context.document.id}") {id sequence(id:"${sequenceId}") {id type nBlocks blocks(positions: [${blocksIdsToRender}]){ os {payload} is {payload} } } } }`
    );
    const sequence = documentResult.data.document.sequence;

    if (!sequence) {
      throw new Error(
        `Sequence '${sequenceId}' not found in renderSequenceId()`
      );
    }

    context.sequences.unshift(this.sequenceContext(sequence, sequenceId));
    this.renderEvent("startSequence", environment);
    let outputBlockN = 0;

    for (let i = 0; i < numberBlockTorender; i++) {
      if (blocksIdsToRender.length !== 0) {
        let inputBlockN = {};
        if (sequenceType === "main") {
          inputBlockN = blocksIdsToRender.pop();
        } else {
          inputBlockN = blocksIdsToRender.shift();
        }

        let blocksResult;
        if (environment.config.excludeScopeTypes) {
          if (environment.config.excludeScopeTypes.length > 0) {
            const scopeTypes = environment.config.excludeScopeTypes.map(
              (elem) => `"${elem}"`
            );
            blocksResult = this.pk.gqlQuerySync(
              `{
                   document(id: "${context.document.id}") {
                     sequence(id:"${sequenceId}") {
                       blocks(positions:${inputBlockN}) {
                         bg {subType payload}
                         bs {payload}
                         items (excludeScopeTypes : [${scopeTypes}] ) {type subType payload}
                       }        
                     }
                   }
                 }`
            );
          } else {
            blocksResult = this.pk.gqlQuerySync(
              `{
                   document(id: "${context.document.id}") {
                     sequence(id:"${sequenceId}") {
                       blocks(positions:${inputBlockN}) {
                         bg {subType payload}
                         bs {payload}
                         items{type subType payload}
                       }
                     }
                   }
                 }`
            );
          }
        } else {
          blocksResult = this.pk.gqlQuerySync(
            `{
                   document(id: "${context.document.id}") {
                     sequence(id:"${sequenceId}") {
                       blocks(positions:${inputBlockN}) {
                         bg {subType payload}
                         bs {payload}
                         items {type subType payload}
                       }
                     }
                   }
                 }`
          );
        }
        const blockResult = blocksResult.data.document.sequence.blocks[0];
        for (const blockGraft of blockResult.bg) {
          context.sequences[0].block = {
            type: "graft",
            subType: camelCaseToSnakeCase(blockGraft.subType),
            blockN: outputBlockN,
            sequence: this.sequences[blockGraft.payload],
          };
          this.cachedSequenceIds.unshift(blockGraft.payload);
          this.renderEvent("blockGraft", environment);
          this.cachedSequenceIds.shift();
          outputBlockN++;
        }
        const subTypeValues = blockResult.bs.payload.split("/");
        let subTypeValue;
        if (subTypeValues[1] && ["tr", "zrow"].includes(subTypeValues[1])) {
          subTypeValue = subTypeValues[1] === "tr" ? "usfm:tr" : "pk";
        } else if (subTypeValues[1]) {
          subTypeValue = `usfm:${subTypeValues[1]}`;
        } else {
          subTypeValue = subTypeValues[0];
        }
        context.sequences[0].block = {
          type: ["usfm:tr", "pk"].includes(subTypeValue) ? "row" : "paragraph",
          subType: subTypeValue,
          blockN: outputBlockN,
          wrappers: [],
        };
        if (context.sequences[0].block.type === "row") {
          if (!environment.workspace.inTable) {
            this.renderEvent(`startTable`, environment);
            environment.workspace.inTable = true;
          }

          this.renderEvent("startRow", environment);
        } else {
          if (
            environment.workspace.inTable &&
            context.sequences[0].type.includes("main")
          ) {
            this.renderEvent(`endTable`, environment);
            environment.workspace.tableHasContent = false;
            environment.workspace.inTable = false;
            environment.workspace.skipEndRow = false;
          }
          this.renderEvent("startParagraph", environment);
        }
        this._tokens = [];
        if (sequenceType === "main" && this.currentCV.chapter) {
          const wrapper = {
            type: "wrapper",
            subType: "chapter",
            atts: {
              number: this.currentCV.chapter,
            },
          };
          environment.context.sequences[0].element = wrapper;
          environment.context.sequences[0].block.wrappers.unshift(
            wrapper.subType
          );
          this.renderEvent("startWrapper", environment);
        }
        if (sequenceType === "main" && this.currentCV.verses) {
          const wrapper = {
            type: "wrapper",
            subType: "verses",
            atts: {
              number: this.currentCV.verses,
            },
          };
          environment.context.sequences[0].element = wrapper;
          environment.context.sequences[0].block.wrappers.unshift(
            wrapper.subType
          );
          this.renderEvent("startWrapper", environment);
        }
        this.renderContent(blockResult.items, environment);

        this._tokens = [];
        if (sequenceType === "main" && this.currentCV.verses) {
          const wrapper = {
            type: "wrapper",
            subType: "verses",
            atts: {
              number: this.currentCV.verses,
            },
          };
          environment.context.sequences[0].element = wrapper;
          environment.context.sequences[0].block.wrappers.shift();
          this.renderEvent("endWrapper", environment);
        }
        if (sequenceType === "main" && this.currentCV.chapter) {
          const wrapper = {
            type: "wrapper",
            subType: "chapter",
            atts: {
              number: this.currentCV.chapter,
            },
          };
          environment.context.sequences[0].element = wrapper;
          environment.context.sequences[0].block.wrappers.shift();
          this.renderEvent("endWrapper", environment);
        }
        if (
          context.sequences[0].block.type === "row" &&
          !environment.workspace.skipEndRow
        ) {
          this.renderEvent("endRow", environment);
        } else if (
          environment.workspace.skipEndRow &&
          context.sequences[0].block.type === "row"
        ) {
          environment.workspace.skipEndRow = false;
        } else {
          this.renderEvent("endParagraph", environment);
        }
        delete context.sequences[0].block;
        outputBlockN++;
      }
    }
    if (
      environment.workspace.inTable &&
      context.sequences[0].type.includes("main")
    ) {
      this.renderEvent(`endTable`, environment);
      environment.workspace.tableHasContent = false;
      environment.workspace.inTable = false;
      environment.workspace.skipEndRow = false;
    }
    this.renderEvent("endSequence", environment);
    if (sequenceType === "main") {
      environment.workspace.blockId = blocksIdsToRender;
    }
    context.sequences.shift();
  }

  renderContent(items, environment) {
    for (let i = 0; i < items.length; i++) {
      this.renderItem(items[i], environment);
    }
    this.maybeRenderText(environment);
  }

  renderItem(item, environment) {
    if (item.type === "scope" && item.payload.startsWith("attribute")) {
      const scopeBits = item.payload.split("/");
      if (item.subType === "start") {
        if (!this._container) {
          this._container = {
            direction: "start",
            subType: `usfm:w`,
            type: "wrapper",
            atts: {},
          };
        }
        if (scopeBits[3] in this._container.atts) {
          this._container.atts[scopeBits[3]].push(scopeBits[5]);
        } else {
          this._container.atts[scopeBits[3]] = [scopeBits[5]];
        }
      } else {
        if (!this._container) {
          this._container = {
            direction: "end",
            subType: `usfm:${camelCaseToSnakeCase(scopeBits[2])}`,
          };
          if (scopeBits[1] !== "milestone") {
            this._container.type = "wrapper";
            this._container.atts = {};
          }
        }
      }
    } else {
      if (this._container) {
        this.maybeRenderText(environment);
        this.renderContainer(environment);
        if (item.payload.includes("spanWith")) {
          this.maybeRenderText(environment);
          return;
        }
      }
      if (item.type === "token") {
        this._tokens.push(item.payload.replace(/[\r\n\t ]+/g, " "));
      } else if (item.type === "graft") {
        this.maybeRenderText(environment);
        const graft = {
          type: "graft",
          subType: camelCaseToSnakeCase(item.subType),
          sequence: this.sequences[item.payload],
        };
        environment.context.sequences[0].element = graft;
        this.cachedSequenceIds.unshift(item.payload);
        this.renderEvent("inlineGraft", environment);
        this.cachedSequenceIds.shift();
        delete environment.context.sequences[0].element;
      } else {
        // scope
        this.maybeRenderText(environment);
        const scopeBits = item.payload.split("/");
        if (["chapter", "verses"].includes(scopeBits[0])) {
          const wrapper = {
            type: "wrapper",
            subType: camelCaseToSnakeCase(scopeBits[0]),
            atts: {
              number: scopeBits[1],
            },
          };
          environment.context.sequences[0].element = wrapper;
          if (item.subType === "start") {
            if (
              environment.workspace.tableHasContent &&
              environment.workspace.inTable
            ) {
              this.renderEvent(`endRow`, environment);
              this.renderEvent(`endTable`, environment);
              environment.workspace.tableHasContent = false;
              environment.workspace.inTable = false;
              environment.workspace.skipEndRow = true;
            }
            this.currentCV[scopeBits[0]] = scopeBits[1];
            environment.context.sequences[0].block.wrappers.unshift(
              wrapper.subType
            );
            this.renderEvent(
              `start${scopeBits[0] === "chapter" ? "Chapter" : "Verses"}`,
              environment
            );
            this.renderEvent("startWrapper", environment);
            const cvMark = {
              type: "mark",
              subType: `${scopeBits[0]}_label`,
              atts: {
                number: scopeBits[1],
              },
            };
            environment.context.sequences[0].element = cvMark;
            this.renderEvent("mark", environment);
            environment.context.sequences[0].element = wrapper;
          } else {
            this.renderEvent("endWrapper", environment);
            this.renderEvent(
              `end${scopeBits[0] === "chapter" ? "Chapter" : "Verses"}`,
              environment
            );

            environment.context.sequences[0].block.wrappers.shift();
            delete environment.context.sequences[0].element;
            this.currentCV[scopeBits[0]] = null;
          }
        } else if (
          ["pubChapter", "pubVerse", "altChapter", "altVerse"].includes(
            scopeBits[0]
          )
        ) {
          if (item.subType === "start") {
            const mark = {
              type: "mark",
              subType: camelCaseToSnakeCase(scopeBits[0]),
              atts: {
                number: scopeBits[1],
              },
            };
            environment.context.sequences[0].element = mark;
            this.renderEvent("mark", environment);
            delete environment.context.sequences[0].element;
          }
        } else if (scopeBits[0] === "span") {
          const wrapper = {
            type: "wrapper",
            subType: `usfm:${scopeBits[1]}`,
            atts: {},
          };

          environment.context.sequences[0].element = wrapper;
          if (item.subType === "start") {
            environment.context.sequences[0].block.wrappers.unshift(
              wrapper.subType
            );
            this.renderEvent("startWrapper", environment);
          } else {
            this.renderEvent("endWrapper", environment);
            environment.context.sequences[0].block.wrappers.shift();
          }
          delete environment.context.sequences[0].element;
        } else if (scopeBits[0] === "spanWithAtts") {
          if (item.subType === "start") {
            this._container = {
              direction: "start",
              type: "wrapper",
              subType: `usfm:${scopeBits[1]}`,
              atts: {},
            };
          } else {
            const wrapper = {
              type: "wrapper",
              subType: `usfm:${scopeBits[1]}`,
              atts: {},
            };
            if (item.payload.includes("spanWith")) {
            }
            environment.context.sequences[0].element = wrapper;
            this.renderEvent("endWrapper", environment);
            environment.context.sequences[0].block.wrappers.shift();
          }
        } else if (scopeBits[0] === "cell") {
          const wrapper = {
            direction: "start",
            type: "wrapper",
            subType: scopeBits[0],
            atts: {
              role: scopeBits[1],
              alignment: scopeBits[2],
              nCols: parseInt(scopeBits[3]),
            },
          };
          environment.context.sequences[0].element = wrapper;
          if (item.subType === "start") {
            environment.context.sequences[0].block.wrappers.unshift(
              wrapper.subType
            );
            this.renderEvent("startWrapper", environment);
          } else {
            this.renderEvent("endWrapper", environment);
            environment.context.sequences[0].block.wrappers.shift();
          }
          delete environment.context.sequences[0].element;
        } else if (scopeBits[0] === "milestone" && item.subType === "start") {
          if (scopeBits[1] === "ts") {
            const mark = {
              type: "mark",
              subType: `usfm:${camelCaseToSnakeCase(scopeBits[1])}`,
              atts: {},
            };
            environment.context.sequences[0].element = mark;
            this.renderEvent("mark", environment);
            delete environment.context.sequences[0].element;
          } else {
            this._container = {
              type: "start_milestone",
              subType: `usfm:${camelCaseToSnakeCase(scopeBits[1])}`,
              atts: {},
            };
          }
        } else if (scopeBits[0] === "milestone") {
          // End milestone
          this._container = {
            type: "end_milestone",
            subType: `usfm:${camelCaseToSnakeCase(scopeBits[1])}`,
            atts: {},
          };
        }
      }
    }
  }

  maybeRenderText(environment) {
    if (this._tokens.length === 0) {
      return;
    }
    const elementContext = {
      type: "text",
      text: this._tokens.join(""),
    };
    environment.context.sequences[0].element = elementContext;
    this._tokens = [];
    this.renderEvent("text", environment);
    if (environment.workspace.inTable) {
      environment.workspace.tableHasContent = true;
    }
    delete environment.context.sequences[0].element;
  }

  renderContainer(environment) {
    if (this._container.type === "wrapper") {
      const direction = this._container.direction;
      delete this._container.direction;
      if (direction === "start") {
        environment.context.sequences[0].element = this._container;
        environment.context.sequences[0].block.wrappers.unshift(
          this._container.subType
        );
        this.renderEvent("startWrapper", environment);
        delete environment.context.sequences[0].element;
      } else {
        environment.context.sequences[0].element = this._container;
        this.renderEvent("endWrapper", environment);
        environment.context.sequences[0].block.wrappers.shift();
        delete environment.context.sequences[0].element;
      }
    } else if (this._container.type === "start_milestone") {
      environment.context.sequences[0].element = this._container;
      this.renderEvent("startMilestone", environment);
      delete environment.context.sequences[0].element;
    } else if (this._container.type === "end_milestone") {
      environment.context.sequences[0].element = this._container;
      this.renderEvent("endMilestone", environment);
      delete environment.context.sequences[0].element;
      this._container = null;
    }
    this._container = null;
  }
}

module.exports = SofriaRenderFromProskomma;
