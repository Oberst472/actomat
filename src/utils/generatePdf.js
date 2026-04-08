import { jsPDF } from 'jspdf'
import { autoTable } from 'jspdf-autotable'
import { formatDateToDDMMYYYY, formatAgreementDate, formatCurrencyPdf } from './formatters.js'

export function generatePdf(data) {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' })
  const pageWidth = doc.internal.pageSize.getWidth()
  const marginLeft = 20
  const marginRight = 20
  const contentWidth = pageWidth - marginLeft - marginRight
  let y = 20

  const actDateFormatted = formatDateToDDMMYYYY(data.actDate)
  const agreementDateFormatted = formatAgreementDate(data.agreementDate)
  const rate = parseFloat(data.pricePerHour) || 0

  // Header: email (left) + full name (right)
  doc.setFontSize(10)
  doc.setFont('helvetica', 'normal')
  doc.text(data.email, marginLeft, y)
  doc.text(data.fullName, pageWidth - marginRight, y, { align: 'right' })
  y += 10

  // Title line
  doc.setFontSize(10)
  doc.setFont('helvetica', 'bold')
  doc.text(`Act #${data.actNumber}`, marginLeft, y)
  doc.setFont('helvetica', 'normal')
  doc.text(` for services rendered under the B2B service agreement from ${agreementDateFormatted}`, marginLeft + doc.getTextWidth(`Act #${data.actNumber}`), y)
  y += 12

  // "Acceptance Act" heading
  doc.setFontSize(14)
  doc.setFont('helvetica', 'bold')
  doc.text('Acceptance Act', marginLeft, y)
  y += 8

  // Submitted on
  doc.setFontSize(10)
  doc.setFont('helvetica', 'bold')
  doc.text('Submitted on:', marginLeft, y)
  doc.setFont('helvetica', 'normal')
  doc.text(`    ${actDateFormatted}`, marginLeft + doc.getTextWidth('Submitted on:'), y)
  y += 10

  // Boilerplate paragraph 1
  doc.setFontSize(9)
  doc.setFont('helvetica', 'normal')
  const para1 = 'We, the undersigned, Representative of the Client, and the Representative of the Executor, hereby execute this Acceptance Act confirming that the Executor rendered the following services calculated on an hourly basis in accordance with the B2B service agreement.'
  const lines1 = doc.splitTextToSize(para1, contentWidth)
  doc.text(lines1, marginLeft, y)
  y += lines1.length * 4 + 4

  // Boilerplate paragraph 2
  const para2p1 = 'The services were rendered on due and timely basis. The Parties have no further claims against each other.'
  const lines2p1 = doc.splitTextToSize(para2p1, contentWidth)
  doc.text(lines2p1, marginLeft, y)
  y += lines2p1.length * 4 + 2

  // Hourly rate line
  doc.text("Executor's hourly rate:", marginLeft, y)
  doc.setFont('helvetica', 'bold')
  const rateText = `      ${rate.toFixed(2)} zl`
  doc.text(rateText, marginLeft + doc.getTextWidth("Executor's hourly rate:"), y)
  doc.setFont('helvetica', 'normal')
  doc.text('  net per hour + VAT, as defined in the B2B service agreement.', marginLeft + doc.getTextWidth("Executor's hourly rate:" + rateText), y)
  y += 10

  // Task table
  const tableBody = data.tasks.map(task => {
    const hours = parseFloat(task.hours) || 0
    return [
      `Task id: ${task.id}\nTask description: ${task.description}`,
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
    bodyStyles: {
      fontSize: 9,
      textColor: [50, 50, 50],
      lineWidth: 0
    },
    columnStyles: {
      0: { cellWidth: contentWidth - 30 },
      1: { cellWidth: 30, halign: 'right' }
    },
    styles: {
      cellPadding: 3,
      overflow: 'linebreak',
      lineColor: [200, 200, 200]
    },
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

  // Check if summary fits on current page, otherwise add new page
  if (y + 40 > doc.internal.pageSize.getHeight() - 20) {
    doc.addPage()
    y = 20
  }

  // Summary section
  const summaryLabelX = marginLeft
  const summaryValueX = pageWidth - marginRight

  // Total hours
  doc.setFontSize(10)
  doc.setFont('helvetica', 'bold')
  doc.text('Total, hours', summaryLabelX, y)
  doc.text(data.totalHours.toFixed(1), summaryValueX, y, { align: 'right' })
  y += 8

  // Net amount
  doc.setFont('helvetica', 'normal')
  doc.text('Net amount', summaryValueX - 50, y, { align: 'right' })
  doc.text(formatCurrencyPdf(data.netAmount), summaryValueX, y, { align: 'right' })
  y += 6

  // VAT
  doc.text('VAT', summaryValueX - 50, y, { align: 'right' })
  doc.text(formatCurrencyPdf(data.vatAmount), summaryValueX, y, { align: 'right' })
  y += 6

  // Total due
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(180, 0, 0)
  doc.text('TOTAL DUE', summaryValueX - 50, y, { align: 'right' })
  doc.text(formatCurrencyPdf(data.totalDue), summaryValueX, y, { align: 'right' })
  doc.setTextColor(0, 0, 0)
  y += 16

  // Footer: Client and Executor
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(10)
  doc.text('Client', marginLeft, y)
  doc.text('Executor', pageWidth / 2, y)

  // Signature lines
  y += 8
  doc.setDrawColor(0, 0, 0)
  doc.setLineWidth(0.3)
  doc.line(marginLeft, y, marginLeft + 60, y)
  doc.line(pageWidth / 2, y, pageWidth / 2 + 60, y)

  // Save
  doc.save(`acceptance-act-${data.actNumber || 'draft'}.pdf`)
}
