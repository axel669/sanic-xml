const xmlStructureRegexes = [
    /(?<prefix><\?xml)/g,
    /(?<prefix>\?>)/g,
    /(?<prefix><)(?<tagOpen>\w+)/g,
    /(?<prefix><\/)(?<tagClose>\w+)>/g,
    /(?<prefix>\/>)/g,
    /(?<attrName>\w+)=(?<attrValue>"(?:.|\\")*?")/g,
    /(?<!\?)(?<prefix>>)/g,
]

const process = (tag, stack, match) => {
    const { prefix } = match.groups

    if (prefix === undefined) {
        const { attrName, attrValue } = match.groups
        tag.attr[attrName] = attrValue.slice(1, -1)

        return [tag, stack, null]
    }

    if (prefix === "<?xml") {
        return [
            { header: true, attr: {} },
            [],
            null
        ]
    }
    if (prefix === "?>") {
        if (tag.header !== true) {
            throw "nope"
        }
        return [
            null,
            stack,
            tag
        ]
    }

    if (prefix === "<") {
        const newTag = {
            tag: match.groups.tagOpen,
            children: [],
            attr: {}
        }
        tag?.children?.push(newTag)

        return [
            newTag,
            (tag === null)
                ? stack
                : [...stack, tag],
            null
        ]
    }
    if (prefix === ">") {
    }
    if (prefix === "</" || prefix === "/>") {
        const { tagClose } = match.groups

        if (tagClose !== undefined && tagClose !== tag.tag) {
            throw "mismatch close"
        }

        if (stack.length === 0) {
            return [
                null,
                [],
                tag
            ]
        }

        return [
            stack.slice(-1)[0],
            stack.slice(0, -1),
            null
        ]
    }

    return [tag, stack, null]
}

const parseXML = (xml) => {
    const tokens = xmlStructureRegexes
        .reduce(
            (found, regex) => {
                const matches = Array.from(
                    xml.matchAll(regex)
                )
                return [...found, ...matches]
            },
            []
        )
        .sort((a, b) => a.index - b.index)

    const root = []

    let current = null
    let stack = []

    tokens.forEach(
        (match, index) => {
            const next = tokens[index + 1]
            const [$current, $stack, $push] = process(current, stack, match)

            const isEnd = (
                match.groups.prefix === ">"
                || match.groups.prefix === "/>"
            )
            const nextIsStart = (
                next !== undefined
                && (
                    next.groups.prefix === "<"
                    || next.groups.prefix === "</"
                )
            )
            if (isEnd === true && nextIsStart === true) {
                const start = match.index + match[0].length
                const end = next.index
                const text = xml.substring(start, end).trim()

                if (text !== "") {
                    $current.children.push({ text })
                }
            }

            current = $current
            stack = $stack
            if ($push !== null) {
                root.push($push)
            }
        }
    )

    return root
}

module.exports = parseXML
