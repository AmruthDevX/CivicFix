import { jsPDF } from 'jspdf';

/**
 * Generates a professional civic incident report PDF.
 */
export const exportReportPDF = (report) => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();

  // Header
  doc.setFillColor(59, 130, 246); // Blue-600
  doc.rect(0, 0, pageWidth, 40, 'F');
  
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(24);
  doc.setFont('helvetica', 'bold');
  doc.text('CIVICFIX INCIDENT REPORT', 20, 25);
  
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(`TICKET ID: ${report.ticket_id}`, 20, 33);

  // Content Section
  doc.setTextColor(31, 41, 55); // Slate-800
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('REPORT DETAILS', 20, 55);
  
  doc.setLineWidth(0.5);
  doc.line(20, 58, pageWidth - 20, 58);

  const details = [
    ['Category:', report.category.toUpperCase()],
    ['Status:', report.status.replace('_', ' ').toUpperCase()],
    ['Reported On:', new Date(report.created_at).toLocaleString()],
    ['Upvotes:', report.upvotes || 0]
  ];

  let y = 70;
  details.forEach(([label, value]) => {
    doc.setFont('helvetica', 'bold');
    doc.text(label, 20, y);
    doc.setFont('helvetica', 'normal');
    doc.text(String(value), 60, y);
    y += 10;
  });

  doc.setFont('helvetica', 'bold');
  doc.text('DESCRIPTION:', 20, y + 5);
  doc.setFont('helvetica', 'normal');
  const splitDesc = doc.splitTextToSize(report.description, pageWidth - 40);
  doc.text(splitDesc, 20, y + 15);

  // Footer
  doc.setFontSize(8);
  doc.setTextColor(156, 163, 175);
  doc.text(`Generated via CivicFix Community App on ${new Date().toLocaleString()}`, 20, doc.internal.pageSize.getHeight() - 10);

  doc.save(`CivicFix_Report_${report.ticket_id}.pdf`);
};

/**
 * Generates a formal escalation letter to the District Collector.
 */
export const generateDCLetter = (report) => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();

  doc.setFont('times', 'normal');
  doc.setFontSize(12);

  let y = 30;
  
  // Date
  doc.text(new Date().toLocaleDateString(), pageWidth - 60, y);
  y += 20;

  // Recipient
  doc.setFont('times', 'bold');
  doc.text('To,', 20, y);
  y += 7;
  doc.text('The District Collector,', 20, y);
  y += 7;
  doc.text('Collectorate Office,', 20, y);
  y += 7;
  doc.text('Subject: Formal Escalation of Unresolved Civic Infrastructure Issue', 20, y + 10);
  
  y += 30;

  // Salutation
  doc.setFont('times', 'normal');
  doc.text('Respected Sir/Madam,', 20, y);
  y += 15;

  // Body
  const body = `This is to formally bring to your attention a long-standing civic infrastructure issue reported via the CivicFix platform. The report (Ticket ID: ${report.ticket_id}) regarding "${report.category}" was filed on ${new Date(report.created_at).toLocaleDateString()} with the following description:`;
  
  const splitBody = doc.splitTextToSize(body, pageWidth - 40);
  doc.text(splitBody, 20, y);
  y += (splitBody.length * 7) + 5;

  doc.setFont('times', 'italic');
  const desc = `"${report.description}"`;
  const splitDesc = doc.splitTextToSize(desc, pageWidth - 50);
  doc.text(splitDesc, 25, y);
  y += (splitDesc.length * 7) + 10;

  doc.setFont('times', 'normal');
  const urgency = `Despite our community guidelines and the 48-hour service level agreement for critical infrastructure, this ticket remains in the state of "${report.status.replace('_', ' ')}" for more than 2 days. The community has expressed significant concern, with multiple citizens upvoting this issue for immediate action.`;
  
  const splitUrgency = doc.splitTextToSize(urgency, pageWidth - 40);
  doc.text(splitUrgency, 20, y);
  y += (splitUrgency.length * 7) + 15;

  doc.text('We request your immediate intervention to direct the relevant engineering department to resolve this matter as soon as possible.', 20, y);
  y += 25;

  // Closing
  doc.text('Sincerely,', 20, y);
  y += 7;
  doc.setFont('times', 'bold');
  doc.text('The CivicFix Community Members', 20, y);

  doc.save(`Escalation_Letter_DC_${report.ticket_id}.pdf`);
};
