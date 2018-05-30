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
class ResourceManager extends element_manager_1.ElementManager {
    add(name, domain, template) {
        this._checkParameter(name, "Name not defined");
        this._checkParameter(domain, "Domain not defined");
        this._checkParameter(template, "Template not defined");
        return Promise.reject("NOT IMPLEMENTED");
    }
    register(name, domain, stamp) {
        return __awaiter(this, void 0, void 0, function* () {
            this._checkParameter(name, "Name not defined");
            this._checkParameter(domain, "Domain not defined");
            this._checkParameter(stamp, "Target stamp not defined");
            yield this._checkStamp(stamp);
            return Promise.reject("NOT IMPLEMENTED");
        });
    }
    remove(name, domain) {
        this._checkParameter(name, "Name not defined");
        this._checkParameter(domain, "Domain not defined");
        return Promise.reject("NOT IMPLEMENTED");
    }
    unregister(name, domain, stamp) {
        return __awaiter(this, void 0, void 0, function* () {
            this._checkParameter(name, "Name not defined");
            this._checkParameter(domain, "Domain not defined");
            this._checkParameter(stamp, "Target stamp not defined");
            yield this._checkStamp(stamp);
            return Promise.reject("NOT IMPLEMENTED");
        });
    }
}
exports.ResourceManager = ResourceManager;
//# sourceMappingURL=resource-manager.js.map