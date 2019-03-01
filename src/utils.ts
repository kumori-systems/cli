import * as logger from './logger'
import { workspace } from './workspace'
import * as path from 'path'

export async function run(cb: () => void) {
    try {
        await cb()
    } catch(error) {
        logger.error(error.message || error)
    }
}

export function printError(message) {
    try {

        let valErrorsIndex = message.indexOf('VALIDATION ERRORS')
        let rsyncIndex = message.indexOf('Rsync failed for')
        if (valErrorsIndex > 0) {
            logger.error(`Manifest validation failed: ${message.substring(valErrorsIndex+18)}`)
        } else if (rsyncIndex > 0) {
            // Try to convert the rsync error to a more understandable one
            let startIndex = message.indexOf('/./')+3
            let endIndex = message.indexOf('manifest.json') - 1
            let element = message.substring(startIndex, endIndex)
            let parts = element.split('/')
            let aux = parts[1]
            let last = parts[parts.length-1]
            let versionParts = last.split('_')
            let areNumbers = true
            for (let version of versionParts) {
                areNumbers = areNumbers && (!Number.isNaN(Number.parseInt(version)))
            }
            if (areNumbers) {
                parts = parts.slice(0, -1)
            }
            parts[1] = parts[0]
            parts[0] = aux
            element = '.'
            for (let part of parts) {
                element += `/${part}`
            }
            logger.error(`Error registering element: ${element}. Probably the element has not been found or properly registered. Check the manifests.`)
        } else {
            logger.error(message)
        }
    } catch(error) {
        logger.error(message)
    }
}

export function executeProgram(program) {
    if (process.argv.length <= 2) {
        console.log(`\n  Error: subcommand expected`)
        program.help()
    } else {
        let found = false;
        for (let cmnd of program.commands) {
            if ((process.argv[2] == '-h')        ||
                (process.argv[2] == '--help')    ||
                (process.argv[2] == '-V')        ||
                (process.argv[2] == '--version') ||
                (cmnd.name().localeCompare(process.argv[2]) == 0)) {
                found = true;
                if ((process.argv[2] != '-h')     &&
                    (process.argv[2] != '--help') &&
                    (process.argv[2] != 'init')   &&
                    (process.argv[2] != '-V')     &&
                    (process.argv[2] != '--version')) {
                    if (!workspace.isValidWorkspace()) {
                        logger.error('Workspace not initialized. Run "kumori init" first')
                        process.exit(1)
                    }
                }
                program.parse(process.argv);
                break;
            }
        }

        if (!found) {
            logger.error("Command not found.\n")
            program.help();
        }
    }
}

export function printResults(callbacks: (() => void)[]) {
    for (let cb of callbacks) {
        logger.info(`---------------------------------------------------------`)
        cb()
    }
    logger.info(`---------------------------------------------------------`)
}
