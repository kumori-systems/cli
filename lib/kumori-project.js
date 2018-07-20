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
let defaultDomain = workspace_1.workspace.configManager.config.domain;
let defaultTemplate = workspace_1.workspace.configManager.config.project.template;
program
    .command('add <name>')
    .description('Populates the workspace with a project elements. A project might include components, resoureces, services, runtimes and deployments')
    .option('-d, --company-domain <company-domain>', 'The project domain', defaultDomain)
    .option('-t, --template <template>', 'The project template', defaultTemplate)
    .action((name, { companyDomain, template }) => {
    utils_1.run(() => __awaiter(this, void 0, void 0, function* () {
        logger.info(`Populating workspace with project using template "${template}", name "${name}" and domain "${companyDomain}"`);
        yield workspace_1.workspace.projects.add(name, companyDomain, template);
        logger.info(`Workspace populated.`);
    }));
});
utils_1.executeProgram(program);
