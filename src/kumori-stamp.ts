import * as program from 'commander'
import * as logger from './logger'
import { workspace, StampConfig } from './workspace';
import { run } from './utils'

program
    .command('add')
    .description('Adds a new stamp to the workspace')
    .option('-n, --name <name>', 'The stamp name')
    .option('-a, --admission <admission>', 'The URL to access admission service of the stamp')
    .option('-t, --token <token>', 'The authentication token to access the admission service of the stamp')
    .option('-d, --default', 'Sets this stamp as the default stamp')
    .action(({name, admission, token, isDefault}) => {
        run(async () => {
            logger.info(`Adding stamp ${name} to the workspace`)
            let config: StampConfig = {
                admission: admission,
                token: token
            }
            await workspace.config.addStamp(name, config, isDefault)
            logger.info(`Stamp added`)
        })
    })

program
    .command('update <name>')
    .description('Updates the information of a previously registered stamp')
    .option('-a, --admission <admission>', 'The URL to access admission service of the stamp')
    .option('-t, --token <token>', 'The authentication token to access the admission service of the stamp')
    .action((name, {admission, token}) => {
        run(async () => {
            logger.info(`Updating stamp ${name} data`)
            let config: StampConfig = {
                admission: admission,
                token: token
            }
            await workspace.config.updateStamp(name, config)
            logger.info(`Stamp data updated`)
        })
    })

program
    .command('remove <name>')
    .description('Removes a stamp')
    .action((name) => {
        run(async () => {
            logger.info(`Removing stamp ${name}`)
            await workspace.config.removeStamp(name)
            logger.info("Stamp removed from the workspace")
        })
    })

program
    .command('use <name>')
    .description('Sets a stamp as the default stamp')
    .action((name) => {
        run(async () => {
            logger.info(`Setting ${name} as the default stamp`)
            await workspace.config.setDefaultStamp(name)
            logger.info("Default stamp updated")
        })
    })

program.parse(process.argv);