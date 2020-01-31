const fs = require('fs')
const PDFDocument = require("pdfkit")

const SIZE = 15

function createDocument(cg) {

    const doc = new PDFDocument({
        layout: cg.layout,
        //layout: 'portrait',
        //layout: 'landscape',
        //size: [180, 252],
        //size: [419.53, 595.28], // A5
        size: [cg.pageWidth, cg.pageHeight],
        //margin: 0,
        margins: {
            top: cg.margin.top,
            bottom: cg.margin.bottom,
            left: cg.margin.left,
            right: cg.margin.right,
        }
    })
    doc.pipe(fs.createWriteStream(cg.outputFile));

    return doc
}

function setup(cg) {
    const doc = createDocument(cg)

    // register a font
    // TODO get fonts from cg
    doc.registerFont('main', 'font/Calibri.ttf')
    doc.registerFont('bold', 'font/CalibriB.ttf')
    doc.registerFont('italic', 'font/CalibriI.ttf')
    //.doc.registerFont('main', 'font/neuropol.ttf')
    //this.doc.registerFont('main', 'font/november.ttf')

    doc
        .font('main')
        .fontSize(SIZE)
        .fillColor('#101012')

    let page = 1
    function printTitle(title) {
        doc
            .font('main')
            .fontSize(20)
            .text(title, { 
                align: 'right',
            })
            .fontSize(SIZE)
    }

    doc.on('pageAdded',
        () => printTitle("Jamming Card " + (++page)))
    printTitle("Jamming Card " + page)

    return doc
}


module.exports = function(md, cg) {

    const doc = setup(cg)

    function fontSize(size) {
        doc.fontSize(size)
    }

    function font(name, size) {
        doc.font(name)
        if (size) fontSize(size)
    }

    function color(c) {
        doc.fillColor(c)
    }

    function text(txt) {
        doc.text(txt, {
            continued: true,
            lineGap: 0,
            indent: 8,
            paragraphGap: 4,
        })
    }

    function p() {
        doc.text('\n\n', {
            continued: true,
        })
    }

    function span(sp) {
        console.log(md.dump(sp))

        switch(sp.type) {
            case 'text': text(sp.val); break;
            case 'p': p(); break;
            case '.nl': break;
            case 'bold': font('bold'); break;
            case '.bold': font('main'); break;
            case 'italic': font('italic'); break;
            case '.italic': font('main'); break;
            default:
                text(md.dump(sp))
        }
    }

    function close() {
        doc.end()
    }

    let sp
    while (sp = md.next()) {
        span(sp)
    }
    close()
}

