import { NextRequest, NextResponse } from 'next/server';
import { analyzeCombined } from '@/lib/analyzeCombined';

export async function POST(request: NextRequest) {
  try {
    const { url } = await request.json();
    
    if (!url) {
      return NextResponse.json({ error: 'URL is required' }, { status: 400 });
    }
    
    const results = await analyzeCombined(url);
    return NextResponse.json(results);
  } catch (error: any) {
    console.error('API Error:', error);
    return NextResponse.json({ 
      error: error.message || 'Analysis failed' 
    }, { status: 500 });
  }
}
