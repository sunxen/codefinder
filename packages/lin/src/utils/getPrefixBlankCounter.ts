function countPrefixBlank(line = '') {
    let count = 0
    for (let i = 0; i < line.length && i < 100; i++) {
        const w = line[i]
        if (w === ' ' || w === '\t') {
            count += 1
        } else {
            break
        }
    }
    return count
}

/**
 * count prefix blank for each line
 * @param lines
 * @returns
 */
export default function getPrefixBlankCounter(lines: string[]): number[] {
    return lines.map(countPrefixBlank)
}
