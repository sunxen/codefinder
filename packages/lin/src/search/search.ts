import logger from '../logger'
import tokenize from '../tokenize'
import TrieNode from './TrieNode'
import * as constants from '../constants'
import loadTrie from './loadTrie'
import { getSearchMode, SearchMode } from './getSearchMode'
import { lengthFilter, nerdFilter, repetitionFilter } from './filters'
import topK from './topK'
import { calcPathMatchValue, calcPercent, SegmentMatch } from './SegmentMatch'
import SearchTimer from './SearchTimer'

type SearchResult = {
    searchMode: number,
    results: {
        snippet: string,
        snippetWithPlaceholder: string,
        source: number
    }[],
}

export default function search(query: string, targetFile: string): SearchResult{
    if (!query || !query.trim()) {
        return {
            searchMode: SearchMode.Nerd,
            results: [],
        }
    }

    const  shortQuery = query.trimLeft().substring(0, constants.MAX_QUERY_CHARS)
    logger.debug(`search: ${shortQuery}`)

    const start = Date.now()
    const trie = loadTrie(targetFile)
    const searchMode = getSearchMode(trie, shortQuery)
    const queryTokens = tokenize(shortQuery.toLocaleLowerCase())

    let stateList: WalkTrieState[]
    if (searchMode === SearchMode.Nerd) {
        stateList = nerdSearch(trie, queryTokens)
    } else if(searchMode === SearchMode.Playboy){
        stateList = playboySearch(trie, queryTokens)
    }

    let matchList = parseWalkTrieState(queryTokens.length, stateList)
    // camel case path maybe find duplicate items
    matchList = repetitionFilter(matchList)
    matchList = lengthFilter(matchList, shortQuery.trim().length + 1)

    calcPathMatchValue(matchList, targetFile)
    calcPercent(matchList)
    matchList = topK(matchList, constants.MAX_SEARCH_RESULTS)

    if(searchMode === SearchMode.Nerd){
        matchList = nerdFilter(matchList)
    }

    for (const item of matchList) {
        logger.debug(`⭐ ${item.segment.snippet} [count ${item.segment.count}][percent ${item.scorePercent}]`)
    }
    logger.debug(`search mode: ${searchMode}, use time: ${Date.now() - start}, result size: ${matchList.length}`)

    const results = matchList.map(item => (
        {
            snippet: item.segment.snippet,
            snippetWithPlaceholder: item.segment.snippetWithPlaceholder,
            source: item.segment.source,
        }
    ))
    return {
        searchMode,
        results,
    }
}

function nerdSearch(trie: TrieNode, queryTokens: string[]): WalkTrieState[] {
    const timer = new SearchTimer()
    const resultList: WalkTrieState[] = []

    let queue: WalkTrieState[] = []
    const nextNode = trie.children.get(queryTokens[0])
    if(nextNode){
        queue.push(new WalkTrieState(nextNode, queryTokens.slice(1)))
    }

    // bfs searching
    while(queue.length > 0){
        const currentSearch = queue.shift()

        if(currentSearch.queryTokens.length === 0){
            resultList.push(currentSearch)
            continue
        }

        const token = currentSearch.queryTokens[0]
        const isLastToken = currentSearch.queryTokens.length === 1
        if(!isLastToken){
            if(currentSearch.currentNode.children.get(token)){
                queue.push(walkTrie(currentSearch, token, true))
            }
        } else {
            // prefix match
            for (const key of currentSearch.currentNode.children.keys()) {
                let nextSearch: WalkTrieState
                if(key.startsWith(token)){
                    nextSearch = walkTrie(currentSearch, key, true)
                    nextSearch.startWithCount += 1
                    queue.push(nextSearch)
                }
            }
        }

        if (timer.isTimeout()) {
            queue = reduceSearchPath(queue)
        }
    }

    return resultList
}

function playboySearch(trie: TrieNode, queryTokens: string[]): WalkTrieState[] {
    const timer = new SearchTimer()
    const resultList: WalkTrieState[] = []

    let queue: WalkTrieState[] = []
    for(const key of trie.children.keys()){
        if(key.startsWith(queryTokens[0])){
            queue.push(new WalkTrieState(trie.children.get(key), queryTokens.slice(1)))
        }
    }

    // bfs searching
    while(queue.length > 0){
        const currentSearch = queue.shift()

        if(currentSearch.queryTokens.length === 0){
            resultList.push(currentSearch)
            continue
        }

        const token = currentSearch.queryTokens[0]
        for (const key of currentSearch.currentNode.children.keys()) {
            let nextSearch: WalkTrieState
            // different match type will have different match value
            if(key === token){
                nextSearch = walkTrie(currentSearch, key, true)
            } else if(key.startsWith(token)){
                nextSearch = walkTrie(currentSearch, key, true)
                nextSearch.startWithCount += 1
            } else if(key.includes(token)){
                nextSearch = walkTrie(currentSearch, key, true)
                nextSearch.includesCount += 1
            } else {
                nextSearch = walkTrie(currentSearch, key, false)
                nextSearch.skipCount += 1
            }
            queue.push(nextSearch)
        }

        if (timer.isTimeout()) {
            queue = reduceSearchPath(queue)
        }
    }

    return resultList
}

class WalkTrieState {
    currentNode: TrieNode

    queryTokens: string[]

    startWithCount = 0

    includesCount = 0

    skipCount = 0

    constructor(node: TrieNode, tokens: string[]) {
        this.currentNode = node
        this.queryTokens = tokens
    }
}

function walkTrie(state: WalkTrieState, key: string, isTokenMatch: boolean) {
    const next = {
        ...state
    }
    next.currentNode = state.currentNode.children.get(key)
    next.queryTokens = state.queryTokens.slice(isTokenMatch ? 1 : 0)
    return next
}

/**
 * drop the longest paths
 * @param list
 */
function reduceSearchPath(list: WalkTrieState[]){
    let max = 0
    for(const item of list){
        if(item.queryTokens.length > max){
            max = item.queryTokens.length
        }
    }

    const filteredList = list.filter(item => item.queryTokens.length < max)

    logger.debug(`reduce search paths from ${list.length} to ${filteredList.length}`)
    return filteredList
}

function parseWalkTrieState(queryTokensCount: number, list: WalkTrieState[]) {
    const resultList: SegmentMatch[] = []

    for (const state of list) {
        for (const segment of state.currentNode.segments) {
            // score base: all tokens strict match is 1
            // Positive correlation: segment count
            // Negative correlation: fuzzy match count, full match count, skip count
            const baseDistance = queryTokensCount
            let walkDistance = queryTokensCount
            walkDistance += state.startWithCount * 1
            walkDistance += state.includesCount * 2
            walkDistance += state.skipCount * 3

            let score = 1
            score *= segment.count
            score /= walkDistance / baseDistance

            resultList.push({
                segment,
                score
            })
        }
    }

    return resultList
}

