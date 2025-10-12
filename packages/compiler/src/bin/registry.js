export class Registry {
    index
    modules = new Map()
    namedModules = new Map()

    setIndex(index) {
        this.index = index
    }

    getIndex(filePath) {
        if (filePath && filePath !== this.index.src.filePath) {
            throw new Error('multiple index.html detected')
        }
        return this.index
    }

    setModule(module) {
        this.modules.set(module.src.filePath, module)
        if (module.name.includes('-')) {
            this.namedModules.set(module.name, module)
        }
    }

    getModule(filePath) {
        return this.modules.get(filePath)
    }

    getNamedModule(name) {
        return this.namedModules.get(name)
    }

    listModules() {
        return this.modules.values()
    }
}
