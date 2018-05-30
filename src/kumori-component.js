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
let defaultTemplate = index_1.workspace.components.configManager.config.component.template;
let defaultStamp = index_1.workspace.components.configManager.config.defaultStamp.name;
program
    .command('add <name>')
    .description('Adds a new component to the workspace')
    .option('-d, --company-domain <company-domain>', 'The component domain', defaultDomain)
    .option('-n, --name <name>', 'The component name')
    .option('-t, --template <template>', 'The component template', defaultTemplate)
    .action((name, { companyDomain, template }) => {
    utils_1.run(() => __awaiter(this, void 0, void 0, function* () {
        logger.info(`Adding component ${name} in ${companyDomain} using template ${template}`);
        let info = yield index_1.workspace.components.add(name, companyDomain, template);
        logger.info(`Component ${info.urn} created in ${info.path}`);
    }));
});
program
    .command('build <name>')
    .description('Creates a distributable version of the component')
    .option('-d, --company-domain <company-domain>', 'The component domain', defaultDomain)
    .action((name, { companyDomain }) => {
    utils_1.run(() => __awaiter(this, void 0, void 0, function* () {
        logger.info(`Bundeling component ${name} from ${companyDomain}`);
        let path = yield index_1.workspace.components.build(name, companyDomain);
        logger.info(`Distributable bundle created in ${path}`);
    }));
});
program
    .command('register <name>')
    .description('Registers a component in a stamp')
    .option('-d, --company-domain <company-domain>', 'The component domain', defaultDomain)
    .option('-s, --stamp <stamp>', 'The target stamp', defaultStamp)
    .action((name, { companyDomain, stamp }) => {
    utils_1.run(() => __awaiter(this, void 0, void 0, function* () {
        logger.info(`Registering in stamp ${stamp} component ${name} from ${companyDomain}`);
        let version = yield index_1.workspace.components.register(name, companyDomain, stamp);
        logger.info(`Registered version ${version}`);
    }));
});
program
    .command('remove <name>')
    .description('Removes an existing component from the workspace')
    .option('-d, --company-domain <company-domain>', 'The component domain', defaultDomain)
    .action((name, { companyDomain }) => {
    utils_1.run(() => __awaiter(this, void 0, void 0, function* () {
        logger.info(`Removing component ${name} from ${companyDomain}`);
        yield index_1.workspace.components.remove(name, companyDomain);
        logger.info("Component removed from the workspace");
    }));
});
program
    .command('unregister <name>')
    .description('Unregisters a component from a stamp')
    .option('-d, --company-domain <company-domain>', 'The component domain', defaultDomain)
    .option('-v, --component-version <component-version>', 'The component version (default: current version of the component in the workspace)')
    .option('-s, --stamp <stamp>', 'The target stamp', defaultStamp)
    .action((name, { companyDomain, componentVersion, stamp }) => {
    utils_1.run(() => __awaiter(this, void 0, void 0, function* () {
        logger.info(`Unregistering from stamp ${stamp} version ${componentVersion} of component ${name} from ${companyDomain}`);
        yield index_1.workspace.components.unregister(name, companyDomain, componentVersion, stamp);
        logger.info(`Version ${componentVersion} unregistered`);
    }));
});
program.parse(process.argv);
//# sourceMappingURL=kumori-component.js.map