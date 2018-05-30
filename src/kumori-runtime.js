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
const index_1 = require("./workspace/index");
const utils_1 = require("./utils");
let defaultDomain = index_1.workspace.components.configManager.config.domain;
let defaultTemplate = index_1.workspace.components.configManager.config.runtime.template;
let defaultParent = index_1.workspace.components.configManager.config.runtime.parent;
let defaultFolder = index_1.workspace.components.configManager.config.runtime.folder;
let defaultEntrypoint = index_1.workspace.components.configManager.config.runtime.entrypoint;
let defaultStamp = index_1.workspace.components.configManager.config.defaultStamp.name;
program
    .command('add <name>')
    .description('Adds a new runtime to the workspace')
    .option('-d, --company-domain <company-domain>', 'The runtime domain', defaultDomain)
    .option('-p, --parent-runtime <parent-runtime>', 'The URN of parent of this runtime', defaultParent)
    .option('-c, --component-folder <component>', 'The folder where the component code will be deployed', defaultFolder)
    .option('-e, --entrypoint <entrypoint>', 'The new runtime entrypoint', defaultEntrypoint)
    .option('-t, --template <template>', 'The runtime template', defaultTemplate)
    .action((name, { companyDomain, parentRuntime, componentFolder, entrypoint, template }) => {
    utils_1.run(() => __awaiter(this, void 0, void 0, function* () {
        logger.info(`Adding runtime ${name} in ${companyDomain} using template ${template}`);
        let info = yield index_1.workspace.runtimes.add(name, companyDomain, parentRuntime, componentFolder, entrypoint, template);
        logger.info(`Runtime ${info.urn} created in ${info.path}`);
    }));
});
program
    .command('build <name>')
    .description('Creates a distributable version of the runtime')
    .option('-d, --company-domain <company-domain>', 'The runtime domain', defaultDomain)
    .action((name, { companyDomain }) => {
    utils_1.run(() => __awaiter(this, void 0, void 0, function* () {
        logger.info(`Bundeling runtime ${name} from ${companyDomain}`);
        let path = yield index_1.workspace.runtimes.build(name, companyDomain);
        logger.info(`Distributable bundle created in ${path}`);
    }));
});
program
    .command('register <name>')
    .description('Registers a runtime in a stamp')
    .option('-d, --company-domain <company-domain>', 'The runtime domain', defaultDomain)
    .option('-s, --stamp <stamp>', 'The target stamp', defaultStamp)
    .action((name, { companyDomain, stamp }) => {
    utils_1.run(() => __awaiter(this, void 0, void 0, function* () {
        logger.info(`Registering in stamp ${stamp} runtime ${name} from ${companyDomain}`);
        let version = yield index_1.workspace.runtimes.register(name, companyDomain, stamp);
        logger.info(`Version ${version} registered`);
    }));
});
program
    .command('remove <name>')
    .description('Removes an existing runtime from the workspace')
    .option('-d, --company-domain <company-domain>', 'The runtime domain', defaultDomain)
    .action((name, { companyDomain }) => {
    utils_1.run(() => __awaiter(this, void 0, void 0, function* () {
        logger.info(`Removing runtime ${name} from ${companyDomain}`);
        yield index_1.workspace.runtimes.remove(name, companyDomain);
        logger.info("Runtime removed from the workspace");
    }));
});
program
    .command('unregister <name>')
    .description('Unregisters a runtime from a stamp')
    .option('-d, --company-domain <company-domain>', 'The runtime domain', defaultDomain)
    .option('-v, --version <version>', 'The runtime version')
    .option('-s, --stamp <stamp>', 'The target stamp', defaultStamp)
    .action((name, { companyDomain, version, stamp }) => {
    utils_1.run(() => __awaiter(this, void 0, void 0, function* () {
        logger.info(`Unregistering from stamp ${stamp} version ${version} of runtime ${name} from ${companyDomain}`);
        yield index_1.workspace.runtimes.unregister(name, companyDomain, version, stamp);
        logger.info(`Version ${version} unregistered`);
    }));
});
program.parse(process.argv);
//# sourceMappingURL=kumori-runtime.js.map