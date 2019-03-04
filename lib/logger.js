"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function log(msg) {
    console.log(msg);
}
exports.log = log;
function error(msg) {
    log(`\x1b[31mError: ${msg}\x1b[0m`);
}
exports.error = error;
function warn(msg) {
    log(`Warning: ${msg}`);
}
exports.warn = warn;
function info(msg) {
    log(msg);
}
exports.info = info;
function debug(msg) {
    log(`Debug: ${msg}`);
}
exports.debug = debug;
function silly(msg) {
    log(`Silly: ${msg}`);
}
exports.silly = silly;
