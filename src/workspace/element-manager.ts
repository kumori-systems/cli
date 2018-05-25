import { WorkspaceConfigManager } from './workspace-manager'
import { Domain, Path } from './types'
import { getJSON } from './utils'
import * as path from 'path'

export class ElementManager {

    public configManager: WorkspaceConfigManager;
    public subfolder: Path;

    constructor(configManager: WorkspaceConfigManager, subfolder: Path) {
        this.configManager = configManager;
        this.subfolder = subfolder
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

    protected _getElementManifest(name: string, domain?: Domain): any {
        let manifestPath = path.join(this._getElementFolder(name, domain), 'Manifest.json')
        return getJSON(manifestPath)
    }
}
