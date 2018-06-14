import { Domain, Path, Template, Url } from './types'
import { getJSON, checkParameter } from './utils'
import * as fs from 'fs'

const DEFAULT_CONFIG: any = {
    "working-stamp": "localstamp",
    "domain": "domain.com",
    "component": {
        "template": "javascript"
    },
    "deployment": {
        "template": "basic"
    },
    "resource": {
        "template": "vhost"
    },
    "runtime": {
        "template": "basic",
        "parent": "eslap://eslap.cloud/runtime/native/1_1_1",
        "folder": "/eslap/component",
        "entrypoint": "/eslap/runtime-agent/scripts/start-runtime-agent.sh"
    },
    "service": {
        "template": "basic"
    },
    "stamps": {
        "localstamp": {
            "admission": "http://localhost:8090"
        }
    }
};

export interface StampConfig {
    admission: Url
    token?: string
    name: string
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
        template: Template
        parent: string
        folder: Path
        entrypoint: Path
    }
    service: {
        template: Template
    }
    resource: {
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
    initialized: boolean

    constructor(configFilePath: string) {
        this.loadConfig(configFilePath)
    }

    public async initConfigFile(data: string): Promise<void> {
        return this._saveChangesRaw(data)
    }

    public isValidWorkspace() {
        return this.initialized
        // return (this.config != null) && (this.config != undefined)
    }

    public loadConfig(configFilePath: string): void {
        try {
            this.configFilePath = configFilePath
            let rawConfig = getJSON(this.configFilePath)
            this.config = this._convertRawConfig(rawConfig)
            this.initialized = true
        } catch(error) {
            this.initialized = false
            if (error.code.localeCompare("ENOENT") != 0) {
                throw error
            } else {
                this.config = DEFAULT_CONFIG
            }
        }
    }

    public saveChanges(): Promise<void> {
        try {
            if (this.config) {
                let data = JSON.stringify(this.config)
                let configCopy = JSON.parse(data)
                if (this.config.defaultStamp) {
                    let workingStamp = this.config.defaultStamp.name
                    configCopy['working-stamp'] = workingStamp
                    delete configCopy.defaultStamp
                }
                for (let stamp in configCopy.stamps) {
                    if (configCopy.stamps[stamp].name) {
                        delete configCopy.stamps[stamp].name
                    }
                }
                return this._saveChangesRaw(JSON.stringify(configCopy, null, 4))
            }

        } catch(error) {
            console.log("ERROR", error)
        }
    }

    public async getWorkspaceConfig(path:string): Promise<WorkspaceConfig> {
        return this.config
    }

    public async getStampConfig(stamp: string): Promise<StampConfig> {
        checkParameter(stamp, "Stamp not defined")
        return stamp ? this.config.stamps[stamp] : await this.getDefaultStampConfig()
    }

    public async getDefaultDomain(): Promise<Domain> {
        return this.config.domain;
    }

    public async setDefaultDomain(domain: Domain): Promise<void> {
        checkParameter(domain, "Domain not defined")
        this.config.domain = domain;
        await this.saveChanges()
    }

    public async addStamp (name: string, config: StampConfig, isDefault: boolean = false): Promise<void> {
        checkParameter(name, "Name not defined")
        checkParameter(config, "Stamp config not defined")
        if (this.config.stamps[name]) {
            throw new Error(`Stamp "${name}" already registered`)
        }
        this.config.stamps[name] = config;
        if (isDefault) {
            this.setDefaultStamp(name)
        }
        await this.saveChanges()
    }

    public async updateStamp (name: string, config: StampConfig): Promise<void> {
        checkParameter(name, "Name not defined")
        checkParameter(config, "Stamp config not defined")
        if (!this.config.stamps[name]) {
            throw new Error(`Stamp "${name}" is not registered`)
        }
        this.config.stamps[name].admission = config.admission || this.config.stamps[name].admission
        this.config.stamps[name].token = config.token || this.config.stamps[name].token
        await this.saveChanges()
    }

    public async removeStamp (name: string): Promise<void> {
        checkParameter(name, "Name not defined")
        if (!this.config.stamps[name]) {
            throw new Error(`Stamp "${name}" is not registered`)
        }
        if (this.config.defaultStamp && (name.localeCompare(this.config.defaultStamp.name) == 0)) {
            throw new Error(`Stamp "${name}" is the default stamp and cannot be removed`)
        }
        delete this.config.stamps[name]
        await this.saveChanges()
    }

    public async setDefaultStamp (name: string): Promise<void> {
        checkParameter(name, "Name not defined")
        if (!this.config.stamps[name]) {
            throw new Error(`Stamp "${name}" is not registered`)
        }
        this.config.defaultStamp = this.config.stamps[name]
        await this.saveChanges()
    }

    public async getDefaultStampConfig (): Promise<StampConfig> {
        return this.config.defaultStamp;
    }

    public getStampsInformation(stamp?: string): { [key: string]: StampConfig } {
        if (stamp) {
            if (this.config && this.config.stamps && this.config.stamps[stamp]) {
                let result:{ [key: string]: StampConfig } = {}
                result[stamp] = this.config.stamps[stamp]
                return result
            } else {
                throw new Error(`Stamp "${stamp}" is not registered`)
            }
        } else {
            return this.config.stamps
        }
    }

    private _saveChangesRaw(data: string): Promise<void> {
        return new Promise((resolve, reject) => {
            try {
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

    private _convertRawConfig(raw: any): WorkspaceConfig {
        let config:WorkspaceConfig = {
            domain: raw.domain,
            component: raw.component,
            deployment: raw.deployment,
            resource: raw.resource,
            runtime: raw.runtime,
            service: raw.service,
            stamps: raw.stamps,
            defaultStamp: raw.stamps[raw['working-stamp']]
        }
        for (let name in config.stamps) {
            config.stamps[name].name = name
        }
        return config
    }
}