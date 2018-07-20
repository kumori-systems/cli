import * as program from 'commander'
import * as logger from './logger'
import { workspace, StampConfig } from './workspace';
import { run, executeProgram, printResults } from './utils'

function printStampData(stamp: string, data: StampConfig) {
    logger.info(`Name: \t\t\t${stamp}`)
    logger.info(`Admission URL: \t\t${data.admission}`)
    logger.info(`Authentication token: \t${data.token ? data.token : "Not set"}`)
}

program
    .command('add <name> <admission>')
    .description('Adds a new stamp to the workspace')
    .option('-t, --token <token>', 'The authentication token to access the admission service of the stamp')
    .option('-d, --default', 'Sets this stamp as the default stamp')
    .action((name, admission, {token, isDefault}) => {
        run(async () => {
            logger.info(`Adding stamp ${name} to the workspace`)
            let config: StampConfig = {
                name: name,
                admission: admission
            }
            if (token) {
                config.token = token
            }
            await workspace.configManager.addStamp(name, config, isDefault)
            logger.info(`Stamp added`)
        })
    })

program
    .command('list')
    .description('Shows detailed information about the stamps registered in this workspace')
    .option('-s, --stamp <stamp>', 'Shows detailed information of this stamp only')
    .action(({stamp}) => {
        run(async () => {
            if (!stamp) {
                logger.info(`Listing reigstered stamps`)
            } else {
                logger.info(`Listing detailed information of stamp ${stamp}`)
            }
            let stampsInfo:{[key: string]: StampConfig} = workspace.configManager.getStampsInformation(stamp)
            let callbacks:(() => void)[] = []
            for (let stamp in stampsInfo) {
                callbacks.push(() => {
                    printStampData(stamp, stampsInfo[stamp])
                })
            }
            printResults(callbacks)
        })
    })


program
    .command('remove <name>')
    .description('Removes a stamp')
    .action((name) => {
        run(async () => {
            logger.info(`Removing stamp ${name}`)
            await workspace.configManager.removeStamp(name)
            logger.info("Stamp removed from the workspace")
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
                name: name,
                admission: admission
            }
            if (token) {
                config.token = token
            }
            await workspace.configManager.updateStamp(name, config)
            logger.info(`Stamp data updated`)
        })
    })

program
    .command('use <name>')
    .description('Sets a stamp as the default stamp')
    .action((name) => {
        run(async () => {
            logger.info(`Setting ${name} as the default stamp`)
            await workspace.configManager.setDefaultStamp(name)
            logger.info("Default stamp updated")
        })
    })

executeProgram(program)
// program.parse(process.argv);