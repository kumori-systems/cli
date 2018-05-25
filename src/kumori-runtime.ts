import * as program from 'commander'
import * as logger from './logger'
import { workspace } from './workspace/index'
import { run } from './utils'

program
    .command('add')
    .description('Adds a new runtime to the workspace')
    .option('-d, --company-domain <company-domain>', 'The runtime domain')
    .option('-n, --name <name>', 'The runtime name')
    .option('-p, --parent <parent>', 'The URN of parent of this runtime')
    .option('-c, --component-folder <component>', 'The folder where the component code will be deployed')
    .option('-e, --entrypoing', 'The new runtime entrypoint')
    .option('-t, --template <template>', 'The runtime template')
    .action(({domain, name, parent, componentFolder, entrypoint, template}) => {
        run(async () => {
            logger.info(`Adding runtime ${name} in ${domain} using template ${template}`)
            let info = await workspace.runtimes.add(name, domain, parent, componentFolder, entrypoint, template)
            logger.info(`Runtime ${info.urn} created in ${info.path}`)
        })
    })

program
    .command('build <name>')
    .description('Creates a distributable version of the runtime')
    .option('-d, --company-domain <company-domain>', 'The runtime domain')
    .action((name, {companyDomain}) => {
        run(async () => {
            logger.info(`Bundeling runtime ${name} from ${companyDomain}`)
            let path = await workspace.runtimes.build(name, companyDomain)
            logger.info(`Distributable bundle created in ${path}`)
        })
    })

program
    .command('register <name>')
    .description('Registers a runtime in a stamp')
    .option('-d, --company-domain <company-domain>', 'The runtime domain')
    .option('-s, --stamp <stamp>', 'The target stamp')
    .action((name, {companyDomain, stamp}) => {
        run(async () => {
            logger.info(`Registering in stamp ${stamp} runtime ${name} from ${companyDomain}`)
            let version = await workspace.runtimes.register(name, companyDomain, stamp)
            logger.info(`Version ${version} registered`)
        })
    })

program
    .command('remove <name>')
    .description('Removes an existing runtime from the workspace')
    .option('-d, --company-domain <company-domain>', 'The runtime domain')
    .action((name, {companyDomain}) => {
        run(async () => {
            logger.info(`Removing runtime ${name} from ${companyDomain}`)
            await workspace.runtimes.remove(name, companyDomain)
            logger.info("Runtime removed from the workspace")
        })
    })

program
    .command('unregister <name>')
    .description('Unregisters a runtime from a stamp')
    .option('-d, --company-domain <company-domain>', 'The runtime domain')
    .option('-n, --name <name>', 'The runtime name')
    .option('-v, --version <version>', 'The runtime version')
    .option('-s, --stamp <stamp>', 'The target stamp')
    .action((name, {companyDomain, version, stamp}) => {
        run(async () => {
            logger.info(`Unregistering from stamp ${stamp} version ${version} of runtime ${name} from ${companyDomain}`)
            await workspace.runtimes.unregister(name, companyDomain, version, stamp)
            logger.info(`Version ${version} unregistered`)
        })
    })

program.parse(process.argv);