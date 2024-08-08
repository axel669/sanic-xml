import { parse, parseStream, parseURL } from "./parse.js"
import { toString, toIterable } from "./to-string.js"

const toBlob = (xmlobj, opt = {}) => new Blob(
    toIterable(xmlobj, opt)
)
const toStream = (xmlobj, opt = {}) => ReadableStream.from(
    toIterable(xmlobj, opt)
)

export default {
    parse,
    parseStream,
    parseURL,
    toString,
    toIterable,
    toBlob,
    toStream,
}
