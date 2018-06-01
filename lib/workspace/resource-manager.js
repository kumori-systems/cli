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
const element_manager_1 = require("./element-manager");
const workspace_1 = require("@kumori/workspace");
class ResourceManager extends element_manager_1.ElementManager {
    add(name, domain, template) {
        return __awaiter(this, void 0, void 0, function* () {
            this._checkParameter(name, "Name not defined");
            this._checkParameter(domain, "Domain not defined");
            this._checkParameter(template, "Template not defined");
            let config = {
                name: name,
                domain: domain
            };
            let resourcePath = yield workspace_1.workspace.resource.add(template, config);
            let manifest = this._getElementManifest(name, domain);
            let info = {
                path: resourcePath,
                urn: manifest.name
            };
            return info;
        });
    }
    register(name, domain, stamp) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                this._checkParameter(name, "Name not defined");
                this._checkParameter(domain, "Domain not defined");
                this._checkParameter(stamp, "Target stamp not defined");
                yield this._checkStamp(stamp);
                let exists = yield this._checkElement(name, domain);
                if (!exists) {
                    throw new Error(`Resource "${name}" with domain "${domain}" not found in the workspace`);
                }
                let resourcePath = this._getElementManifestPath(name, domain);
                let bundlePath = yield workspace_1.workspace.bundle([resourcePath]);
                let result = yield workspace_1.workspace.register([bundlePath], stamp);
                if (result && result.successful && (result.successful.length > 0)) {
                    return;
                }
                throw new Error(`Resource "${name}" registration failed for domain "${domain}" and stamp "${stamp}"`);
            }
            catch (error) {
                let message = error.message || error;
                if (message.indexOf("already in storage") != -1) {
                    throw new Error(`Resource "${name}" from domain "${domain}" already registered in "${stamp}"`);
                }
                else {
                    throw error;
                }
            }
        });
    }
    remove(name, domain) {
        return __awaiter(this, void 0, void 0, function* () {
            this._checkParameter(name, "Name not defined");
            this._checkParameter(domain, "Domain not defined");
            if (yield this._checkElement(name, domain)) {
                yield this._removeElement(name, domain);
            }
            else {
                throw new Error(`Resource "${name}" not found in the workspace for domain "${domain}"`);
            }
        });
    }
    unregister(name, domain, stamp) {
        return __awaiter(this, void 0, void 0, function* () {
            this._checkParameter(name, "Name not defined");
            this._checkParameter(domain, "Domain not defined");
            this._checkParameter(stamp, "Target stamp not defined");
            yield this._checkStamp(stamp);
            let urn = workspace_1.workspace.resource.generateUrn(name, domain);
            yield workspace_1.workspace.stamp.unregister(stamp, urn);
        });
    }
}
exports.ResourceManager = ResourceManager;
