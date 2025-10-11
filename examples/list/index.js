import { ExList } from './wc/ex-list'
//import { signal } from "../../src/signals/signal2"
//import { effect } from "../../src/signals/effect"

customElements.define('ex-list', ExList)



// TEST
/*
const object = signal({ ll: 8, zz: { yy: 0 } })

effect(() => {
    console.log(object.zz.yy)
})

object.zz.yy = 1
console.log('NEXT')
object.dd = 4
*/