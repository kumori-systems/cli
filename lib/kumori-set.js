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
const workspace_1 = require("./workspace");
const utils_1 = require("./utils");
program
    .command('domain <domain>')
    .description('Changes the default domain used in the workspace elements')
    .action((domain) => {
    utils_1.run(() => __awaiter(this, void 0, void 0, function* () {
        logger.info(`Seting default domain to ${domain}`);
        yield workspace_1.workspace.config.setDefaultDomain(domain);
        logger.info(`New domain set`);
    }));
});
utils_1.executeProgram(program);
// program.parse(process.argv);
