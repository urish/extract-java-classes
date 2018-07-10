const { parse } = require('java-ast');
const {
  ClassDeclarationContext,
  MethodDeclarationContext,
  ConstructorDeclarationContext,
} = require('java-ast/dist/parser/JavaParser');
const { ParseTreeWalker } = require('antlr4ts/tree');
const { Replacement, applyReplacements } = require('typewiz-core/dist/replacement');

function extractClasses(source) {
  const ast = parse(source);
  const classes = [];
  ParseTreeWalker.DEFAULT.walk(
    {
      enterEveryRule(rule) {
        if (rule instanceof ClassDeclarationContext) {
          classes.push(source.substr(rule.start.startIndex, rule.stop.stopIndex).trim());
        }
      },
    },
    ast,
  );
  return classes;
}

function stripMethodBodies(methodSource) {
  const ast = parse(methodSource);
  const replacements = [];
  ParseTreeWalker.DEFAULT.walk(
    {
      enterEveryRule(rule) {
        try {
          if (rule instanceof MethodDeclarationContext) {
            const methodBody = rule.methodBody();
            if (methodBody) {
              let { startIndex } = methodBody.start;
              while (' \t\n\r'.includes(methodSource[startIndex - 1])) {
                startIndex--;
              }
              replacements.push(new Replacement(startIndex, methodBody.stop.stopIndex + 1, ';'));
            }
          }
          if (rule instanceof ConstructorDeclarationContext) {
            const { parent } = rule.parent;
            replacements.push(
              Replacement.delete(parent.start.startIndex, parent.stop.stopIndex + 1),
            );
          }
        } catch (err) {
          console.error('Parsing failed', err);
        }
      },
    },
    ast,
  );
  return applyReplacements(methodSource, replacements);
}

module.exports = {
  extractClasses,
  stripMethodBodies,
};
