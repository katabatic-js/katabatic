import path from 'path'

export function route(outDirPath) {
    let router

    return {
        name: 'route',
        async serve({ request }) {
            router ??= await import(path.join(outDirPath, 'router.js'))
            return router.route(request.url)
        }
    }
}
