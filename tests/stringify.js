import fs from "node:fs/promises"

const load = async (file) => JSON.parse(
    await fs.readFile(file, "utf8")
)

const array = await load("tests/json/multiple.json")

console.log(array)

const splitKey = (pair) => {
    if (pair[0].startsWith("__") === true) {
        return pair[0]
    }
    if (pair[0].startsWith("_") === true) {
        return "_"
    }
    return "c"
}
const attrSplit = (value) => {
    const split = {
        c: [],
        _: [],
        __text: [],
        __cdata: [],
    }
    if (typeof value === "string") {
        split.__text.push(["", value])
        return split
    }
    for (const pair of Object.entries(value)) {
        split[splitKey(pair)].push(pair)
    }
    return split
}
const text = (xml, split, st) => {
    const tabs = st.tab.repeat(st.indent)
    const text = split.__text[0]?.[1] ?? ""
    xml.write(text ? `${tabs}${text}` : "")
    if (split.__cdata.length === 0) {
        return
    }
    xml.write(`${tabs}<![CDATA[${split.__cdata[0][1]}]]>`)
}
const innerText = (split, st) => {
    const text = split.__text[0]?.[1] ?? ""
    if (split.__cdata.length === 0) {
        return text
    }
    const tabs = st.tab.repeat(st.indent)
    const endTabs = st.tab.repeat(st.indent - 1)
    const innerText = `${text}\n${tabs}<![CDATA[${split.__cdata[0][1]}]]>`.trim()
    return `\n${tabs}${innerText}\n${endTabs}`
}
const attrs = (source) => source.reduce(
    (xml, [attr, value]) => `${xml} ${attr.slice(1)}="${value}"`,
    ""
)
const nodeToString = (xml, [name, value], st) => {
    const split = attrSplit(value)
    // console.log(name, split)
    const tabs = st.tab.repeat(st.indent)
    const stNext = { ...st, indent: st.indent + 1 }
    if (name === "?xml") {
        xml.write(`${tabs}<?xml${attrs(split._)} ?>`)
        return
    }
    if (Array.isArray(value) === true) {
        // let xml = ""
        for (const arrayValue of value) {
            nodeToString(xml, [name, arrayValue], st)
        }
        return
    }
    const attrXML = attrs(split._)
    if (split.c.length > 0) {
        xml.write(`${tabs}<${name}${attrXML}>`)
        text(xml, split, stNext)
        for (const pair of split.c) {
            nodeToString(xml, pair, stNext)
        }
        xml.write(`${tabs}</${name}>`)
        return
    }
    xml.write(`${tabs}<${name}>${innerText(split, st)}</${name}>`)
    return
}
const writer = () => {
    let xml = ""

    return {
        write(line) {
            if (line === "") {
                return
            }
            xml += line + "\n"
        },
        end() {
            return xml
        }
    }
}
const stringify = (obj, opt = {}) => {
    const st = {
        indent: 0,
        tab: opt.indent ?? "    "
    }
    const xml = writer()
    for (const [name, value] of Object.entries(obj)) {
        nodeToString(xml, [name, value], st) + "\n"
    }
    return xml.end()
}

console.log(
    stringify(array)
)
