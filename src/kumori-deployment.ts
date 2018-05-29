import * as program from 'commander'
import * as logger from './logger'
import { workspace, DeploymentData, RegistrationData } from './workspace/index'
import { run } from './utils'

let defaultDomain = workspace.components.configManager.config.domain
let defaultTemplate = workspace.components.configManager.config.deployment.template
let defaultStamp = workspace.components.configManager.config.defaultStamp.name

function printDeploymentData(data: DeploymentData) {
    logger.info(`---------------------------------------------------------`)
    logger.info(`URN: \t${data.urn}`)
    for (let role of data.roles) {
        logger.info(`Role: \t${role.name}`)
        for (let entrypoint of role.entrypoints) {
            logger.info(`\tLink: \t${entrypoint.urn}`)
        }
    }
    logger.info(`---------------------------------------------------------`)
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
                serviceVersion = workspace.services.getCurrentVersion(name, companyDomain)
                logger.info(`Service version set to ${serviceVersion}`)
            }
            logger.info(`Adding a deployment configuration ${name} for version ${serviceVersion} of service ${service} using template ${template}`)
            let info = await workspace.deployments.add(name, companyDomain, service, serviceVersion, template)
            logger.info(`Deployment added in ${info.path}`)
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

program
    .command('deploy <name>')
    .description('Creates a new service in the target stamp')
    .option('-s, --stamp <stamp>', 'The target stamp', defaultStamp)
    .action((name, {stamp}) => {
        run(async () => {
            let service = await workspace.deployments.getDeploymentServiceName(name)
            logger.info(`Deploying service ${service} in stamp ${stamp} using configuration ${name}`)
            let data = await workspace.deployments.deploy(name, stamp)
            if (data.deployments){
                for (let deploymentData of data.deployments) {
                    printDeploymentData(deploymentData)
                }
            }
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
    .action((name) => {
        run(async () => {
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

program
    .command('undeploy <urn>')
    .description('Undeploys a service from the target stamp')
    .option('-s, --stamp <stamp>', 'The target stamp', defaultStamp)
    .action((urn, {stamp}) => {
        run(async () => {
            logger.info(`Undeploying service with URN ${urn} from ${stamp}`)
            await workspace.deployments.undeploy(urn, stamp)
            logger.info("Service undeployed")
        })
    })

program.parse(process.argv);