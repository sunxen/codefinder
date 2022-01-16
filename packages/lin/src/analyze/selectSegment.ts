import Segment from '../Segment'
import * as constants from '../constants'
import getFileContent from './getFileContent'
import validateSourceFile from './validateSourceFile'
import getPrefixBlankCounter from '../utils/getPrefixBlankCounter'

export default function selectSegment(file: string): Segment[] {
    if (!validateSourceFile(file)) {
        return []
    }

    // fix: double read
    const text = getFileContent(file)
    const lines = text.split('\n')
    const levels = getPrefixBlankCounter(lines)

    // think about the prefix blank of every line, it split the text into segments
    const segments: Segment[] = []
    for (let i = 0; i < lines.length; i++) {
        // ignore the empty line
        if (!lines[i].trim()) {
            continue
        }

        const startLevel = levels[i]
        const selectedNumbers = [i]
        for (let j = i + 1; j < lines.length; j++) {
            // ignore the empty line
            if (!lines[j].trim()) {
                continue
            }

            const endLevel = levels[j]
            const nextLineLevel = levels[j + 1] || 0
            if (endLevel > startLevel) {
                selectedNumbers.push(j)
                continue
            }
            if (selectedNumbers.length > 1 && endLevel === startLevel && nextLineLevel <= endLevel) {
                selectedNumbers.push(j)
            }
            break
        }

        // when exceed the max line number, ignore higher level lines
        const maxLevel = calcMaxLevel(levels, selectedNumbers)
        const snippetLines = selectedNumbers.filter(num => levels[num] <= maxLevel).map(num => lines[num])

        // remove common prefix blank
        for (let k = 0; k < snippetLines.length; k++) {
            snippetLines[k] = snippetLines[k].replace(new RegExp(`^[ \t]{${startLevel}}`), '')
        }

        const snippet = snippetLines.join('\n')
        if (snippet.length >= constants.MIN_SNIPPET_CHARS && snippet.length <= constants.MAX_SNIPPET_CHARS) {
            segments.push(new Segment(snippet))
        }
    }

    return segments
}

function calcMaxLevel(levels: number[], selectedNumbers: number[]): number {
    let maxLevel = Number.MAX_SAFE_INTEGER
    if (selectedNumbers.length > constants.MAX_SNIPPET_LINES) {
        const levelLinesCounter: number[] = []
        for (const num of selectedNumbers) {
            const level = levels[num]
            levelLinesCounter[level] = (levelLinesCounter[level] || 0) + 1
        }
        let sum = 0
        for (let level = 0; level < levelLinesCounter.length; level++) {
            sum += levelLinesCounter[level] || 0
            if (sum > constants.MAX_SNIPPET_LINES) {
                maxLevel = level - 1
                break
            }
        }
    }
    return maxLevel
}
