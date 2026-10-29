const pdfParse = require('pdf-parse');
const mammoth = require('mammoth');

/**
 * Extract text from a PDF buffer
 */
const extractFromPDF = async (buffer) => {
  try {
    const data = await pdfParse(buffer);
    return data.text?.trim() || '';
  } catch (err) {
    throw new Error(`Failed to parse PDF: ${err.message}`);
  }
};

/**
 * Extract text from a DOCX buffer
 */
const extractFromDOCX = async (buffer) => {
  try {
    const result = await mammoth.extractRawText({ buffer });
    return result.value?.trim() || '';
  } catch (err) {
    throw new Error(`Failed to parse DOCX: ${err.message}`);
  }
};

/**
 * Extract text based on file MIME type
 */
const extractText = async (buffer, mimeType) => {
  if (mimeType === 'application/pdf') {
    return extractFromPDF(buffer);
  }
  if (mimeType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
    return extractFromDOCX(buffer);
  }
  throw new Error('Unsupported file type for text extraction.');
};

/**
 * Basic validation of extracted text
 */
const validateExtractedText = (text) => {
  if (!text || text.trim().length < 50) {
    throw new Error('Extracted text is too short or empty. Please upload a valid resume file.');
  }
  if (text.trim().length > 20000) {
    // Truncate but warn
    console.warn('Resume text exceeds 20000 chars; truncating for analysis.');
    return text.slice(0, 20000);
  }
  return text;
};

module.exports = { extractText, validateExtractedText };
