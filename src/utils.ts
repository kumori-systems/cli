import * as logger from './logger'
import * as fs from 'fs'
import * as path from 'path'
import { workspace } from './workspace'

export async function run(cb: () => void) {
    try {
        await cb()
    } catch(error) {
        logger.error(error.message || error)
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