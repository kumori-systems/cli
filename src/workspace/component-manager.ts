import { ElementInfo } from './element-info'
import { Domain, Version, Template, Path } from './types'
import { workspace, ComponentConfig } from 'workspace'
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
            throw new Error(`Component ${name} not found for doman ${domain}`)
        }
        let config = {
            domain: domain,
            name: name
        }
        let path = await workspace.component.build(config)
        return path
    }

    public async register(name: string, domain: Domain, stamp: string): Promise<Version> {
        this._checkParameter(name, "Name not defined")
        this._checkParameter(domain, "Domain not defined")
        this._checkParameter(stamp, "Target stamp not defined")
        await this._checkStamp(stamp)
        throw new Error("NOT IMPLEMENTED")
    }

    public async remove(name: string, domain: Domain): Promise<void> {
        this._checkParameter(name, "Name not defined")
        this._checkParameter(domain, "Domain not defined")
        throw new Error("NOT IMPLEMENTED")
    }

    public async unregister (name: string, domain: Domain, version: Version, stamp: string): Promise<void> {
        this._checkParameter(name, "Name not defined")
        this._checkParameter(domain, "Domain not defined")
        this._checkParameter(version, "Component version not defined")
        this._checkParameter(stamp, "Target stamp not defined")
        await this._checkStamp(stamp)
        throw new Error("NOT IMPLEMENTED")
    }
}