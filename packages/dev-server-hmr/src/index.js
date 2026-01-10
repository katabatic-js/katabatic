/** @import {Plugin} from '@web/dev-server-core' */

import { hmrPlugin as basePlugin } from '@web/dev-server-hmr'

const includeRegexs = [/([^\/]+-[^\/]+)+\.js$/]
const excludeRegexs = [/^\/__web-dev-server__/, /^\/__wds-outside-root__/]
const defineCustomElementRegex = /customElements\.define\('([^']+)', ([^)]+)\)/

/**
 * @returns {Plugin}
 */
export function hmrPlugin() {
    const base = basePlugin()

    return {
        name: 'katabatic-hmr',
        injectWebSocket: true,
        transform(context) {
            if (
                includeRegexs.some((r) => context.path.match(r)) &&
                !excludeRegexs.some((r) => context.path.match(r)) &&
                context.body.includes('export function $hot()')
            ) {
                context.body = withHMR(context.body)
            }
            return base.transform(context)
        },
        resolveImport(...args) {
            return base.resolveImport?.(...args)
        },
        serve(...args) {
            return base.serve?.(...args)
        },
        serverStart(...args) {
            return base.serverStart?.(...args)
        },
        serverStop(...args) {
            return base.serverStop?.(...args)
        },
        transformCacheKey(...args) {
            return base.transformCacheKey?.(...args)
        },
        transformImport(...args) {
            return base.transformImport?.(...args)
        },
        resolveMimeType(...args) {
            return base.resolveMimeType?.(...args)
        }
    }
}

function withHMR(code) {
    return code.replace(
        defineCustomElementRegex,
        `
if (import.meta.hot) {
    let HotElement = customElements.get('$1')

    if (!HotElement) {
        HotElement = class extends HTMLElement {
            constructor() {
                super()
                this.$hot()
            }
            connectedCallback() {
                super.connectedCallback()
            }
            disconnectedCallback() {
                super.disconnectedCallback()
            }
        }

        $2.prototype.$hot = $hot
        Object.setPrototypeOf(HotElement.prototype, $2.prototype)

        customElements.define('$1', HotElement)
    }

    import.meta.hot.accept((newModule) => {
        if (newModule) {
            if (newModule.$name !== '$1') {
                return
            }
            if (newModule.$shadowRootMode !== $shadowRootMode) {
                newModule.$class.prototype.$hot = newModule.$hot
                Object.setPrototypeOf(HotElement.prototype, newModule.$class.prototype)

                import.meta.hot.invalidate()
                return
            }

            document.querySelectorAll('$1').forEach((node) => {
                node.disconnectedCallback()
            })

            queueMicrotask(() => {
                newModule.$class.prototype.$hot = newModule.$hot
                Object.setPrototypeOf(HotElement.prototype, newModule.$class.prototype)

                document.querySelectorAll('$1').forEach((node) => {
                    node.$hot()
                    node.connectedCallback()
                })
            })
        }
    })
} else {
    customElements.define('$1', $2)
}`
    )
}
