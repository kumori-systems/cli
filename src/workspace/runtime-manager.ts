import { ElementInfo } from './element-info'
import { Domain, Version, Template, Path, Urn } from './types'
import { ElementManager } from './element-manager'
import { workspace, RuntimeConfig } from '@kumori/workspace'
import * as path from 'path'

export interface RuntimeInfo extends ElementInfo {
}

export class RuntimeManager extends ElementManager {
    public async add (name: string, domain: Domain, parent: Urn, componentFolder: Path, entrypoint: string, template: Template): Promise<RuntimeInfo> {
        this._checkParameter(name, "Name not defined")
        this._checkParameter(domain, "Domain not defined")
        this._checkParameter(parent, "Parent runtime not defined")
        this._checkParameter(componentFolder, "Component folder not defined")
        this._checkParameter(entrypoint, "Entrypoint not defined")
        this._checkParameter(template, "Template not defined")
        let config:RuntimeConfig = {
            name: name,
            domain: domain
        }
        if (parent) {
            config.parent = parent
        }
        if (componentFolder) {
            config.componentFolder = componentFolder
        }
        if (entrypoint) {
            config.entrypoint = entrypoint
        }
        let runtimePath = await workspace.runtime.add(template, config)
        let manifest = this._getElementManifest(name, domain)
        let info:RuntimeInfo = {
            path: runtimePath,
            urn: manifest.name
        }
        return info
    }

    public async build (name: string, domain: Domain): Promise<Path> {
        this._checkParameter(name, "Name not defined")
        this._checkParameter(domain, "Domain not defined")
        let manifest = this._getElementManifest(name, domain)
        this._checkParameter(manifest, "Manifest not found")
        this._checkParameter(manifest.derived, "Parent runtime not found in the runtime manifest (key derived.from)")
        this._checkParameter(manifest.derived.from, "Parent runtime not found in the runtime manifest (key derived.from)")
        let config:RuntimeConfig = {
            name: name,
            domain: domain
        }
        await workspace.runtime.build(config)
        return this._getBundleFilePath(name, domain)
    }

    public async register (name: string, domain: Domain, stamp: string): Promise<Version> {
        this._checkParameter(name, "Name not defined")
        this._checkParameter(domain, "Domain not defined")
        this._checkParameter(stamp, "Target stamp not defined")
        await this._checkStamp(stamp)
        let exists = await this._checkElement(name, domain)
        if (!exists) {
            throw new Error(`Runtime "${name}" with domain "${domain}" not found in the workspace`)
        }
        let bundlePath = this._getBundleFilePath(name, domain)
        await workspace.register([bundlePath], stamp)
        let manifest = this._getElementManifest(name, domain)
        let parts = manifest.name.split('/')
        return parts[parts.length - 1]
    }

    public remove (name: string, domain: Domain): Promise<void> {
        this._checkParameter(name, "Name not defined")
        this._checkParameter(domain, "Domain not defined")
        return Promise.reject("NOT IMPLEMENTED");
    }

    public async unregister (name: string, domain: Domain, version: Version, stamp: string): Promise<void> {
        this._checkParameter(name, "Name not defined")
        this._checkParameter(domain, "Domain not defined")
        this._checkParameter(version, "Runtime version not defined")
        this._checkParameter(stamp, "Target stamp not defined")
        await this._checkStamp(stamp)
        let urn = workspace.runtime.generateUrn(name, domain, version)
        await workspace.stamp.unregister(stamp, urn)
    }
}