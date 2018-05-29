import { ElementInfo } from './element-info'
import { Domain, Version, Template } from './types'
import { ElementManager } from './element-manager'
import { workspace, ServiceConfig } from 'workspace'

export interface ServiceInfo extends ElementInfo {
}

export class ServiceManager extends ElementManager {
    public async add (name: string, domain: Domain, template: Template): Promise<ServiceInfo> {
        this._checkParameter(name, "Name not defined")
        this._checkParameter(domain, "Domain not defined")
        this._checkParameter(template, "Template not defined")
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
        this._checkParameter(name, "Name not defined")
        this._checkParameter(domain, "Domain not defined")
        this._checkParameter(stamp, "Target stamp not defined")
        await this._checkStamp(stamp)
        throw new Error("NOT IMPLEMENTED")
    }

    public async remove (name: string, domain: Domain): Promise<void> {
        this._checkParameter(name, "Name not defined")
        this._checkParameter(domain, "Domain not defined")
        throw new Error("NOT IMPLEMENTED")
    }

    public async unregister (name: string, domain: Domain, version: Version, stamp: string): Promise<void> {
        this._checkParameter(name, "Name not defined")
        this._checkParameter(domain, "Domain not defined")
        this._checkParameter(version, "Service version not defined")
        this._checkParameter(stamp, "Target stamp not defined")
        await this._checkStamp(stamp)
        throw new Error("NOT IMPLEMENTED")
    }

}