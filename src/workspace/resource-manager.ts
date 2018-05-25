import { ElementInfo } from './element-info'
import { Domain, Template } from './types'
import { ElementManager } from './element-manager'

export interface ResourceInfo extends ElementInfo {
}

export class ResourceManager extends ElementManager {
    public add (name: string, domain: Domain, template: Template): Promise<ResourceInfo> {
        return Promise.reject("NOT IMPLEMENTED");
    }

    public register (name: string, domain: Domain, stamp: string): Promise<void> {
        return Promise.reject("NOT IMPLEMENTED");
    }

    public remove (name: string, domain: Domain): Promise<void> {
        return Promise.reject("NOT IMPLEMENTED");
    }

    public unregister (name: string, domain: Domain, stamp: string): Promise<void> {
        return Promise.reject("NOT IMPLEMENTED");
    }

}
