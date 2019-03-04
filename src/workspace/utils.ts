import * as vm from 'vm'
import * as fs from 'fs'

export function getJSON(filepath: string): any {
    const jsonString = "g = " + fs.readFileSync(filepath, 'utf8') + "; g";
    return (new vm.Script(jsonString)).runInNewContext();
}

export function checkParameter(param: any, errorMessage: string): void {
    if ((param == null) || (param == undefined)) {
        throw new Error(errorMessage)
    }
}

export function checkIsNumber(param: any, errorMessage: string, min: number, max: number): void {
    let value = parseInt(param)
    if (isNaN(value) || (value < min) || (value > max)) {
        throw new Error(errorMessage)
    }
}

export function checkName(name: string): void {
    let re = /^\w+$/;
    if (!re.exec(name)) {
        throw new Error(`Name "${name}" is not valid. Use only by alphanumeric characters`)
    }
}

export function getNested(obj: Object, ...keys: string[]): any {
    for (let key of keys) {
        if (!obj || !obj.hasOwnProperty(key)) {
            return undefined
        }
        obj = obj[key]
    }
    return obj
}
