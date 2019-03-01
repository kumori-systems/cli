"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const logger = require("./logger");
const workspace_1 = require("./workspace");
function run(cb) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            yield cb();
        }
        catch (error) {
            logger.error(error.message || error);
        }
    });
}
exports.run = run;
function printError(message) {
    try {
        let valErrorsIndex = message.indexOf('VALIDATION ERRORS');
        let rsyncIndex = message.indexOf('Rsync failed for');
        if (valErrorsIndex > 0) {
            logger.error(`Manifest validation failed: ${message.substring(valErrorsIndex + 18)}`);
        }
        else if (rsyncIndex > 0) {
            // Try to convert the rsync error to a more understandable one
            let startIndex = message.indexOf('/./') + 3;
            let endIndex = message.indexOf('manifest.json') - 1;
            let element = message.substring(startIndex, endIndex);
            let parts = element.split('/');
            let aux = parts[1];
            let last = parts[parts.length - 1];
            let versionParts = last.split('_');
            let areNumbers = true;
            for (let version of versionParts) {
                areNumbers = areNumbers && (!Number.isNaN(Number.parseInt(version)));
            }
            if (areNumbers) {
                parts = parts.slice(0, -1);
            }
            parts[1] = parts[0];
            parts[0] = aux;
            element = '.';
            for (let part of parts) {
                element += `/${part}`;
            }
            logger.error(`Error registering element: ${element}. Probably the element has not been found or properly registered. Check the manifests.`);
        }
        else {
            logger.error(message);
        }
    }
    catch (error) {
        logger.error(message);
    }
}
exports.printError = printError;
function executeProgram(program) {
    if (process.argv.length <= 2) {
        console.log(`\n  Error: subcommand expected`);
        program.help();
    }
    else {
        let found = false;
        for (let cmnd of program.commands) {
            if ((process.argv[2] == '-h') ||
                (process.argv[2] == '--help') ||
                (process.argv[2] == '-V') ||
                (process.argv[2] == '--version') ||
                (cmnd.name().localeCompare(process.argv[2]) == 0)) {
                found = true;
                if ((process.argv[2] != '-h') &&
                    (process.argv[2] != '--help') &&
                    (process.argv[2] != 'init') &&
                    (process.argv[2] != '-V') &&
                    (process.argv[2] != '--version')) {
                    if (!workspace_1.workspace.isValidWorkspace()) {
                        logger.error('Workspace not initialized. Run "kumori init" first');
                        process.exit(1);
                    }
                }
                program.parse(process.argv);
                break;
            }
        }
        if (!found) {
            logger.error("Command not found.\n");
            program.help();
        }
    }
}
exports.executeProgram = executeProgram;
function printResults(callbacks) {
    for (let cb of callbacks) {
        logger.info(`---------------------------------------------------------`);
        cb();
    }
    logger.info(`---------------------------------------------------------`);
}
exports.printResults = printResults;
