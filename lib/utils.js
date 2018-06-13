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
function executeProgram(program) {
    if (process.argv.length <= 2) {
        console.log(`\n  Error: subcommand expected`);
        program.help();
    }
    else {
        let found = false;
        for (let cmnd of program.commands) {
            if ((process.argv[2] == '-V') || (process.argv[2] == '--version') || (cmnd.name().localeCompare(process.argv[2]) == 0)) {
                found = true;
                if ((process.argv[2] != 'init') && (process.argv[2] != '-V') && (process.argv[2] != '--version')) {
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
