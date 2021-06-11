const minstr = (minify, str) => {
    if (minify === false) {
        return str
    }
    return str.trim().replace(/\s+/g, " ")
}
const stringify = (js, options = {}, tab = 0) => {
    const {
        minify = false,
    } = options
    const joinString = minstr(minify, "\n")
    const tabs = minstr(minify, "    ".repeat(tab))

    return js.map(
        (item) => {
            if (item.text !== undefined) {
                return minstr(minify, `${tabs}${item.text}`)
            }

            const {
                tag,
                header = false,
                children = [],
                attr = {}
            } = item

            const attrString = [""]
                .concat(
                    Object.entries(attr)
                    .map(
                        (pair) => `${pair[0]}="${pair[1]}"`
                    )
                )
                .join(" ")

            if (header === true) {
                return `${tabs}<?xml${attrString}?>`
            }

            if (children.length === 0) {
                return `${tabs}<${tag}${attrString} />`
            }

            return [
                `${tabs}<${tag}${attrString}>`,
                stringify(children, options, tab + 1),
                `${tabs}</${tag}>`
            ].join(joinString)
        }
    ).join(joinString)
}

module.exports = stringify
