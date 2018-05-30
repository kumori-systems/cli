"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vm = require("vm");
const fs = require("fs");
function getJSON(filepath) {
    const jsonString = "g = " + fs.readFileSync(filepath, 'utf8') + "; g";
    return (new vm.Script(jsonString)).runInNewContext();
}
exports.getJSON = getJSON;
function checkParameter(param, errorMessage) {
    if ((param == null) || (param == undefined)) {
        throw new Error(errorMessage);
    }
}
exports.checkParameter = checkParameter;
function checkIsNumber(param, errorMessage, min, max) {
    let value = parseInt(param);
    if (isNaN(value) || (value < min) || (value > max)) {
        throw new Error(errorMessage);
    }
}
exports.checkIsNumber = checkIsNumber;
//# sourceMappingURL=utils.js.map