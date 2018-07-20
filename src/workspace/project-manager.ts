import { Domain, Template } from './types'
import { workspace } from '@kumori/workspace'
import { ElementManager } from './element-manager'

export interface ProjectInfo {
}

export class ProjectManager extends ElementManager {

    public async add (name: string, domain: Domain, template: Template): Promise<ProjectInfo> {
        let kumoriConfig = this.configManager.config
        template = template || kumoriConfig.project.template
        domain = domain || kumoriConfig.domain
        this._checkParameter(name, "Name not defined")
        this._checkParameter(domain, "Domain not defined")
        this._checkParameter(template, "Template not defined")
        this._checkName(name)
        let config = {
            domain: domain,
            name: name
        }
        await workspace.project.add(template, config)
        let info:ProjectInfo = {}
        return info
    }
}