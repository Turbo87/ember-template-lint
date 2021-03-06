'use strict';

const Rule = require('./base');

module.exports = class NoMultipleEmptyLines extends Rule {
  parseConfig(config) {
    return config || {};
  }

  visitor() {
    // Swallow the final newline, as some editors add it automatically and we don't want it to cause an issue
    let allLines =
      this.source[this.source.length - 1] === '' ? this.source.slice(0, -1) : this.source;

    let first = true;

    return {
      Program: {
        exit() {
          if (!first) {
            return;
          }

          let max = 'max' in this.config ? this.config.max : 1;

          allLines

            // Given a list of lines, first get a list of line numbers that are non-empty.
            .reduce((nonEmptyLineNumbers, line, index) => {
              if (line.trim()) {
                nonEmptyLineNumbers.push(index + 1);
              }
              return nonEmptyLineNumbers;
            }, [])

            // Add a value at the end to allow trailing empty lines to be checked.
            .concat(allLines.length + 1)

            // Given two line numbers of non-empty lines, report the lines between if the difference is too large.
            .reduce((lastLineNumber, lineNumber) => {
              if (lineNumber - lastLineNumber - 1 > max) {
                let message = `More than ${max} blank ${max === 1 ? 'line' : 'lines'} not allowed.`;

                let loc = {
                  start: { line: lastLineNumber + max, column: 0 },
                  end: { line: lineNumber, column: 0 },
                };

                this.log({
                  message,
                  line: loc.start.line,
                  column: loc.start.column,
                  source: this.sourceForLoc(loc),
                });
              }

              return lineNumber;
            }, 0);

          first = false;
        },
      },
    };
  }
};
