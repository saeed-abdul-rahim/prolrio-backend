export function randomString(keyStr = 'xT791n5') {
    const rand = Math.random().toString(36).slice(-8)
    const date = Date.now().toString(36)
    const str = parseInt([...keyStr].map(s => s.charCodeAt(0)).join('')).toString(36).substring(0, 12)
    return (rand + str + date)
}