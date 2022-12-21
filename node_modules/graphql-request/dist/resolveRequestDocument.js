"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.resolveRequestDocument = void 0;
var graphql_1 = require("graphql");
/**
 * helpers
 */
function extractOperationName(document) {
    var _a;
    var operationName = undefined;
    var operationDefinitions = document.definitions.filter(function (definition) { return definition.kind === 'OperationDefinition'; });
    if (operationDefinitions.length === 1) {
        operationName = (_a = operationDefinitions[0].name) === null || _a === void 0 ? void 0 : _a.value;
    }
    return operationName;
}
function resolveRequestDocument(document) {
    if (typeof document === 'string') {
        var operationName_1 = undefined;
        try {
            var parsedDocument = (0, graphql_1.parse)(document);
            operationName_1 = extractOperationName(parsedDocument);
        }
        catch (err) {
            // Failed parsing the document, the operationName will be undefined
        }
        return { query: document, operationName: operationName_1 };
    }
    var operationName = extractOperationName(document);
    return { query: (0, graphql_1.print)(document), operationName: operationName };
}
exports.resolveRequestDocument = resolveRequestDocument;
//# sourceMappingURL=resolveRequestDocument.js.map