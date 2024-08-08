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
/**
const text = function* (split, st) {
    const tabs = st.tab.repeat(st.indent)
    const text = split.__text[0]?.[1] ?? ""
    text ? yield `${tabs}${text}` : ""
    if (split.__cdata.length === 0) {
        return
    }
    yield `${tabs}<![CDATA[${split.__cdata[0][1]}]]>`
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
/**
const nodeToString = function* ([name, value], st) {
    const split = attrSplit(value)
    const tabs = st.tab.repeat(st.indent)
    const stNext = { ...st, indent: st.indent + 1 }
    if (name === "?xml") {
        yield `${tabs}<?xml${attrs(split._)} ?>`
        return
    }
    if (Array.isArray(value) === true) {
        for (const arrayValue of value) {
            yield* nodeToString([name, arrayValue], st)
        }
        return
    }
    const attrXML = attrs(split._)
    if (split.c.length > 0) {
        yield `${tabs}<${name}${attrXML}>`
        yield* text(split, stNext)
        for (const pair of split.c) {
            yield* nodeToString(pair, stNext)
        }
        yield `${tabs}</${name}>`
        return
    }
    yield `${tabs}<${name}${attrXML}>${innerText(split, st)}</${name}>`
}
/**
@typedef {{
    indent: int,
    tab: string,
}} state
*/
const stringify = function* (obj, opt) {
    /** @type state */
    const st = {
        indent: 0,
        tab: opt.indent ?? "    "
    }
    for (const [name, value] of Object.entries(obj)) {
        for (const line of nodeToString([name, value], st)) {
            yield line + "\n"
        }
    }
}

/**
@typedef {object} options
@property {string} options.indent
    The character(s) to use for indentation. Defaults to "    " (4 spaces).
*/
/**
Converts an XML Object to a string in memory.
export const toString = (xmlobj, opt = {}) => {
    let s = ""
    for (const line of stringify(xmlobj, opt)) {
        s += line
    }
    return s
}
export const toIterable = (xmlobj, opt = {}) => stringify(xmlobj, opt)
