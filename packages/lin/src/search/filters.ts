import Segment from '../Segment'
import { SegmentMatch } from './SegmentMatch'

export function nerdFilter(list: SegmentMatch[]): SegmentMatch[]{
    return list.filter(item => item.segment.count >= 3 && item.scorePercent >= 80)
}

export function lengthFilter(list: SegmentMatch[], minLength: number): SegmentMatch[]{
    return list.filter(item => item.segment.snippet.length >= minLength)
}

export function repetitionFilter(list: SegmentMatch[]): SegmentMatch[]{
    const map = new Map<Segment, SegmentMatch>()
    for (const item of list) {
        const key = item.segment
        const curr = map.get(key)
        if (curr && curr.score > item.score) {
            continue
        }
        map.set(key, item)
    }
    return Array.from(map.values())
}
