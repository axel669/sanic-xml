import fs from "node:fs"

const xmlStructureRegexes = [
    /(?<header><\?xml(.|\r|\n)*?\?>)/g,
    /(?<comment><\!\-\-(.|\r|\n)*?\-\->)/g,
    /(?<doctype><\!doctype(.|\r|\n)*?>)/g,
    /(<)(?<tagOpen>[\w\-]+)/g,
    /(<\/)(?<tagClose>[\w\-]+)>/g,
    /(?<tagSelfClose>\/>)/g,
    /(?<attrName>[\w\-]+)=(?<attrValue>"(?:.|\\")*?")/g,
    /(?<![\?\-])(?<tagEnd>>)/g,
]
const beeg = new RegExp(
    `${xmlStructureRegexes.map(r => r.source).join("|")}`,
    "gi"
)

const addChild = (item, child) => {
    const { "@attr": hasAttr, tag, __text, ...attrs } = child
    const textValue = (__text !== "") ? { __text } : {}
    const value = hasAttr ? { ...attrs, ...textValue } : (textValue.__text ?? "")
    item["@attr"] = true
    if (item[tag] === undefined) {
        item[tag] = value
        return
    }
    if (Array.isArray(item[tag]) === true) {
        item[tag].push(value)
        return
    }
    item[tag] = [item[tag], value]
}
const parser = () => {
    let i = 0
    let current = { __text: "" }
    let stack = []
    let remain = ""
    let xml = ""
    let seen = 0
    const process = (match, end) => {
        const token = match.groups
        if (end === false && (match.index + match[0].length) === xml.length) {
            return
        }
        if (token.header !== undefined || token.comment !== undefined || token.doctype !== undefined) {
            current.__text += xml.substring(i, match.index)
            i = match.index + match[0].length
            return
        }
        if (token.tagOpen !== undefined) {
            current.__text += xml.substring(i, match.index)
            stack.push(current)
            current = {
                tag: token.tagOpen,
                __text: "",
            }
            i = match.index + match[0].length
            return
        }
        if (token.tagEnd !== undefined) {
            i = match.index + match[0].length
            return
        }
        if (token.tagClose !== undefined) {
            current.__text = (current.__text + xml.substring(i, match.index)).trim()
            const next = stack.pop()
            if (current.tag !== token.tagClose) {
                throw `wat: ${seen + match.index}`
            }
            addChild(next, current)
            current = next
            i = match.index + match[0].length
            return
        }
        if (token.tagSelfClose !== undefined) {
            const next = stack.pop()
            addChild(next, current)
            current = next
            i = match.index + match[0].length
            return
        }
        if (token.attrName !== undefined) {
            current[`_${token.attrName}`] = token.attrValue.slice(1, -1)
            current["@attr"] = true
            i = match.index + match[0].length
            return
        }
    }

    const self = {
        chunk: (chunk, end = false) => {
            xml = remain + chunk
            i = 0
            for (const match of xml.matchAll(beeg)) {
                process(match, end)
            }
            seen += chunk.length
            remain = xml.slice(i)
        },
        end: () => {
            self.chunk("", true)
            if (remain.trim() !== "") {
                return new Error("Invalid XML")
            }
            if (stack.length !== 0) {
                return new Error("Invalid XML")
            }
            const { __text, "@attr": skip, ...document } = current
            return document
        }
    }

    return self
}

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

const parse = (xml) => {
    const p = parser()
    p.chunk(xml)
    return p.end()
}

export default { parse, parseStream, parseFile }
