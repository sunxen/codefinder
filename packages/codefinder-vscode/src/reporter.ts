import * as vscode from 'vscode'
import axios from 'axios'

let uid: string
let timer: NodeJS.Timer
const REPORT_INTERVAL = 1000 * 60 * 10
const MAX_REPORT_COUNT = 100

// when query changed or result selected, add one record
type SearchRecord = {
    query: string
    lang: string
    searchMode: number
    snippet?: string
    source?: number
}

type Report = {
    uid: string
    lang: string
    searchMode: number
    isSelect: number
    queryLenth: number
    snippetLength: number
    lines: number
    source: number
}

let records: SearchRecord[] = []
let currRecord: SearchRecord | null

export function activate(context: vscode.ExtensionContext): void {
    uid = context.globalState.get('uid') || ''
    if (!uid) {
        uid = String(Date.now())
        void context.globalState.update('uid', uid)
    }
    timer = setInterval(doReport, REPORT_INTERVAL)
    console.log('[CodeFinder] active, ', uid)
}

export function deactivate(): void {
    clearInterval(timer)
}

export function reportSearch(
    query: string,
    lang: string,
    searchMode: number
): void {
    if (!currRecord) {
        currRecord = {
            query,
            lang,
            searchMode,
        }
    } else if (query.includes(currRecord.query)) {
        currRecord.query = query
    } else {
        records.push(currRecord)
        currRecord = {
            query,
            lang,
            searchMode,
        }
    }
}

export type SearchResultItem = {
    snippet: string
    source: number
}

export function reportSelect(result: SearchResultItem): void {
    if (currRecord) {
        currRecord.snippet = result.snippet
        currRecord.source = result.source
        records.push(currRecord)
    }
    currRecord = null
}

function doReport() {
    const list = getReportList()
    if (list.length > 0) {
        axios({
            method: 'post',
            url: 'http://114.132.197.122/r',
            data: list,
        })
            .then(() => {
                // clear records
                records = []
            })
            .catch(() => {})
    }
}

function getReportList() {
    const list: Report[] = []
    for (const record of records) {
        list.push({
            uid,
            lang: record.lang,
            searchMode: record.searchMode,
            isSelect: record.snippet ? 1 : 0,
            queryLenth: record.query.length,
            snippetLength: record.snippet?.length || 0,
            lines: record.snippet?.split('\n').length || 0,
            source: record.source || 0,
        })
    }
    return list.slice(0, MAX_REPORT_COUNT)
}
