import path from 'path'

export function serve(outDirPath) {
    let router

    return {
        name: 'serve',
        async serve({ request }) {
            router ??= await import(path.join(outDirPath, 'router.js'))
            console.log(request.url)
            return router.route(request.url)
        }
    }
}
