import * as program from 'commander'
import * as logger from './logger'
import { workspace, DeploymentData } from './workspace/index'
import { run, executeProgram, getHostname, printError, printResults, question } from './utils'

let defaultDomain = workspace.configManager.config.domain
let defaultTemplate = workspace.configManager.config.deployment.template
let defaultStamp = workspace.configManager.config.defaultStamp.name

function printDeploymentData(data: DeploymentData) {
    logger.info("Service deployed:")
    if (data.nickname) {
        logger.info(`Nickname: \t${data.nickname}`)
    }
    logger.info(`URN: \t${data.urn}`)
    for (let role of data.roles) {
        logger.info(`Role: \t${role.name}`)
        for (let entrypoint of role.entrypoints) {
            logger.info(`\tLink: \t${entrypoint.urn}`)
        }
    }
}

function printSkipped(skipped: string[], stamp: string) {
    logger.info(`Elements already registered in ${stamp}:`)
    for (let elemUrn of skipped) {
        logger.info(`* ${elemUrn}\t \x1b[31mSKIPPED\x1b[0m`)
    }
}

program
    .command('add <name> <service>')
    .description('Adds a new deployment configuration to the workspace')
    .option('-d, --company-domain <company-domain>', 'The service domain', defaultDomain)
    .option('-v, --service-version <service-version>', 'The service version (default: current version of the service in the workspace)')
    .option('-t, --template <template>', 'The deployment template', defaultTemplate)
    .action((name, service, {companyDomain, serviceVersion, template}) => {
        run(async () => {
            if (!serviceVersion) {
                serviceVersion = workspace.services.getCurrentVersion(service, companyDomain)
                logger.info(`Service version set to ${serviceVersion}`)
            }
            logger.info(`Adding a deployment configuration ${name} for version ${serviceVersion} of service ${service} using template ${template}`)
            let info = await workspace.deployments.add(name, companyDomain, service, serviceVersion, template)
            logger.info(`Deployment added in ${info.path}`)
        })
    })

program
    .command('deploy <name>')
    .description('Creates a new service in the target stamp')
    .option('-b, --build-components', 'For each service component, generate a distributable version if it is missing and the component has not been already registered in the platform')
    .option('-f, --force-build-components', 'For each service component, generate a distributable version if the component has not been already registered in the platform')
    .option('-i, --generate-inbounds', 'Add random domains for each service entrypoint')
    .option('-s, --stamp <stamp>', 'The target stamp', defaultStamp)
    .action((name, { buildComponents, forceBuildComponents, generateInbounds, stamp }) => {
        run(async () => {
            let service = await workspace.deployments.getDeploymentServiceName(name)
            logger.info(`Deploying service ${service} in stamp ${stamp} using configuration ${name}`)
            let data = await workspace.deployments.deploy(name, stamp, generateInbounds, buildComponents, forceBuildComponents)
            if (data.errors) {
                for (let error of data.errors) {
                    if (error instanceof Object) {
                        if (error.message) {
                            printError(error.message)
                            // logger.error(error.message)
                        } else {
                            logger.error(JSON.stringify(error, null, 2))
                        }
                    } else {
                        printError(error)
                        // let valErrorsIndex = error.indexOf('VALIDATION ERRORS')
                        // if (valErrorsIndex > 0) {
                        //     logger.error(`Manifest validation failed: ${error.substring(valErrorsIndex+18)}`)
                        // } else {
                        //     logger.error(error)
                        // }
                    }
                }
            }
            let callbacks:(() => void)[] = []
            if (data.skipped && (data.skipped.length > 0)) {
                callbacks.push(() => {
                    printSkipped(data.skipped, stamp)
                })
            }
            if (data.deployments){
                for (let deploymentData of data.deployments) {
                    callbacks.push(() => {
                        printDeploymentData(deploymentData)
                    })
                }
            }
            printResults(callbacks)
        })
    })

program
    .command('ps')
    .description('Lists the services currently running in the target stamp')
    .option('-s, --stamp <stamp>', 'The target stamp', defaultStamp)
    .action(({stamp}) => {
        run(async () => {
            logger.info(`Searching for services in stamp ${stamp}`)
            let data = await workspace.deployments.ps(stamp)
            for (let element of data) {
                printDeploymentData(element)
            }
        })
    })

program
    .command('remove <name>')
    .description('Removes an existing deployment from the workspace')
    .option('--force', 'Required to remove this deployment', false)
    .action((name, {force}) => {
        run(async () => {
            if (!force) {
                logger.info(`This will remove ${name} from the workspace. If you are sure about this, use the --force flag`)
                process.exit()
            }
            logger.info(`Removing deployment configuration ${name}`)
            await workspace.deployments.remove(name)
            logger.info(`Deployment configuration removed from the workspace`)
        })
    })

program
    .command('scale <urn> <role> <instances>')
    .description('Unregisters a component from a stamp')
    .option('-s, --stamp <stamp>', 'The target stamp', defaultStamp)
    .action((urn, role, instances, {stamp}) => {
        run(async () => {
            logger.info(`Scaling role ${role} to ${instances} for deployment ${urn} in stamp ${stamp}`)
            let created = await workspace.deployments.scale(urn, role, instances, stamp)
            logger.info(`Role ${role} scaled to ${created}`)
        })
    })

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
    .action((service, otherServices, {removeInbounds, stamp, type}) => {
        run(async () => {
            let services: string[] = []
            switch(type) {
                case('URN'): {
                    services = [ service ]
                    for (let other of otherServices) {
                        if (!services.includes(other)) {
                            services.push(other)
                        }
                    }
                    break;
                }
                case('NAME'): {
                    services = await workspace.deployments.getUrnsFromDeploymentName(service, stamp)
                    for (let otherService of otherServices) {
                        let otherUrns = await workspace.deployments.getUrnsFromDeploymentName(otherService, stamp)
                        for (let other of otherUrns) {
                            if (!services.includes(other)) {
                                services.push(other)
                            }
                        }
                    }
                    break;
                }
                case('DOMAIN'): {
                    service = getHostname(service)
                    services = await workspace.deployments.getUrnsFromInboundDomain(service, stamp)
                    for (let otherService of otherServices) {
                        let otherUrns = await workspace.deployments.getUrnsFromInboundDomain(otherService, stamp)
                        for (let other of otherUrns) {
                            if (!services.includes(other)) {
                                services.push(other)
                            }
                        }
                    }
                    break;
                }
                default: {
                    console.log('DEFAULT')
                    logger.error(`Unkown type ${type}`)
                }
            }
            if (removeInbounds) {
                let inbounds = await workspace.deployments.getInboundsFromUrns(services, stamp)
                services = services.concat(inbounds)
            }
            if (services.length == 0) {
                throw new Error('None of the current services match the given conditions')
            }
            let text = 'The following services will be undeployed:\n'
            for (let service of services) {
                text += `\n\t${service}`
            }
            text += '\n\nAre you sure (write "yes" to proceed): '
            let proceed = await question(text, /^y(es)?$/i)
            if (proceed) {
                let result = await workspace.deployments.undeployUrns(services, stamp)
                logger.info(`\nUndeployed services from ${stamp}:\n`)
                for (let urn of result.undeployed) {
                    logger.info(`\t${urn}`)
                }
                if (result.errors.length > 0) {
                    logger.error(`\nErrors:\n`)
                    for (let error of result.errors) {
                        logger.error(`\t${error.message || error}`)
                    }
                }
            } else {
                logger.info("Aborting")
            }
        })
    })

program
    .command('update <name>')
    .description('Updates a deployment configuration in the workspace')
    .option('-t, --template <template>', 'The deployment template', defaultTemplate)
    .action((name, {template}) => {
        run(async () => {
            logger.info(`Updating deployment ${name} using template ${template}`)
            let info = await workspace.deployments.update(name, template)
            logger.info(`Deployment updated in ${info.path}`)
        })
    })

executeProgram(program)
// program.parse(process.argv);
