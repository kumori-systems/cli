import * as program from 'commander'
import * as logger from './logger'
import { workspace } from './workspace';
import { run, executeProgram } from './utils'

let defaultDomain = workspace.components.configManager.config.domain
let defaultTemplate = workspace.components.configManager.config.service.template
let defaultStamp = workspace.components.configManager.config.defaultStamp.name

program
    .command('add <name>')
    .description('Adds a new service to the workspace')
    .option('-d, --company-domain <company-domain>', 'The service domain', defaultDomain)
    .option('-t, --template <template>', 'The service template', defaultTemplate)
    .action((name, {companyDomain, template}) => {
        run(async () => {
            logger.info(`Adding service ${name} in ${companyDomain} using template ${template}`)
            let info = await workspace.services.add(name, companyDomain, template)
            logger.info(`Service ${info.urn} created in ${info.path}`)
        })
    })

program
    .command('register <name>')
    .description('Registers a service in a stamp')
    .option('-d, --company-domain <company-domain>', 'The service domain', defaultDomain)
    .option('-s, --stamp <stamp>', 'The target stamp', defaultStamp)
    .action((name, {companyDomain, stamp}) => {
        run(async () => {
            logger.info(`Registering in stamp ${stamp} service ${name} from ${companyDomain}`)
            let version = await workspace.services.register(name, companyDomain, stamp)
            logger.info(`Version ${version} registered`)
        })
    })

program
    .command('remove <name>')
    .description('Removes an existing service from the workspace')
    .option('-d, --company-domain <company-domain>', 'The service domain', defaultDomain)
    .option('--force', 'Required to remove this service', false)
    .action((name, {companyDomain, force}) => {
        run(async () => {
            if (!force) {
                logger.info(`This will remove ${name} from the workspace. If you are sure about this, use the --force flag`)
                process.exit()
            }
            logger.info(`Removing service ${name} from ${companyDomain}`)
            await workspace.services.remove(name, companyDomain)
            logger.info("Service removed from the workspace")
        })
    })

program
    .command('unregister <name>')
    .description('Unregisters a service from a stamp')
    .option('-d, --company-domain <company-domain>', 'The service domain', defaultDomain)
    .option('-v, --service-version <service-version>', 'The component version (default: current version of the service in the workspace)')
    .option('-s, --stamp <stamp>', 'The target stamp', defaultStamp)
    .action((name, {companyDomain, serviceVersion, stamp}) => {
        run(async () => {
            if (!serviceVersion) {
                serviceVersion = workspace.runtimes.getCurrentVersion(name, companyDomain)
            }
            logger.info(`Unregistering from stamp ${stamp} version ${serviceVersion} of service ${name} from ${companyDomain}`)
            await workspace.services.unregister(name, companyDomain, serviceVersion, stamp)
            logger.info(`Version ${serviceVersion} unregistered`)
        })
    })

executeProgram(program)
// program.parse(process.argv);