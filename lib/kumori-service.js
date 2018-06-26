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
let defaultTemplate = workspace_1.workspace.configManager.config.service.template;
let defaultStamp = workspace_1.workspace.configManager.config.defaultStamp.name;
program
    .command('add <name>')
    .description('Adds a new service to the workspace')
    .option('-d, --company-domain <company-domain>', 'The service domain', defaultDomain)
    .option('-t, --template <template>', 'The service template', defaultTemplate)
    .action((name, { companyDomain, template }) => {
    utils_1.run(() => __awaiter(this, void 0, void 0, function* () {
        logger.info(`Adding service ${name} in ${companyDomain} using template ${template}`);
        let info = yield workspace_1.workspace.services.add(name, companyDomain, template);
        logger.info(`Service ${info.urn} created in ${info.path}`);
    }));
});
program
    .command('register <name>')
    .description('Registers a service in a stamp')
    .option('-d, --company-domain <company-domain>', 'The service domain', defaultDomain)
    .option('-s, --stamp <stamp>', 'The target stamp', defaultStamp)
    .action((name, { companyDomain, stamp }) => {
    utils_1.run(() => __awaiter(this, void 0, void 0, function* () {
        logger.info(`Registering in stamp ${stamp} service ${name} from ${companyDomain}`);
        let version = yield workspace_1.workspace.services.register(name, companyDomain, stamp);
        logger.info(`Version ${version} registered`);
    }));
});
program
    .command('remove <name>')
    .description('Removes an existing service from the workspace')
    .option('-d, --company-domain <company-domain>', 'The service domain', defaultDomain)
    .option('--force', 'Required to remove this service', false)
    .action((name, { companyDomain, force }) => {
    utils_1.run(() => __awaiter(this, void 0, void 0, function* () {
        if (!force) {
            logger.info(`This will remove ${name} from the workspace. If you are sure about this, use the --force flag`);
            process.exit();
        }
        logger.info(`Removing service ${name} from ${companyDomain}`);
        yield workspace_1.workspace.services.remove(name, companyDomain);
        logger.info("Service removed from the workspace");
    }));
});
program
    .command('unregister <name>')
    .description('Unregisters a service from a stamp')
    .option('-d, --company-domain <company-domain>', 'The service domain', defaultDomain)
    .option('-v, --service-version <service-version>', 'The component version (default: current version of the service in the workspace)')
    .option('-s, --stamp <stamp>', 'The target stamp', defaultStamp)
    .action((name, { companyDomain, serviceVersion, stamp }) => {
    utils_1.run(() => __awaiter(this, void 0, void 0, function* () {
        if (!serviceVersion) {
            serviceVersion = workspace_1.workspace.runtimes.getCurrentVersion(name, companyDomain);
        }
        logger.info(`Unregistering from stamp ${stamp} version ${serviceVersion} of service ${name} from ${companyDomain}`);
        yield workspace_1.workspace.services.unregister(name, companyDomain, serviceVersion, stamp);
        logger.info(`Version ${serviceVersion} unregistered`);
    }));
});
utils_1.executeProgram(program);
// program.parse(process.argv);
