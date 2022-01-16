import * as fs from 'fs'
import Segment from '../Segment'

type SegmentCache = {
    [file: string]: {
        timestamp: number;
        data: Segment[];
    }
}

const segmentCache: SegmentCache = {}

export function getSegmentsByFile(file: string): Segment[] {
    return segmentCache[file]?.data
}

export function isSegmentsExpired(file: string): boolean {
    if (!segmentCache[file]){
        return true
    }

    const stat = fs.lstatSync(file)
    if (stat.mtimeMs > segmentCache[file]?.timestamp) {
        return true
    }

    return false
}

export function saveSegments(file: string, segments: Segment[]): void {
    segmentCache[file] = {
        timestamp: Date.now(),
        data: segments
    }
}
