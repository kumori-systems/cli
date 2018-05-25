import { ElementInfo } from './element-info'
import { Domain, Version, Template } from './types'
import { ElementManager } from './element-manager'
import { workspace, ServiceConfig } from 'workspace'

export interface ServiceInfo extends ElementInfo {
}

export class ServiceManager extends ElementManager {
    public async add (name: string, domain: Domain, template: Template): Promise<ServiceInfo> {
        let config:ServiceConfig = {
            name: name,
            domain: domain
        }
        let servicePath = await workspace.service.add(template, config)
        let manifest = this._getElementManifest(name, domain)
        let info:ServiceInfo = {
            path: servicePath,
            urn: manifest.name
        }
        return info
    }

    public async register (name: string, domain: Domain, stamp: string): Promise<Version> {
        throw new Error("NOT IMPLEMENTED")
    }

    public async remove (name: string, domain: Domain): Promise<void> {
        throw new Error("NOT IMPLEMENTED")
    }

    public async unregister (name: string, domain: Domain, version: Version, stamp: string): Promise<void> {
        throw new Error("NOT IMPLEMENTED")
    }

}