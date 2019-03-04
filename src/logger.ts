export function log(msg:string) {
    console.log(msg)
}

export function error(msg:string) {
    log(`\x1b[31mError: ${msg}\x1b[0m`)
}

export function warn(msg:string) {
    log(`Warning: ${msg}`)
}

export function info(msg:string) {
    log(msg)
}

export function debug(msg:string) {
    log(`Debug: ${msg}`)
}
export function silly(msg:string) {
    log(`Silly: ${msg}`)
}