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
const program = require("commander");
const logger = require("./logger");
const workspace_1 = require("./workspace");
const utils_1 = require("./utils");
function printStampData(stamp, data) {
    logger.info(`---------------------------------------------------------`);
    logger.info(`Name: \t\t\t${stamp}`);
    logger.info(`Admission URL: \t\t${data.admission}`);
    logger.info(`Authentication token: \t${data.token ? data.token : "Not set"}`);
    logger.info(`---------------------------------------------------------`);
}
program
    .command('add <name> <admission>')
    .description('Adds a new stamp to the workspace')
    .option('-t, --token <token>', 'The authentication token to access the admission service of the stamp')
    .option('-d, --default', 'Sets this stamp as the default stamp')
    .action((name, admission, { token, isDefault }) => {
    utils_1.run(() => __awaiter(this, void 0, void 0, function* () {
        logger.info(`Adding stamp ${name} to the workspace`);
        let config = {
            name: name,
            admission: admission
        };
        if (token) {
            config.token = token;
        }
        yield workspace_1.workspace.config.addStamp(name, config, isDefault);
        logger.info(`Stamp added`);
    }));
});
program
    .command('list')
    .description('Shows detailed information about the stamps registered in this workspace')
    .option('-s, --stamp <stamp>', 'Shows detailed information of this stamp only')
    .action(({ stamp }) => {
    utils_1.run(() => __awaiter(this, void 0, void 0, function* () {
        if (stamp) {
            logger.info(`Listing reigstered stamps`);
        }
        else {
            logger.info(`Listing detailed information of stamp ${stamp}`);
        }
        let stampsInfo = workspace_1.workspace.config.getStampsInformation(stamp);
        for (let stamp in stampsInfo) {
            printStampData(stamp, stampsInfo[stamp]);
        }
    }));
});
program
    .command('remove <name>')
    .description('Removes a stamp')
    .action((name) => {
    utils_1.run(() => __awaiter(this, void 0, void 0, function* () {
        logger.info(`Removing stamp ${name}`);
        yield workspace_1.workspace.config.removeStamp(name);
        logger.info("Stamp removed from the workspace");
    }));
});
program
    .command('update <name>')
    .description('Updates the information of a previously registered stamp')
    .option('-a, --admission <admission>', 'The URL to access admission service of the stamp')
    .option('-t, --token <token>', 'The authentication token to access the admission service of the stamp')
    .action((name, { admission, token }) => {
    utils_1.run(() => __awaiter(this, void 0, void 0, function* () {
        logger.info(`Updating stamp ${name} data`);
        let config = {
            name: name,
            admission: admission
        };
        if (token) {
            config.token = token;
        }
        yield workspace_1.workspace.config.updateStamp(name, config);
        logger.info(`Stamp data updated`);
    }));
});
program
    .command('use <name>')
    .description('Sets a stamp as the default stamp')
    .action((name) => {
    utils_1.run(() => __awaiter(this, void 0, void 0, function* () {
        logger.info(`Setting ${name} as the default stamp`);
        yield workspace_1.workspace.config.setDefaultStamp(name);
        logger.info("Default stamp updated");
    }));
});
utils_1.executeProgram(program);
// program.parse(process.argv);
