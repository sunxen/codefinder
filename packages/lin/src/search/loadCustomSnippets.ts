import * as fs from 'fs'
import * as path from 'path'
import logger from '../logger'
import Segment from '../Segment'

type LangExtMap = {
    [lang: string]: string[]
}
const langExtMap: LangExtMap = {
    'js': ['js', 'ts', 'jsx', 'tsx', 'vue'],
    'ts': ['ts', 'tsx', 'vue'],
    'html': ['html', 'htm', 'vue'],
    'css': ['css', 'scss', 'less', 'html', 'htm', 'vue'],
}

export default function loadCustomSnippets(dir: string, ext: string): Segment[] {
    const segments: Segment[] = []
    const files = fs.readdirSync(dir)
    for (const file of files) {
        if (fs.statSync(`${dir}/${file}`).isDirectory()) {
            const subFiles = fs.readdirSync(`${dir}/${file}`)
            for (const subFile of subFiles) {
                segments.push(...readSegmentsTextFile(`${dir}/${file}/${subFile}`, ext, file))
            }
        } else {
            segments.push(...readSegmentsTextFile(`${dir}/${file}`, ext))
        }
    }
    return segments
}

function readSegmentsTextFile(file: string, ext: string, tag?: string): Segment[] {
    if (!fs.statSync(file).isFile() || !availableForExt(file, ext)) {
        return []
    }

    // split content by empty line
    const content = fs.readFileSync(file, 'utf8')
    const snippets = content.trim().split(/\n{3,}/)

    const segments: Segment[] = []
    for (const snippet of snippets) {
        const text = removePlaceholder(snippet)
        const segment = new Segment(text)
        segment.snippetWithPlaceholder = snippet
        if (tag) {
            segment.tag = tag
        }
        segments.push(segment)
    }
    logger.debug(`load ${file}, size: ${segments.length}`)
    return segments
}

function availableForExt(file: string, ext: string): boolean {
    const lang = path.basename(file).split('.')[0]
    if (langExtMap[lang]) {
        return langExtMap[lang].includes(ext)
    }
    if (lang === ext) {
        return true
    }
    return false
}

function removePlaceholder(snippetWithPlaceholder: string): string {
    let snippet = snippetWithPlaceholder
    snippet = snippet.replace(/\$\d+/g, '')
    snippet = snippet.replace(/\$\{\d+\}/g, '')
    snippet = snippet.replace(/\$\{\d+:([\w-]+)\}/g, '$1')
    return snippet
}
