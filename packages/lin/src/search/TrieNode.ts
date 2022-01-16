import Segment from '../Segment'
import tokenize from '../tokenize'
import * as constants from '../constants'

export default class TrieNode {
    segments: Segment[] = []

    children: Map<string, TrieNode> = new Map()

    tags: Set<string> = new Set()

    add(segment: Segment): void {
        this.segments.push(segment)
        this.tags.add(segment.tag)

        const snippet = segment.snippet.substring(0, constants.MAX_QUERY_CHARS)
        // ignore camel case
        const tokens = tokenize(snippet.toLocaleLowerCase())
        this.connect(segment, tokens)
        if (segment.tag) {
            this.connect(segment, [segment.tag, ...tokens])
        }

        if (constants.SUPPORT_CAMEL_CASE) {
            const tokens2 = tokenize(snippet)
            if (tokens.length !== tokens2.length) {
                this.connect(segment, tokens2)
                if (segment.tag) {
                    this.connect(segment, [segment.tag, ...tokens2])
                }
            }
        }
    }

    private connect(segment: Segment, tokens: string[]) {
        // eslint-disable-next-line @typescript-eslint/no-this-alias
        let curr: TrieNode = this
        for (let i = 0; i < tokens.length; i++) {
            const token = tokens[i].toLocaleLowerCase()
            const next = curr.children.get(token) || new TrieNode()
            next.segments.push(segment)
            curr.children.set(token, next)
            curr = next
        }
    }
}
