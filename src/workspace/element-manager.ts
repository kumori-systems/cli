import { WorkspaceConfigManager, StampConfig } from './workspace-manager'
import { Domain, Path, Version } from './types'
import { getJSON, checkName, checkParameter, checkIsNumber } from './utils'
import * as path from 'path'
import * as fs from 'fs-extra'
import { AdmissionClient } from '@kumori/admission-client'

export class ElementManager {

    public configManager: WorkspaceConfigManager;
    public subfolder: Path;

    constructor(configManager: WorkspaceConfigManager, subfolder: Path) {
        this.configManager = configManager;
        this.subfolder = subfolder
    }

    public getCurrentVersion(name: string, domain?: Domain): Version {
        try {
            let manifest = this._getElementManifest(name, domain)
            let parts:string[] = manifest.name.split('/')
            let version = parts[parts.length-1]
            parts = version.split('_')
            for (let part of parts) {
                let converted:number = parseInt(part)
                if (converted == NaN) {
                    return undefined
                }
            }
            return version
        } catch(error) {
            return undefined
        }
    }

    protected _checkElement(name: string, domain?: Domain): Promise<boolean> {
        return new Promise((resolve, reject) => {
            try {
                let path = this._getElementFolder(name, domain)
                fs.stat(path, (error, stats) => {
                    if (error && error.code.localeCompare('ENOENT') == 0) {
                        resolve(false)
                    } else if (error) {
                        reject(error)
                    } else if (stats.isDirectory()) {
                        resolve(true)
                    } else {
                        resolve(false)
                    }
                })
            } catch(error) {
                reject(error)
            }
        })
    }

    protected _getElementFolder(name: string, domain?: Domain): Path {
        if (domain) {
            return path.join(process.cwd(), this.subfolder, domain, name);
        } else {
            return path.join(process.cwd(), this.subfolder, name);
        }
    }

    protected _getBundleFilePath(name: string, domain?: Domain): Path {
        let runtimeFolder = this._getElementFolder(name, domain)
        return path.join(runtimeFolder,'dist','bundle.zip');
    }

    protected _getElementManifestPath(name: string, domain?: Domain): Path {
        try {
            let manifestPath = path.join(this._getElementFolder(name, domain), 'Manifest.json')
            getJSON(manifestPath)
            return manifestPath
        } catch(error) {
            if (error.code.localeCompare('ENOENT') == 0) {
                throw new Error(`Manifest not found for ${name}.`)
            } else {
                throw new Error(`Error accesing ${name}'s manifest`)
            }
        }
    }

    protected _getElementManifest(name: string, domain?: Domain): any {
        try {
            let manifestPath = path.join(this._getElementFolder(name, domain), 'Manifest.json')
            return getJSON(manifestPath)
        } catch(error) {
            if (error.code.localeCompare('ENOENT') == 0) {
                throw new Error(`Manifest not found for ${name}.`)
            } else {
                throw new Error(`Error accesing ${name}'s manifest`)
            }
        }
    }


    protected async _getAdmissionClient(stamp: string): Promise<AdmissionClient> {
        let stampData = await this.configManager.getStampConfig(stamp)
        if (!stampData) {
            throw new Error("Stamp not found.")
        }
        return new AdmissionClient(`${stampData.admission}/admission`, stampData.token)
    }

    protected async _checkStamp(stamp: string): Promise<void> {
        let admission:AdmissionClient
        try {
            admission = await this._getAdmissionClient(stamp)
            await admission.init()
            await admission.close()
        } catch(error) {
            if (error.code && (error.code.localeCompare('ECONNREFUSED') == 0)) {
                error.message = `Connection to ${stamp} refused`
            } else if (error.message && (error.message.indexOf("Authentication error") != -1)) {
                error.message = `Authentication failure. Maybe your token expired or is not set. Use "kumori stamp update ${stamp} -t <TOKEN>" command to change it. Access your user settings in the platform dashboard to get a valid token.`
            } else {
                error.message = `Unable to connect to ${stamp}`
            }
            try {
                admission.close()
            } catch(err) {}
            throw error
        }
    }

    protected _checkParameter(param: any, errorMessage: string): void {
        return checkParameter(param, errorMessage)
    }

    protected _checkIsNumber(param: any, errorMessage: string, min: number, max: number): void {
        return checkIsNumber(param, errorMessage, min, max)
    }

    protected async _removeElement(name: string, domain?: Domain): Promise<void> {
        let elemPath = this._getElementFolder(name, domain)
        await fs.remove(elemPath)
    }

    protected _checkName(name: string): void {
        return checkName(name);
    }
}
