import { ElementInfo } from './element-info'
import { Domain, Version, Template, Path } from './types'
import { ElementManager } from './element-manager'
import { workspace, ServiceConfig } from '@kumori/workspace'

export interface ServiceInfo extends ElementInfo {
}

export class ServiceManager extends ElementManager {

    public async add (name: string, domain: Domain, template: Template): Promise<ServiceInfo> {
        this._checkParameter(name, "Name not defined")
        this._checkParameter(domain, "Domain not defined")
        this._checkParameter(template, "Template not defined")
        this._checkName(name)
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
        try {
            this._checkParameter(name, "Name not defined")
            this._checkParameter(domain, "Domain not defined")
            this._checkParameter(stamp, "Target stamp not defined")
            await this._checkStamp(stamp)
            let exists = await this._checkElement(name, domain)
            if (!exists) {
                throw new Error(`Service "${name}" with domain "${domain}" not found in the workspace`)
            }
            let servicePath = this._getElementManifestPath(name, domain)
            let bundlePath = await workspace.bundle([servicePath])
            let result = await workspace.register([bundlePath], stamp)
            if (result && result.successful && (result.successful.length > 0)) {
                let parts = result.successful[0].split('/')
                if (parts && (parts.length > 5)) {
                    return parts[parts.length - 1]
                }
            }
            throw new Error(`Service "${name}" registration failed for domain "${domain}" and stamp "${stamp}"`)
        } catch(error) {
            let message = error.message || error
            if (message.indexOf("already in storage") != -1) {
                throw new Error(`Component "${name}" from domain "${domain}" already registered in "${stamp}"`)
            } else {
                throw error
            }
        }

    }

    public async remove (name: string, domain: Domain): Promise<void> {
        this._checkParameter(name, "Name not defined")
        this._checkParameter(domain, "Domain not defined")
        if (await this._checkElement(name, domain)) {
            await this._removeElement(name, domain)
        } else {
            throw new Error(`Service "${name}" not found in the workspace for domain "${domain}"`)
        }
    }

    public async unregister (name: string, domain: Domain, version: Version, stamp: string): Promise<void> {
        this._checkParameter(name, "Name not defined")
        this._checkParameter(domain, "Domain not defined")
        this._checkParameter(version, "Service version not defined")
        this._checkParameter(stamp, "Target stamp not defined")
        await this._checkStamp(stamp)
        let urn = workspace.service.generateUrn(name, domain, version)
        await workspace.stamp.unregister(stamp, urn)
    }

}