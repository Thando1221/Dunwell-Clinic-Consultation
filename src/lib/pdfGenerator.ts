import jsPDF from 'jspdf';
import clinicLogoIco from '@/assets/clinic-logo-pdf.ico';



const CLINIC_NAME = 'DUNWELL Youth Priority Clinic';
const CLINIC_TAGLINE = 'PR : 988030';
const CLINIC_ADDRESS = '38 De Beer Street, Braamfontein, Johannesburg, 2001';
const CLINIC_TEL = 'Tel: 072 176 0247';
const CLINIC_EMAIL = 'Email: admin@dunwellyouthpriority.co.za';

// Professional navy blue color palette
const colors = {
  navy: { r: 26, g: 54, b: 93 },         // Primary navy blue
  navyLight: { r: 41, g: 82, b: 132 },   // Lighter navy
  navyDark: { r: 15, g: 35, b: 60 },     // Darker navy
  accent: { r: 70, g: 130, b: 180 },     // Steel blue accent
  text: { r: 30, g: 41, b: 59 },         // Dark text
  muted: { r: 100, g: 116, b: 139 },     // Muted text
  light: { r: 241, g: 245, b: 249 },     // Light background
  border: { r: 203, g: 213, b: 225 },    // Border color
  white: { r: 255, g: 255, b: 255 },
  success: { r: 34, g: 139, b: 34 },     // Green for fit
  danger: { r: 178, g: 34, b: 34 },      // Red for unfit
  warning: { r: 218, g: 165, b: 32 },    // Gold for conditional
};

// Store loaded logo
let logoDataUrl: string | null = null;

// Load logo as PNG data URL (converts from .ico if needed)
const loadLogo = async (): Promise<string> => {
  if (logoDataUrl) return logoDataUrl;

  try {
    const response = await fetch(clinicLogoIco);
    const blob = await response.blob();

    // Convert to PNG via canvas for jsPDF compatibility
    const objectUrl = URL.createObjectURL(blob);
    try {
      const img = await new Promise<HTMLImageElement>((resolve, reject) => {
        const image = new Image();
        image.onload = () => resolve(image);
        image.onerror = () => reject(new Error('Failed to load logo image'));
        image.src = objectUrl;
      });

      const maxDim = 256;
      const scale = Math.min(1, maxDim / Math.max(img.width || 1, img.height || 1));
      const width = Math.max(1, Math.round((img.width || maxDim) * scale));
      const height = Math.max(1, Math.round((img.height || maxDim) * scale));

      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');

      if (!ctx) return '';
      ctx.clearRect(0, 0, width, height);
      ctx.drawImage(img, 0, 0, width, height);

      logoDataUrl = canvas.toDataURL('image/png');
      return logoDataUrl;
    } finally {
      URL.revokeObjectURL(objectUrl);
    }
  } catch {
    return '';
  }
};

// Format date to YYYY-MM-DD (ISO)
const formatDOB = (dob?: string): string => {
  if (!dob) return 'N/A';

  const date = new Date(dob);
  if (isNaN(date.getTime())) return dob; // fallback if already formatted

  return date.toISOString().split('T')[0]; // YYYY-MM-DD
};


// Pre-load logo on module init
loadLogo();

interface PatientInfo {
  name: string;
  surname: string;
  dob: string; // can be ISO, Date string, etc.
  email?: string;
  idNumber?: string;
  address?: string;
  contactNumber?: string;
  gender?: string;
}


interface NurseInfo {
  name: string;
  surname: string;
  sancNumber: string;
}

// Helper to set color
const setColor = (doc: jsPDF, color: { r: number; g: number; b: number }) => {
  doc.setTextColor(color.r, color.g, color.b);
};

const setDrawColor = (doc: jsPDF, color: { r: number; g: number; b: number }) => {
  doc.setDrawColor(color.r, color.g, color.b);
};

const setFillColor = (doc: jsPDF, color: { r: number; g: number; b: number }) => {
  doc.setFillColor(color.r, color.g, color.b);
};

// Add beautiful watermark with logo
const addWatermark = (doc: jsPDF, logoData?: string) => {
  if (!logoData) return;

  const anyDoc = doc as any;
  const canOpacity = typeof anyDoc.setGState === 'function' && typeof anyDoc.GState === 'function';
  const canSaveRestore = typeof anyDoc.saveGraphicsState === 'function' && typeof anyDoc.restoreGraphicsState === 'function';

  // If opacity isn't supported, skip watermark (otherwise it will overpower content)
  if (!canOpacity) return;

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const watermarkSize = 120;

  const x = (pageWidth - watermarkSize) / 2;
  const y = (pageHeight - watermarkSize) / 2;

  try {
    if (canSaveRestore) anyDoc.saveGraphicsState();
    anyDoc.setGState(anyDoc.GState({ opacity: 0.06 }));
    doc.addImage(logoData, 'PNG', x, y, watermarkSize, watermarkSize);
  } catch {
    // Skip watermark if it fails
  } finally {
    if (canSaveRestore) {
      try {
        anyDoc.restoreGraphicsState();
      } catch {
        // ignore
      }
    }
  }
};

// Draw professional header with logo
const addProfessionalHeader = (doc: jsPDF, logoData?: string): number => {
  const pageWidth = doc.internal.pageSize.getWidth();
  let y = 0;

  // Top navy bar
  setFillColor(doc, colors.navy);
  doc.rect(0, 0, pageWidth, 6, 'F');
  
  // Accent line
  setFillColor(doc, colors.accent);
  doc.rect(0, 6, pageWidth, 1.5, 'F');

  y = 12;

  // Add logo image if available - larger size with rounded background
  const logoSize = 28;
  if (logoData) {
    try {
      // Draw rounded background for logo
      setFillColor(doc, colors.light);
      doc.roundedRect((pageWidth - logoSize - 4) / 2, y - 2, logoSize + 4, logoSize + 4, 3, 3, 'F');
      
      // Add subtle border
      setDrawColor(doc, colors.border);
      doc.setLineWidth(0.3);
      doc.roundedRect((pageWidth - logoSize - 4) / 2, y - 2, logoSize + 4, logoSize + 4, 3, 3, 'S');
      
      // Add the logo
      doc.addImage(logoData, 'PNG', (pageWidth - logoSize) / 2, y, logoSize, logoSize);
    } catch {
      // Skip logo if it fails to load - no fallback text
    }
  }

  y += logoSize + 8;

  // Clinic name
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  setColor(doc, colors.navy);
  doc.text(CLINIC_NAME, pageWidth / 2, y, { align: 'center' });
  y += 5;

  // Tagline
  doc.setFontSize(8);
  doc.setFont('helvetica', 'italic');
  setColor(doc, colors.muted);
  doc.text(CLINIC_TAGLINE, pageWidth / 2, y, { align: 'center' });
  y += 6;

  // Contact info
  doc.setFontSize(7);
  doc.setFont('helvetica', 'normal');
  setColor(doc, colors.text);
  doc.text(CLINIC_ADDRESS, pageWidth / 2, y, { align: 'center' });
  y += 3.5;
  doc.text(`${CLINIC_TEL}  |  ${CLINIC_EMAIL}`, pageWidth / 2, y, { align: 'center' });
  y += 5;

  // Divider line
  setDrawColor(doc, colors.border);
  doc.setLineWidth(0.5);
  doc.line(20, y, pageWidth - 20, y);
  y += 6;

  return y;
};

// Add document title
const addDocumentTitle = (doc: jsPDF, title: string, y: number): number => {
  const pageWidth = doc.internal.pageSize.getWidth();
  
  // Title box
  setFillColor(doc, colors.navy);
  doc.roundedRect(40, y - 5, pageWidth - 80, 14, 2, 2, 'F');

  // Title text
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  setColor(doc, colors.white);
  doc.text(title.toUpperCase(), pageWidth / 2, y + 4, { align: 'center' });

  return y + 18;
};

// Add section header
const addSectionHeader = (doc: jsPDF, title: string, y: number, margin: number): number => {
  // Left accent bar
  setFillColor(doc, colors.navy);
  doc.rect(margin, y - 1, 2, 7, 'F');
  
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  setColor(doc, colors.navy);
  doc.text(title, margin + 5, y + 4);
  
  return y + 12;
};

// Add info row
const addInfoRow = (doc: jsPDF, label: string, value: string, y: number, margin: number, labelWidth: number = 50): number => {
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  setColor(doc, colors.muted);
  doc.text(label, margin, y);
  
  doc.setFont('helvetica', 'normal');
  setColor(doc, colors.text);
  doc.text(value || 'N/A', margin + labelWidth, y);
  
  return y + 6;
};

// Add table row (for medical fitness report style)
const addTableRow = (doc: jsPDF, label: string, value: string, y: number, margin: number, tableWidth: number): number => {
  const halfWidth = tableWidth / 2;
  
  setDrawColor(doc, colors.border);
  doc.setLineWidth(0.3);
  doc.rect(margin, y, halfWidth, 8);
  doc.rect(margin + halfWidth, y, halfWidth, 8);
  
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  setColor(doc, colors.text);
  doc.text(label, margin + 3, y + 5.5);
  doc.text(value || '', margin + halfWidth + 3, y + 5.5);
  
  return y + 8;
};

// Add content box
const addContentBox = (doc: jsPDF, title: string, content: string, y: number, margin: number, height: number = 80): number => {
  const pageWidth = doc.internal.pageSize.getWidth();
  const boxWidth = pageWidth - 2 * margin;

  if (title) {
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    setColor(doc, colors.navy);
    doc.text(title, margin, y);
    y += 5;
  }

  // Box border
  setDrawColor(doc, colors.navy);
  doc.setLineWidth(0.8);
  doc.roundedRect(margin, y, boxWidth, height, 2, 2, 'S');

  // Content
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  setColor(doc, colors.text);
  const textLines = doc.splitTextToSize(content || 'No content provided.', boxWidth - 10);
  doc.text(textLines, margin + 5, y + 8);

  return y + height + 8;
};

// Add signature section
const addSignatureSection = (doc: jsPDF, nurse: NurseInfo, y: number, margin: number): number => {
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  
  // Calculate remaining space
  const footerStart = pageHeight - 30;
  const availableSpace = footerStart - y;
  
  // If not enough space, adjust y to fit
  if (availableSpace < 55) {
    y = footerStart - 55;
  }
  
  // Nurse details
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  setColor(doc, colors.text);
  doc.text(`Issued by: ${nurse.name} ${nurse.surname}`, margin, y);
  y += 5;
  doc.text(`HPCSA/SANC No: ${nurse.sancNumber}`, margin, y);
  y += 5;
  doc.text(`Date: ${new Date().toLocaleDateString('en-ZA', { day: '2-digit', month: 'long', year: 'numeric' })}`, margin, y);
  y += 10;

  // Signature and stamp
  const boxWidth = 60;
  const boxHeight = 25;
  
  // Signature
  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');
  setColor(doc, colors.muted);
  doc.text('Signature:', margin, y);
  y += 3;
  
  setDrawColor(doc, colors.border);
  doc.setLineWidth(0.5);
  doc.roundedRect(margin, y, boxWidth, boxHeight, 2, 2, 'S');
  
  // Signature line
  setDrawColor(doc, colors.muted);
  doc.line(margin + 5, y + boxHeight - 6, margin + boxWidth - 5, y + boxHeight - 6);

  // Stamp
  const stampX = pageWidth - margin - boxWidth;
  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');
  setColor(doc, colors.muted);
  doc.text('Official Stamp:', stampX, y - 3);
  
  setDrawColor(doc, colors.border);
  doc.roundedRect(stampX, y, boxWidth, boxHeight, 2, 2, 'S');

  return y + boxHeight + 5;
};

// Professional footer
const addProfessionalFooter = (doc: jsPDF, docType: string) => {
  const pageHeight = doc.internal.pageSize.getHeight();
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 20;
  let y = pageHeight - 25;

  // Footer line
  setDrawColor(doc, colors.border);
  doc.setLineWidth(0.5);
  doc.line(margin, y, pageWidth - margin, y);
  y += 6;

  // Document reference
  doc.setFontSize(7);
  doc.setFont('helvetica', 'normal');
  setColor(doc, colors.muted);
  const docRef = `REF: DW-${docType}-${Date.now().toString().slice(-8)}`;
  doc.text(docRef, margin, y);

  // Confidentiality
  doc.text('CONFIDENTIAL MEDICAL DOCUMENT', pageWidth / 2, y, { align: 'center' });

  // Page
  doc.text('Page 1 of 1', pageWidth - margin, y, { align: 'right' });
  y += 5;

  // Legal text
  doc.setFontSize(6);
  doc.setFont('helvetica', 'italic');
  setColor(doc, { r: 140, g: 140, b: 140 });
  doc.text(
    'This document is confidential and protected by law. For verification, contact Dunwell Youth Priority Clinic.',
    pageWidth / 2, y, { align: 'center' }
  );

  // Bottom bar
  setFillColor(doc, colors.navy);
  doc.rect(0, pageHeight - 4, pageWidth, 4, 'F');
};

// Generate Sick Note PDF
export const generateSickNotePDF = async (
  patient: PatientInfo,
  nurse: NurseInfo,
  formData: {
    accompaniedBy: string;
    consultedFor: string;
    fromTime: string;
    toTime: string;
    returningTo: string;
    bookedOffFrom: string;
    bookedOffTo: string;
  }
): Promise<jsPDF> => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 20;

  // Load logo
  const logoData = await loadLogo();

  // Add watermark first (behind all content)
  addWatermark(doc, logoData);

  let y = addProfessionalHeader(doc, logoData);
  y = addDocumentTitle(doc, 'Medical Sick Note', y);

  // Patient Information
  y = addSectionHeader(doc, 'PATIENT INFORMATION', y, margin);
  y = addInfoRow(doc, 'Full Name:', `${patient.name} ${patient.surname}`, y, margin);
  y = addInfoRow(doc, 'Date of Birth:', formatDOB(patient.dob), y, margin);
  y = addInfoRow(doc, 'Accompanied By:', formData.accompaniedBy, y, margin);
  y += 6;

  // Consultation Details
  y = addSectionHeader(doc, 'CONSULTATION DETAILS', y, margin);
  y = addInfoRow(doc, 'Reason for Visit:', formData.consultedFor, y, margin);
  y = addInfoRow(doc, 'Consultation Time:', `${formData.fromTime} - ${formData.toTime}`, y, margin);
  y = addInfoRow(doc, 'Return to Work/School:', formData.returningTo, y, margin);
  y += 6;

  // Leave Period
  y = addSectionHeader(doc, 'AUTHORIZED LEAVE PERIOD', y, margin);
  
  // Highlight box
  setFillColor(doc, colors.light);
  doc.roundedRect(margin, y, pageWidth - 2 * margin, 18, 2, 2, 'F');
  setDrawColor(doc, colors.navy);
  doc.setLineWidth(1);
  doc.roundedRect(margin, y, pageWidth - 2 * margin, 18, 2, 2, 'S');

  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  setColor(doc, colors.navy);
  doc.text(`FROM: ${formData.bookedOffFrom}     TO: ${formData.bookedOffTo}`, pageWidth / 2, y + 11, { align: 'center' });
  y += 28;

  // Certification
  doc.setFontSize(8);
  doc.setFont('helvetica', 'italic');
  setColor(doc, colors.text);
  const cert = 'I hereby certify that the above-named patient was examined and found to be unfit for work/school for the period indicated above.';
  doc.text(cert, margin, y, { maxWidth: pageWidth - 2 * margin });
  y += 12;

  // Signature section - calculate space
  const footerStart = pageHeight - 30;
  
  // Nurse details
  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  setColor(doc, colors.text);
  doc.text(`Issued by: ${nurse.name} ${nurse.surname}`, margin, y);
  doc.text(`HPCSA/SANC No: ${nurse.sancNumber}`, pageWidth / 2, y);
  y += 5;
  doc.text(`Date: ${new Date().toLocaleDateString('en-ZA', { day: '2-digit', month: 'long', year: 'numeric' })}`, margin, y);
  y += 8;

  // Signature and stamp boxes - increased size
  const boxWidth = 70;
  const boxHeight = 30;
  
  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');
  setColor(doc, colors.muted);
  doc.text('Signature:', margin, y);
  doc.text('Official Stamp:', pageWidth - margin - boxWidth, y);
  y += 3;
  
  setDrawColor(doc, colors.border);
  doc.setLineWidth(0.5);
  doc.roundedRect(margin, y, boxWidth, boxHeight, 2, 2, 'S');
  doc.roundedRect(pageWidth - margin - boxWidth, y, boxWidth, boxHeight, 2, 2, 'S');
  
  // Signature line
  setDrawColor(doc, colors.muted);
  doc.line(margin + 5, y + boxHeight - 6, margin + boxWidth - 5, y + boxHeight - 6);

  addProfessionalFooter(doc, 'SN');

  return doc;
};

// Generate Prescription PDF
export const generatePrescriptionPDF = async (
  patient: PatientInfo,
  nurse: NurseInfo,
  prescriptionText: string
): Promise<jsPDF> => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 20;

  // Load logo
  const logoData = await loadLogo();

  // Add watermark first (behind all content)
  addWatermark(doc, logoData);

  let y = addProfessionalHeader(doc, logoData);
  y = addDocumentTitle(doc, 'Medical Prescription', y);

  // Patient Information - compact
  y = addSectionHeader(doc, 'PATIENT DETAILS', y, margin);
  
  // Two column layout for patient info
  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');
  setColor(doc, colors.muted);
  doc.text('Full Name:', margin, y);
  doc.setFont('helvetica', 'normal');
  setColor(doc, colors.text);
  doc.text(`${patient.name} ${patient.surname}`, margin + 28, y);
  
  doc.setFont('helvetica', 'bold');
  setColor(doc, colors.muted);
  doc.text('DOB:', pageWidth / 2 + 10, y);
  doc.setFont('helvetica', 'normal');
  setColor(doc, colors.text);
  doc.text(formatDOB(patient.dob), pageWidth / 2 + 25, y);
  y += 8;

  // Prescription box - calculate available space
  const signatureHeight = 55;
  const footerHeight = 30;
  const availableHeight = pageHeight - y - signatureHeight - footerHeight - 15;
  const prescriptionBoxHeight = Math.min(Math.max(availableHeight, 60), 100);

  // Prescription section header
  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');
  setColor(doc, colors.navy);
  doc.text('PRESCRIPTION', margin, y);
  y += 4;

  // Prescription box
  setDrawColor(doc, colors.navy);
  doc.setLineWidth(0.8);
  doc.roundedRect(margin, y, pageWidth - 2 * margin, prescriptionBoxHeight, 2, 2, 'S');

  // Content
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  setColor(doc, colors.text);
  const textLines = doc.splitTextToSize(prescriptionText || 'No prescription provided.', pageWidth - 2 * margin - 10);
  doc.text(textLines, margin + 5, y + 6);
  y += prescriptionBoxHeight + 6;

  // Instructions
  doc.setFontSize(7);
  doc.setFont('helvetica', 'italic');
  setColor(doc, colors.muted);
  doc.text('Please follow the prescribed medication as directed. Consult with a pharmacist for any questions.', margin, y);
  y += 8;

  // Signature section - compact layout
  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  setColor(doc, colors.text);
  doc.text(`Issued by: ${nurse.name} ${nurse.surname}`, margin, y);
  doc.text(`HPCSA/SANC No: ${nurse.sancNumber}`, pageWidth / 2, y);
  y += 5;
  doc.text(`Date: ${new Date().toLocaleDateString('en-ZA', { day: '2-digit', month: 'long', year: 'numeric' })}`, margin, y);
  y += 8;

  // Signature and stamp boxes - increased size
  const boxWidth = 70;
  const boxHeight = 30;
  
  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');
  setColor(doc, colors.muted);
  doc.text('Signature:', margin, y);
  doc.text('Official Stamp:', pageWidth - margin - boxWidth, y);
  y += 3;
  
  setDrawColor(doc, colors.border);
  doc.setLineWidth(0.5);
  doc.roundedRect(margin, y, boxWidth, boxHeight, 2, 2, 'S');
  doc.roundedRect(pageWidth - margin - boxWidth, y, boxWidth, boxHeight, 2, 2, 'S');
  
  // Signature line
  setDrawColor(doc, colors.muted);
  doc.line(margin + 5, y + boxHeight - 6, margin + boxWidth - 5, y + boxHeight - 6);

  addProfessionalFooter(doc, 'RX');

  return doc;
};

// Generate Referral Letter PDF
export const generateReferralLetterPDF = async (
  patient: PatientInfo,
  nurse: NurseInfo,
  clinicalNotes: string
): Promise<jsPDF> => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 20;

  // Load logo
  const logoData = await loadLogo();

  // Add watermark first (behind all content)
  addWatermark(doc, logoData);

  let y = addProfessionalHeader(doc, logoData);
  y = addDocumentTitle(doc, 'Medical Referral Letter', y);

  // Date and greeting on same line
  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  setColor(doc, colors.text);
  doc.text('Dear Colleague,', margin, y);
  doc.text(`Date: ${new Date().toLocaleDateString('en-ZA', { day: '2-digit', month: 'long', year: 'numeric' })}`, pageWidth - margin, y, { align: 'right' });
  y += 8;

  // Patient Information - compact
  y = addSectionHeader(doc, 'PATIENT INFORMATION', y, margin);
  
  // Two column layout
  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');
  setColor(doc, colors.muted);
  doc.text('Full Name:', margin, y);
  doc.setFont('helvetica', 'normal');
  setColor(doc, colors.text);
  doc.text(`${patient.name} ${patient.surname}`, margin + 28, y);
  
  doc.setFont('helvetica', 'bold');
  setColor(doc, colors.muted);
  doc.text('DOB:', pageWidth / 2 + 10, y);
  doc.setFont('helvetica', 'normal');
  setColor(doc, colors.text);
  doc.text(formatDOB(patient.dob), pageWidth / 2 + 25, y);
  y += 8;

  // Clinical Notes - calculate available space
  const signatureHeight = 55;
  const footerHeight = 30;
  const closingHeight = 15;
  const availableHeight = pageHeight - y - signatureHeight - footerHeight - closingHeight - 10;
  const notesBoxHeight = Math.min(Math.max(availableHeight, 50), 80);

  // Notes section header
  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');
  setColor(doc, colors.navy);
  doc.text('CLINICAL NOTES & REASON FOR REFERRAL', margin, y);
  y += 4;

  // Notes box
  setDrawColor(doc, colors.navy);
  doc.setLineWidth(0.8);
  doc.roundedRect(margin, y, pageWidth - 2 * margin, notesBoxHeight, 2, 2, 'S');

  // Content
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  setColor(doc, colors.text);
  const textLines = doc.splitTextToSize(clinicalNotes || 'No clinical notes provided.', pageWidth - 2 * margin - 10);
  doc.text(textLines, margin + 5, y + 6);
  y += notesBoxHeight + 6;

  // Closing
  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  setColor(doc, colors.text);
  doc.text('Thank you for your attention to this referral. Kind regards,', margin, y);
  y += 8;

  // Signature section - compact layout
  doc.setFontSize(8);
  setColor(doc, colors.text);
  doc.text(`Issued by: ${nurse.name} ${nurse.surname}`, margin, y);
  doc.text(`HPCSA/SANC No: ${nurse.sancNumber}`, pageWidth / 2, y);
  y += 5;
  doc.text(`Date: ${new Date().toLocaleDateString('en-ZA', { day: '2-digit', month: 'long', year: 'numeric' })}`, margin, y);
  y += 8;

  // Signature and stamp boxes - increased size
  const boxWidth = 70;
  const boxHeight = 30;
  
  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');
  setColor(doc, colors.muted);
  doc.text('Signature:', margin, y);
  doc.text('Official Stamp:', pageWidth - margin - boxWidth, y);
  y += 3;
  
  setDrawColor(doc, colors.border);
  doc.setLineWidth(0.5);
  doc.roundedRect(margin, y, boxWidth, boxHeight, 2, 2, 'S');
  doc.roundedRect(pageWidth - margin - boxWidth, y, boxWidth, boxHeight, 2, 2, 'S');
  
  // Signature line
  setDrawColor(doc, colors.muted);
  doc.line(margin + 5, y + boxHeight - 6, margin + boxWidth - 5, y + boxHeight - 6);

  addProfessionalFooter(doc, 'REF');

  return doc;
};

// Generate Medical Fitness Report PDF (2-page professional design)
export const generateMedicalFitnessPDF = async (
  patient: PatientInfo,
  nurse: NurseInfo,
  formData: {
    idNumber: string;
    address: string;
    contactNumber: string;
    gender: string;
    nationality: string;
    exercise: string;
    gymMember: string;
    alcohol: string;
    alcoholQuantity: string;
    smoking: string;
    cigarettesPerDay: string;
    drugs: string;
    drugsDetail: string;
    familyHistory: string;
    allergies: string;
    medications: string;
    medicalHistory: string;
    surgicalHistory: string;
    accidentHistory: string;
    weight: string;
    height: string;
    bmi: string;
    bloodPressure: string;
    hgt: string;
    temperature: string;
    cholesterol: string;
    ecg: string;
    spo2: string;
    head: string;
    chest: string;
    abdomen: string;
    earNoseThroat: string;
    cardiovascular: string;
    musculoskeletal: string;
    physicallyFit: boolean;
  }
): Promise<jsPDF> => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 15;
  const tableWidth = pageWidth - 2 * margin;
  const halfTableWidth = (tableWidth - 4) / 2;

  const logoData = await loadLogo();

  // Add watermark first (behind all content)
  addWatermark(doc, logoData);

  // Helper for styled table rows with alternating backgrounds
  const addStyledRow = (label: string, value: string, y: number, isAlt: boolean = false): number => {
    if (isAlt) {
      setFillColor(doc, { r: 245, g: 248, b: 252 });
      doc.rect(margin, y, tableWidth, 7, 'F');
    }
    setDrawColor(doc, colors.border);
    doc.setLineWidth(0.2);
    doc.rect(margin, y, halfTableWidth, 7);
    doc.rect(margin + halfTableWidth + 4, y, halfTableWidth, 7);
    
    doc.setFontSize(8);
    doc.setFont('helvetica', 'bold');
    setColor(doc, colors.navy);
    doc.text(label, margin + 3, y + 5);
    doc.setFont('helvetica', 'normal');
    setColor(doc, colors.text);
    doc.text(value || '-', margin + halfTableWidth + 7, y + 5);
    return y + 7;
  };

  // Two-column row helper
  const addTwoColumnRow = (label1: string, val1: string, label2: string, val2: string, y: number, isAlt: boolean = false): number => {
    if (isAlt) {
      setFillColor(doc, { r: 245, g: 248, b: 252 });
      doc.rect(margin, y, tableWidth, 7, 'F');
    }
    const colWidth = tableWidth / 4;
    setDrawColor(doc, colors.border);
    doc.setLineWidth(0.2);
    
    for (let i = 0; i < 4; i++) {
      doc.rect(margin + i * colWidth, y, colWidth, 7);
    }
    
    doc.setFontSize(8);
    doc.setFont('helvetica', 'bold');
    setColor(doc, colors.navy);
    doc.text(label1, margin + 2, y + 5);
    doc.setFont('helvetica', 'normal');
    setColor(doc, colors.text);
    doc.text(val1 || '-', margin + colWidth + 2, y + 5);
    
    doc.setFont('helvetica', 'bold');
    setColor(doc, colors.navy);
    doc.text(label2, margin + 2 * colWidth + 2, y + 5);
    doc.setFont('helvetica', 'normal');
    setColor(doc, colors.text);
    doc.text(val2 || '-', margin + 3 * colWidth + 2, y + 5);
    
    return y + 7;
  };

  // Section header helper
  const addSectionTitle = (title: string, y: number): number => {
    setFillColor(doc, colors.navy);
    doc.roundedRect(margin, y, tableWidth, 8, 1, 1, 'F');
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    setColor(doc, colors.white);
    doc.text(title, margin + 4, y + 5.5);
    return y + 10;
  };

  // ============ PAGE 1 ============
  // Header gradient bar
  setFillColor(doc, colors.navy);
  doc.rect(0, 0, pageWidth, 8, 'F');
  setFillColor(doc, colors.accent);
  doc.rect(0, 8, pageWidth, 2, 'F');

  let y = 14;

  // Logo and title section
  const logoSize = 18;
  if (logoData) {
    try {
      doc.addImage(logoData, 'PNG', margin, y, logoSize, logoSize);
    } catch {}
  }

  doc.setFontSize(13);
  doc.setFont('helvetica', 'bold');
  setColor(doc, colors.navy);
  doc.text('DUNWELL EXECUTIVE WELLNESS & HEALTHCARE', margin + logoSize + 5, y + 6);
  
  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  setColor(doc, colors.muted);
  doc.text('38 De Beer Street, Braamfontein, Johannesburg | Tel: 072 176 0247', margin + logoSize + 5, y + 12);
  
  // Document title badge
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  setColor(doc, colors.navy);
  doc.text('MEDICAL FITNESS REPORT', margin + logoSize + 5, y + 18);
  
  y += logoSize + 8;

  // Divider
  setDrawColor(doc, colors.navy);
  doc.setLineWidth(0.8);
  doc.line(margin, y, pageWidth - margin, y);
  y += 6;

  // Personal Details Section
  y = addSectionTitle('PATIENT PERSONAL DETAILS', y);
  y = addTwoColumnRow('ID Number', formData.idNumber, 'Gender', formData.gender, y, false);
  y = addTwoColumnRow('Full Name', `${patient.name} ${patient.surname}`, 'DOB', formatDOB(patient.dob), y, true);
  y = addTwoColumnRow('Contact', formData.contactNumber, 'Nationality', formData.nationality, y, false);
  y = addStyledRow('Address', formData.address, y, true);
  y = addStyledRow('Email', patient.email || '', y, false);
  y += 4;

  // Lifestyle Section
  y = addSectionTitle('LIFESTYLE & HABITS', y);
  y = addTwoColumnRow('Exercise', formData.exercise, 'Gym Member', formData.gymMember, y, false);
  y = addTwoColumnRow('Alcohol', formData.alcohol, 'Quantity/Day', formData.alcohol === 'Yes' ? formData.alcoholQuantity : 'N/A', y, true);
  y = addTwoColumnRow('Smoker', formData.smoking, 'Cigarettes/Day', formData.smoking === 'Yes' ? formData.cigarettesPerDay : 'N/A', y, false);
  y = addStyledRow('Recreational Drugs', `${formData.drugs}${formData.drugs === 'Yes' ? ' - ' + formData.drugsDetail : ''}`, y, true);
  y += 4;

  // Health History Section
  y = addSectionTitle('HEALTH HISTORY', y);
  y = addStyledRow('Family History', formData.familyHistory, y, false);
  y = addStyledRow('Allergies', formData.allergies, y, true);
  y = addStyledRow('Current Medications', formData.medications, y, false);
  y += 4;

  // Medical History Section
  y = addSectionTitle('MEDICAL / SURGICAL / ACCIDENT HISTORY', y);
  y = addStyledRow('Medical History', formData.medicalHistory, y, false);
  y = addStyledRow('Surgical History', formData.surgicalHistory, y, true);
  y = addStyledRow('Accident History', formData.accidentHistory, y, false);
  y += 6;

  // Declaration Box
  setFillColor(doc, { r: 255, g: 251, b: 235 });
  setDrawColor(doc, { r: 234, g: 179, b: 8 });
  doc.setLineWidth(0.5);
  doc.roundedRect(margin, y, tableWidth, 28, 2, 2, 'FD');
  
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  setColor(doc, colors.navyDark);
  doc.text('PATIENT DECLARATION', margin + 4, y + 6);
  
  doc.setFontSize(8);
  doc.setFont('helvetica', 'italic');
  setColor(doc, colors.text);
  doc.text('I hereby declare that all information provided above is true and accurate to the best of my knowledge.', margin + 4, y + 13);
  
  doc.setFont('helvetica', 'normal');
  doc.text(`Date: ${new Date().toLocaleDateString('en-ZA')}`, margin + 4, y + 20);
  
  doc.text('Signature:', margin + 80, y + 20);
  setDrawColor(doc, colors.muted);
  doc.line(margin + 100, y + 20, margin + 155, y + 20);

  // Page 1 footer
  setFillColor(doc, colors.navy);
  doc.rect(0, pageHeight - 6, pageWidth, 6, 'F');
  doc.setFontSize(7);
  setColor(doc, colors.white);
  doc.text('Page 1 of 2 | CONFIDENTIAL MEDICAL DOCUMENT', pageWidth / 2, pageHeight - 2, { align: 'center' });

  // ============ PAGE 2 ============
  doc.addPage();

  // Add watermark to page 2
  addWatermark(doc, logoData);

  // Header bar
  setFillColor(doc, colors.navy);
  doc.rect(0, 0, pageWidth, 8, 'F');
  setFillColor(doc, colors.accent);
  doc.rect(0, 8, pageWidth, 2, 'F');

  let y2 = 16;

  // Page 2 title
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  setColor(doc, colors.navy);
  doc.text('MEDICAL FITNESS REPORT - CLINICAL ASSESSMENT', pageWidth / 2, y2, { align: 'center' });
  y2 += 8;

  // Measurements Section
  y2 = addSectionTitle('MEASUREMENTS & VITAL SIGNS', y2);
  y2 = addTwoColumnRow('Weight (kg)', formData.weight, 'Height (cm)', formData.height, y2, false);
  y2 = addTwoColumnRow('BMI', formData.bmi, 'Blood Pressure', formData.bloodPressure, y2, true);
  y2 = addTwoColumnRow('HGT (mmol/L)', formData.hgt, 'Temperature (°C)', formData.temperature, y2, false);
  y2 = addTwoColumnRow('Cholesterol', formData.cholesterol, 'SPO2 (%)', formData.spo2, y2, true);
  y2 = addStyledRow('ECG Findings', formData.ecg, y2, false);
  y2 += 4;

  // Examination Section
  y2 = addSectionTitle('PHYSICAL EXAMINATION', y2);
  y2 = addTwoColumnRow('Head', formData.head || 'NAD', 'Chest', formData.chest || 'NAD', y2, false);
  y2 = addTwoColumnRow('Abdomen', formData.abdomen || 'NAD', 'ENT', formData.earNoseThroat || 'NAD', y2, true);
  y2 = addTwoColumnRow('Cardiovascular', formData.cardiovascular || 'NAD', 'Musculoskeletal', formData.musculoskeletal || 'NAD', y2, false);
  y2 += 6;

  // Assessment Section - Prominent styling
  y2 = addSectionTitle('FINAL ASSESSMENT', y2);
  
  // Fit/Unfit boxes with prominent styling
  const assessBoxWidth = (tableWidth - 10) / 2;
  
  // Physically Fit box
  if (formData.physicallyFit) {
    setFillColor(doc, { r: 220, g: 252, b: 231 });
    setDrawColor(doc, colors.success);
  } else {
    setFillColor(doc, { r: 250, g: 250, b: 250 });
    setDrawColor(doc, colors.border);
  }
  doc.setLineWidth(formData.physicallyFit ? 1.5 : 0.5);
  doc.roundedRect(margin, y2, assessBoxWidth, 20, 3, 3, 'FD');
  
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  setColor(doc, formData.physicallyFit ? colors.success : colors.muted);
  doc.text('PHYSICALLY FIT', margin + assessBoxWidth / 2, y2 + 8, { align: 'center' });
  
  if (formData.physicallyFit) {
    doc.setFontSize(14);
    doc.text('✓', margin + assessBoxWidth / 2, y2 + 16, { align: 'center' });
  }
  
  // Not Fit box
  if (!formData.physicallyFit) {
    setFillColor(doc, { r: 254, g: 226, b: 226 });
    setDrawColor(doc, colors.danger);
  } else {
    setFillColor(doc, { r: 250, g: 250, b: 250 });
    setDrawColor(doc, colors.border);
  }
  doc.setLineWidth(!formData.physicallyFit ? 1.5 : 0.5);
  doc.roundedRect(margin + assessBoxWidth + 10, y2, assessBoxWidth, 20, 3, 3, 'FD');
  
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  setColor(doc, !formData.physicallyFit ? colors.danger : colors.muted);
  doc.text('NOT PHYSICALLY FIT', margin + assessBoxWidth + 10 + assessBoxWidth / 2, y2 + 8, { align: 'center' });
  
  if (!formData.physicallyFit) {
    doc.setFontSize(14);
    doc.text('✗', margin + assessBoxWidth + 10 + assessBoxWidth / 2, y2 + 16, { align: 'center' });
  }
  
  y2 += 28;

  // Clinician Section
  y2 = addSectionTitle('EXAMINING CLINICIAN', y2);
  y2 = addTwoColumnRow('Name', `${nurse.name} ${nurse.surname}`, 'HPCSA/SANC No', nurse.sancNumber, y2, false);
  y2 = addStyledRow('Date of Examination', new Date().toLocaleDateString('en-ZA', { day: '2-digit', month: 'long', year: 'numeric' }), y2, true);
  y2 += 8;

  // Signature and Stamp boxes
  const sigBoxWidth = 75;
  const sigBoxHeight = 28;
  
  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');
  setColor(doc, colors.navy);
  doc.text('Clinician Signature:', margin, y2);
  doc.text('Official Stamp:', pageWidth - margin - sigBoxWidth, y2);
  y2 += 4;
  
  setDrawColor(doc, colors.navy);
  doc.setLineWidth(0.8);
  doc.roundedRect(margin, y2, sigBoxWidth, sigBoxHeight, 3, 3, 'S');
  doc.roundedRect(pageWidth - margin - sigBoxWidth, y2, sigBoxWidth, sigBoxHeight, 3, 3, 'S');
  
  // Signature line
  setDrawColor(doc, colors.muted);
  doc.setLineWidth(0.3);
  doc.line(margin + 5, y2 + sigBoxHeight - 8, margin + sigBoxWidth - 5, y2 + sigBoxHeight - 8);

  // Page 2 footer
  setFillColor(doc, colors.navy);
  doc.rect(0, pageHeight - 6, pageWidth, 6, 'F');
  doc.setFontSize(7);
  setColor(doc, colors.white);
  doc.text('Page 2 of 2 | REF: DW-MFR-' + Date.now().toString().slice(-8), pageWidth / 2, pageHeight - 2, { align: 'center' });

  return doc;
};
