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
const fs = require("fs");
const DEFAULT_CONFIG = {
    "working-stamp": "localstamp",
    "domain": "domain.com",
    "component": {
        "template": "javascript"
    },
    "deployment": {
        "template": "basic"
    },
    "resource": {
        "template": "vhost"
    },
    "runtime": {
        "template": "basic",
        "parent": "eslap://eslap.cloud/runtime/native/1_1_1",
        "folder": "/eslap/component",
        "entrypoint": "/eslap/runtime-agent/scripts/start-runtime-agent.sh"
    },
    "service": {
        "template": "basic"
    },
    "stamps": {
        "localstamp": {
            "admission": "http://localhost:8090"
        }
    }
};
class WorkspaceConfigManager {
    constructor(configFilePath) {
        this.loadConfig(configFilePath);
    }
    initConfigFile(data) {
        return __awaiter(this, void 0, void 0, function* () {
            return this._saveChangesRaw(data);
        });
    }
    isValidWorkspace() {
        return this.initialized;
        // return (this.config != null) && (this.config != undefined)
    }
    loadConfig(configFilePath) {
        try {
            this.configFilePath = configFilePath;
            let rawConfig = utils_1.getJSON(this.configFilePath);
            this.config = this._convertRawConfig(rawConfig);
            this.initialized = true;
        }
        catch (error) {
            this.initialized = false;
            if (error.code.localeCompare("ENOENT") != 0) {
                throw error;
            }
            else {
                this.config = DEFAULT_CONFIG;
            }
        }
    }
    saveChanges() {
        try {
            if (this.config) {
                let data = JSON.stringify(this.config);
                let configCopy = JSON.parse(data);
                if (this.config.defaultStamp) {
                    let workingStamp = this.config.defaultStamp.name;
                    configCopy['working-stamp'] = workingStamp;
                    delete configCopy.defaultStamp;
                }
                for (let stamp in configCopy.stamps) {
                    if (configCopy.stamps[stamp].name) {
                        delete configCopy.stamps[stamp].name;
                    }
                }
                return this._saveChangesRaw(JSON.stringify(configCopy, null, 4));
            }
        }
        catch (error) {
            console.log("ERROR", error);
        }
    }
    getWorkspaceConfig(path) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.config;
        });
    }
    getStampConfig(stamp) {
        return __awaiter(this, void 0, void 0, function* () {
            utils_1.checkParameter(stamp, "Stamp not defined");
            return stamp ? this.config.stamps[stamp] : yield this.getDefaultStampConfig();
        });
    }
    getDefaultDomain() {
        return __awaiter(this, void 0, void 0, function* () {
            return this.config.domain;
        });
    }
    setDefaultDomain(domain) {
        return __awaiter(this, void 0, void 0, function* () {
            utils_1.checkParameter(domain, "Domain not defined");
            this.config.domain = domain;
            yield this.saveChanges();
        });
    }
    addStamp(name, config, isDefault = false) {
        return __awaiter(this, void 0, void 0, function* () {
            utils_1.checkParameter(name, "Name not defined");
            utils_1.checkParameter(config, "Stamp config not defined");
            if (this.config.stamps[name]) {
                throw new Error(`Stamp ${name} already registered`);
            }
            this.config.stamps[name] = config;
            if (isDefault) {
                this.setDefaultStamp(name);
            }
            yield this.saveChanges();
        });
    }
    updateStamp(name, config) {
        return __awaiter(this, void 0, void 0, function* () {
            utils_1.checkParameter(name, "Name not defined");
            utils_1.checkParameter(config, "Stamp config not defined");
            if (!this.config.stamps[name]) {
                throw new Error(`Stamp ${name} is not registered`);
            }
            this.config.stamps[name].admission = config.admission || this.config.stamps[name].admission;
            this.config.stamps[name].token = config.token || this.config.stamps[name].token;
            yield this.saveChanges();
        });
    }
    removeStamp(name) {
        return __awaiter(this, void 0, void 0, function* () {
            utils_1.checkParameter(name, "Name not defined");
            if (!this.config.stamps[name]) {
                throw new Error(`Stamp ${name} is not registered`);
            }
            if (this.config.defaultStamp && (name.localeCompare(this.config.defaultStamp.name) == 0)) {
                throw new Error(`Stamp ${name} is the default stamp and cannot be removed`);
            }
            delete this.config.stamps[name];
            yield this.saveChanges();
        });
    }
    setDefaultStamp(name) {
        return __awaiter(this, void 0, void 0, function* () {
            utils_1.checkParameter(name, "Name not defined");
            if (!this.config.stamps[name]) {
                throw new Error(`Stamp ${name} is not registered`);
            }
            this.config.defaultStamp = this.config.stamps[name];
            yield this.saveChanges();
        });
    }
    getDefaultStampConfig() {
        return __awaiter(this, void 0, void 0, function* () {
            return this.config.defaultStamp;
        });
    }
    _saveChangesRaw(data) {
        return new Promise((resolve, reject) => {
            try {
                fs.writeFile(this.configFilePath, data, (error) => {
                    if (error) {
                        reject(error);
                    }
                    else {
                        resolve();
                    }
                });
            }
            catch (error) {
                reject(error);
            }
        });
    }
    _convertRawConfig(raw) {
        let config = {
            domain: raw.domain,
            component: raw.component,
            deployment: raw.deployment,
            resource: raw.resource,
            runtime: raw.runtime,
            service: raw.service,
            stamps: raw.stamps,
            defaultStamp: raw.stamps[raw['working-stamp']]
        };
        for (let name in config.stamps) {
            config.stamps[name].name = name;
        }
        return config;
    }
}
exports.WorkspaceConfigManager = WorkspaceConfigManager;
//# sourceMappingURL=workspace-manager.js.map