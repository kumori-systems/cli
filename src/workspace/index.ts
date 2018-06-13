import * as path from 'path'

import { ComponentManager } from './component-manager'
import { DeploymentManager } from './deployment-manager'
import { ResourceManager } from './resource-manager'
import { RuntimeManager } from './runtime-manager'
import { ServiceManager } from './service-manager'
import { WorkspaceConfigManager } from './workspace-manager'

export { Domain, Version, Template, Path, Urn, Url } from './types'

export { ComponentInfo } from './component-manager'
export { DeploymentData, DeploymentInfo, RegistrationData } from './deployment-manager'
export { ResourceInfo } from './resource-manager'
export { RuntimeInfo } from './runtime-manager'
export { ServiceInfo } from './service-manager'
export { StampConfig } from './workspace-manager'

import { workspace as itiWorkspace, configuration as iticonf, Deployment, DeploymentConfig, ServiceConfig, RegistrationResult } from '@kumori/workspace'

const CONFIG_FILE_NAME = 'kumoriConfig.json'
const WORKSPACE_CONFIG_FILE = path.join(process.cwd(), CONFIG_FILE_NAME);
// const config = new WorkspaceConfigManager(WORKSPACE_CONFIG_FILE)

export class Workspace {

    components: ComponentManager
    config: WorkspaceConfigManager
    deployments: DeploymentManager
    resources: ResourceManager
    runtimes: RuntimeManager
    services: ServiceManager

    constructor() {
        // Our custom configuration file name must be set in workspace lib
        iticonf.configFileName = CONFIG_FILE_NAME
        this.config = new WorkspaceConfigManager(WORKSPACE_CONFIG_FILE)
        this.components = new ComponentManager(this.config, 'components')
        this.deployments = new DeploymentManager(this.config, 'deployments')
        this.resources = new ResourceManager(this.config, 'resources')
        this.runtimes = new RuntimeManager(this.config, 'runtimes')
        this.services = new ServiceManager(this.config, 'services')
    }

    public isValidWorkspace(): boolean {
        return this.config.isValidWorkspace()
    }

    public async init(): Promise<void> {
        // await this.config.initConfigFile(JSON.stringify(DEFAULT_CONFIG, null, 2))
        await itiWorkspace.init()
    }
}

export const workspace = new Workspace()