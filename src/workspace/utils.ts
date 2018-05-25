import * as vm from 'vm'
import * as fs from 'fs'
import { AdmissionClient } from 'admission-client'

export function getJSON(filepath: string): any {
    const jsonString = "g = " + fs.readFileSync(filepath, 'utf8') + "; g";
    return (new vm.Script(jsonString)).runInNewContext();
}

export function getAdmissionClient(stamp: string):AdmissionClient {
    let stampData = this.configManager.getStampConfig(stamp)
    if (!stampData) {
        throw new Error("Stamp not found.")
    }
    return new AdmissionClient(`${stampData.admission}/admission`, stampData.token)
}