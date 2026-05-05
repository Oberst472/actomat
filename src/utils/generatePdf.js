import { jsPDF } from 'jspdf'
import { autoTable } from 'jspdf-autotable'
import { formatDateToDDMMYYYY, formatAgreementDate, fmtMoney, parseNum } from './formatters.js'

const CURRENCY_LABEL = {
  'zł': 'zl',
  '€': 'EUR',
  '$': 'USD'
}

export function generatePdf(data) {
  const currency = CURRENCY_LABEL[data.currency] || data.currency || 'zl'
  const fmtCur = (n) => `${fmtMoney(n).replace(/ /g, ' ')} ${currency}`

  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' })
  const pageWidth = doc.internal.pageSize.getWidth()
  const marginLeft = 20
  const marginRight = 20
  const contentWidth = pageWidth - marginLeft - marginRight
  let y = 20

  const actDateFormatted = formatDateToDDMMYYYY(data.actDate)
  const agreementDateFormatted = formatAgreementDate(data.agreementDate)
  const rate = parseNum(data.pricePerHour)

  doc.setFontSize(10)
  doc.setFont('helvetica', 'normal')
  doc.text(data.email || '', marginLeft, y)
  doc.text(data.fullName || '', pageWidth - marginRight, y, { align: 'right' })
  y += 10

  doc.setFontSize(10)
  doc.setFont('helvetica', 'bold')
  doc.text(`Act #${data.actNumber || ''}`, marginLeft, y)
  doc.setFont('helvetica', 'normal')
  doc.text(
    ` for services rendered under the B2B service agreement from ${agreementDateFormatted}`,
    marginLeft + doc.getTextWidth(`Act #${data.actNumber || ''}`),
    y
  )
  y += 12

  doc.setFontSize(14)
  doc.setFont('helvetica', 'bold')
  doc.text('Acceptance Act', marginLeft, y)
  y += 8

  doc.setFontSize(10)
  doc.setFont('helvetica', 'bold')
  doc.text('Submitted on:', marginLeft, y)
  doc.setFont('helvetica', 'normal')
  doc.text(`    ${actDateFormatted}`, marginLeft + doc.getTextWidth('Submitted on:'), y)
  y += 10

  doc.setFontSize(9)
  const para1 =
    'We, the undersigned, Representative of the Client, and the Representative of the Executor, hereby execute this Acceptance Act confirming that the Executor rendered the following services calculated on an hourly basis in accordance with the B2B service agreement.'
  const lines1 = doc.splitTextToSize(para1, contentWidth)
  doc.text(lines1, marginLeft, y)
  y += lines1.length * 4 + 4

  const para2 = 'The services were rendered on due and timely basis. The Parties have no further claims against each other.'
  const lines2 = doc.splitTextToSize(para2, contentWidth)
  doc.text(lines2, marginLeft, y)
  y += lines2.length * 4 + 2

  doc.text("Executor's hourly rate:", marginLeft, y)
  doc.setFont('helvetica', 'bold')
  const rateText = `      ${fmtCur(rate)}`
  doc.text(rateText, marginLeft + doc.getTextWidth("Executor's hourly rate:"), y)
  doc.setFont('helvetica', 'normal')
  doc.text(
    '  net per hour + VAT, as defined in the B2B service agreement.',
    marginLeft + doc.getTextWidth("Executor's hourly rate:" + rateText),
    y
  )
  y += 10

  const tableBody = data.tasks.map((task) => {
    const hours = parseNum(task.hours)
    return [
      `Task id: ${task.id || ''}\nTask description: ${task.description || ''}`,
      hours.toFixed(1)
    ]
  })

  autoTable(doc, {
    startY: y,
    head: [['Description of services', 'Number of hours']],
    body: tableBody,
    margin: { left: marginLeft, right: marginRight },
    headStyles: {
      fillColor: [255, 255, 255],
      textColor: [0, 0, 0],
      fontStyle: 'bold',
      lineWidth: 0,
      fontSize: 10
    },
    bodyStyles: { fontSize: 9, textColor: [50, 50, 50], lineWidth: 0 },
    columnStyles: {
      0: { cellWidth: contentWidth - 30 },
      1: { cellWidth: 30, halign: 'right' }
    },
    styles: { cellPadding: 3, overflow: 'linebreak', lineColor: [200, 200, 200] },
    theme: 'plain',
    didDrawCell: (hookData) => {
      if (hookData.section === 'body') {
        const cellY = hookData.cell.y + hookData.cell.height
        doc.setDrawColor(200, 200, 200)
        doc.setLineWidth(0.2)
        doc.line(hookData.cell.x, cellY, hookData.cell.x + hookData.cell.width, cellY)
      }
    }
  })

  y = doc.lastAutoTable.finalY + 6

  if (y + 40 > doc.internal.pageSize.getHeight() - 20) {
    doc.addPage()
    y = 20
  }

  const summaryValueX = pageWidth - marginRight

  doc.setFontSize(10)
  doc.setFont('helvetica', 'bold')
  doc.text('Total, hours', marginLeft, y)
  doc.text(data.totalHours.toFixed(1), summaryValueX, y, { align: 'right' })
  y += 8

  doc.setFont('helvetica', 'normal')
  doc.text('Net amount', summaryValueX - 50, y, { align: 'right' })
  doc.text(fmtCur(data.netAmount), summaryValueX, y, { align: 'right' })
  y += 6

  doc.text('VAT', summaryValueX - 50, y, { align: 'right' })
  doc.text(fmtCur(data.vatAmount), summaryValueX, y, { align: 'right' })
  y += 6

  doc.setFont('helvetica', 'bold')
  doc.setTextColor(91, 92, 240)
  doc.text('TOTAL DUE', summaryValueX - 50, y, { align: 'right' })
  doc.text(fmtCur(data.totalDue), summaryValueX, y, { align: 'right' })
  doc.setTextColor(0, 0, 0)
  y += 16

  doc.setFont('helvetica', 'normal')
  doc.setFontSize(10)
  doc.text('Client', marginLeft, y)
  doc.text('Executor', pageWidth / 2, y)

  y += 8
  doc.setDrawColor(0, 0, 0)
  doc.setLineWidth(0.3)
  doc.line(marginLeft, y, marginLeft + 60, y)
  doc.line(pageWidth / 2, y, pageWidth / 2 + 60, y)

  doc.save(`acceptance-act-${data.actNumber || 'draft'}.pdf`)
}
