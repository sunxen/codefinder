const listeners = new Map<string, Set<() => void>>()

function getListeners(key: string) {
    if (!listeners.has(key)) {
        listeners.set(key, new Set())
    }
    return listeners.get(key)
}

export function onProjectUpdate(key: string, listener: () => void): void {
    getListeners(key).add(listener)
}

export function notifyProjectUpdate(key: string): void {
    const some = getListeners(key)
    some.forEach(listener => listener())
}
