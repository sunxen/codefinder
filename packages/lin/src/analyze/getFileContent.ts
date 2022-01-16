import * as fs from 'fs'
import chardet from 'chardet'
import * as iconvlite from 'iconv-lite'
import logger from '../logger'

export default function getFileContent(file: string): string {
    const buffer = fs.readFileSync(file)
    let encoding = chardet.detect(buffer).toString()
    // test with win7 file
    if (encoding === 'Shift_JIS') {
        encoding = 'GBK'
    }

    let text = ''
    try {
        text = iconvlite.decode(buffer, encoding)
    } catch (error) {
        logger.debug(`decode error: ${file}, encoding: ${encoding}`)
        text = iconvlite.decode(buffer, 'utf8')
    }
    return text
}
