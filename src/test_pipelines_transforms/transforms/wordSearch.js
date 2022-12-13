import PerfRenderFromJson from '../../../src/PerfRenderFromJson';
import xre from "xregexp";
const splitWords = xre('([\\p{Letter}\\p{Number}\\p{Mark}\\u2060]{1,127})');

const localWordSearchActions = {
    startDocument: [
        {
            description: "Set up state variables and output",
            test: () => true,
            action: ({config, context, workspace, output}) => {
                workspace.chapter = null;
                workspace.verses = null;
                workspace.matches = new Set([]);
                workspace.chunks = [];
                if (config.regex) {
                    workspace.regex = new RegExp(config.toSearch, config.regexFlags);
                }
            }
        },
    ],
    mark: [
        {
            description: "Update CV state",
            test: () => true,
            action: ({config, context, workspace, output}) => {
                const element = context.sequences[0].element;
                if (element.subType === 'chapter') {
                    doSearch(workspace, config);
                    workspace.chapter = element.atts['number'];
                    workspace.chunks = [];
                } else if (element.subType === 'verses') {
                    doSearch(workspace, config);
                    workspace.verses = element.atts['number'];
                    workspace.chunks = [];
                }
            }
        },
    ],
    text: [
        {
            description: "Add matching verses to set",
            test: ({context, workspace}) => workspace.chapter && workspace.verses,
            action: ({config, context, workspace, output}) => {
                const text = context.sequences[0].element.text;
                workspace.chunks.push(text);
            }
        },
    ],
    endDocument: [
        {
            description: "Sort matches",
            test: () => true,
            action: ({config, context, workspace, output}) => {
                output.bookCode = context?.document?.metadata?.document?.bookCode || '';
                output.searchTerms = Array.isArray(config.toSearch) ? config.toSearch.join(' ') : config.toSearch;
                output.options = [];
                if (config.ignoreCase) {
                  output.options.push('ignoreCase');
                }
                if (config.andLogic) {
                  output.options.push('andLogic');
                }
                if (config.orLogic) {
                  output.options.push('orLogic');
                }
                if (config.partialMatch) {
                    output.options.push('partialMatch');
                }
                if (config.regex) {
                    output.options.push('regex');
                }
                doSearch(workspace, config);
                output.matches = Array.from(workspace.matches)
                    .sort((a, b) => ((a.chapter * 1000) + a.verses) - ((b.chapter * 1000) + b.verses))
            }
        },
    ],
};

const addMatch = function(workspace, config) {
    const match = {
        chapter: workspace.chapter,
        verses: workspace.verses,
        content: []
    };

    let search = config.toSearch;
    const config_ = {
      ...config,
      andLogic: false, // for highlighting we match any found
    }
    
    let text = workspace.chunks.join('');
    const words = xre.split(text, splitWords);
    
    for (const value of words) {
      if (value) {
        const found = findMatch(config_, value, search, workspace);
        if (found) {
          match.content.push({
            type: "wrapper",
            subtype: "x-search-match",
            content: [
              value
            ]
          });
        } else {
          match.content.push(value);
        }
      }
    }
    workspace.matches.add( match );
}

function findMatch(config, text, search, workspace) {
    if (config.regex) {
        return workspace.regex.test(text);
    } 
    
    const isSearchArray = Array.isArray(search);
    if (config.ignoreCase) {
    text = text.toLowerCase();
    if (isSearchArray) {
      search = search.map(item => item.toLowerCase());
    } else {
      search = search.toLowerCase();
    }
  }

  if (!isSearchArray) {
    search = [search];
  }
  
  if (!config.partialMatch) { // if word search, we separate text into array of words to match
    const words = xre.split(text, splitWords);
    text = words;
  }
  
  let allMatched = true;
  let anyMatched = false;
  for (const searchTerm of search) {
    const found = text.includes(searchTerm);
    if (!found) {
      allMatched = false;
    } else {
      anyMatched = true;
    }
  }
  if (config.andLogic) {
    return allMatched;
  } else { // doing or logic
    return anyMatched;
  }
}

const doSearch = function(workspace, config){
    if (workspace.chunks.length) {
        let text = workspace.chunks.join(''); 
        
        let search_ = config.toSearch;
        const found = findMatch(config, text, search_, workspace);
        if (found) {
            addMatch(workspace, config);
        }
    }
}

const wordSearchCode = function ({perf, searchString, ignoreCase = '1', logic = '', regex = '0', partialMatch = '0'}) {
    const cl = new PerfRenderFromJson({srcJson: perf, actions: localWordSearchActions});
    const output = {};
    const ignoreCase_ = ignoreCase.trim() === '1';
    logic = logic.trim().substring(0,1).toUpperCase();
    const andLogic_ = logic === 'A';
    const orLogic_ = logic === 'O';
    const partialMatch_ = partialMatch && partialMatch.trim() === '1';
    let regex_ = regex.trim() === '1';
    let toSearch = searchString.trim();
    if (!regex_) {
      if (toSearch.includes('?') || toSearch.includes('*')) { // check for wildcard characters
        let newSearch = toSearch.replaceAll('?', '\\S{1}');
        newSearch = newSearch.replaceAll('*', '\\S*');
        if (!partialMatch_) {
          newSearch = '\\b' + newSearch + '\\b';
        }
        toSearch = '/' + newSearch + '/';
      }
    }
    
    let regexFlags = '';
    if ( toSearch.startsWith('/') && toSearch.includes('/', 2) ) {
        regex_ = true;
        const regexParts = toSearch.split('/');
        toSearch = regexParts[1];
        regexFlags = regexParts[2];

        if (ignoreCase_ && ! regexFlags.includes('i')) {
          regexFlags += 'i';
        }
    } else if ((andLogic_ || orLogic_) && toSearch) {
      toSearch = toSearch.split(' ');
    }

    cl.renderDocument({
        docId: "",
        config: {
            toSearch,
            ignoreCase: ignoreCase_,
            andLogic: andLogic_,
            orLogic: orLogic_,
            partialMatch: partialMatch_,
            regex: regex_,
            regexFlags
        },
        output});
    return {matches: output};
}

const wordSearch = {
    name: "wordSearch",
    type: "Transform",
    description: "PERF=>JSON: Searches for a word",
    inputs: [
        {
            name: "perf",
            type: "json",
            source: ""
        },
        {
            name: "searchString",
            type: "text",
            source: ""
        },
        {
            name: "ignoreCase", // expect '1' to enable case insensitive, otherwise we do case sensitive searching
            type: "text",
            source: ""
        },
        {
            name: "regex", // expect '1' to enable
            type: "text",
            source: ""
        },
        {
            name: "logic", // expect 'A' to enable AND logic, 'O' to enable OR logic, default is exact match search string
            type: "text",
            source: ""
        },
        {
            name: "partial", // expect '1' to enable partial match of words/string, otherwise we do full word matching
            type: "text",
            source: ""
        },
    ],
    outputs: [
        {
            name: "matches",
            type: "json",
        }
    ],
    code: wordSearchCode
}
export default wordSearch;
