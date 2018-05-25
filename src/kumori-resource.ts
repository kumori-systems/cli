import * as program from 'commander'
import * as logger from './logger'
import { workspace } from './workspace/index'
import { run } from './utils'

program
    .command('add')
    .description('Adds a new resource to the workspace')
    .option('-d, --company-domain <company-domain>', 'The resource domain')
    .option('-n, --name <name>', 'The resource name')
    .option('-t, --template <template>', 'The resource template')
    .action(({companyDomain, name, template}) => {
        run(async () => {
            logger.info(`Adding resource ${name} in ${companyDomain} using template ${template}`)
            let info = await workspace.resources.add(name, companyDomain, template)
            logger.info(`Resource ${info.urn} created in ${info.path}`)
        })
    })

program
    .command('register <name>')
    .description('Registers a resource in a stamp')
    .option('-d, --company-domain <company-domain>', 'The resource domain')
    .option('-s, --stamp <stamp>', 'The target stamp')
    .action((name, {companyDomain, stamp}) => {
        run(async () => {
            logger.info(`Registering in stamp ${stamp} resource ${name} from ${companyDomain}`)
            await workspace.resources.register(name, companyDomain, stamp)
            logger.info(`Resource registered`)
        })
    })

program
    .command('remove <name>')
    .description('Removes an existing resource from the workspace')
    .option('-d, --company-domain <company-domain>', 'The resource domain')
    .action((name, {companyDomain}) => {
        run(async () => {
            logger.info(`Removing resource ${name} from ${companyDomain}`)
            await workspace.resources.remove(name, companyDomain)
            logger.info("Resource removed from the workspace")
        })
    })

program
    .command('unregister <name>')
    .description('Unregisters a resource from a stamp')
    .option('-d, --company-domain <company-domain>', 'The resource domain')
    .option('-s, --stamp <stamp>', 'The target stamp')
    .action((name, {companyDomain, stamp}) => {
        run(async () => {
            logger.info(`Unregistering from stamp ${stamp} resource ${name} from ${companyDomain}`)
            await workspace.resources.unregister(name, companyDomain, stamp)
            logger.info(`Resource unregistered`)
        })
    })

program.parse(process.argv);