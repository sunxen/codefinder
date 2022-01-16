import * as path from 'path'
import Segment from '../Segment'
import { getProjectDir } from '../utils/projectFiles'
import getPathMatchValue from '../utils/getPathMatchValue'

export type SegmentMatch = {
    segment: Segment

    score: number

    scorePercent?: number
}

export function calcPercent(list: SegmentMatch[]): void {
    const total = list.reduce((sum, item) => sum + item.score, 0)
    for (const item of list) {
        item.scorePercent = Math.round(item.score / total * 1000) / 10
    }
}

export function calcPathMatchValue(list: SegmentMatch[], targetFile: string): void {
    const relativePath = targetFile.replace(getProjectDir(targetFile) + path.sep, '')
    for (const item of list) {
        if (!item.segment.files) {
            continue
        }

        let max = 1
        for (const file of item.segment.files) {
            const value = getPathMatchValue(file, relativePath)
            if (value > max) {
                max = value
            }
        }
        item.score *= max
    }
}
