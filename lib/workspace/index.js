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
const path = require("path");
const component_manager_1 = require("./component-manager");
const deployment_manager_1 = require("./deployment-manager");
const resource_manager_1 = require("./resource-manager");
const runtime_manager_1 = require("./runtime-manager");
const service_manager_1 = require("./service-manager");
const workspace_manager_1 = require("./workspace-manager");
const project_manager_1 = require("./project-manager");
var types_1 = require("./types");
exports.Domain = types_1.Domain;
exports.Version = types_1.Version;
exports.Template = types_1.Template;
exports.Path = types_1.Path;
exports.Urn = types_1.Urn;
exports.Url = types_1.Url;
var component_manager_2 = require("./component-manager");
exports.ComponentInfo = component_manager_2.ComponentInfo;
var deployment_manager_2 = require("./deployment-manager");
exports.DeploymentData = deployment_manager_2.DeploymentData;
exports.DeploymentInfo = deployment_manager_2.DeploymentInfo;
exports.RegistrationData = deployment_manager_2.RegistrationData;
var resource_manager_2 = require("./resource-manager");
exports.ResourceInfo = resource_manager_2.ResourceInfo;
var runtime_manager_2 = require("./runtime-manager");
exports.RuntimeInfo = runtime_manager_2.RuntimeInfo;
var service_manager_2 = require("./service-manager");
exports.ServiceInfo = service_manager_2.ServiceInfo;
var workspace_manager_2 = require("./workspace-manager");
exports.StampConfig = workspace_manager_2.StampConfig;
const workspace_1 = require("@kumori/workspace");
const CONFIG_FILE_NAME = 'kumoriConfig.json';
const WORKSPACE_CONFIG_FILE = path.join(process.cwd(), CONFIG_FILE_NAME);
// const config = new WorkspaceConfigManager(WORKSPACE_CONFIG_FILE)
class Workspace {
    constructor() {
        // Our custom configuration file name must be set in workspace lib
        workspace_1.configuration.configFileName = CONFIG_FILE_NAME;
        this.configManager = new workspace_manager_1.WorkspaceConfigManager(WORKSPACE_CONFIG_FILE);
        this.components = new component_manager_1.ComponentManager(this.configManager, 'components');
        this.deployments = new deployment_manager_1.DeploymentManager(this.configManager, 'deployments');
        this.projects = new project_manager_1.ProjectManager(this.configManager, '.');
        this.resources = new resource_manager_1.ResourceManager(this.configManager, 'resources');
        this.runtimes = new runtime_manager_1.RuntimeManager(this.configManager, 'runtimes');
        this.services = new service_manager_1.ServiceManager(this.configManager, 'services');
    }
    isValidWorkspace() {
        return this.configManager.isValidWorkspace();
    }
    init(template) {
        return __awaiter(this, void 0, void 0, function* () {
            // await this.config.initConfigFile(JSON.stringify(DEFAULT_CONFIG, null, 2))
            yield workspace_1.workspace.init(template);
        });
    }
}
exports.Workspace = Workspace;
exports.workspace = new Workspace();
