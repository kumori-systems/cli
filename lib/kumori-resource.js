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
let defaultTemplate = index_1.workspace.components.configManager.config.resource.template;
let defaultStamp = index_1.workspace.components.configManager.config.defaultStamp.name;
program
    .command('add <name>')
    .description('Adds a new resource to the workspace')
    .option('-d, --company-domain <company-domain>', 'The resource domain', defaultDomain)
    .option('-t, --template <template>', 'The resource template', defaultTemplate)
    .action((name, { companyDomain, template }) => {
    utils_1.run(() => __awaiter(this, void 0, void 0, function* () {
        logger.info(`Adding resource ${name} in ${companyDomain} using template ${template}`);
        let info = yield index_1.workspace.resources.add(name, companyDomain, template);
        logger.info(`Resource ${info.urn} created in ${info.path}`);
    }));
});
program
    .command('register <name>')
    .description('Registers a resource in a stamp')
    .option('-d, --company-domain <company-domain>', 'The resource domain', defaultDomain)
    .option('-s, --stamp <stamp>', 'The target stamp', defaultStamp)
    .action((name, { companyDomain, stamp }) => {
    utils_1.run(() => __awaiter(this, void 0, void 0, function* () {
        logger.info(`Registering in stamp ${stamp} resource ${name} from ${companyDomain}`);
        yield index_1.workspace.resources.register(name, companyDomain, stamp);
        logger.info(`Resource registered`);
    }));
});
program
    .command('remove <name>')
    .description('Removes an existing resource from the workspace')
    .option('-d, --company-domain <company-domain>', 'The resource domain', defaultDomain)
    .option('--force', 'Required to remove this resource', false)
    .action((name, { companyDomain, force }) => {
    utils_1.run(() => __awaiter(this, void 0, void 0, function* () {
        if (!force) {
            logger.info(`This will remove ${name} from the workspace. If you are sure about this, use the --force flag`);
            process.exit();
        }
        logger.info(`Removing resource ${name} from ${companyDomain}`);
        yield index_1.workspace.resources.remove(name, companyDomain);
        logger.info("Resource removed from the workspace");
    }));
});
program
    .command('unregister <name>')
    .description('Unregisters a resource from a stamp')
    .option('-d, --company-domain <company-domain>', 'The resource domain', defaultDomain)
    .option('-s, --stamp <stamp>', 'The target stamp', defaultStamp)
    .action((name, { companyDomain, stamp }) => {
    utils_1.run(() => __awaiter(this, void 0, void 0, function* () {
        logger.info(`Unregistering from stamp ${stamp} resource ${name} from ${companyDomain}`);
        yield index_1.workspace.resources.unregister(name, companyDomain, stamp);
        logger.info(`Resource unregistered`);
    }));
});
utils_1.executeProgram(program);
// program.parse(process.argv);
