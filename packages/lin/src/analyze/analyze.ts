
import logger from '../logger'
import selectSegment from './selectSegment'
import validateSourceFile from './validateSourceFile'
import * as constants from '../constants'
import { notifyProjectUpdate } from '../storage/eventCenter'
import { isSegmentsExpired, saveSegments } from '../storage/segmentsManager'
import { getProjectExtFiles, getProjectExtKey } from '../utils/projectFiles'
import loadTrie from '../search/loadTrie'

let lastProcessTime = 0

export default function analyze(targetFile: string): void{
    if (Date.now() - lastProcessTime < constants.ANALYZE_INTERVAL_MS) {
        logger.debug('analyze throttle')
        return
    }

    if (!isSegmentsExpired(targetFile)) {
        logger.debug(`file not change: ${targetFile}`)
        return
    }

    if (!validateSourceFile(targetFile)) {
        return
    }

    analyzeProject(targetFile)
    loadTrie(targetFile)
    lastProcessTime = Date.now()
}

function analyzeProject(targetFile: string){
    const start = Date.now()
    const files = getProjectExtFiles(targetFile, constants.MAX_FILES_NUMBER)
    for (const file of files) {
        if (isSegmentsExpired(file)) {
            saveSegments(file, selectSegment(file))
        }
    }

    notifyProjectUpdate(getProjectExtKey(targetFile))
    logger.debug(`analyze project finish. file count: ${files.length}, use time: ${Date.now() - start}ms`)
}
