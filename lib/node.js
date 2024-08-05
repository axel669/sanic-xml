import fs from "node:fs"

import { parse, parser } from "./parse.js"
import { stringify } from "./stringify.js"

const parseStream = (stream) => new Promise(
    (resolve) => {
        const p = parser()
        stream.on(
            "data",
            chunk => p.chunk(
                chunk.toString("utf8")
            )
        )
        stream.on(
            "end",
            () => resolve(p.end())
        )
    }
)
const parseFile = (filename) => parseStream(
    fs.createReadStream(filename)
)

export default {
    parse,
    parseStream,
    parseFile,
    stringify,
}
