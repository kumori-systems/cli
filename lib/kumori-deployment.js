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
    logger.info("Service deployed:");
    if (data.nickname) {
        logger.info(`Nickname: \t${data.nickname}`);
    }
    logger.info(`URN: \t${data.urn}`);
    for (let role of data.roles) {
        logger.info(`Role: \t${role.name}`);
        for (let entrypoint of role.entrypoints) {
            logger.info(`\tLink: \t${entrypoint.urn}`);
        }
    }
}
function printSkipped(skipped, stamp) {
    logger.info(`Elements already registered in ${stamp}:`);
    for (let elemUrn of skipped) {
        logger.info(`* ${elemUrn}\t \x1b[31mSKIPPED\x1b[0m`);
    }
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
    .command('deploy <name>')
    .description('Creates a new service in the target stamp')
    .option('-b, --build-components', 'For each service component, generate a distributable version if it is missing and the component has not been already registered in the platform')
    .option('-f, --force-build-components', 'For each service component, generate a distributable version if the component has not been already registered in the platform')
    .option('-i, --generate-inbounds', 'Add random domains for each service entrypoint')
    .option('-s, --stamp <stamp>', 'The target stamp', defaultStamp)
    .action((name, { buildComponents, forceBuildComponents, generateInbounds, stamp }) => {
    utils_1.run(() => __awaiter(this, void 0, void 0, function* () {
        let service = yield index_1.workspace.deployments.getDeploymentServiceName(name);
        logger.info(`Deploying service ${service} in stamp ${stamp} using configuration ${name}`);
        let data = yield index_1.workspace.deployments.deploy(name, stamp, generateInbounds, buildComponents, forceBuildComponents);
        if (data.errors) {
            for (let error of data.errors) {
                if (error instanceof Object) {
                    if (error.message) {
                        utils_1.printError(error.message);
                        // logger.error(error.message)
                    }
                    else {
                        logger.error(JSON.stringify(error, null, 2));
                    }
                }
                else {
                    utils_1.printError(error);
                    // let valErrorsIndex = error.indexOf('VALIDATION ERRORS')
                    // if (valErrorsIndex > 0) {
                    //     logger.error(`Manifest validation failed: ${error.substring(valErrorsIndex+18)}`)
                    // } else {
                    //     logger.error(error)
                    // }
                }
            }
        }
        let callbacks = [];
        if (data.skipped && (data.skipped.length > 0)) {
            callbacks.push(() => {
                printSkipped(data.skipped, stamp);
            });
        }
        if (data.deployments) {
            for (let deploymentData of data.deployments) {
                callbacks.push(() => {
                    printDeploymentData(deploymentData);
                });
            }
        }
        utils_1.printResults(callbacks);
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
// program
//     .command('undeploy <service> [otherServices...]')
//     .description('Undeploys services from the target stamp')
//     .option('-i, --remove-inbounds', 'Removes the inbounds connected to each service')
//     .option('-s, --stamp <stamp>', 'The target stamp', defaultStamp)
//     .option('-t, --type <type>', '"URN" if  <service> and [otherServices...] are service URNs. "NAME" if they are deployment configuration names in the workspace. "DOMAIN" if their linked inbound domains are used', 'URN')
//     .action((service, otherServices, {removeInbounds, stamp, type}) => {
//         run(async () => {
//             logger.info(`Undeploying service with URN ${service} from ${stamp}`)
//             try {
//                 await workspace.deployments.undeploy(service, stamp)
//                 logger.info("Service undeployed")
//             } catch (error) {
//                 printError(error.message  || error)
//             }
//             otherServices.forEach(async function(otherService) {
//                 logger.info(`Undeploying service with URN ${otherService} from ${stamp}`)
//                 try {
//                     await workspace.deployments.undeploy(otherService, stamp)
//                     logger.info("Service undeployed")
//                 } catch (error) {
//                     printError(error.message || error)
//                 }
//             })
//         })
//     })
program
    .command('undeploy <service> [otherServices...]')
    .description('Undeploys services from the target stamp')
    .option('-i, --remove-inbounds', 'Removes the inbounds connected to each service')
    .option('-s, --stamp <stamp>', 'The target stamp', defaultStamp)
    .option('-t, --type <type>', '"URN" if  <service> and [otherServices...] are service URNs. "NAME" if they are deployment configuration names in the workspace. "DOMAIN" if their linked inbound domains are used', 'URN')
    .action((service, otherServices, { removeInbounds, stamp, type }) => {
    utils_1.run(() => __awaiter(this, void 0, void 0, function* () {
        let services = [];
        switch (type) {
            case ('URN'): {
                services = [service];
                for (let other of otherServices) {
                    if (!services.includes(other)) {
                        services.push(other);
                    }
                }
                break;
            }
            case ('NAME'): {
                services = yield index_1.workspace.deployments.getUrnsFromDeploymentName(service, stamp);
                for (let otherService of otherServices) {
                    let otherUrns = yield index_1.workspace.deployments.getUrnsFromDeploymentName(otherService, stamp);
                    for (let other of otherUrns) {
                        if (!services.includes(other)) {
                            services.push(other);
                        }
                    }
                }
                break;
            }
            case ('DOMAIN'): {
                service = utils_1.getHostname(service);
                services = yield index_1.workspace.deployments.getUrnsFromInboundDomain(service, stamp);
                for (let otherService of otherServices) {
                    let otherUrns = yield index_1.workspace.deployments.getUrnsFromInboundDomain(otherService, stamp);
                    for (let other of otherUrns) {
                        if (!services.includes(other)) {
                            services.push(other);
                        }
                    }
                }
                break;
            }
            default: {
                console.log('DEFAULT');
                logger.error(`Unkown type ${type}`);
            }
        }
        if (removeInbounds) {
            let inbounds = yield index_1.workspace.deployments.getInboundsFromUrns(services, stamp);
            services = services.concat(inbounds);
        }
        if (services.length == 0) {
            throw new Error('None of the current services match the given conditions');
        }
        let text = 'The following services will be undeployed:\n';
        for (let service of services) {
            text += `\n\t${service}`;
        }
        text += '\n\nAre you sure (write "yes" to proceed): ';
        let proceed = yield utils_1.question(text, /^y(es)?$/i);
        if (proceed) {
            let result = yield index_1.workspace.deployments.undeployUrns(services, stamp);
            logger.info(`\nUndeployed services from ${stamp}:\n`);
            for (let urn of result.undeployed) {
                logger.info(`\t${urn}`);
            }
            if (result.errors.length > 0) {
                logger.error(`\nErrors:\n`);
                for (let error of result.errors) {
                    logger.error(`\t${error.message || error}`);
                }
            }
        }
        else {
            logger.info("Aborting");
        }
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
utils_1.executeProgram(program);
// program.parse(process.argv);
