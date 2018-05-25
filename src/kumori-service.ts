import * as program from 'commander'
import * as logger from './logger'
import { workspace } from './workspace';
import { run } from './utils'

program
    .command('add')
    .description('Adds a new service to the workspace')
    .option('-d, --company-domain <company-domain>', 'The service domain')
    .option('-n, --name <name>', 'The service name')
    .option('-t, --template <template>', 'The service template')
    .action(({companyDomain, name, template}) => {
        run(async () => {
            logger.info(`Adding service ${name} in ${companyDomain} using template ${template}`)
            let info = await workspace.services.add(name, companyDomain, template)
            logger.info(`Service ${info.urn} created in ${info.path}`)
        })
    })

program
    .command('register <name>')
    .description('Registers a service in a stamp')
    .option('-d, --company-domain <company-domain>', 'The service domain')
    .option('-s, --stamp <stamp>', 'The target stamp')
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
    .option('-d, --company-domain <company-domain>', 'The service domain')
    .action((name, {companyDomain}) => {
        run(async () => {
            logger.info(`Removing service ${name} from ${companyDomain}`)
            await workspace.services.remove(name, companyDomain)
            logger.info("Service removed from the workspace")
        })
    })

program
    .command('unregister <name>')
    .description('Unregisters a service from a stamp')
    .option('-d, --company-domain <company-domain>', 'The service domain')
    .option('-v, --version <version>', 'The service version')
    .option('-s, --stamp <stamp>', 'The target stamp')
    .action((name, {companyDomain, version, stamp}) => {
        run(async () => {
            logger.info(`Unregistering from stamp ${stamp} version ${version} of service ${name} from ${companyDomain}`)
            await workspace.services.unregister(name, companyDomain, version, stamp)
            logger.info(`Version ${version} unregistered`)
        })
    })

program.parse(process.argv);