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
const admission_client_1 = require("admission-client");
class DeploymentManager extends element_manager_1.ElementManager {
    add(name, domain, service, version, template) {
        return __awaiter(this, void 0, void 0, function* () {
            this._checkParameter(name, "Name not defined");
            this._checkParameter(domain, "Service domain not defined");
            this._checkParameter(service, "Service name not defined");
            this._checkParameter(version, "Service version not defined");
            this._checkParameter(template, "Template not defined");
            let config = {
                name: name,
                service: {
                    domain: domain,
                    name: service,
                    version: version
                }
            };
            let deploymentPath = yield workspace_1.workspace.deployment.add(template, config);
            let info = {
                path: deploymentPath
            };
            return info;
        });
    }
    update(name, template) {
        return __awaiter(this, void 0, void 0, function* () {
            this._checkParameter(name, "Name not defined");
            this._checkParameter(template, "Template not defined");
            throw new Error('NOT IMPLEMENTED');
        });
    }
    deploy(name, stamp) {
        return __awaiter(this, void 0, void 0, function* () {
            this._checkParameter(name, "Name not defined");
            this._checkParameter(stamp, "Target stamp not defined");
            yield this._checkStamp(stamp);
            let info = yield workspace_1.workspace.deployWithDependencies(name, stamp);
            if (!info.deployments) {
                throw new Error('Nothing deployed');
            }
            /*
            This converts the format returned by workspace lib to RegistrationData format
            RegistrationData format:
    
            export class RegistrationResult {
                public 'successful': any
                public 'errors': any
                public 'deployments': {
                    'successful': Deployment[]
                    'errors': any
                }
                public 'links': any
                public 'tests': any
                public 'testToken': string
            }
            */
            let errors = [];
            let deployments = [];
            if (info.deployments) {
                if (info.errors) {
                    errors.push.apply(errors, info.errors);
                }
                if (info.deployments.errors) {
                    errors.push.apply(errors, info.deployments.errors);
                }
                if ((info.deployments.successful) && (info.deployments.successful.length > 0)) {
                    for (let deployment of info.deployments.successful) {
                        let data = this._convertDeploymentToDeploymentData(deployment);
                        deployments.push(data);
                    }
                }
            }
            let registrationData = {};
            if (errors.length > 0) {
                registrationData.errors = errors;
            }
            if (deployments.length > 0) {
                registrationData.deployments = deployments;
            }
            return registrationData;
        });
    }
    /**
     * Returns a list of running services in the target stamp.
     * NOTE: ITI's Workspace infoCommand is not used since it directly prints the stamps
     *       data on console instead of returning it.
     * @param stamp The target stamp
     * @returns The list of running stamps
     */
    ps(stamp) {
        return __awaiter(this, void 0, void 0, function* () {
            this._checkParameter(stamp, "Target stamp not defined");
            yield this._checkStamp(stamp);
            let admission = yield this._getAdmissionClient(stamp);
            let data = [];
            let deployments = yield admission.findDeployments();
            if (deployments) {
                for (let name in deployments) {
                    let deployment = deployments[name];
                    data.push(this._convertDeploymentToDeploymentData(deployment));
                }
            }
            return data;
        });
    }
    remove(name) {
        this._checkParameter(name, "Name not defined");
        return Promise.reject("NOT IMPLEMENTED");
    }
    scale(urn, role, instances, stamp) {
        return __awaiter(this, void 0, void 0, function* () {
            this._checkParameter(urn, "Deployment URN not defined");
            this._checkParameter(role, "Role to scale not defined");
            this._checkParameter(instances, "New number of role instances not defined");
            this._checkIsNumber(instances, "The number of instances must be a natural number greater than zero", 1, Number.MAX_SAFE_INTEGER);
            this._checkParameter(stamp, "Target stamp not defined");
            yield this._checkStamp(stamp);
            if (!(yield this._checkDeployment(urn, stamp))) {
                return Promise.reject(`Deployment not found in ${stamp} with URN "${urn}"`);
            }
            let modification = new admission_client_1.ScalingDeploymentModification();
            modification.deploymentURN = urn;
            modification.scaling = {};
            modification.scaling[role] = instances;
            let admission = yield this._getAdmissionClient(stamp);
            let value = yield admission.modifyDeployment(modification);
            if (!value) {
                let deployments = yield admission.findDeployments(urn);
                return Object.keys(deployments[urn].roles[role].instances).length;
            }
            else {
                let newInstances = parseInt(value, 10);
                if (isNaN(newInstances)) {
                    throw new Error(`Error scaling role ${role} in servce ${urn}`);
                }
                return newInstances;
            }
        });
    }
    undeploy(urn, stamp) {
        return __awaiter(this, void 0, void 0, function* () {
            this._checkParameter(urn, "Deployment URN not defined");
            this._checkParameter(stamp, "Target stamp not defined");
            yield this._checkStamp(stamp);
            if (!(yield this._checkDeployment(urn, stamp))) {
                return Promise.reject(`Deployment not found in ${stamp} with URN "${urn}"`);
            }
            let admission = yield this._getAdmissionClient(stamp);
            let result = yield admission.undeploy(urn);
            let data = {
                urn: urn
            };
            return data;
        });
    }
    getDeploymentServiceName(name) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!name) {
                throw new Error(`Deployment name is empty`);
            }
            let manifest = this._getElementManifest(name);
            return manifest.servicename;
        });
    }
    _checkDeployment(name, stamp) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                let admission = yield this._getAdmissionClient(stamp);
                let deployments = yield admission.findDeployments(name);
                if ((!deployments) || (!deployments[name])) {
                    return false;
                }
                else {
                    return true;
                }
            }
            catch (error) {
                if (error.message && (error.message.indexOf(`Deployment ${name} does not exist`) != -1)) {
                    return false;
                }
                else if (error.message && (error.message.indexOf("Unexpected token u in JSON at position 0") != -1)) {
                    return false;
                }
                else {
                    throw new Error(`Failed checking deployment ${name} in stamp ${stamp}`);
                }
            }
        });
    }
    /**
     * Converts the Deployment structure to DeploymentData.
     *    export class Deployment {
     *        public urn: string
     *        public nickname: string
     *        public service: string
     *        public roles: {
     *            [key: string]: {
     *            instances: {[key: string]: DeploymentInstanceInfo}
     *            configuration: {
     *                parameters: {[key: string]: any}
     *            }
     *            arrangement: {
     *                bandwidth: number
     *                cpu: number
     *                failurezones: number
     *                ioperf: number
     *                iopsintensive: boolean
     *                instances: number
     *                maxinstances: number
     *                memory: number
     *                mininstances: number
     *                resilience: number
     *            }
     *            component: string
     *            entrypoint: {
     *                sslonly: boolean
     *                domain: string
     *                secrets: {
     *                cert: string
     *                key: string
     *                ca: string
     *                }
     *            }
     *            }
     *        }
     *        public links: {
     *            [key: string]:
     *            {[key: string]:
     *                {[key: string]: any}
     *            }
     *        }
     *        public resources: {
     *            [key: string]: any
     *        }
     *    }
     *
     * @param deployment The Deployment instance
     * @returns A DeploymentData instance
     */
    _convertDeploymentToDeploymentData(deployment) {
        let data = {
            urn: deployment.urn,
        };
        if (deployment.nickname) {
            data.nickname = deployment.nickname;
        }
        if (deployment.roles) {
            data.roles = [];
            for (let name in deployment.roles) {
                let roleData = {
                    name: name,
                    entrypoints: []
                };
                let role = deployment.roles[name];
                for (let section of ['entrypoint', 'configuration']) {
                    if (role[section] && role[section].domain) {
                        let protocol = role[section].sslonly ? 'https' : 'http';
                        roleData.entrypoints.push({
                            urn: `${protocol}://${role[section].domain}`
                        });
                    }
                }
            }
        }
        return data;
    }
}
exports.DeploymentManager = DeploymentManager;
