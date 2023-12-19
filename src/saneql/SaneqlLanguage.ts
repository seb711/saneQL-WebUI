import { Monaco } from "@monaco-editor/react";

export class SaneqlLanguage {

  static registered: boolean = false;

  static register(monaco: Monaco): boolean {
    if (this.registered) {
      return false;
    }

    const def = {
      keywords: ["let","defun","null","true","false"],
      builtins: [
        "filter","join","groupby","aggregate","distinct","orderby",
        "map","project","projectout","as","alias","union","except","intersect","window",
        "asc","desc","collate","is","between","in","like","substr","extract",
      ],
      constants: [
        "function","leftassoc","rightassoc","operator",
        "inner","left","leftouter","right","rightouter","full",
        "fullouter","leftsemi","exists","rightsemi","leftanti",
        "notexists","rightanti"
      ],
      operators: ["&&", "||", "!", "!="],
      types: ["integer", "boolean", "date", "interval", "text", "table"]
    };

    monaco.languages.register({id: 'saneql'});
    // adapted from https://microsoft.github.io/monaco-editor/monarch.html
    monaco.languages.setMonarchTokensProvider('saneql', {
      ignoreCase: true,
      keywords: [...def.keywords, ...def.builtins, ...def.constants],
      operators: [...def.operators],
      typeKeywords: [...def.types],
      // C# style strings
      escapes: /\\(?:[abfnrtv\\']|x[0-9A-Fa-f]{1,4}|u[0-9A-Fa-f]{4}|U[0-9A-Fa-f]{8})/,
      symbols: /[=><!~?:&|+\-*\/\^%]+/,

      // The main tokenizer for our languages
      tokenizer: {
        root: [
          // identifiers and keywords
          [/[a-z_$][\w$]*/, { cases: { '@typeKeywords': 'keyword',
                                       '@keywords': 'keyword',
                                       '@default': 'identifier' } }],
          [/[A-Z][\w\$]*/, 'type.identifier' ],  // to show class names nicely

          // whitespace
          { include: '@whitespace' },

          // delimiters and operators
          [/[{}()\[\]]/, '@brackets'],
          [/[<>](?!@symbols)/, '@brackets'],
          [/@symbols/, { cases: { '@operators': 'operator',
                                  '@default'  : '' } } ],

          // @ annotations.
          // As an example, we emit a debugging log message on these tokens.
          // Note: message are supressed during the first load -- change some lines to see them.
          [/@\s*[a-zA-Z_\$][\w\$]*/, { token: 'annotation', log: 'annotation token: $0' }],

          // numbers
          [/\d*\.\d+([eE][\-+]?\d+)?/, 'number.float'],
          [/0[xX][0-9a-fA-F]+/, 'number.hex'],
          [/\d+/, 'number'],

          // delimiter: after number because of .\d floats
          [/[;,.]/, 'delimiter'],

          // strings
          [/'([^'\\]|\\.)*$/, 'string.invalid' ],  // non-teminated string
          [/'/,  { token: 'string.quote', bracket: '@open', next: '@string' } ],
        ],

        comment: [
          [/[^\-*]+/, 'comment' ],
        ],

        string: [
          [/[^\\']+/,  'string'],
          [/@escapes/, 'string.escape'],
          [/\\./,      'string.escape.invalid'],
          [/'/,        { token: 'string.quote', bracket: '@close', next: '@pop' } ]
        ],

        whitespace: [
          [/[ \t\r\n]+/, 'white'],
          [/\/\*/,       'comment', '@comment' ],
          [/\/\/.*$/,    'comment'],
        ],
      },
    });

    // TODO implement completions for saneql as well
    // monaco.languages.registerCompletionItemProvider('saneql', {
    // });

    this.registered = true;
    return true;
  }
}
