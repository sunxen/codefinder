import Segment from '../Segment'

export default function merge(segments: Segment[]): Segment[] {
    const map: Map<string, Segment> = new Map()
    for (const segment of segments) {
        const {snippet} = segment
        if (!map.has(snippet)) {
            map.set(snippet, segment)
            continue
        }

        const mergedSegment = map.get(snippet)
        mergedSegment.count += 1

        if (!mergedSegment.tag && segment.tag) {
            mergedSegment.tag = segment.tag
        }

        if (segment.files) {
            if (!mergedSegment.files) {
                mergedSegment.files = new Set()
            }
            for (const file of segment.files) {
                mergedSegment.files.add(file)
            }
        }

    }
    return Array.from(map.values())
}
