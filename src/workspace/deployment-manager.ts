import { ElementInfo } from './element-info'
import { Domain, Version, Template, Urn } from './types'
import { ElementManager } from './element-manager'
import { workspace, Deployment, DeploymentConfig, ExtendedRegistrationResult } from '@kumori/workspace'
import { ScalingDeploymentModification } from '@kumori/admission-client'
import { workspace as cliWorkspace} from './index'
import { getNested } from './utils'

const INBOUND_SERVICE_URN_PREFIX = 'eslap://eslap.cloud/services/http/inbound/'

export interface DeploymentInfo extends ElementInfo {
}

export interface EntrypointData {
    name?: string
    urn: string
}

export interface RoleData {
    name: string
    entrypoints: EntrypointData[]
}

export interface DeploymentData {
    urn: Urn
    nickname?: string,
    roles?: RoleData[]
}

export interface RegistrationData {
    errors?: any[]
    deployments?: DeploymentData[]
    skipped?: Urn[]
}

export enum ServiceIdType {
    Urn,
    Name,
    Domain
}

export class DeploymentManager extends ElementManager {

    public async add (name: string, domain: Domain, service: string, version: Version, template: Template): Promise<DeploymentInfo> {
        this._checkParameter(name, "Name not defined")
        this._checkParameter(domain, "Service domain not defined")
        this._checkParameter(service, "Service name not defined")
        this._checkParameter(version, "Service version not defined")
        this._checkParameter(template, "Template not defined")
        let config:DeploymentConfig = {
            name: name,
            service: {
                domain: domain,
                name: service,
                version: version
            }
        }
        let deploymentPath = await workspace.deployment.add(template, config)
        let info: DeploymentInfo = {
            path: deploymentPath
        }
        return info
    }

    public async update (name: string, template: Template): Promise<DeploymentInfo> {
        this._checkParameter(name, "Name not defined")
        this._checkParameter(template, "Template not defined")
        throw new Error('NOT IMPLEMENTED')
    }

    public async deploy (name: string, stamp: string, addInbounds: boolean, buildComponents: boolean, forceBuildComponents: boolean): Promise<RegistrationData> {
        this._checkParameter(name, "Name not defined")
        this._checkParameter(stamp, "Target stamp not defined")
        await this._checkStamp(stamp)
        let info:ExtendedRegistrationResult = await workspace.deployWithDependencies(
            name, stamp, addInbounds, buildComponents, forceBuildComponents
        )
        // if (!info.deployments) {
        //     console.log("--------->", info)
        //     throw new Error('Nothing deployed')
        // }
        /*
        This converts the format returned by workspace lib to RegistrationData format
        */
        let errors:any[] = []
        if (info.errors) {
            errors.push.apply(errors, info.errors)
        }
        let deployments:DeploymentData[] = []
        if (info.deployments) {
            if (info.deployments.errors) {
                errors.push.apply(errors, info.deployments.errors)
            }
            if ((info.deployments.successful) && (info.deployments.successful.length >  0)) {
                for (let deployment of info.deployments.successful) {
                    let data:DeploymentData = this._convertDeploymentToDeploymentData(deployment)
                    deployments.push(data)
                }
            }
        }
        let registrationData:RegistrationData = {}
        if (errors.length > 0) {
            registrationData.errors = errors
        }
        if (deployments.length > 0) {
            registrationData.deployments = deployments
        }
        if (info.skipped) {
            registrationData.skipped = info.skipped
        }

        return registrationData
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
    public async getUrnsFromDeploymentName(name: string, stamp: string): Promise<Urn[]> {
        this._checkParameter(name, "Deployment name not defined")
        this._checkParameter(stamp, "Target stamp not defined")
        await this._checkStamp(stamp)
        let elementExists = await this._checkElement(name)
        if (!elementExists) {
            throw new Error(`Deployment configuration "${name}" not found in this workspace`)
        }
        let serviceName = await this.getDeploymentServiceName(name)
        let admission = await this._getAdmissionClient(stamp)
        let data:Urn[] = []
        let deployments = await admission.findDeployments()
        if (deployments) {
            for (let name in deployments) {
                let deployment = deployments[name]
                if (deployment.service.localeCompare(serviceName) == 0) {
                    data.push(name as Urn)
                }
            }
        }
        return data
    }

    /**
     * Returns the deployments URNs linked to a given inbound represented by its domain.
     *
     * @param domain The inbound domain
     * @param stamp The stamp to look in
     * @returns An array of deployment URNs
     */
    public async getUrnsFromInboundDomain(domain: string, stamp: string): Promise<Urn[]> {
        this._checkParameter(domain, "Domain not defined")
        this._checkParameter(stamp, "Target stamp not defined")
        await this._checkStamp(stamp)
        let urns:Urn[] = []
        let admission = await this._getAdmissionClient(stamp)
        let deployments = await admission.findDeployments()
        if (deployments) {
            for (let name in deployments) {
                let deployment = deployments[name]
                if (deployment.service.indexOf(INBOUND_SERVICE_URN_PREFIX) == 0) {
                    let vhost = getNested(
                        deployment, 'resources', 'vhost', 'resource', 'parameters', 'vhost'
                    )
                    let refDomain = getNested(
                        deployment, 'roles', 'sep', 'entrypoint', 'refDomain'
                    )
                    let sepDomain = getNested(deployment, 'roles', 'sep', 'entrypoint', 'domain')
                    if (vhost && vhost.localeCompare(domain) == 0) {
                        for (let element of Object.keys(deployment.links.frontend)) {
                            urns.push(element as Urn)
                        }
                    }
                    else if (refDomain && refDomain.localeCompare(domain) == 0) {
                        for (let element of Object.keys(deployment.links.frontend)) {
                            urns.push(element as Urn)
                        }
                    }
                    else if (sepDomain && sepDomain.localeCompare(domain) == 0) {
                        for (let element of Object.keys(deployment.links.frontend)) {
                            urns.push(element as Urn)
                        }
                    }
                }
            }
        }
        return urns
    }

    /**
     * Returns a list of running services in the target stamp.
     * NOTE: ITI's Workspace infoCommand is not used since it directly prints the stamps
     *       data on console instead of returning it.
     * @param stamp The target stamp
     * @returns The list of running stamps
     */
    public async ps (stamp: string): Promise<DeploymentData[]> {
        this._checkParameter(stamp, "Target stamp not defined")
        await this._checkStamp(stamp)
        let admission = await this._getAdmissionClient(stamp)
        let data:DeploymentData[] = []
        let deployments = await admission.findDeployments()
        if (deployments) {
            for (let name in deployments) {
                let deployment = deployments[name]
                data.push(this._convertDeploymentToDeploymentData(deployment))
            }
        }
        return data
    }

    public async remove (name: string): Promise<void> {
        this._checkParameter(name, "Name not defined")
        if (await this._checkElement(name)) {
            await this._removeElement(name)
        } else {
            throw new Error(`Deployment "${name}" not found in the workspace`)
        }
    }

    public async scale (urn: string, role:string, instances: number, stamp: string): Promise<number> {
        this._checkParameter(urn, "Deployment URN not defined")
        this._checkParameter(role, "Role to scale not defined")
        this._checkParameter(instances, "New number of role instances not defined")
        this._checkIsNumber(instances, "The number of instances must be a natural number greater than zero", 1, Number.MAX_SAFE_INTEGER)
        this._checkParameter(stamp, "Target stamp not defined")
        await this._checkStamp(stamp)
        if (!(await this.checkDeployment(urn, stamp))) {
            return Promise.reject(`Deployment not found in "${stamp}" with URN "${urn}"`)
        }
        let modification = new ScalingDeploymentModification();
        modification.deploymentURN = urn;
        modification.scaling = {};
        modification.scaling[role] = instances;
        let admission = await this._getAdmissionClient(stamp)
        let value = await admission.modifyDeployment(modification)
        if (!value) {
            let deployments:{[key: string]: Deployment} = await admission.findDeployments(urn)
            return Object.keys(deployments[urn].roles[role].instances).length
        } else {
            let newInstances:number = parseInt(value, 10)
            if (isNaN(newInstances)) {
                throw new Error(`Error scaling role "${role}" in servce "${urn}"`)
            }
            return newInstances
        }
    }

    public async undeploy (urn: string, stamp: string): Promise<DeploymentData> {
        this._checkParameter(urn, "Deployment URN not defined")
        this._checkParameter(stamp, "Target stamp not defined")
        await this._checkStamp(stamp)
        if (!(await this.checkDeployment(urn, stamp))) {
            return Promise.reject(new Error(`Deployment "${urn}" not found in "${stamp}"`))
        }
        let admission = await this._getAdmissionClient(stamp)
        await admission.undeploy(urn)
        let data = {
            urn: urn
        }
        return data
    }

    public async getInboundsFromUrns(urns: Urn[], stamp: string): Promise<Urn[]> {
        this._checkParameter(urns, "Deployment URNs not defined")
        this._checkParameter(stamp, "Target stamp not defined")
        let admission = await this._getAdmissionClient(stamp)
        let inbounds:Urn[] = []
        for (let urn of urns) {
            let deployments:{[key: string]: Deployment} = await admission.findDeployments(urn)
            if (deployments && deployments[urn] && deployments[urn].links && deployments[urn].links.service) {
                let linked = deployments[urn].links.service
                for (let name of Object.keys(linked)) {
                    let linkedDeployments:{[key: string]: Deployment} = await admission.findDeployments(name)
                    for (let link of Object.keys(linkedDeployments)) {
                        if (linkedDeployments[link].service.indexOf(INBOUND_SERVICE_URN_PREFIX) != -1) {
                            inbounds.push(linkedDeployments[link].urn)
                        }
                    }
                }
            }
        }
        return inbounds
    }

    public async undeployUrns(
        urns: Urn[],
        stamp: string
    ): Promise<{ undeployed: Urn[], errors: Error[] }> {
        this._checkParameter(urns, "Deployment URNs not defined")
        this._checkParameter(stamp, "Target stamp not defined")
        await this._checkStamp(stamp)
        let admission = await this._getAdmissionClient(stamp)
        let results = {
            undeployed: [],
            errors: []
        }
        for (let urn of urns) {
            try {
                if (await this.checkDeployment(urn, stamp)) {
                    await admission.undeploy(urn)
                    results.undeployed.push(urn)
                } else {
                    results.errors.push(new Error(`Service "${urn}" not found in "${stamp}"`))
                }
            } catch(error) {
                results.errors.push(new Error(`Service "${urn}" undeployment failed in "${stamp}": ${error.message || error}`))
            }
        }
        return results
    }

    public async getDeploymentServiceName(name: string): Promise<Urn> {
        if (!name) {
            throw new Error(`Deployment name is empty`)
        }
        let manifest = this._getElementManifest(name)
        return manifest.servicename as Urn
    }

    public async checkDeployment(name: string, stamp: string): Promise<boolean> {
        try {
            let admission = await this._getAdmissionClient(stamp)
            let deployments:{[key: string]: Deployment} = await admission.findDeployments(name)
            if ((!deployments) || (!deployments[name])) {
                return false
            } else {
                return true
            }
        } catch(error) {
            if (error.message && (error.message.indexOf(`Deployment ${name} does not exist`) != -1)) {
                return false
            } else if (error.message && (error.message.indexOf("Unexpected token u in JSON at position 0") != -1)) {
                return false
            } else {
                throw new Error(`Failed checking deployment "${name}" in stamp "${stamp}"`)
            }
        }
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
    private _convertDeploymentToDeploymentData(deployment: Deployment): DeploymentData {
        let data:DeploymentData = {
            urn: deployment.urn,
        }
        if (deployment.nickname) {
            data.nickname = deployment.nickname
        }
        if (deployment.roles) {
            data.roles = <RoleData[]>[]
            for (let name in deployment.roles) {
                let roleData = {
                    name: name,
                    entrypoints: <EntrypointData[]>[]
                }
                let role = deployment.roles[name]
                for (let section of ['entrypoint', 'configuration']) {
                    if (role[section] && role[section].domain) {
                        let protocol = role[section].sslonly ? 'https' : 'http'
                        roleData.entrypoints.push({
                            urn: `${protocol}://${role[section].domain}`
                        })
                    }
                }
                data.roles.push(roleData)
            }
        }
        return data
    }
}
