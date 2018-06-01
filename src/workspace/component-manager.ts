import { ElementInfo } from './element-info'
import { Domain, Version, Template, Path } from './types'
import { workspace, ComponentConfig } from '@kumori/workspace'
import { ElementManager } from './element-manager'

export interface ComponentInfo extends ElementInfo {
}

export class ComponentManager extends ElementManager {

    public async add (name: string, domain: Domain, template: Template): Promise<ComponentInfo> {
        let kumoriConfig = this.configManager.config
        template = template || kumoriConfig.component.template
        domain = domain || kumoriConfig.domain
        this._checkParameter(name, "Name not defined")
        this._checkParameter(domain, "Domain not defined")
        this._checkParameter(template, "Template not defined")
        let config = {
            domain: domain,
            name: name
        }
        let path = await workspace.component.add(template, config)
        let manifest = this._getElementManifest(name, domain)
        let info:ComponentInfo = {
            path: path,
            urn: manifest.name
        }
        return info
    }

    public async build (name: string, domain: Domain): Promise<Path> {
        this._checkParameter(name, "Name not defined")
        this._checkParameter(domain, "Domain not defined")
        let elementExists = await this._checkElement(name, domain)
        if (!elementExists) {
            throw new Error(`Component "${name}" not found for doman "${domain}"`)
        }
        let config = {
            domain: domain,
            name: name
        }
        let path = await workspace.component.build(config)
        return path
    }

    public async register(name: string, domain: Domain, stamp: string): Promise<Version> {
        try {
            this._checkParameter(name, "Name not defined")
            this._checkParameter(domain, "Domain not defined")
            this._checkParameter(stamp, "Target stamp not defined")
            await this._checkStamp(stamp)
            let exists = await this._checkElement(name, domain)
            if (!exists) {
                throw new Error(`Component "${name}" with domain "${domain}" not found in the workspace`)
            }
            let config:ComponentConfig = {
                domain: domain,
                name: name
            }
            config.version = await workspace.component.getCurrentVersion(config)
            this._checkParameter(config.version, `Component "${name}" with domain "${domain}" not found in the workspace`)
            let bundlePath = await workspace.component.getDistributableFile(config)
            let result = await workspace.register([bundlePath], stamp)
            let parts = result.successful[0].split('/')
            return parts[parts.length - 1]
        } catch(error) {
            let message = error.message || error
            if (message.indexOf("already in storage") != -1) {
                throw new Error(`Component "${name}" from domain "${domain}" already registered in "${stamp}"`)
            } else {
                throw error
            }
        }
    }

    public async remove(name: string, domain: Domain): Promise<void> {
        this._checkParameter(name, "Name not defined")
        this._checkParameter(domain, "Domain not defined")
        if (await this._checkElement(name, domain)) {
            await this._removeElement(name, domain)
        } else {
            throw new Error(`Component "${name}" not found in the workspace for domain "${domain}"`)
        }
    }

    public async unregister (name: string, domain: Domain, version: Version, stamp: string): Promise<void> {
        this._checkParameter(name, "Name not defined")
        this._checkParameter(domain, "Domain not defined")
        this._checkParameter(version, "Component version not defined")
        this._checkParameter(stamp, "Target stamp not defined")
        await this._checkStamp(stamp)
        let urn = workspace.component.generateUrn(name, domain, version)
        await workspace.stamp.unregister(stamp, urn)
    }
}