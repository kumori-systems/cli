import { ElementInfo } from './element-info'
import { Domain, Template } from './types'
import { ElementManager } from './element-manager'
import { workspace, ResourceConfig } from '@kumori/workspace'

export interface ResourceInfo extends ElementInfo {
}

export class ResourceManager extends ElementManager {
    public async add (name: string, domain: Domain, template: Template): Promise<ResourceInfo> {
        this._checkParameter(name, "Name not defined")
        this._checkParameter(domain, "Domain not defined")
        this._checkParameter(template, "Template not defined")
        let config:ResourceConfig = {
            name: name,
            domain: domain
        }
        let resourcePath = await workspace.resource.add(template, config)
        let manifest = this._getElementManifest(name, domain)
        let info:ResourceInfo = {
            path: resourcePath,
            urn: manifest.name
        }
        return info
    }

    public async register (name: string, domain: Domain, stamp: string): Promise<void> {
        try {
            this._checkParameter(name, "Name not defined")
            this._checkParameter(domain, "Domain not defined")
            this._checkParameter(stamp, "Target stamp not defined")
            await this._checkStamp(stamp)
            let exists = await this._checkElement(name, domain)
            if (!exists) {
                throw new Error(`Resource "${name}" with domain "${domain}" not found in the workspace`)
            }
            let resourcePath = this._getElementManifestPath(name, domain)
            let bundlePath = await workspace.bundle([resourcePath])
            let result = await workspace.register([bundlePath], stamp)
            if (result && result.successful && (result.successful.length > 0)) {
                return
            }
            throw new Error(`Resource "${name}" registration failed for domain "${domain}" and stamp "${stamp}"`)
        } catch(error) {
            let message = error.message || error
            if (message.indexOf("already in storage") != -1) {
                throw new Error(`Resource "${name}" from domain "${domain}" already registered in "${stamp}"`)
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
            throw new Error(`Resource "${name}" not found in the workspace for domain "${domain}"`)
        }
    }

    public async unregister (name: string, domain: Domain, stamp: string): Promise<void> {
        this._checkParameter(name, "Name not defined")
        this._checkParameter(domain, "Domain not defined")
        this._checkParameter(stamp, "Target stamp not defined")
        await this._checkStamp(stamp)
        let urn = workspace.resource.generateUrn(name, domain)
        await workspace.stamp.unregister(stamp, urn)
    }

}
