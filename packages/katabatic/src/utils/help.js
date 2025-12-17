export function printHelp(options, error) {
    if (error) {
        console.log(error.message)
        console.log('')
    }

    console.log('usage: katabatic [options]')
    console.log('')
    for (const [name, config] of Object.entries(options)) {
        let line = ''.padEnd(4)
        line += config.short ? `-${config.short}, ` : ''
        line += `--${name}`
        line = line.padEnd(25)

        if (line.length > 25) {
            console.log(line)
            line = ''.padEnd(25)
        }

        line += config.description ?? ''
        console.log(line)
    }
}

export function withHelp(options, fn) {
    try {
        return fn()
    } catch (error) {
        printHelp(options, error)
        process.exit(1)
    }
}
