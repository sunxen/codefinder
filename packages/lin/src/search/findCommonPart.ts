import Segment from '../Segment'
import getPrefixBlankCounter from '../utils/getPrefixBlankCounter'

const PLACEHOLDER = '__CODEFINDER_PLACEHOLDER__'
const PLACEHOLDER_IN_SNIPPET = '\t$0'

/**
 * different snippets may have same common part, find the common parts to build segments
 */
export default function findCommonPart(segments: Segment[]): Segment[] {
    const snippets: string[] = []
    const segmentMap = new Map<string, Segment>()

    for (const segment of segments) {
        const someSnippets = getSubSnippets(segment.snippet)
        if (someSnippets.length >= 2) {
            snippets.push(...someSnippets)

            for (const snippet of someSnippets) {
                const subSegment = segmentMap.get(snippet) || genNewSegment(snippet)
                subSegment.count += segment.count
                segment.files?.forEach(file => subSegment.files.add(file))
                segmentMap.set(snippet, subSegment)
            }
        }
    }

    const commonSegments = new Set<Segment>()
    for (let i = 0; i < snippets.length - 1; i++) {
        const snippet = snippets[i]
        const nextSnippet = snippets[i + 1]
        // if the snippet is part of the next snippet, it may be common part
        // and it is found in others snippet, so it is
        if (
            segmentMap.get(snippet).count > segmentMap.get(nextSnippet).count &&
            isContain(nextSnippet, snippet)
        ) {
            commonSegments.add(segmentMap.get(snippet))
        }
    }

    return Array.from(commonSegments.values())
}

function genNewSegment(snippet: string) {
    const segment = new Segment(snippet, 0)
    segment.files = new Set()
    if (segment.snippet.includes(PLACEHOLDER)) {
        segment.snippet = snippet.replace(PLACEHOLDER, '')
        segment.snippetWithPlaceholder = escapeSnippet(snippet).replace(PLACEHOLDER, PLACEHOLDER_IN_SNIPPET)
    }
    return segment
}

function escapeSnippet(snippet: string){
	return snippet.replace(/\$[a-zA-Z0-9{]+/gm, str => `\\${str}`)
}

function getSubSnippets(text: string) {
    const lines = text.split('\n')
    if (lines.length === 1) {
        return [text]
    }

    const snippets: string[] = []
    const levels = getPrefixBlankCounter(lines)
    const maxLevel = Math.max(...levels)
    let lastOne = null

    for (let level = 0; level <= maxLevel; level++) {
        const subLines = []
        let hasInsertPlaceholder = false
        for (let i = 0; i < lines.length; i++) {
            if (levels[i] <= level) {
                subLines.push(lines[i])
            } else if(!hasInsertPlaceholder) {
                subLines.push(PLACEHOLDER)
                hasInsertPlaceholder = true
            }
        }
        const snippet = subLines.join('\n')
        if (snippet !== lastOne) {
            snippets.push(snippet)
            lastOne = snippet
        }
    }

    return snippets
}

function isContain(longSnippet: string, shortSnippet: string) {
    if (longSnippet.length < shortSnippet.length) {
        return false
    }

    const longSnippetLines = longSnippet.split('\n')
    const shortSnippetLines = shortSnippet.split('\n')
    let i = 0
    let j = 0
    while (i < longSnippetLines.length && j < shortSnippetLines.length) {
        if (
            longSnippetLines[i].trim() === shortSnippetLines[j].trim() ||
            shortSnippetLines[j] === PLACEHOLDER
        ) {
            j += 1
        }
        i += 1
    }
    return j >= shortSnippetLines.length
}
