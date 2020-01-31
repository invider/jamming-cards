
const TAB = 4

module.exports = function(md) {

    let pos = 0
    let line = 0
    let linePos = 0
    let bufc
    let buffered = false

    function isSpace(c) {
        return c === ' ' || c === '\t'
    }

    function isNewLine(c) {
        return c === '\r' || c === '\n'
    }

    function isWhitespace(c) {
        return isSpace(c) || isNewLine(c)
    }

    function isDigit(c) {
        const code = c.charCodeAt(0) - 48
        return code >= 0 && code < 10
    }

    function isAlpha(c) {
        const d = c.chatCodeAt(0)
        return ((d >= 65 && d <= 90)
            || (d >= 97 && d <= 122)
            || (d >= 161)
        );
    }

    function isAlphaNum(c) {
        return isDigit(c) || isAlpha(c)
    }

    function isSpecial(c) {
        switch(c) {
            case '*': case '_':
                return true

            default:
                return false
        }
    }

    // stream
    function getc() {
        if (buffered && bufc) {
            buffered = false
            return bufc
        }
        if (pos < md.length) {
            bufc = md.charAt(pos++)
            if (bufc === '\n') {
                line++
                linePos = 0
            } else {
                linePos ++
            }
            return bufc
        }
        bufc = undefined
    }

    function retc() {
        if (buffered) throw 'double buffering is not supported!'
        buffered = true
    }

    function ahead() {
        const c = getc()
        retc()
        return c
    }

    function matchShift() {
        let sh = 0
        let c = getc()
        while (c && (c === ' ' || c === '\t')) {
            if (c === ' ') sh ++
            else if (c === '\t') sh += TAB
            c = getc()
        }
        if (c) retc()
        return sh
    }

    return {
        getc,
        retc,
        ahead,
        matchShift,
        isNewLine,
        isSpecial,
        linePos: () => linePos,
    }
}
