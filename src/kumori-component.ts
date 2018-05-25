import * as program from 'commander'
import * as logger from './logger'
import { workspace } from './workspace/index'
import { run } from './utils'

program
    .command('add')
    .description('Adds a new component to the workspace')
    .option('-d, --company-domain <company-domain>', 'The component domain')
    .option('-n, --name <name>', 'The component name')
    .option('-t, --template <template>', 'The component template')
    .action(({companyDomain, name, template}) => {
        run(async () => {
            logger.info(`Adding component ${name} in ${companyDomain} using template ${template}`)
            let info = await workspace.components.add(name, companyDomain, template)
            logger.info(`Component ${info.urn} created in ${info.path}`)
        })
    })

program
    .command('build <name>')
    .description('Creates a distributable version of the component')
    .option('-d, --company-domain <company-domain>', 'The component domain')
    .action((name, {companyDomain}) => {
        run(async () => {
            logger.info(`Bundeling component ${name} from ${companyDomain}`)
            let path = await workspace.components.build(name, companyDomain)
            logger.info(`Distributable bundle created in ${path}`)
        })
    })

program
    .command('register <name>')
    .description('Registers a component in a stamp')
    .option('-d, --company-domain <company-domain>', 'The component domain')
    .option('-s, --stamp <stamp>', 'The target stamp')
    .action((name, {companyDomain, stamp}) => {
        run(async () => {
            logger.info(`Registering in stamp ${stamp} component ${name} from ${companyDomain}`)
            let version = await workspace.components.register(name, companyDomain, stamp)
            logger.info(`Registered version ${version}`)
        })
    })

program
    .command('remove <name>')
    .description('Removes an existing component from the workspace')
    .option('-d, --company-domain <company-domain>', 'The component domain')
    .action((name, {companyDomain}) => {
        run(async () => {
            logger.info(`Removing component ${name} from ${companyDomain}`)
            await workspace.components.remove(name, companyDomain)
            logger.info("Component removed from the workspace")
        })
    })

program
    .command('unregister <name>')
    .description('Unregisters a component from a stamp')
    .option('-d, --company-domain <company-domain>', 'The component domain')
    .option('-v, --version <version>', 'The component version')
    .option('-s, --stamp <stamp>', 'The target stamp')
    .action((name, {companyDomain, version, stamp}) => {
        run(async () => {
            logger.info(`Unregistering from stamp ${stamp} version ${version} of component ${name} from ${companyDomain}`)
            await workspace.components.unregister(name, companyDomain, version, stamp)
            logger.info(`Version ${version} unregistered`)
        })
    })

    program.parse(process.argv);
