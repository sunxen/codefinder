import * as fs from 'fs'
import * as constants from '../constants'
import logger from '../logger'
import getFileContent from './getFileContent'

export default function validateSourceFile(file: string): boolean{
    if (!fs.existsSync(file)) {
        logger.debug(`not exists: ${file}`)
        return false
    }

    const stat = fs.lstatSync(file)
    if (stat.size > constants.MAX_FILE_SIZE) {
        logger.debug(`large file: ${file}`)
        return false
    }

    const text = getFileContent(file)
    const lines = text.split('\n')

    if (lines.length > constants.MAX_FILE_LINES) {
        logger.debug(`too many lines: ${file}`)
        return false
    }

    if ((text.length / lines.length) > constants.MAX_AVG_CHARS_PER_LINE) {
        logger.debug(`binary/compress file ${file}`)
        return false
    }

    return true
}
