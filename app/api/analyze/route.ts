import { NextRequest, NextResponse } from 'next/server';
import { AnalyzeRequest } from '@/types';
import { analyzeWebsite } from '@/lib/analyze';
export async function POST(request: NextRequest) {
  const { url } = await request.json();
  
  try {
    const results = await analyzeWebsite(url);
    return NextResponse.json(results);
  } catch (error) {
    return NextResponse.json({ error: 'Analysis failed' }, { status: 500 });
  }
}
