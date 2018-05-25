import { ElementInfo } from './element-info'
import { Domain, Version, Template, Path, Urn } from './types'
import { ElementManager } from './element-manager'
import { workspace, RuntimeConfig } from 'workspace'
import * as path from 'path'

export interface RuntimeInfo extends ElementInfo {
}

export class RuntimeManager extends ElementManager {
    public async add (name: string, domain: Domain, parent: Urn, componentFolder: Path, entrypoint: string, template: Template): Promise<RuntimeInfo> {
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
        let config:RuntimeConfig = {
            name: name,
            domain: domain
        }
        await workspace.runtime.bundle(config)
        return this._getBundleFilePath(name, domain)
    }

    public async register (name: string, domain: Domain, stamp: string): Promise<Version> {
        let bundlePath = this._getBundleFilePath(name, domain)
        await workspace.register([bundlePath], stamp)
        let manifest = this._getElementManifest(name, domain)
        let parts = manifest.name.split('/')
        return parts[parts.length - 1]
    }

    public remove (name: string, domain: Domain): Promise<void> {
        return Promise.reject("NOT IMPLEMENTED");
    }

    public unregister (name: string, domain: Domain, version: Version, stamp: string): Promise<void> {
        return Promise.reject("NOT IMPLEMENTED");
    }
}