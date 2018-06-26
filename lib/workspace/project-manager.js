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
const workspace_1 = require("@kumori/workspace");
const element_manager_1 = require("./element-manager");
class ProjectManager extends element_manager_1.ElementManager {
    add(name, domain, template) {
        return __awaiter(this, void 0, void 0, function* () {
            let kumoriConfig = this.configManager.config;
            template = template || kumoriConfig.project.template;
            domain = domain || kumoriConfig.domain;
            this._checkParameter(name, "Name not defined");
            this._checkParameter(domain, "Domain not defined");
            this._checkParameter(template, "Template not defined");
            this._checkName(name);
            let config = {
                domain: domain,
                name: name
            };
            yield workspace_1.workspace.project.add(template, config);
            let info = {};
            return info;
        });
    }
}
exports.ProjectManager = ProjectManager;
