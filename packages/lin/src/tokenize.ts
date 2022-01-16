enum CharCase {
    Upper,
    Lower,
    Other,
}

function getCharCase(char) {
    if (char >= 'A' && char <= 'Z') {
        return CharCase.Upper
    }
    if (char >= 'a' && char <= 'z') {
        return CharCase.Lower
    }
    return CharCase.Other
}

const cache = new Map<string, boolean>()

function isVariable(char: string) {
    if (cache.has(char)) {
        return cache.get(char)
    }
    const value = /[a-zA-Z0-9$]/.test(char)
    cache.set(char, value)
    return value
}

export default function tokenize(text: string): string[] {
    const tokens: string[] = []
    const charList = text.split('')
    let token = ''
    let lastCharCase = null

    while (charList.length > 0) {
        const char = charList.shift()

        // camel case
        const currCharCase = getCharCase(char)
        const isCamelCase =
            lastCharCase === CharCase.Lower && currCharCase === CharCase.Upper
        lastCharCase = currCharCase
        if (isCamelCase) {
            if (token) {
                tokens.push(token)
            }
            token = char
            continue
        }

        if (isVariable(char)) {
            token += char
            continue
        }

        if (token) {
            tokens.push(token)
        }
        token = ''
        if (char.trim()) {
            tokens.push(char)
        }
    }
    if (token) {
        tokens.push(token)
    }
    return tokens
}
