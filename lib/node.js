import fs from "node:fs"
import { Readable } from "node:stream"

import sanicXML from "./main.js"
/** @import { XMLObject } from "./parse.js" */

/**
Reads a file and parses the xml inside.
@param {string} filename
@return {Promise<XMLObject|Error>}
*/
const parseFile = async (filename) => {
    const fsstream = fs.createReadStream(filename)
    return await sanicXML.parseStream(
        Readable.toWeb(fsstream)
    )
}

/**
Converts an XMLObject into xml and writes it to a file.
@param {string} filename
@param {XMLObject} xmlobj
@param {options} [opt]
@return {void}
*/
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
