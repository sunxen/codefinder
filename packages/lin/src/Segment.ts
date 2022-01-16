export enum SegmentSource {
    Project = 0,
    DefaultSnippets,
    UserSnippets,
}

export default class Segment {
    snippet: string

    count: number

    snippetWithPlaceholder?: string

    tag?: string

    files?: Set<string>

    source: SegmentSource = 0

    constructor(snippet: string, count = 1) {
        this.snippet = snippet
        this.count = count
    }
}
