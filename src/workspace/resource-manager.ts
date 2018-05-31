import { ElementInfo } from './element-info'
import { Domain, Template } from './types'
import { ElementManager } from './element-manager'

export interface ResourceInfo extends ElementInfo {
}

export class ResourceManager extends ElementManager {
    public add (name: string, domain: Domain, template: Template): Promise<ResourceInfo> {
        this._checkParameter(name, "Name not defined")
        this._checkParameter(domain, "Domain not defined")
        this._checkParameter(template, "Template not defined")
        return Promise.reject("NOT IMPLEMENTED");
    }

    public async register (name: string, domain: Domain, stamp: string): Promise<void> {
        this._checkParameter(name, "Name not defined")
        this._checkParameter(domain, "Domain not defined")
        this._checkParameter(stamp, "Target stamp not defined")
        await this._checkStamp(stamp)
        return Promise.reject("NOT IMPLEMENTED");
    }

    public remove (name: string, domain: Domain): Promise<void> {
        this._checkParameter(name, "Name not defined")
        this._checkParameter(domain, "Domain not defined")
        return Promise.reject("NOT IMPLEMENTED");
    }

    public async unregister (name: string, domain: Domain, stamp: string): Promise<void> {
        this._checkParameter(name, "Name not defined")
        this._checkParameter(domain, "Domain not defined")
        this._checkParameter(stamp, "Target stamp not defined")
        await this._checkStamp(stamp)
        return Promise.reject("NOT IMPLEMENTED");
    }

}
