export interface DetectedIssue {
  issue: string;
  severity: 'منخفض' | 'متوسط' | 'حرج' | string;
  symptoms: string;
  probableCause: string;
}

export interface CareStep {
  step: number;
  title: string;
  action: string;
  materials: string;
  timing: string;
}

export interface DiagnosisResult {
  plantIdentification: {
    arabicName: string;
    englishScientificName: string;
    category: string;
    description: string;
  };
  healthAssessment: {
    overallStatus: string;
    healthScore: number;
    detectedIssues: DetectedIssue[];
  };
  irrigationEngine: {
    frequencyPerWeek: string;
    litersPerM2: number;
    totalLitersPerSession: number;
    bestTimeOfDay: string;
    weatherLogicAdvice: string;
    irrigationMethod: string;
  };
  careActionPlan: CareStep[];
  sunAndEnvironment: {
    sunlightNeeds: string;
    temperatureTolerance: string;
    soilAdvice: string;
  };
  standardFormattedSummary: string;
  followUpPrompt: string;
}

export interface SeasonalPhase {
  phase: string;
  months: string;
  description: string;
}

export interface GrowthStep {
  stepNumber: number;
  title: string;
  description: string;
}

export interface FertilizationStage {
  stage: string;
  fertilizer: string;
}

export interface PestManagement {
  pestOrDisease: string;
  prevention: string;
  organicTreatment: string;
}

export interface CropPlanResult {
  cropTitle: string;
  location: string;
  standardFormattedHeader: string;
  feasibility: {
    suitability: string;
    compatibilityScore: number;
    climateEvaluation: string;
    expectedYield: string;
  };
  plantingCalendar: {
    sowingMonths: string[];
    harvestMonths: string[];
    idealGerminationDays: string;
    temperatureRange: {
      germinationOptimal: string;
      growthRange: string;
      frostSensitivity: string;
    };
    seasonalPhases: SeasonalPhase[];
  };
  whereToPlant: {
    sunlightRequirement: string;
    spacePerPlant: string;
    spaceBetweenRows: string;
    soilTypeAndPH: string;
    indoorVsOutdoor: string;
    spaceCapacityEstimate: string;
  };
  howToPlant: {
    soilPreparation: string;
    seedDepthAndSpacing: string;
    irrigationSchedule: {
      seedlingStage: string;
      vegetativeStage: string;
      fruitingStage: string;
      litersPerM2Weekly: number;
    };
    fertilizationGuide: FertilizationStage[];
    growthSteps: GrowthStep[];
  };
  pestAndDiseaseManagement: PestManagement[];
  followUpPrompt: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  content: string;
  timestamp: string;
}

export interface ForumComment {
  id: string;
  author: string;
  location?: string;
  content: string;
  createdAt: string;
}

export interface ForumPost {
  id: string;
  author: string;
  location: string;
  category: string;
  title: string;
  content: string;
  imageBase64?: string;
  likes: number;
  comments: ForumComment[];
  createdAt: string;
}
