import * as logger from './logger'

export async function run(cb: () => void) {
    try {
        await cb()
    } catch(error) {
        logger.error(error.message || error)
    }
}