import * as program from 'commander'
import * as logger from './logger'
import { workspace } from './workspace';
import { run, executeProgram } from './utils'

program
    .command('domain <domain>')
    .description('Changes the default domain used in the workspace elements')
    .action((domain) => {
        run(async () => {
            logger.info(`Seting default domain to ${domain}`)
            await workspace.config.setDefaultDomain(domain)
            logger.info(`New domain set`)
        })
    })


executeProgram(program)
program.parse(process.argv);