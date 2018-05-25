import { ElementInfo } from './element-info'
import { Domain, Version, Template, Urn } from './types'
import { ElementManager } from './element-manager'
import { workspace, Deployment, DeploymentConfig, ServiceConfig, RegistrationResult } from 'workspace'
import { getAdmissionClient } from './utils'

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
}

export class DeploymentManager extends ElementManager {

    public async add (name: string, domain: Domain, service: string, version: Version, template: Template): Promise<DeploymentInfo> {
        let config:DeploymentConfig = {
            name: name,
            config: {
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

    public async deploy (name: string, stamp: string): Promise<RegistrationData> {
        let info:RegistrationResult = await workspace.deployWithDependencies(name, stamp)
        if (!info.deployments) {
            throw new Error('Nothing deployed')
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
        let errors:any[] = []
        let deployments:DeploymentData[] = []
        if (info.deployments) {
            if (info.errors) {
                errors.push.apply(errors, info.errors)
            }
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

        return registrationData
    }

    /**
     * Returns a list of running services in the target stamp.
     * NOTE: ITI's Workspace infoCommand is not used since it directly prints the stamps
     *       data on console instead of returning it.
     * @param stamp The target stamp
     * @returns The list of running stamps
     */
    public async ps (stamp: string): Promise<DeploymentData[]> {
        let admission = getAdmissionClient(stamp)
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

    public remove (name: string): Promise<void> {
        return Promise.reject("NOT IMPLEMENTED");
    }

    public async scale (name: string, role:string, instances: number, stamp: string): Promise<number> {
        let value:string = await workspace.deploment.scaleRole(name, role, instances, stamp)
        if (!value) {
            throw new Error(`Error scaling role ${role} in servce ${name}`)
        }
        let newInstances:number = parseInt(value, 10)
        if (isNaN(newInstances)) {
            throw new Error(`Error scaling role ${role} in servce ${name}`)
        }
        return newInstances
    }

    public async undeploy (name: string, stamp: string): Promise<DeploymentData> {
        let admission = getAdmissionClient(stamp)
        let result = admission.undeploy(name)
        let data = {
            urn: name
        }
        return data
    }

    public async getDeploymentServiceName(name: string): Promise<Urn> {
        if (!name) {
            throw new Error(`Deployment name is empty`)
        }
        let manifest = this._getElementManifest(name)
        return manifest.servicename as Urn
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
            }
        }
        return data
    }
}
