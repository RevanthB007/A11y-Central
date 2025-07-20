// models/AnalysisResult.js
import mongoose from 'mongoose';

const ViolationSchema = new mongoose.Schema({
  id: String,
  impact: {
    type: String,
    enum: ['minor', 'moderate', 'serious', 'critical']
  },
  description: String,
  help: String,
  helpUrl: String,
  tags: [String],
  nodes: [{
    target: [String],
    html: String,
    failureSummary: String,
    impact: String,
    any: [mongoose.Schema.Types.Mixed],
    all: [mongoose.Schema.Types.Mixed],
    none: [mongoose.Schema.Types.Mixed]
  }]
}, { _id: false });

const PassSchema = new mongoose.Schema({
  id: String,
  impact: String,
  description: String,
  help: String,
  helpUrl: String,
  tags: [String],
  nodes: Number
}, { _id: false });

const IncompleteSchema = new mongoose.Schema({
  id: String,
  impact: String,
  description: String,
  help: String,
  helpUrl: String,
  tags: [String],
  nodes: Number
}, { _id: false });

const InapplicableSchema = new mongoose.Schema({
  id: String,
  description: String,
  help: String,
  helpUrl: String,
  tags: [String]
}, { _id: false });

const OpportunitySchema = new mongoose.Schema({
  id: String,
  title: String,
  description: String,
  score: Number,
  displayValue: String
}, { _id: false });

const AccessibilityIssueSchema = new mongoose.Schema({
  id: String,
  title: String,
  description: String,
  score: Number,
  impact: Number
}, { _id: false });

const AnalysisResultSchema = new mongoose.Schema({
  url: {
    type: String,
    required: true,
    trim: true
  },
  timeStamp: {
    type: Date,
    default: Date.now
  },
  
  // Axe Results
  axeResults: {
    testEngine: {
      name: String,
      version: String
    },
    testRunner: mongoose.Schema.Types.Mixed,
    testEnvironment: mongoose.Schema.Types.Mixed,
    summary: {
      violations: Number,
      passes: Number,
      incomplete: Number,
      inapplicable: Number
    },
    violations: [ViolationSchema],
    passes: [PassSchema],
    incomplete: [IncompleteSchema],
    inapplicable: [InapplicableSchema],
    timestamp: String
  },
  
  // Lighthouse Results
  lighthouseResults: {
    scores: {
      performance: Number,
      accessibility: Number,
      seo: Number,
      bestPractices: Number,
      pwa: Number
    },
    opportunities: [OpportunitySchema],
    accessibilityIssues: [AccessibilityIssueSchema],
    timestamp: String
  },
  
  // Error tracking
  errors: {
    axe: String,
    lighthouse: String
  }
}, {
  timestamps: true
});

export const AnalysisResult = mongoose.models.AnalysisResult || 
  mongoose.model('AnalysisResult', AnalysisResultSchema);
