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
class RuntimeManager extends element_manager_1.ElementManager {
    add(name, domain, parent, componentFolder, entrypoint, template) {
        return __awaiter(this, void 0, void 0, function* () {
            this._checkParameter(name, "Name not defined");
            this._checkParameter(domain, "Domain not defined");
            this._checkParameter(parent, "Parent runtime not defined");
            this._checkParameter(componentFolder, "Component folder not defined");
            this._checkParameter(entrypoint, "Entrypoint not defined");
            this._checkParameter(template, "Template not defined");
            let config = {
                name: name,
                domain: domain
            };
            if (parent) {
                config.parent = parent;
            }
            if (componentFolder) {
                config.componentFolder = componentFolder;
            }
            if (entrypoint) {
                config.entrypoint = entrypoint;
            }
            let runtimePath = yield workspace_1.workspace.runtime.add(template, config);
            let manifest = this._getElementManifest(name, domain);
            let info = {
                path: runtimePath,
                urn: manifest.name
            };
            return info;
        });
    }
    build(name, domain) {
        return __awaiter(this, void 0, void 0, function* () {
            this._checkParameter(name, "Name not defined");
            this._checkParameter(domain, "Domain not defined");
            let manifest = this._getElementManifest(name, domain);
            this._checkParameter(manifest, "Manifest not found");
            this._checkParameter(manifest.derived, "Parent runtime not found in the runtime manifest (key derived.from)");
            this._checkParameter(manifest.derived.from, "Parent runtime not found in the runtime manifest (key derived.from)");
            let config = {
                name: name,
                domain: domain
            };
            yield workspace_1.workspace.runtime.build(config);
            return this._getBundleFilePath(name, domain);
        });
    }
    register(name, domain, stamp) {
        return __awaiter(this, void 0, void 0, function* () {
            this._checkParameter(name, "Name not defined");
            this._checkParameter(domain, "Domain not defined");
            this._checkParameter(stamp, "Target stamp not defined");
            yield this._checkStamp(stamp);
            let exists = yield this._checkElement(name, domain);
            if (!exists) {
                throw new Error(`Runtime "${name}" with domain "${domain}" not found in the workspace`);
            }
            let bundlePath = this._getBundleFilePath(name, domain);
            yield workspace_1.workspace.register([bundlePath], stamp);
            let manifest = this._getElementManifest(name, domain);
            let parts = manifest.name.split('/');
            return parts[parts.length - 1];
        });
    }
    remove(name, domain) {
        this._checkParameter(name, "Name not defined");
        this._checkParameter(domain, "Domain not defined");
        return Promise.reject("NOT IMPLEMENTED");
    }
    unregister(name, domain, version, stamp) {
        return __awaiter(this, void 0, void 0, function* () {
            this._checkParameter(name, "Name not defined");
            this._checkParameter(domain, "Domain not defined");
            this._checkParameter(version, "Runtime version not defined");
            this._checkParameter(stamp, "Target stamp not defined");
            yield this._checkStamp(stamp);
            let urn = workspace_1.workspace.runtime.generateUrn(name, domain, version);
            yield workspace_1.workspace.stamp.unregister(stamp, urn);
        });
    }
}
exports.RuntimeManager = RuntimeManager;
