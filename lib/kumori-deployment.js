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
let defaultDomain = index_1.workspace.configManager.config.domain;
let defaultTemplate = index_1.workspace.configManager.config.deployment.template;
let defaultStamp = index_1.workspace.configManager.config.defaultStamp.name;
function printDeploymentData(data) {
    logger.info(`---------------------------------------------------------`);
    logger.info(`URN: \t${data.urn}`);
    for (let role of data.roles) {
        logger.info(`Role: \t${role.name}`);
        for (let entrypoint of role.entrypoints) {
            logger.info(`\tLink: \t${entrypoint.urn}`);
        }
    }
    logger.info(`---------------------------------------------------------`);
}
program
    .command('add <name> <service>')
    .description('Adds a new deployment configuration to the workspace')
    .option('-d, --company-domain <company-domain>', 'The service domain', defaultDomain)
    .option('-v, --service-version <service-version>', 'The service version (default: current version of the service in the workspace)')
    .option('-t, --template <template>', 'The deployment template', defaultTemplate)
    .action((name, service, { companyDomain, serviceVersion, template }) => {
    utils_1.run(() => __awaiter(this, void 0, void 0, function* () {
        if (!serviceVersion) {
            serviceVersion = index_1.workspace.services.getCurrentVersion(service, companyDomain);
            logger.info(`Service version set to ${serviceVersion}`);
        }
        logger.info(`Adding a deployment configuration ${name} for version ${serviceVersion} of service ${service} using template ${template}`);
        let info = yield index_1.workspace.deployments.add(name, companyDomain, service, serviceVersion, template);
        logger.info(`Deployment added in ${info.path}`);
    }));
});
program
    .command('update <name>')
    .description('Updates a deployment configuration in the workspace')
    .option('-t, --template <template>', 'The deployment template', defaultTemplate)
    .action((name, { template }) => {
    utils_1.run(() => __awaiter(this, void 0, void 0, function* () {
        logger.info(`Updating deployment ${name} using template ${template}`);
        let info = yield index_1.workspace.deployments.update(name, template);
        logger.info(`Deployment updated in ${info.path}`);
    }));
});
program
    .command('deploy <name>')
    .description('Creates a new service in the target stamp')
    .option('-i, --skip-inbounds', 'Random domains are not created to this service entrypoints')
    .option('-s, --stamp <stamp>', 'The target stamp', defaultStamp)
    .action((name, { skipInbounds, stamp }) => {
    utils_1.run(() => __awaiter(this, void 0, void 0, function* () {
        let service = yield index_1.workspace.deployments.getDeploymentServiceName(name);
        logger.info(`Deploying service ${service} in stamp ${stamp} using configuration ${name}`);
        let inbounds = !skipInbounds;
        let data = yield index_1.workspace.deployments.deploy(name, stamp, inbounds);
        if (data.errors) {
            for (let error of data.errors) {
                logger.error(error);
            }
        }
        if (data.deployments) {
            for (let deploymentData of data.deployments) {
                printDeploymentData(deploymentData);
            }
        }
    }));
});
program
    .command('ps')
    .description('Lists the services currently running in the target stamp')
    .option('-s, --stamp <stamp>', 'The target stamp', defaultStamp)
    .action(({ stamp }) => {
    utils_1.run(() => __awaiter(this, void 0, void 0, function* () {
        logger.info(`Searching for services in stamp ${stamp}`);
        let data = yield index_1.workspace.deployments.ps(stamp);
        for (let element of data) {
            printDeploymentData(element);
        }
    }));
});
program
    .command('remove <name>')
    .description('Removes an existing deployment from the workspace')
    .option('--force', 'Required to remove this deployment', false)
    .action((name, { force }) => {
    utils_1.run(() => __awaiter(this, void 0, void 0, function* () {
        if (!force) {
            logger.info(`This will remove ${name} from the workspace. If you are sure about this, use the --force flag`);
            process.exit();
        }
        logger.info(`Removing deployment configuration ${name}`);
        yield index_1.workspace.deployments.remove(name);
        logger.info(`Deployment configuration removed from the workspace`);
    }));
});
program
    .command('scale <urn> <role> <instances>')
    .description('Unregisters a component from a stamp')
    .option('-s, --stamp <stamp>', 'The target stamp', defaultStamp)
    .action((urn, role, instances, { stamp }) => {
    utils_1.run(() => __awaiter(this, void 0, void 0, function* () {
        logger.info(`Scaling role ${role} to ${instances} for deployment ${urn} in stamp ${stamp}`);
        let created = yield index_1.workspace.deployments.scale(urn, role, instances, stamp);
        logger.info(`Role ${role} scaled to ${created}`);
    }));
});
program
    .command('undeploy <urn>')
    .description('Undeploys a service from the target stamp')
    .option('-s, --stamp <stamp>', 'The target stamp', defaultStamp)
    .action((urn, { stamp }) => {
    utils_1.run(() => __awaiter(this, void 0, void 0, function* () {
        logger.info(`Undeploying service with URN ${urn} from ${stamp}`);
        yield index_1.workspace.deployments.undeploy(urn, stamp);
        logger.info("Service undeployed");
    }));
});
utils_1.executeProgram(program);
// program.parse(process.argv);
