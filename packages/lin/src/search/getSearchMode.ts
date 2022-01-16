import tokenize from '../tokenize'
import TrieNode from './TrieNode'

/**
 * 2 search modes:
 * Nerd
 *  trigger: General input that conforms to grammatical rules
 *  match: Exact match
 *  return: 1 items
 * Playboy
 *  trigger: Jumping input (letters + space + letters...), or Double spaces (letters + space + space...))
 *  match: Fuzzy match
 *  return: 5 items
 */
export enum SearchMode {
    Nerd,
    Playboy,
}

function isWord(str: string): boolean {
    return /^[A-Za-zA-Z0-9$]+$/.test(str)
}

export function getSearchMode(trie: TrieNode, query: string): SearchMode{
    if (!query.includes(' ')) {
        return SearchMode.Nerd
    }

    // Double spaces
    if (query.includes('  ')){
        return SearchMode.Playboy
    }

    if (trie.tags.has(query.split(' ')[0])) {
        return SearchMode.Playboy
    }

    // Jumping input
    // if the sequence is found in the trie, it is conforms to grammatical rules, so it is a nerd mode

    const tokens = tokenize(query.toLocaleLowerCase())
    if (!tokens.every(isWord)) {
        return SearchMode.Nerd
    }

    // ignore last incomplete token
    if (!query.endsWith(' ')) {
        tokens.pop()
    }

    let curr = trie.children.get(tokens.shift())
    while (curr && tokens.length > 0) {
        curr = curr.children.get(tokens.shift())
    }

    return curr ? SearchMode.Nerd : SearchMode.Playboy
}
