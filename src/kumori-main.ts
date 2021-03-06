#!/usr/bin/env node

import * as program from 'commander'
import * as logger from './logger'
import { run, executeProgram } from './utils'

import { workspace } from './workspace';

const pkg = require("../package.json")

module.exports = function (argv: string[]): void {

    program
        .version(pkg.version)
        .command('component', 'Manages components')
        .command('deployment', 'Manages deployments')
        .command('project', 'Manages projects')
        .command('resource', 'Manages resources')
        .command('runtime', 'Manages runtimes')
        .command('service', 'Manages services')
        .command('set', 'Manages workspace configuration parameters')
        .command('stamp', 'Manages stamps')

    program
        .command('init')
        .description('Populates the current folder with the worspace folders structure')
        .option('-t, --template <template>', 'The workspace template', '@kumori/workspace')
        .action(({template}) => {
            run(async () => {
                if (workspace.isValidWorkspace()) {
                    logger.info("Workspace already created")
                } else {
                    workspace.init(template)
                }
            })
        })

        executeProgram(program)
        // program
        //     .parse(process.argv)
}
