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
const workspace_1 = require("workspace");
const element_manager_1 = require("./element-manager");
class ComponentManager extends element_manager_1.ElementManager {
    add(name, domain, template) {
        return __awaiter(this, void 0, void 0, function* () {
            let kumoriConfig = this.configManager.config;
            template = template || kumoriConfig.component.template;
            domain = domain || kumoriConfig.domain;
            this._checkParameter(name, "Name not defined");
            this._checkParameter(domain, "Domain not defined");
            this._checkParameter(template, "Template not defined");
            let config = {
                domain: domain,
                name: name
            };
            let path = yield workspace_1.workspace.component.add(template, config);
            let manifest = this._getElementManifest(name, domain);
            let info = {
                path: path,
                urn: manifest.name
            };
            return info;
        });
    }
    build(name, domain) {
        return __awaiter(this, void 0, void 0, function* () {
            this._checkParameter(name, "Name not defined");
            this._checkParameter(domain, "Domain not defined");
            let elementExists = yield this._checkElement(name, domain);
            if (!elementExists) {
                throw new Error(`Component ${name} not found for doman ${domain}`);
            }
            let config = {
                domain: domain,
                name: name
            };
            let path = yield workspace_1.workspace.component.build(config);
            return path;
        });
    }
    register(name, domain, stamp) {
        return __awaiter(this, void 0, void 0, function* () {
            this._checkParameter(name, "Name not defined");
            this._checkParameter(domain, "Domain not defined");
            this._checkParameter(stamp, "Target stamp not defined");
            yield this._checkStamp(stamp);
            throw new Error("NOT IMPLEMENTED");
        });
    }
    remove(name, domain) {
        return __awaiter(this, void 0, void 0, function* () {
            this._checkParameter(name, "Name not defined");
            this._checkParameter(domain, "Domain not defined");
            throw new Error("NOT IMPLEMENTED");
        });
    }
    unregister(name, domain, version, stamp) {
        return __awaiter(this, void 0, void 0, function* () {
            this._checkParameter(name, "Name not defined");
            this._checkParameter(domain, "Domain not defined");
            this._checkParameter(version, "Component version not defined");
            this._checkParameter(stamp, "Target stamp not defined");
            yield this._checkStamp(stamp);
            throw new Error("NOT IMPLEMENTED");
        });
    }
}
exports.ComponentManager = ComponentManager;
