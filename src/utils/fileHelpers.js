import * as mammoth from 'mammoth';
import { ACCEPTED_EXTENSIONS } from '../constants/prompt';

export const isAcceptedFile = (file) => {
  const name = file.name.toLowerCase();
  return ACCEPTED_EXTENSIONS.some(ext => name.endsWith(ext));
};

export const getFileIcon = (name) => {
  if (name.endsWith('.pdf')) return { label: 'PDF', color: '#D0021B' };
  if (name.endsWith('.docx') || name.endsWith('.doc')) return { label: 'DOC', color: '#4A90E2' };
  return { label: 'TXT', color: '#9B9B9B' };
};

const extractPdfText = async (file) => {
  const pdfjsLib = await import('pdfjs-dist');
  pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
    'pdfjs-dist/build/pdf.worker.mjs',
    import.meta.url
  ).toString();
  const arrayBuffer = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
  const pages = [];
  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const content = await page.getTextContent();
    pages.push(content.items.map(item => item.str).join(' '));
  }
  return pages.join('\n\n');
};

export const readFile = (file) => {
  return new Promise(async (resolve, reject) => {
    try {
      if (file.type === 'application/pdf') {
        const text = await extractPdfText(file);
        resolve({ type: 'text', text: `--- Transcript: ${file.name} ---\n${text}` });
      } else if (file.name.endsWith('.docx') || file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
        const arrayBuffer = await file.arrayBuffer();
        const result = await mammoth.extractRawText({ arrayBuffer });
        resolve({ type: 'text', text: `--- Transcript: ${file.name} ---\n${result.value}` });
      } else {
        const reader = new FileReader();
        reader.onload = () => resolve({
          type: 'text', text: `--- Transcript: ${file.name} ---\n${reader.result}`
        });
        reader.onerror = () => reject(new Error(`Failed to read ${file.name}`));
        reader.readAsText(file);
      }
    } catch (err) {
      reject(err);
    }
  });
};
