import { parse, parser } from "./parse.js"
import { stringify } from "./stringify.js"

const parseStream = async (stream) => {
    const p = parser()
    const textStream = new TextDecoderStream("utf8")
    stream.pipeThrough(textStream)
    for await (const chunk of textStream.readable) {
        p.chunk(chunk)
    }
    return p.end()
}
const parseURL = async (url, options = {}) => {
    const res = await fetch(url, options)
    return await parseStream(res.body)
}

export default {
    parse,
    parseStream,
    parseURL,
    stringify,
}
