
import * as PriorityQueue from 'js-priority-queue'
import { SegmentMatch } from './SegmentMatch'

export default function topK(list: SegmentMatch[], k: number): SegmentMatch[] {
    const queue = new PriorityQueue({ comparator: (a: SegmentMatch, b) => b.score - a.score })
    list.forEach(item => {
        queue.queue(item)
    })
    const result: SegmentMatch[] = []
    while (result.length < k && queue.length > 0) {
        result.push(queue.dequeue())
    }
    return result
}
