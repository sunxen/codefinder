import * as path from 'path'
import * as fs from 'fs'
import logger from '../logger'
import TrieNode from './TrieNode'
import merge from './merge'
import findCommonPart from './findCommonPart'
import { onProjectUpdate } from '../storage/eventCenter'
import { getSegmentsByFile } from '../storage/segmentsManager'
import Segment, { SegmentSource } from '../Segment'
import * as constants from '../constants'
import { getFileExt, getProjectDir, getProjectExtFiles, getProjectExtKey } from '../utils/projectFiles'
import loadCustomSnippets from './loadCustomSnippets'

const trieCache = new Map<string, TrieNode>()

export default function loadTrie(targetFile: string): TrieNode {
    const key = getProjectExtKey(targetFile)
    logger.debug(`load trie: ${key}`)

    if (!trieCache.has(key)) {
        trieCache.set(key, loadTrieNoCache(targetFile))
        onProjectUpdate(key, () => {
            trieCache.set(key, loadTrieNoCache(targetFile))
        })
    }
    return trieCache.get(key)
}

function loadTrieNoCache(targetFile: string): TrieNode {
    const start = Date.now()
    let segments: Segment[] = []
    segments.push(...loadDefaultSegments(targetFile))
    segments.push(...loadUserSegments(targetFile))
    segments.push(...loadProjectSegments(targetFile))
    segments = merge(segments)
    logger.debug(`load segments use time: ${Date.now() - start}, size: ${segments.length}`)

    const start2 = Date.now()
    segments.push(...findCommonPart(segments))
    logger.debug(`findCommonPart use time: ${Date.now() - start2}, size: ${segments.length}`)

    const trie = new TrieNode()
    for (const segment of segments) {
        trie.add(segment)
    }

    logger.debug(`load trie finish. use time: ${Date.now() - start}`)
    return trie
}

function loadDefaultSegments(targetFile: string): Segment[] {
    const dir = `${__dirname}/../../default-snippets`
    if (fs.existsSync(dir)) {
        const segments = loadCustomSnippets(dir, getFileExt(targetFile))
        for (const segment of segments) {
            segment.source = SegmentSource.DefaultSnippets
        }
        return segments
    }
    return []
}

function loadUserSegments(targetFile: string): Segment[] {
    const dir = `${getProjectDir(targetFile)}/.codefinder`
    if (fs.existsSync(dir)) {
        const segments = loadCustomSnippets(dir, getFileExt(targetFile))
        for (const segment of segments) {
            segment.source = SegmentSource.UserSnippets
        }
        return segments
    }
    return []
}

function loadProjectSegments(targetFile: string): Segment[] {
    const files = getProjectExtFiles(targetFile, constants.MAX_FILES_NUMBER)
    const projectDir = getProjectDir(targetFile)
    const projectSegments: Segment[] = []
    for (const file of files) {
        const relativePath = file.replace(projectDir + path.sep, '')
        const segments = getSegmentsByFile(file) || []
        for (const segment of segments) {
            if (!segment.files) {
                segment.files = new Set()
            }
            segment.files.add(relativePath)
            projectSegments.push(segment)
        }
    }
    return projectSegments
}
