const lex = require('./lex.js')

function parser(md) {

    const { getc, retc, ahead,
        matchShift,
        isNewLine,
        isSpecial,
        linePos } = lex(md)

    function mark(type, val) {
        return { type, val }
    }

    function text(txt) {
        return {
            type: 'text',
            val: txt,
        }
    }

    function nextSpan() {
        let c = getc()
        if (!c) return
        if (c === '\r') c = getc()

        if (isNewLine(c)) return mark('.nl')

        if (linePos() === 1) {
            const sh = matchShift()
            if (sh > 0) return mark('shift', sh)
        }

        switch (c) {
            case '*': return mark('*')
            case '_': return mark('_')
        }

        if (c === '<') {
            let tag = c
            while(c && !isNewLine(c) && c !== '>') {
                c = getc()
                tag += c
            }
            return nextSpan()
        } else if (c === '>') {
            c = getc()
        }

        let span = ''
        while(c && !isNewLine(c) && !isSpecial(c)) {
            span += c
            c = getc()
        }
        retc()
        return text(span)
    }

    let state = {}
    let lastSpan = {}
    let lineSpan = 0

    function doNext() {

        let span = nextSpan()
        if (!span) return

        if (span.type === '.nl') { 
            lineSpan = 0
            if (lastSpan.type === '.nl') return mark('p')
        } else {
            lineSpan ++
        }

        if (span.type === '*') {
            if (state.bold) {
                state.bold = false
                return mark('.bold')
            } else {
                state.bold = true
                return mark('bold')
            }
        }

        if (span.type === '_') {
            if (state.italic) {
                state.italic = false
                return mark('.italic')
            } else {
                state.italic = true
                return mark('italic')
            }
        }

        if (span.type === 'shift') {
            if (!state.code) {
                state.code = true
                return mark('code')
            }
        } else {
            if (state.code && lineSpan === 1) {
                state.code = false
                return mark('.code')
            }
        }

        return span
    }

    function next() {
        const span = doNext()
        lastSpan = span
        return span
    }

    function dump(span) {
        if (span.type === 'text') return `"${span.val}"`
        else return `[${span.type}]`
    }

    return {
        next,
        dump,
    }
}

module.exports = parser
