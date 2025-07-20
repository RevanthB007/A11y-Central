// lib/analyzeCombined.js
import { analyzeWebsite } from './analyze';
import { analyzeLighthouse } from './lighthouse-analyze';
import connectToDatabase from './mongodb';
import { AnalysisResult } from '../models/AnalysisResult';

export async function analyzeCombined(url, saveToDb = true) {
    try {
        console.log('Starting combined analysis for:', url);
        
        // Run analyses SEQUENTIALLY instead of concurrently
        let axeResults = null;
        let lighthouseResults = null;
        const errors = { axe: null, lighthouse: null };

        // Run axe-core first
        try {
            axeResults = await analyzeWebsite(url);
            console.log('Axe analysis completed successfully');
        } catch (axeError) {
            console.error('Axe analysis failed:', axeError);
            errors.axe = axeError.message;
        }

        // Then run Lighthouse
        try {
            lighthouseResults = await analyzeLighthouse(url);
            console.log('Lighthouse analysis completed successfully');
        } catch (lighthouseError) {
            console.error('Lighthouse analysis failed:', lighthouseError);
            errors.lighthouse = lighthouseError.message;
        }

        const combinedResults = {
            url: url,
            timeStamp: new Date().toISOString(),
            axeResults,
            lighthouseResults,
            errors
        };

        // Save to MongoDB logic remains the same
        if (saveToDb && (axeResults || lighthouseResults)) {
            try {
                await connectToDatabase();
                const analysisDocument = new AnalysisResult(combinedResults);
                const savedAnalysis = await analysisDocument.save();
                
                console.log('Analysis saved to MongoDB with ID:', savedAnalysis._id);
                
                return {
                    ...combinedResults,
                    _id: savedAnalysis._id,
                    saved: true
                };
                
            } catch (dbError) {
                console.error('Failed to save to MongoDB:', dbError);
                return {
                    ...combinedResults,
                    saved: false,
                    saveError: dbError.message
                };
            }
        }

        return combinedResults;

    } catch (error) {
        console.error('Combined analysis error:', error);
        throw new Error(`Combined analysis failed: ${error.message}`);
    }
}
