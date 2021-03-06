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
const admission_client_1 = require("@kumori/admission-client");
const utils_1 = require("./utils");
const INBOUND_SERVICE_URN_PREFIX = 'eslap://eslap.cloud/services/http/inbound/';
var ServiceIdType;
(function (ServiceIdType) {
    ServiceIdType[ServiceIdType["Urn"] = 0] = "Urn";
    ServiceIdType[ServiceIdType["Name"] = 1] = "Name";
    ServiceIdType[ServiceIdType["Domain"] = 2] = "Domain";
})(ServiceIdType = exports.ServiceIdType || (exports.ServiceIdType = {}));
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
    deploy(name, stamp, addInbounds, buildComponents, forceBuildComponents) {
        return __awaiter(this, void 0, void 0, function* () {
            this._checkParameter(name, "Name not defined");
            this._checkParameter(stamp, "Target stamp not defined");
            yield this._checkStamp(stamp);
            let info = yield workspace_1.workspace.deployWithDependencies(name, stamp, addInbounds, buildComponents, forceBuildComponents);
            // if (!info.deployments) {
            //     console.log("--------->", info)
            //     throw new Error('Nothing deployed')
            // }
            /*
            This converts the format returned by workspace lib to RegistrationData format
            */
            let errors = [];
            if (info.errors) {
                errors.push.apply(errors, info.errors);
            }
            let deployments = [];
            if (info.deployments) {
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
            if (info.skipped) {
                registrationData.skipped = info.skipped;
            }
            return registrationData;
        });
    }
    /**
     * Returns the deployments URNs related to a given deployment configuration in the workspace.
     * The element of the deployment manifest used to search for the deployments is the
     * `servicename` key.
     *
     * @param name The deployment configuration name in the workspace
     * @param stamp The stamp to look in
     * @returns An array of deployment URNs
     */
    getUrnsFromDeploymentName(name, stamp) {
        return __awaiter(this, void 0, void 0, function* () {
            this._checkParameter(name, "Deployment name not defined");
            this._checkParameter(stamp, "Target stamp not defined");
            yield this._checkStamp(stamp);
            let elementExists = yield this._checkElement(name);
            if (!elementExists) {
                throw new Error(`Deployment configuration "${name}" not found in this workspace`);
            }
            let serviceName = yield this.getDeploymentServiceName(name);
            let admission = yield this._getAdmissionClient(stamp);
            let data = [];
            let deployments = yield admission.findDeployments();
            if (deployments) {
                for (let name in deployments) {
                    let deployment = deployments[name];
                    if (deployment.service.localeCompare(serviceName) == 0) {
                        data.push(name);
                    }
                }
            }
            return data;
        });
    }
    /**
     * Returns the deployments URNs linked to a given inbound represented by its domain.
     *
     * @param domain The inbound domain
     * @param stamp The stamp to look in
     * @returns An array of deployment URNs
     */
    getUrnsFromInboundDomain(domain, stamp) {
        return __awaiter(this, void 0, void 0, function* () {
            this._checkParameter(domain, "Domain not defined");
            this._checkParameter(stamp, "Target stamp not defined");
            yield this._checkStamp(stamp);
            let urns = [];
            let admission = yield this._getAdmissionClient(stamp);
            let deployments = yield admission.findDeployments();
            if (deployments) {
                for (let name in deployments) {
                    let deployment = deployments[name];
                    if (deployment.service.indexOf(INBOUND_SERVICE_URN_PREFIX) == 0) {
                        let vhost = utils_1.getNested(deployment, 'resources', 'vhost', 'resource', 'parameters', 'vhost');
                        let refDomain = utils_1.getNested(deployment, 'roles', 'sep', 'entrypoint', 'refDomain');
                        let sepDomain = utils_1.getNested(deployment, 'roles', 'sep', 'entrypoint', 'domain');
                        if (vhost && vhost.localeCompare(domain) == 0) {
                            for (let element of Object.keys(deployment.links.frontend)) {
                                urns.push(element);
                            }
                        }
                        else if (refDomain && refDomain.localeCompare(domain) == 0) {
                            for (let element of Object.keys(deployment.links.frontend)) {
                                urns.push(element);
                            }
                        }
                        else if (sepDomain && sepDomain.localeCompare(domain) == 0) {
                            for (let element of Object.keys(deployment.links.frontend)) {
                                urns.push(element);
                            }
                        }
                    }
                }
            }
            return urns;
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
        return __awaiter(this, void 0, void 0, function* () {
            this._checkParameter(name, "Name not defined");
            if (yield this._checkElement(name)) {
                yield this._removeElement(name);
            }
            else {
                throw new Error(`Deployment "${name}" not found in the workspace`);
            }
        });
    }
    scale(urn, role, instances, stamp) {
        return __awaiter(this, void 0, void 0, function* () {
            this._checkParameter(urn, "Deployment URN not defined");
            this._checkParameter(role, "Role to scale not defined");
            this._checkParameter(instances, "New number of role instances not defined");
            this._checkIsNumber(instances, "The number of instances must be a natural number greater than zero", 1, Number.MAX_SAFE_INTEGER);
            this._checkParameter(stamp, "Target stamp not defined");
            yield this._checkStamp(stamp);
            if (!(yield this.checkDeployment(urn, stamp))) {
                return Promise.reject(`Deployment not found in "${stamp}" with URN "${urn}"`);
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
                    throw new Error(`Error scaling role "${role}" in servce "${urn}"`);
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
            if (!(yield this.checkDeployment(urn, stamp))) {
                return Promise.reject(new Error(`Deployment "${urn}" not found in "${stamp}"`));
            }
            let admission = yield this._getAdmissionClient(stamp);
            yield admission.undeploy(urn);
            let data = {
                urn: urn
            };
            return data;
        });
    }
    getInboundsFromUrns(urns, stamp) {
        return __awaiter(this, void 0, void 0, function* () {
            this._checkParameter(urns, "Deployment URNs not defined");
            this._checkParameter(stamp, "Target stamp not defined");
            let admission = yield this._getAdmissionClient(stamp);
            let inbounds = [];
            for (let urn of urns) {
                let deployments = yield admission.findDeployments(urn);
                if (deployments && deployments[urn] && deployments[urn].links && deployments[urn].links.service) {
                    let linked = deployments[urn].links.service;
                    for (let name of Object.keys(linked)) {
                        let linkedDeployments = yield admission.findDeployments(name);
                        for (let link of Object.keys(linkedDeployments)) {
                            if (linkedDeployments[link].service.indexOf(INBOUND_SERVICE_URN_PREFIX) != -1) {
                                inbounds.push(linkedDeployments[link].urn);
                            }
                        }
                    }
                }
            }
            return inbounds;
        });
    }
    undeployUrns(urns, stamp) {
        return __awaiter(this, void 0, void 0, function* () {
            this._checkParameter(urns, "Deployment URNs not defined");
            this._checkParameter(stamp, "Target stamp not defined");
            yield this._checkStamp(stamp);
            let admission = yield this._getAdmissionClient(stamp);
            let results = {
                undeployed: [],
                errors: []
            };
            for (let urn of urns) {
                try {
                    if (yield this.checkDeployment(urn, stamp)) {
                        yield admission.undeploy(urn);
                        results.undeployed.push(urn);
                    }
                    else {
                        results.errors.push(new Error(`Service "${urn}" not found in "${stamp}"`));
                    }
                }
                catch (error) {
                    results.errors.push(new Error(`Service "${urn}" undeployment failed in "${stamp}": ${error.message || error}`));
                }
            }
            return results;
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
    checkDeployment(name, stamp) {
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
                    throw new Error(`Failed checking deployment "${name}" in stamp "${stamp}"`);
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
                data.roles.push(roleData);
            }
        }
        return data;
    }
}
exports.DeploymentManager = DeploymentManager;
