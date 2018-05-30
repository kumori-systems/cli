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
const workspace_1 = require("workspace");
class ServiceManager extends element_manager_1.ElementManager {
    add(name, domain, template) {
        return __awaiter(this, void 0, void 0, function* () {
            this._checkParameter(name, "Name not defined");
            this._checkParameter(domain, "Domain not defined");
            this._checkParameter(template, "Template not defined");
            let config = {
                name: name,
                domain: domain
            };
            let servicePath = yield workspace_1.workspace.service.add(template, config);
            let manifest = this._getElementManifest(name, domain);
            let info = {
                path: servicePath,
                urn: manifest.name
            };
            return info;
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
            this._checkParameter(version, "Service version not defined");
            this._checkParameter(stamp, "Target stamp not defined");
            yield this._checkStamp(stamp);
            throw new Error("NOT IMPLEMENTED");
        });
    }
}
exports.ServiceManager = ServiceManager;
//# sourceMappingURL=service-manager.js.map