import * as program from 'commander'
import * as logger from './logger'
import { workspace } from './workspace';
import { run, executeProgram } from './utils'

let defaultDomain = workspace.configManager.config.domain
let defaultTemplate = workspace.configManager.config.project.template

program
    .command('add <name>')
    .description('Populates the workspace with a project elements. A project might include components, resoureces, services, runtimes and deployments')
    .option('-d, --company-domain <company-domain>', 'The project domain', defaultDomain)
    .option('-t, --template <template>', 'The project template', defaultTemplate)
    .action((name, {companyDomain, template}) => {
        run(async () => {
            logger.info(`Populating workspace with project using template "${template}", name "${name}" and domain "${companyDomain}"`)
            await workspace.projects.add(name, companyDomain, template)
            logger.info(`Workspace populated.`)
        })
    })

executeProgram(program)