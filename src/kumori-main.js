#!/usr/bin/env node
"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const program = require("commander");
const logger = require("./logger");
const utils_1 = require("./utils");
const workspace_1 = require("./workspace");
const pkg = require("../package.json");
module.exports = function (argv) {
    program
        .version(pkg.version)
        .command('component', 'Manages components')
        .command('deployment', 'Manages deployments')
        .command('resource', 'Manages resources')
        .command('runtime', 'Manages runtimes')
        .command('service', 'Manages services')
        .command('set', 'Manages workspace configuration parameters')
        .command('stamp', 'Manages stamps');
    program
        .command('init')
        .description('Populates the current folder with the worspace folders structure')
        .action(() => {
        utils_1.run(() => __awaiter(this, void 0, void 0, function* () {
            if (workspace_1.workspace.isValidWorkspace()) {
                logger.info("Workspace already created");
            }
            else {
                workspace_1.workspace.init();
            }
        }));
    });
    program
        .parse(process.argv);
};
//# sourceMappingURL=kumori-main.js.map