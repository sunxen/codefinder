import * as path from 'path'

const cache = new Map<string, number>()

/**
 * the Similarity of two path
 * @param sourceFile
 * @param targetFile
 * @returns value between 1 and 2
 */
export default function getPathMatchValue(sourceFile: string, targetFile: string): number {
    if (!sourceFile || !targetFile) {
        return 1
    }
    const key = `${sourceFile}:${targetFile}`
    if (cache[key]) {
        return cache.get(key)
    }
    const list1 = sourceFile.split(path.sep)
    const list2 = targetFile.split(path.sep)
    // match head and tail
    const maxLen = Math.max(list1.length, list2.length)
    let count = 0
    while (list1.length > 0 && list2.length > 0) {
        if(list1.shift() === list2.shift()) {
            count += 1
        } else {
            break
        }
    }
    while (list1.length > 0 && list2.length > 0) {
        if(list1.pop() === list2.pop()) {
            count += 1
        } else {
            break
        }
    }
    // todo: think about base value
    const base = 1
    const value = 1 + (count / maxLen * base)
    cache.set(key, value)
    return value
}
