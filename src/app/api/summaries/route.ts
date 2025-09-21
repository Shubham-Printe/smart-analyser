import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import Summary from '@/models/Summary';

// Smart NLP-powered document type detection (same as in upload/text APIs)
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
    }
  ];

  // Score based on filename
  patterns.forEach(pattern => {
    pattern.filePatterns.forEach(filePattern => {
      if (name.includes(filePattern)) {
        pattern.score += 3;
      }
    });
  });

  // Score based on content keywords
  patterns.forEach(pattern => {
    pattern.keywords.forEach(keyword => {
      const regex = new RegExp(`\\b${keyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'gi');
      const matches = (text.match(regex) || []).length;
      pattern.score += matches * 1;
    });
  });

  // Find the pattern with the highest score
  const bestMatch = patterns.reduce((prev, current) => 
    (current.score > prev.score) ? current : prev
  );

  // Only return the detected type if confidence is high enough
  if (bestMatch.score >= 3) {
    return bestMatch.type;
  }

  // Fallback to basic detection for edge cases
  if (name.includes('change order') || text.includes('change order')) {
    return 'Change Order';
  }
  if (name.includes('estimate') || text.includes('estimate') || text.includes('quote')) {
    return 'Estimate/Quote';
  }

  return 'Other';
}

export async function GET() {
  try {
    console.log('GET /api/summaries - Attempting to fetch summaries...');
    
    await connectToDatabase();
    
    // First, update any existing documents that don't have the analytics fields
    try {
      const updateResult = await Summary.updateMany(
        { 
          $or: [
            { success: { $exists: false } },
            { processingMethod: { $exists: false } },
            { documentType: { $exists: false } },
            { processingTimeMs: { $exists: false } }
          ]
        },
        { 
          $set: { 
            success: true, 
            errorType: null,
            processingMethod: 'Manual text input',
            documentType: 'Other',
            fileSize: 0,
            textLength: 0,
            processingTimeMs: 0
          } 
        }
      );
      
      if (updateResult.modifiedCount > 0) {
        console.log(`📊 Updated ${updateResult.modifiedCount} old documents with analytics fields`);
      } else {
        console.log(`📊 No documents needed migration (${updateResult.matchedCount} already have fields)`);
      }
    } catch (migrationError) {
      console.error('⚠️ Migration error:', migrationError);
      // Continue anyway - we'll handle missing fields in the frontend
    }
    
    const summaries = await Summary.find().sort({ createdAt: -1 }).limit(100);
    
    // Re-analyze existing documents to detect document types from their content
    const summariesWithSmartTags = summaries.map(summary => {
      const summaryObj = summary.toObject();
      
      // If documentType is missing or 'Other', try to detect it from content
      if (!summaryObj.documentType || summaryObj.documentType === 'Other' || summaryObj.documentType === null) {
        const detectedType = detectDocumentType(summaryObj.fileName || '', summaryObj.summary || '');
        summaryObj.documentType = detectedType;
      }
      
      // If processingMethod is missing, set a default
      if (!summaryObj.processingMethod || summaryObj.processingMethod === null) {
        summaryObj.processingMethod = 'Manual text input';
      }
      
      return summaryObj;
    });
    
    console.log(`✅ Successfully fetched ${summaries.length} summaries with smart tagging`);
    return NextResponse.json(summariesWithSmartTags);
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('[GET /api/summaries] Error:', error);
    
    // Provide specific error messages based on the type of error
    if (errorMessage.includes('MongoDB URI not configured')) {
      return NextResponse.json({ 
        error: 'Database not configured. Please check server configuration.',
        summaries: [] 
      }, { status: 200 }); // Return empty array instead of error for better UX
    }
    
    if (errorMessage.includes('ENOTFOUND') || errorMessage.includes('ECONNREFUSED') || errorMessage.includes('connection') || errorMessage.includes('MongooseServerSelectionError')) {
      return NextResponse.json({ 
        error: 'Database connection failed. Please try again later.',
        summaries: [] 
      }, { status: 200 }); // Return empty array instead of error
    }
    
    return NextResponse.json({ 
      error: 'Failed to fetch summaries: ' + errorMessage,
      summaries: [] 
    }, { status: 500 });
  }
}
