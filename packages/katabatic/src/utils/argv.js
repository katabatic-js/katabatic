export function command() {
    return process.argv[2]
}

export function option(name) {
    const index = process.argv.indexOf(`-${name}`)

    if (index >= 0) {
        const value = process.argv[index + 1]
        return value && value[0] !== '-' ? value : undefined
    }
}
