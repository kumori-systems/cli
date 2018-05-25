import { ElementInfo } from './element-info'
import { Domain, Version, Template, Path } from './types'
import { workspace, ComponentConfig } from 'workspace'
import { ElementManager } from './element-manager'

export interface ComponentInfo extends ElementInfo {
}

export class ComponentManager extends ElementManager {
    public async add (name: string, domain: Domain, template: Template): Promise<ComponentInfo> {
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
        let config = {
            domain: domain,
            name: name
        }
        let path = await workspace.component.build(config)
        return path
    }

    public async register(name: string, domain: Domain, stamp: string): Promise<Version> {
        throw new Error("NOT IMPLEMENTED")
    }

    public async remove(name: string, domain: Domain): Promise<void> {
        throw new Error("NOT IMPLEMENTED")
    }

    public async unregister (name: string, domain: Domain, version: Version, stamp: string): Promise<void> {
        throw new Error("NOT IMPLEMENTED")
    }
}