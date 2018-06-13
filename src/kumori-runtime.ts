import * as program from 'commander'
import * as logger from './logger'
import { workspace } from './workspace/index'
import { run, executeProgram } from './utils'

let defaultDomain = workspace.components.configManager.config.domain
let defaultTemplate = workspace.components.configManager.config.runtime.template
let defaultParent = workspace.components.configManager.config.runtime.parent
let defaultFolder = workspace.components.configManager.config.runtime.folder
let defaultEntrypoint = workspace.components.configManager.config.runtime.entrypoint
let defaultStamp = workspace.components.configManager.config.defaultStamp.name

program
    .command('add <name>')
    .description('Adds a new runtime to the workspace')
    .option('-d, --company-domain <company-domain>', 'The runtime domain', defaultDomain)
    .option('-p, --parent-runtime <parent-runtime>', 'The URN of parent of this runtime', defaultParent)
    .option('-c, --component-folder <component>', 'The folder where the component code will be deployed', defaultFolder)
    .option('-e, --entrypoint <entrypoint>', 'The new runtime entrypoint', defaultEntrypoint)
    .option('-t, --template <template>', 'The runtime template', defaultTemplate)
    .action((name, {companyDomain, parentRuntime, componentFolder, entrypoint, template}) => {
        run(async () => {
            logger.info(`Adding runtime ${name} in ${companyDomain} using template ${template}`)
            let info = await workspace.runtimes.add(name, companyDomain, parentRuntime, componentFolder, entrypoint, template)
            logger.info(`Runtime ${info.urn} created in ${info.path}`)
        })
    })

program
    .command('build <name>')
    .description('Creates a distributable version of the runtime')
    .option('-d, --company-domain <company-domain>', 'The runtime domain', defaultDomain)
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
    .option('-d, --company-domain <company-domain>', 'The runtime domain', defaultDomain)
    .option('-s, --stamp <stamp>', 'The target stamp', defaultStamp)
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
    .option('-d, --company-domain <company-domain>', 'The runtime domain', defaultDomain)
    .option('--force', 'Required to remove this runtime', false)
    .action((name, {companyDomain, force}) => {
        run(async () => {
            if (!force) {
                logger.info(`This will remove ${name} from the workspace. If you are sure about this, use the --force flag`)
                process.exit()
            }
            logger.info(`Removing runtime ${name} from ${companyDomain}`)
            await workspace.runtimes.remove(name, companyDomain)
            logger.info("Runtime removed from the workspace")
        })
    })

program
    .command('unregister <name>')
    .description('Unregisters a runtime from a stamp')
    .option('-d, --company-domain <company-domain>', 'The runtime domain', defaultDomain)
    .option('-v, --runtime-version <runtime-version>', 'The runtime version')
    .option('-s, --stamp <stamp>', 'The target stamp', defaultStamp)
    .action((name, {companyDomain, runtimeVersion, stamp}) => {
        run(async () => {
            if (!runtimeVersion) {
                runtimeVersion = workspace.runtimes.getCurrentVersion(name, companyDomain)
            }
            logger.info(`Unregistering from stamp ${stamp} version ${runtimeVersion} of runtime ${name} from ${companyDomain}`)
            await workspace.runtimes.unregister(name, companyDomain, runtimeVersion, stamp)
            logger.info(`Version ${runtimeVersion} unregistered`)
        })
    })

executeProgram(program)
program.parse(process.argv);