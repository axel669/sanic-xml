import { SanicError } from "./sanic-error.js"
/** @import { SanicError } from "./sanic-error.js" */

/**
@type {RegExp[]}
*/
const xmlStructureRegexes = [
    /(?<attrName>[\w:\-]+)=(["'])(?<attrValue>(.|\\\2)*?)\2/,
    /<(?<tagOpen>[\w:\-]+)/,
    /<\/(?<tagClose>[\w:\-]+)>/,
    /(?<tagSelfClose>\/>)/,
    /(?<![\?\-])(?<tagEnd>>)/,
    /(?<prologOpen><\?xml)/,
    /(?<prologClose>\?>)/,
    /(?<comment><\!\-\-[\s\S]*?\-\->)/,
    /(?<doctype><\!doctype[^>]*?>)/,
    /<\!\[CDATA\[(?<cdata>[\s\S]*?)\]\]>/,
]
const beeg = new RegExp(
    `${xmlStructureRegexes.map(r => r.source).join("|")}`,
    "gi"
)

/**
Add a child to its parent XMLObject.
@param {XMLNode} item
@param {XMLNode} child
@return {void}
*/
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
/**
@typedef {{
    "@attr": bool,
    __text: string,
    __cdata: string,
    tag: string,
    [attrName: string]: string | string[]
}} XMLNode
*/

/**
@readonly
@enum {int}
*/
const Mode = {
    text: 0,
    tag: 1,
}
/**
Creates an xml parser that can process xml strings as chunks.
*/
const parser = () => {
    /** @type {int} */
    let i = 0
    /** @type {XMLNode} */
    let current = { __text: "" }
    /** @type {XMLNode[]} */
    let stack = []
    let remain = ""
    let xml = ""
    /** @type {int} */
    let seen = 0
    /** @type {Mode} */
    let mode = Mode.text

    /**
    @typedef {{
        "0": string,
        [n: int]: string,
        groups: {
            attrName: string,
            attrValue: string,
            tagOpen: string,
            tagClose: string,
            tagSelfClose: string,
            tagEnd: string,
            prologOpen: string,
            prologClose: string,
            comment: string,
            doctype: string,
            cdata: string,
        }
    }} RegexMatch
    */
    /**
    Processes a regex match.
    @param {RegexMatch} match
    @param {bool} end
    @return {void}
    */
    const process = (match, end) => {
        const token = match.groups
        // console.log(JSON.stringify(token))
        const endIndex = match.index + match[0].length
        if (end === false && endIndex === xml.length) {
            return
        }
        const i_temp = i
        const position = seen + match.index
        i = endIndex
        if (token.tagOpen !== undefined) {
            mode = Mode.tag
            current.__text += xml.substring(i_temp, match.index)
            stack.push(current)
            current = {
                tag: token.tagOpen,
                __text: "",
                "@attr": false,
            }
            return
        }
        if (token.tagEnd !== undefined) {
            if (mode !== Mode.tag) {
                i = i_temp
                return
            }
            const between = xml.substring(i_temp, match.index)
            if (between.trim() !== "") {
                return new SanicError(
                    `Invalid attribute @${position}: "${between}"`,
                    {
                        text: between,
                        index: position
                    }
                )
            }
            mode = Mode.text
            return
        }
        if (token.tagClose !== undefined) {
            current.__text = (current.__text + xml.substring(i_temp, match.index)).trim()
            const next = stack.pop()
            if (current.tag !== token.tagClose) {
                return new SanicError(
                    `Mismatched closing tag @${position}: found ${token.tagClose}, expected ${current.tag}`,
                    {
                        index: position,
                        found: token.tagClose,
                        expected: current.tag
                    }
                )
            }
            addChild(next, current)
            current = next
            return
        }
        if (token.tagSelfClose !== undefined || token.prologClose !== undefined) {
            mode = Mode.text
            const next = stack.pop()
            addChild(next, current)
            current = next
            return
        }
        if (token.attrName !== undefined) {
            if (mode !== Mode.tag) {
                i = i_temp
                return
            }
            const between = xml.substring(i_temp, match.index)
            if (between.trim() !== "") {
                return new SanicError(
                    `Invalid attribute @${position}: "${between}"`,
                    {
                        text: between,
                        index: position
                    }
                )
            }
            current[`_${token.attrName}`] = token.attrValue
            current["@attr"] = true
            return
        }
        if (token.prologOpen !== undefined) {
            stack.push(current)
            current = {
                tag: "?xml",
                __text: "",
                "@attr": false,
            }
            return
        }
        if (token.comment !== undefined || token.doctype !== undefined) {
            current.__text += xml.substring(i_temp, match.index)
            return
        }
        if (token.cdata !== undefined) {
            current.__cdata = token.cdata
            current["@attr"] = true
            return
        }
    }

    /**
    Processes an xml chunk.
    @param {string} chunk A chunk of xml
    @param {bool} [end] If the chunk is the last one in entire parse
    */
    const chunk = (chunk, end = false) => {
        xml = remain + chunk
        i = 0
        for (const match of xml.matchAll(beeg)) {
            const error = process(match, end)
            if (error !== undefined) {
                return error
            }
        }
        seen += chunk.length
        remain = xml.slice(i)
    }
    /**
    Checks if the parse resulted in valid XML, returning the XMLObject if it did
    @return {XMLObject|SanicError}
    */
    const end = () => {
        chunk("", true)
        if (remain.trim() !== "") {
            return new SanicError("XML contains extra characters after main document element")
        }
        if (stack.length !== 0) {
            return new SanicError("Invalid XML")
        }
        delete current.__text
        delete current["@attr"]
        return current
    }

    return { chunk, end }
}

/**
@typedef {{
    __text: string?,
    __cdata: string?,
    [attrName: string]: string | string[]
}} XMLObject
*/
/**
Parse an XML string into an XML object.
@param {string} xml
@return {XMLObject|SanicError}
*/
export const parse = (xml) => {
    const p = parser()
    const error = p.chunk(xml)
    if (error !== undefined) {
        return error
    }
    return p.end()
}

/**
Parse a ReadableStream into an XML object.
@param {ReadableStream} readable
@return {Promise<XMLObject|SanicError>}
*/
export const parseStream = async (readable) => {
    const p = parser()
    const decoder = new TextDecoderStream("utf8")
    readable.pipeThrough(decoder)
    for await (const xml of decoder.readable) {
        const error = p.chunk(xml)
        if (error !== undefined) {
            return error
        }
    }
    return p.end()
}

/**
Parse xml after fetching it from a URL.
@param {string|URL|Request} url
@param {RequestInit} [fetchOptions]
@return {Promise<XMLObject|SanicError>}
*/
export const parseURL = async(url, fetchOptions) => {
    const response = await fetch(url, fetchOptions)
    if (response.ok === false) {
        const error = new SanicError("Fetch did not return an ok response")
        error.detail = response
        return error
    }
    return await parseStream(response.body)
}
