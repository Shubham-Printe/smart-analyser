/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from 'next/server';
import { writeFile, unlink } from 'fs/promises';
import { existsSync } from 'fs';
import path from 'path';
import { tmpdir } from 'os';
import { v4 as uuidv4 } from 'uuid';
import { connectToDatabase } from '@/lib/mongodb';
import Summary from '@/models/Summary';

// PDF.co API configuration
const PDFCO_API_KEY = process.env.PDFCO_API_KEY;
const PDFCO_BASE_URL = 'https://api.pdf.co/v1';

// Helper function to extract text using PDF.co API
async function extractTextWithPDFCo(fileBuffer: Buffer, fileName: string): Promise<{ text: string; method: string }> {
  if (!PDFCO_API_KEY) {
    throw new Error('PDF.co API key not configured');
  }

  try {
    console.log('🔧 Using PDF.co API for text extraction...');

    // Step 1: Upload file to PDF.co using base64 encoding
    const base64File = fileBuffer.toString('base64');
    
    const uploadResponse = await fetch(`${PDFCO_BASE_URL}/file/upload/base64`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': PDFCO_API_KEY
      },
      body: JSON.stringify({
        file: base64File,
        name: fileName
      })
    });

    const uploadResult = await uploadResponse.json();
    
    if (!uploadResult.url) {
      throw new Error('Failed to upload file to PDF.co');
    }

    console.log('📤 File uploaded to PDF.co successfully');

    // Step 2: Extract text from uploaded PDF
    const extractResponse = await fetch(`${PDFCO_BASE_URL}/pdf/convert/to/text`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': PDFCO_API_KEY
      },
      body: JSON.stringify({
        url: uploadResult.url,
        inline: true,
        async: false
      })
    });

    const extractResult = await extractResponse.json();

    if (!extractResult.body) {
      throw new Error('PDF.co text extraction failed');
    }

    console.log(`✅ PDF.co extracted ${extractResult.body.length} characters`);
    
    return {
      text: extractResult.body,
      method: 'PDF.co API text extraction'
    };

  } catch (error: any) {
    console.error('❌ PDF.co extraction failed:', error.message);
    throw error;
  }
}

// Fallback basic text extraction
function basicTextExtraction(fileBuffer: Buffer): { text: string; method: string } {
  try {
    console.log('🔍 Attempting basic text extraction as fallback...');
    
    const pdfString = fileBuffer.toString('latin1');
    
    // Extract text between common PDF text markers
    const textMatches = pdfString.match(/\(([^)]+)\)/g);
    if (textMatches && textMatches.length > 0) {
      const extractedText = textMatches
        .map(match => match.slice(1, -1)) // Remove parentheses
        .filter(text => text.length > 2 && /[a-zA-Z]/.test(text)) // Filter meaningful text
        .join(' ')
        .replace(/\\[rn]/g, ' ') // Replace escape sequences
        .replace(/\s+/g, ' ') // Normalize spaces
        .trim();
      
      console.log(`✅ Basic extraction: ${extractedText.length} characters`);
      
      return {
        text: extractedText,
        method: 'Basic PDF text extraction (fallback)'
      };
    }
    
    throw new Error('No readable text found with basic extraction');
    
  } catch (error: any) {
    console.error('❌ Basic extraction failed:', error.message);
    throw error;
  }
}

    // Smart NLP-powered document type detection
function detectDocumentType(fileName: string, content: string): string {
  const name = fileName.toLowerCase();
  const text = content.toLowerCase();
  
  // Enhanced pattern matching with confidence scoring
  const patterns = [
    {
      type: 'Invoice/Bill',
      score: 0,
      keywords: ['invoice', 'bill', 'billing', 'payment', 'due', 'amount', 'total', 'subtotal', 'tax', 'receipt', 'charge', 'cost', 'price', 'qty', 'quantity', 'item', 'description', 'vendor', 'customer'],
      filePatterns: ['invoice', 'bill', 'receipt', 'payment']
    },
    {
      type: 'Contract/Agreement',
      score: 0,
      keywords: ['contract', 'agreement', 'terms', 'conditions', 'party', 'parties', 'whereas', 'hereby', 'signature', 'signed', 'effective date', 'termination', 'clause', 'provision', 'legal', 'binding'],
      filePatterns: ['contract', 'agreement', 'terms', 'legal']
    },
    {
      type: 'Resume/CV',
      score: 0,
      keywords: ['resume', 'curriculum vitae', 'experience', 'education', 'skills', 'employment', 'work history', 'qualifications', 'achievements', 'references', 'objective', 'summary', 'career'],
      filePatterns: ['resume', 'cv', 'curriculum']
    },
    {
      type: 'Financial Report',
      score: 0,
      keywords: ['financial', 'budget', 'profit', 'loss', 'revenue', 'expenses', 'balance sheet', 'income statement', 'cash flow', 'assets', 'liabilities', 'equity', 'quarterly', 'annual'],
      filePatterns: ['financial', 'budget', 'profit', 'balance', 'income']
    },
    {
      type: 'Technical Report',
      score: 0,
      keywords: ['report', 'analysis', 'findings', 'methodology', 'results', 'conclusion', 'recommendation', 'data', 'research', 'study', 'investigation', 'technical', 'specification'],
      filePatterns: ['report', 'analysis', 'study', 'research']
    },
    {
      type: 'Legal Document',
      score: 0,
      keywords: ['legal', 'court', 'lawsuit', 'plaintiff', 'defendant', 'attorney', 'law', 'statute', 'regulation', 'compliance', 'jurisdiction', 'litigation', 'affidavit', 'deposition'],
      filePatterns: ['legal', 'court', 'law', 'attorney']
    },
    {
      type: 'Medical Document',
      score: 0,
      keywords: ['medical', 'patient', 'diagnosis', 'treatment', 'prescription', 'doctor', 'physician', 'hospital', 'clinic', 'health', 'symptoms', 'medication', 'therapy', 'examination'],
      filePatterns: ['medical', 'patient', 'doctor', 'health', 'prescription']
    },
    {
      type: 'Academic Paper',
      score: 0,
      keywords: ['abstract', 'introduction', 'methodology', 'literature review', 'references', 'bibliography', 'research', 'study', 'university', 'academic', 'journal', 'publication', 'thesis'],
      filePatterns: ['thesis', 'paper', 'academic', 'research', 'journal']
    },
    {
      type: 'Manual/Guide',
      score: 0,
      keywords: ['manual', 'guide', 'instructions', 'how to', 'step by step', 'procedure', 'process', 'tutorial', 'handbook', 'documentation', 'user guide', 'installation'],
      filePatterns: ['manual', 'guide', 'instructions', 'handbook', 'tutorial']
    },
    {
      type: 'Presentation',
      score: 0,
      keywords: ['presentation', 'slide', 'agenda', 'overview', 'summary', 'conclusion', 'next steps', 'questions', 'discussion', 'meeting', 'conference'],
      filePatterns: ['presentation', 'slide', 'ppt', 'slides']
    },
    {
      type: 'Marketing Material',
      score: 0,
      keywords: ['marketing', 'brochure', 'flyer', 'advertisement', 'promotion', 'campaign', 'brand', 'product', 'service', 'offer', 'discount', 'sale'],
      filePatterns: ['brochure', 'flyer', 'marketing', 'promo']
    },
    {
      type: 'Policy Document',
      score: 0,
      keywords: ['policy', 'procedure', 'guidelines', 'standards', 'compliance', 'governance', 'framework', 'protocol', 'rules', 'regulations', 'requirements'],
      filePatterns: ['policy', 'procedure', 'guidelines', 'standards']
    }
  ];

  // Score based on filename
  patterns.forEach(pattern => {
    pattern.filePatterns.forEach(filePattern => {
      if (name.includes(filePattern)) {
        pattern.score += 3; // Higher weight for filename matches
      }
    });
  });

  // Score based on content keywords
  patterns.forEach(pattern => {
    pattern.keywords.forEach(keyword => {
      const regex = new RegExp(`\\b${keyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'gi');
      const matches = (text.match(regex) || []).length;
      pattern.score += matches * 1; // Each keyword match adds 1 point
    });
  });

  // Find the pattern with the highest score
  const bestMatch = patterns.reduce((prev, current) => 
    (current.score > prev.score) ? current : prev
  );

  // Only return the detected type if confidence is high enough
  if (bestMatch.score >= 3) {
    console.log(`🏷️ Smart tagging detected: ${bestMatch.type} (confidence: ${bestMatch.score})`);
    return bestMatch.type;
  }

  // Fallback to basic detection for edge cases
  if (name.includes('change order') || text.includes('change order')) {
    return 'Change Order';
  }
  if (name.includes('estimate') || text.includes('estimate') || text.includes('quote')) {
    return 'Estimate/Quote';
  }
  if (name.includes('schedule') || text.includes('schedule') || text.includes('timeline')) {
    return 'Schedule/Timeline';
  }

  console.log(`🏷️ Smart tagging: No confident match found, using 'Other' (best score: ${bestMatch.score})`);
  return 'Other';
}

// Helper function to validate extracted text quality
function validateExtractedText(text: string): { isValid: boolean; reason?: string } {
  if (!text || text.trim().length < 20) {
    return { isValid: false, reason: 'Insufficient text extracted' };
  }

  // Clean the text first
  const cleanText = text
    .replace(/\\[a-zA-Z0-9]+/g, ' ')  // Remove escape sequences
    .replace(/\([^)]*\)/g, ' ')       // Remove parenthetical content
    .replace(/[<>{}[\]]/g, ' ')       // Remove brackets and braces
    .replace(/\d{10,}/g, ' ')         // Remove long numbers
    .replace(/[^\w\s.,!?;:-]/g, ' ')  // Remove special characters
    .replace(/\s+/g, ' ')             // Normalize whitespace
    .trim();

  // Check for meaningful content
  const words = cleanText.split(/\s+/).filter(word => 
    word.length > 2 && 
    /[a-zA-Z]/.test(word) && 
    !word.includes('endobj') && 
    !word.includes('xref') && 
    !word.includes('ReportLab')
  );

  if (words.length < 10) {
    return { isValid: false, reason: 'Extracted text contains mostly metadata or corrupted content' };
  }

  // Check for repetitive or meaningless content
  const uniqueWords = new Set(words.map(w => w.toLowerCase()));
  if (uniqueWords.size < words.length * 0.3) {
    return { isValid: false, reason: 'Extracted text appears to be repetitive or corrupted' };
  }

  return { isValid: true };
}

export async function POST(req: NextRequest) {
  let tempPdfPath = '';
  const startTime = Date.now();
  let detectedDocumentType = 'Other';
  
  try {
    console.log('🚀 Starting PDF analysis with PDF.co API...');

    const formData = await req.formData();
    const file = formData.get('pdf') as File;

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    console.log(`📄 Processing: ${file.name} (${Math.round(file.size / 1024)}KB)`);

    // Save PDF temporarily for potential future processing
    const fileBuffer = Buffer.from(await file.arrayBuffer());
    const uploadId = uuidv4();
    tempPdfPath = path.join(tmpdir(), `pdf-${uploadId}.pdf`);
    await writeFile(tempPdfPath, fileBuffer);
    console.log('💾 PDF saved temporarily');

    // Try PDF.co first, then fallback to basic extraction
    let extractedText = '';
    let processingMethod = '';

    try {
      // Primary: PDF.co API extraction
      const pdfcoResult = await extractTextWithPDFCo(fileBuffer, file.name);
      extractedText = pdfcoResult.text;
      processingMethod = pdfcoResult.method;
    } catch {
      console.log('⚠️ PDF.co failed, trying basic extraction...');
      
      try {
        // Fallback: Basic extraction
        const basicResult = basicTextExtraction(fileBuffer);
        extractedText = basicResult.text;
        processingMethod = basicResult.method;
      } catch {
        console.log('❌ All extraction methods failed');
        
        return NextResponse.json({
          error: 'PDF_EXTRACTION_FAILED',
          message: 'Unable to extract readable text from this PDF',
          details: 'This PDF might be scanned, have complex formatting, or contain mostly images. Please use the manual text input below to copy and paste the content.',
          fileName: file.name,
          fileSize: `${Math.round(file.size / 1024)}KB`
        }, { status: 422 });
      }
    }

    // Validate the quality of extracted text
    const validation = validateExtractedText(extractedText);
    if (!validation.isValid) {
      console.log(`❌ Text validation failed: ${validation.reason}`);
      
      return NextResponse.json({
        error: 'PDF_TEXT_QUALITY_POOR',
        message: 'Extracted text quality is insufficient for analysis',
        details: `${validation.reason}. Please use the manual text input below to copy and paste the content for better results.`,
        fileName: file.name,
        fileSize: `${Math.round(file.size / 1024)}KB`,
        extractedLength: extractedText.length
      }, { status: 422 });
    }

    // Prepare text for analysis (limit to 6000 characters)
    const safeText = extractedText.slice(0, 6000);
    console.log(`📝 Prepared ${safeText.length} characters for analysis`);

    // Generate a real human-readable summary
    let summary = "";
    try {
      console.log('📝 Creating readable summary...');
      
      // Clean the text first - remove PDF artifacts and metadata
      const cleanText = safeText
        .replace(/\\[a-zA-Z0-9]+/g, ' ')  // Remove escape sequences
        .replace(/\([^)]*\)/g, ' ')       // Remove parenthetical content
        .replace(/[<>{}[\]]/g, ' ')       // Remove brackets and braces
        .replace(/\d{10,}/g, ' ')         // Remove long numbers
        .replace(/[^\w\s.,!?;:-]/g, ' ')  // Remove special characters
        .replace(/\s+/g, ' ')             // Normalize whitespace
        .trim();
      
      // Import compromise for natural language processing
      const nlp = (await import('compromise')).default;
      const doc = nlp(cleanText);
      
      // Get clean sentences
      const sentences = doc.sentences().out('array')
        .filter((sentence: string) => {
          const s = sentence.trim();
          return s.length > 20 && 
                 s.split(' ').length > 3 && 
                 /[a-zA-Z]/.test(s) &&
                 !s.includes('endobj') &&
                 !s.includes('xref') &&
                 !s.includes('ReportLab') &&
                 !s.includes('PDF');
        });
      
      if (sentences.length < 2) {
        console.log('❌ Insufficient meaningful sentences found');
        
        return NextResponse.json({
          error: 'PDF_CONTENT_INSUFFICIENT',
          message: 'Unable to generate meaningful summary from extracted text',
          details: 'The extracted text does not contain enough meaningful content for analysis. Please use the manual text input below.',
          fileName: file.name,
          fileSize: `${Math.round(file.size / 1024)}KB`,
          extractedLength: extractedText.length
        }, { status: 422 });
      }

      // Create a proper summary from clean sentences
      const people = doc.people().out('array').filter((p: string) => p.length > 2);
      const places = doc.places().out('array').filter((p: string) => p.length > 2);
      const organizations = doc.organizations().out('array').filter((o: string) => o.length > 2);
      
      // Build a natural summary
      const summaryParts = [];
      
      // Start with the main content
      if (sentences.length >= 3) {
        summaryParts.push(`This document contains ${sentences.length} main points. ${sentences.slice(0, 3).join(' ')}`);
      } else {
        summaryParts.push(`This document states: ${sentences.join(' ')}`);
      }
      
      // Add key entities if found
      if (people.length > 0) {
        summaryParts.push(`Key people mentioned include ${people.slice(0, 3).join(', ')}.`);
      }
      
      if (places.length > 0) {
        summaryParts.push(`Locations referenced: ${places.slice(0, 3).join(', ')}.`);
      }
      
      if (organizations.length > 0) {
        summaryParts.push(`Organizations involved: ${organizations.slice(0, 3).join(', ')}.`);
      }
      
      // Add more content if available
      if (sentences.length > 3) {
        summaryParts.push(`Additional details include: ${sentences.slice(3, 6).join(' ')}`);
      }
      
      summary = summaryParts.join(' ');
      
      // Ensure summary is reasonable length
      if (summary.length > 2000) {
        summary = summary.substring(0, 2000) + '...';
      }
      
      console.log(`✅ Readable summary created (${summary.length} characters)`);
      
    } catch (processingError: any) {
      console.error('❌ Summary generation failed:', processingError.message);
      
      return NextResponse.json({
        error: 'SUMMARY_GENERATION_FAILED',
        message: 'Failed to generate summary from extracted text',
        details: 'The text was extracted but could not be processed into a meaningful summary. Please use the manual text input below.',
        fileName: file.name,
        fileSize: `${Math.round(file.size / 1024)}KB`
      }, { status: 422 });
    }

    // Save to MongoDB Atlas
    try {
      console.log('💾 Saving to database...');
      await connectToDatabase();
      
              const processingTime = Date.now() - startTime;
        detectedDocumentType = detectDocumentType(file.name, extractedText);
      
      await Summary.create({
        fileName: file.name,
        summary,
        processingMethod,
        documentType: detectedDocumentType,
        fileSize: file.size,
        textLength: extractedText.length,
        processingTimeMs: processingTime,
        success: true,
        errorType: null,
        createdAt: new Date(),
      });
      console.log('✅ Saved to database');
    } catch (dbError: any) {
      console.error('⚠️ Database save failed:', dbError.message);
      console.log('📤 Continuing without database save');
    }

    console.log('🎉 Processing completed successfully!');
    return NextResponse.json({ 
      summary,
      processingMethod,
      fileName: file.name,
      fileSize: `${Math.round(file.size / 1024)}KB`,
      documentType: detectedDocumentType,
      smartTagging: true
    });

  } catch (error: any) {
    console.error('💥 Processing error:', error.message);
    
    return NextResponse.json({ 
      error: 'PROCESSING_FAILED',
      message: `Processing failed: ${error.message}`,
      details: "Please try uploading a different PDF or use the manual text input below."
    }, { status: 500 });
    
  } finally {
    // Clean up temporary files
    try {
      if (tempPdfPath && existsSync(tempPdfPath)) {
        await unlink(tempPdfPath);
        console.log('🗑️ Cleaned up temporary files');
      }
    } catch (cleanupError) {
      console.warn('⚠️ Cleanup warning:', cleanupError);
    }
  }
}
