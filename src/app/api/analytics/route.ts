import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import Summary from '@/models/Summary';

export async function GET() {
  try {
    console.log('GET /api/analytics - Fetching analytics data...');

    await connectToDatabase();

    // First, update any existing documents that don't have the analytics fields
    // (old documents created before analytics were added)
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
    }

    // Get date ranges
    const now = new Date();
    const last30Days = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const last7Days = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    // Basic counts - treat missing success field as true for backward compatibility
    const [
      totalDocuments,
      documentsLast30Days,
      documentsLast7Days,
      documentsToday,
      successfulProcessing,
      failedProcessing
    ] = await Promise.all([
      Summary.countDocuments(),
      Summary.countDocuments({ createdAt: { $gte: last30Days } }),
      Summary.countDocuments({ createdAt: { $gte: last7Days } }),
      Summary.countDocuments({ createdAt: { $gte: today } }),
      Summary.countDocuments({ $or: [{ success: true }, { success: { $exists: false } }] }),
      Summary.countDocuments({ success: false })
    ]);

    // Processing method breakdown
    const processingMethods = await Summary.aggregate([
      {
        $group: {
          _id: '$processingMethod',
          count: { $sum: 1 },
          avgProcessingTime: { $avg: '$processingTimeMs' }
        }
      },
      { $sort: { count: -1 } }
    ]);

    // Document type breakdown
    const documentTypes = await Summary.aggregate([
      {
        $group: {
          _id: '$documentType',
          count: { $sum: 1 },
          avgTextLength: { $avg: '$textLength' },
          avgFileSize: { $avg: '$fileSize' }
        }
      },
      { $sort: { count: -1 } }
    ]);

    // Error type breakdown (for failed processing)
    const errorTypes = await Summary.aggregate([
      {
        $match: { success: false, errorType: { $ne: null } }
      },
      {
        $group: {
          _id: '$errorType',
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } }
    ]);

    // Daily activity for last 30 days - treat missing success as true
    const dailyActivity = await Summary.aggregate([
      {
        $match: { createdAt: { $gte: last30Days } }
      },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' },
            day: { $dayOfMonth: '$createdAt' }
          },
          count: { $sum: 1 },
          successful: {
            $sum: { 
              $cond: [
                { $or: [{ $eq: ['$success', true] }, { $not: ['$success'] }] }, 
                1, 
                0
              ] 
            }
          },
          failed: {
            $sum: { $cond: [{ $eq: ['$success', false] }, 1, 0] }
          }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 } }
    ]);

    // Performance metrics
    const performanceMetrics = await Summary.aggregate([
      {
        $group: {
          _id: null,
          avgProcessingTime: { $avg: '$processingTimeMs' },
          minProcessingTime: { $min: '$processingTimeMs' },
          maxProcessingTime: { $max: '$processingTimeMs' },
          avgTextLength: { $avg: '$textLength' },
          avgFileSize: { $avg: '$fileSize' },
          totalTextProcessed: { $sum: '$textLength' },
          totalFilesProcessed: { $sum: { $cond: [{ $gt: ['$fileSize', 0] }, '$fileSize', 0] } }
        }
      }
    ]);

    // Recent activity (last 10 documents) - show success as true for old documents
    const recentActivityRaw = await Summary.find()
      .select('fileName documentType processingMethod success createdAt processingTimeMs')
      .sort({ createdAt: -1 })
      .limit(10);

    // Fix missing fields for display
    const recentActivity = recentActivityRaw.map(doc => {
      const docObj = doc.toObject();
      return {
        ...docObj,
        success: docObj.success !== false, // treat undefined/null as true
        documentType: docObj.documentType || 'Other',
        processingMethod: docObj.processingMethod || 'Manual text input',
        processingTimeMs: docObj.processingTimeMs || 0
      };
    });

    // Calculate success rate
    const successRate = totalDocuments > 0 ? (successfulProcessing / totalDocuments) * 100 : 0;

    const analytics = {
      overview: {
        totalDocuments,
        documentsLast30Days,
        documentsLast7Days,
        documentsToday,
        successfulProcessing,
        failedProcessing,
        successRate: Math.round(successRate * 100) / 100
      },
      processingMethods: processingMethods.map(method => ({
        method: method._id || 'Manual text input',
        count: method.count,
        avgProcessingTime: Math.round(method.avgProcessingTime || 0)
      })),
      documentTypes: documentTypes.map(type => ({
        type: type._id || 'Other',
        count: type.count,
        avgTextLength: Math.round(type.avgTextLength || 0),
        avgFileSize: Math.round(type.avgFileSize || 0)
      })),
      errorTypes: errorTypes.map(error => ({
        type: error._id || 'Unknown',
        count: error.count
      })),
      dailyActivity: dailyActivity.map(day => ({
        date: `${day._id.year}-${String(day._id.month).padStart(2, '0')}-${String(day._id.day).padStart(2, '0')}`,
        total: day.count,
        successful: day.successful,
        failed: day.failed
      })),
      performance: performanceMetrics[0] ? {
        avgProcessingTime: Math.round(performanceMetrics[0].avgProcessingTime || 0),
        minProcessingTime: Math.round(performanceMetrics[0].minProcessingTime || 0),
        maxProcessingTime: Math.round(performanceMetrics[0].maxProcessingTime || 0),
        avgTextLength: Math.round(performanceMetrics[0].avgTextLength || 0),
        avgFileSize: Math.round(performanceMetrics[0].avgFileSize || 0),
        totalTextProcessed: performanceMetrics[0].totalTextProcessed || 0,
        totalFilesProcessed: Math.round(performanceMetrics[0].totalFilesProcessed || 0)
      } : null,
      recentActivity
    };

    console.log(`✅ Analytics data compiled for ${totalDocuments} documents`);
    return NextResponse.json(analytics);

  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('[GET /api/analytics] Error:', error);

    // Handle database connection issues gracefully
    if (errorMessage.includes('MongoDB URI not configured') || 
        errorMessage.includes('ENOTFOUND') || 
        errorMessage.includes('connection')) {
      return NextResponse.json({
        error: 'Database connection failed',
        analytics: {
          overview: {
            totalDocuments: 0,
            documentsLast30Days: 0,
            documentsLast7Days: 0,
            documentsToday: 0,
            successfulProcessing: 0,
            failedProcessing: 0,
            successRate: 0
          },
          processingMethods: [],
          documentTypes: [],
          errorTypes: [],
          dailyActivity: [],
          performance: null,
          recentActivity: []
        }
      }, { status: 200 });
    }

    return NextResponse.json({
      error: 'Failed to fetch analytics: ' + errorMessage
    }, { status: 500 });
  }
} 