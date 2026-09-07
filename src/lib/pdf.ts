import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

export async function exportInvoiceToPdf(elementId: string, invoiceNumber: string): Promise<boolean> {
  const element = document.getElementById(elementId);
  if (!element) return false;

  try {
    const canvas = await html2canvas(element, {
      scale: 2,
      useCORS: true,
      logging: false,
      backgroundColor: '#ffffff',
    });

    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
    });

    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

    pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
    pdf.save(`Invoice_${invoiceNumber || 'receipt'}.pdf`);
    return true;
  } catch (err) {
    console.error('Failed to generate PDF:', err);
    return false;
  }
}
