import mongoose from "mongoose";
import { Schema } from "mongoose";
const SuggestionSchema = new mongoose.Schema({
    url: {
        type: String,
        required: true,
        trim: true,
    },
    quickFix:{
        type:Object,
        required:true

    },
    alternatives:{
        type:Schema.Types.Mixed
    },
    testingSteps:{
        type:Schema.Types.Mixed
    }
    
},{timestamps:true});

export const Suggestion = mongoose.models.Suggestion || 
  mongoose.model('Suggestion', SuggestionSchema);