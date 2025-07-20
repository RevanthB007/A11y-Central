import connectToDatabase from '@/lib/mongodb';
import { NextRequest, NextResponse } from 'next/server';
import { analyzeCombined } from '@/lib/analyzeCombined';
import { AnalysisResult } from '@/models/AnalysisResult';
export async function POST(request: NextRequest) {
  try {
    await connectToDatabase();
    console.log('API route hit - analyze');

    const { url } = await request.json();
    console.log('Received URL:', url);

    if (!url) {
      return NextResponse.json({ error: 'URL is required' }, { status: 400 });
    }

    // Validate URL format
    try {
      new URL(url);
    } catch {
      return NextResponse.json({ error: 'Invalid URL format' }, { status: 400 });
    }

    console.log('Starting analysis for:', url);
    const results = await analyzeCombined(url);
    console.log('Analysis completed successfully');

    return NextResponse.json(results);
  } catch (error: any) {
    console.error('API Error:', error);
    console.error('Error stack:', error.stack);
    return NextResponse.json({
      error: error.message || 'Analysis failed'
    }, { status: 500 });
  }
}

// export async function GET(request: NextRequest) {

//   try {
//     await connectToDatabase();
//     const results = await AnalysisResult.find();
//     return NextResponse.json(results, { status: 200 });
//   } catch (error: any) {
//     console.error('API Error:', error);
//     console.error('Error stack:', error.stack);
//     return NextResponse.json({
//       error: error.message || 'Analysis failed'
//     }, { status: 500 });
//   }
// }
