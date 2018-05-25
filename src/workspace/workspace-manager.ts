import { Domain, Path, Template, Url } from './types'
import { getJSON } from './utils'
import * as fs from 'fs'

export interface StampConfig {
    admission: Url
    token: string
}

export interface WorkspaceConfig {
    component: {
        template: Template
    }
    deployment: {
        template: Template
    }
    domain: Domain
    runtime: {
        parent: string
        folder: Path
        entrypoint: Path
    }
    service: {
        template: Template
    }
    stamps: {
        [key: string]: StampConfig
    }
    defaultStamp: StampConfig,
}

export class WorkspaceConfigManager {

    configFilePath: Path
    config: WorkspaceConfig

    constructor(configFilePath: string) {
        this.loadConfig(configFilePath)
    }

    public async initConfigFile(data: string): Promise<void> {
        return this._saveChangesRaw(data)
    }

    public isValidWorkspace() {
        return (this.config != null) && (this.config != undefined)
    }

    public loadConfig(configFilePath: string): void {
        try {
            this.configFilePath = configFilePath
            this.config = getJSON(this.configFilePath) as WorkspaceConfig
        } catch(error) {
            if (error.code.localeCompare("ENOENT") != 0) {
                throw error
            }
        }
    }

    public saveChanges(): Promise<void> {
        return this._saveChangesRaw(JSON.stringify(this.config, null, 4))
    }

    public async getWorkspaceConfig(path:string): Promise<WorkspaceConfig> {
        return this.config
    }

    public async getStampConfig(stamp: string): Promise<StampConfig> {
        return stamp ? this.config.stamps[stamp] : await this.getDefaultStampConfig()
    }

    public async getDefaultDomain(): Promise<Domain> {
        return this.config.domain;
    }

    public async setDefaultDomain(domain: Domain): Promise<void> {
        if (!domain) {
            throw new Error("Domain is missing")
        }
        this.config.domain = domain;
        await this.saveChanges()
    }

    public async addStamp (name: string, config: StampConfig, isDefault: boolean = false): Promise<void> {
        if (!name) {
            throw new Error(`Stamp name missing`)
        }
        if (!config) {
            throw new Error(`Stamp config missing`)
        }
        if (this.config.stamps[name]) {
            throw new Error(`Stamp ${name} already registered`)
        }
        this.config.stamps[name] = config;
        if (isDefault) {
            this.setDefaultStamp(name)
        }
        await this.saveChanges()
    }

    public async updateStamp (name: string, config: StampConfig): Promise<void> {
        if (!name) {
            throw new Error(`Stamp name missing`)
        }
        if (!config) {
            throw new Error(`Stamp config missing`)
        }
        if (!this.config.stamps[name]) {
            throw new Error(`Stamp ${name} is not registered`)
        }
        this.config.stamps[name] = config;
        await this.saveChanges()
    }

    public async removeStamp (name: string): Promise<void> {
        if (!name) {
            throw new Error(`Stamp name missing`)
        }
        if (!this.config.stamps[name]) {
            throw new Error(`Stamp ${name} is not registered`)
        }
        delete this.config.stamps[name]
        await this.saveChanges()
    }

    public async setDefaultStamp (name: string): Promise<void> {
        if (!name) {
            throw new Error(`Stamp name missing`)
        }
        if (!this.config.stamps[name]) {
            throw new Error(`Stamp ${name} is not registered`)
        }
        this.config.defaultStamp = this.config.stamps[name]
        await this.saveChanges()
    }

    public async getDefaultStampConfig (): Promise<StampConfig> {
        return this.config.defaultStamp;
    }

    private _saveChangesRaw(data: string): Promise<void> {
        fs.writeFileSync(this.configFilePath, data);
        return new Promise((resolve, reject) => {
            try {
                let data = JSON.stringify(this.config, null, 4)
                fs.writeFile(this.configFilePath, data, (error) => {
                    if (error) {
                        reject(error)
                    } else {
                        resolve()
                    }
                })
            } catch(error) {
                reject(error);
            }

        })
    }

}