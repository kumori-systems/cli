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
const utils_1 = require("./utils");
const path = require("path");
const fs = require("fs-extra");
const admission_client_1 = require("@kumori/admission-client");
class ElementManager {
    constructor(configManager, subfolder) {
        this.configManager = configManager;
        this.subfolder = subfolder;
    }
    getCurrentVersion(name, domain) {
        try {
            let manifest = this._getElementManifest(name, domain);
            let parts = manifest.name.split('/');
            let version = parts[parts.length - 1];
            parts = version.split('_');
            for (let part of parts) {
                let converted = parseInt(part);
                if (converted == NaN) {
                    return undefined;
                }
            }
            return version;
        }
        catch (error) {
            return undefined;
        }
    }
    _checkElement(name, domain) {
        return new Promise((resolve, reject) => {
            try {
                let path = this._getElementFolder(name, domain);
                fs.stat(path, (error, stats) => {
                    if (error && error.code && error.code.localeCompare('ENOENT') == 0) {
                        resolve(false);
                    }
                    else if (error) {
                        reject(error);
                    }
                    else if (stats.isDirectory()) {
                        resolve(true);
                    }
                    else {
                        resolve(false);
                    }
                });
            }
            catch (error) {
                reject(error);
            }
        });
    }
    _getElementFolder(name, domain) {
        if (domain) {
            return path.join(process.cwd(), this.subfolder, domain, name);
        }
        else {
            return path.join(process.cwd(), this.subfolder, name);
        }
    }
    _getBundleFilePath(name, domain) {
        let runtimeFolder = this._getElementFolder(name, domain);
        return path.join(runtimeFolder, 'dist', 'bundle.zip');
    }
    _getElementManifestPath(name, domain) {
        try {
            let manifestPath = path.join(this._getElementFolder(name, domain), 'Manifest.json');
            utils_1.getJSON(manifestPath);
            return manifestPath;
        }
        catch (error) {
            if (error.code && error.code.localeCompare('ENOENT') == 0) {
                throw new Error(`Manifest not found for ${name}.`);
            }
            else {
                throw new Error(`Error accessing ${name}'s manifest. This error usually appears when the Manifest.json file is not a correct JSON document. Original error message: ${error.message}`);
            }
        }
    }
    _getElementManifest(name, domain) {
        try {
            let manifestPath = path.join(this._getElementFolder(name, domain), 'Manifest.json');
            return utils_1.getJSON(manifestPath);
        }
        catch (error) {
            if (error.code && error.code.localeCompare('ENOENT') == 0) {
                throw new Error(`Manifest not found for ${name}.`);
            }
            else {
                throw new Error(`Error accessing ${name}'s manifest. This error usually appears when the Manifest.json file is not a correct JSON document. Original error message: ${error.message}`);
            }
        }
    }
    _getAdmissionClient(stamp) {
        return __awaiter(this, void 0, void 0, function* () {
            let stampData = yield this.configManager.getStampConfig(stamp);
            if (!stampData) {
                throw new Error("Stamp not found.");
            }
            return new admission_client_1.AdmissionClient(`${stampData.admission}/admission`, stampData.token);
        });
    }
    _checkStamp(stamp) {
        return __awaiter(this, void 0, void 0, function* () {
            let admission;
            try {
                admission = yield this._getAdmissionClient(stamp);
                yield admission.init();
                yield admission.close();
            }
            catch (error) {
                if (error.code && (error.code.localeCompare('ECONNREFUSED') == 0)) {
                    error.message = `Connection to ${stamp} refused`;
                }
                else if (error.message && (error.message.indexOf("Authentication error") != -1)) {
                    error.message = `Authentication failure. Maybe your token expired or is not set. Use "kumori stamp update ${stamp} -t <TOKEN>" command to change it. Access your user settings in the platform dashboard to get a valid token.`;
                }
                else {
                    error.message = `Unable to connect to ${stamp}`;
                }
                try {
                    admission.close();
                }
                catch (err) { }
                throw error;
            }
        });
    }
    _checkParameter(param, errorMessage) {
        return utils_1.checkParameter(param, errorMessage);
    }
    _checkIsNumber(param, errorMessage, min, max) {
        return utils_1.checkIsNumber(param, errorMessage, min, max);
    }
    _removeElement(name, domain) {
        return __awaiter(this, void 0, void 0, function* () {
            let elemPath = this._getElementFolder(name, domain);
            yield fs.remove(elemPath);
        });
    }
    _checkName(name) {
        return utils_1.checkName(name);
    }
}
exports.ElementManager = ElementManager;
