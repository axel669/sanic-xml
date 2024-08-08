import fs from "node:fs"
import { Readable } from "node:stream"

import sanicXML from "./main.js"

const parseFile = async (filename) => {
    const fsstream = fs.createReadStream(filename)
    return await sanicXML.parseStream(
        Readable.toWeb(fsstream)
    )
}
const toFile = (filename, xmlobj, opt = {}) => {
    const stream = fs.createWriteStream(filename)
    const lines = sanicXML.toIterable(xmlobj, opt)
    for (const line of lines) {
        stream.write(line)
    }
    stream.close()
}

export default {
    ...sanicXML,
    parseFile,
    toFile,
}
