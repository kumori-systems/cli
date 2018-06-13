import * as program from 'commander'
import * as logger from './logger'
import { workspace } from './workspace/index'
import { run } from './utils'

let defaultDomain = workspace.components.configManager.config.domain
let defaultTemplate = workspace.components.configManager.config.component.template
let defaultStamp = workspace.components.configManager.config.defaultStamp.name

program
    .command('add <name>')
    .description('Adds a new component to the workspace')
    .option('-d, --company-domain <company-domain>', 'The component domain', defaultDomain)
    .option('-t, --template <template>', 'The component template', defaultTemplate)
    .action((name, {companyDomain, template}) => {
        run(async () => {
            logger.info(`Adding component ${name} in ${companyDomain} using template ${template}`)
            let info = await workspace.components.add(name, companyDomain, template)
            logger.info(`Component ${info.urn} created in ${info.path}`)
        })
    })

program
    .command('build <name>')
    .description('Creates a distributable version of the component')
    .option('-d, --company-domain <company-domain>', 'The component domain', defaultDomain)
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
    .option('-d, --company-domain <company-domain>', 'The component domain', defaultDomain)
    .option('-s, --stamp <stamp>', 'The target stamp', defaultStamp)
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
    .option('-d, --company-domain <company-domain>', 'The component domain', defaultDomain)
    .option('--force', 'Required to remove this component', false)
    .action((name, {companyDomain, force}) => {
        run(async () => {
            if (!force) {
                logger.info(`This will remove ${name} from the workspace. If you are sure about this, use the --force flag`)
                process.exit()
            }
            logger.info(`Removing component ${name} from ${companyDomain}`)
            await workspace.components.remove(name, companyDomain)
            logger.info("Component removed from the workspace")
        })
    })

program
    .command('unregister <name>')
    .description('Unregisters a component from a stamp')
    .option('-d, --company-domain <company-domain>', 'The component domain', defaultDomain)
    .option('-v, --component-version <component-version>', 'The component version (default: current version of the component in the workspace)')
    .option('-s, --stamp <stamp>', 'The target stamp', defaultStamp)
    .action((name, {companyDomain, componentVersion, stamp}) => {
        run(async () => {
            if (!componentVersion) {
                componentVersion = workspace.components.getCurrentVersion(name, companyDomain)
            }
            logger.info(`Unregistering from stamp ${stamp} version ${componentVersion} of component ${name} from ${companyDomain}`)
            await workspace.components.unregister(name, companyDomain, componentVersion, stamp)
            logger.info(`Version ${componentVersion} unregistered`)
        })
    })

    program.parse(process.argv);
