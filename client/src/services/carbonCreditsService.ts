import apiClient from './apiService';

export interface CarbonProjectRequest {
  projectType: 'tree_planting' | 'rice_cultivation' | 'soil_management';
  details: {
    treeCount?: number;
    species?: string;
    area?: number;
    practice?: string;
    practices?: string[];
  };
  location: string;
  startDate: string;
}

export interface CarbonCreditsResponse {
  success: boolean;
  data: {
    projectType: string;
    carbonCredits: {
      annual: number;
      lifetime: number;
      unit: string;
    };
    financialBenefits: {
      annualEarnings: number;
      lifetimeEarnings: number;
      currency: string;
      marketPrice: number;
    };
    breakdown: any;
    verification: {
      status: string;
      requirements: string[];
      nextSteps: string[];
    };
  };
}

export const carbonCreditsAPI = {
  // Calculate carbon credits
  calculateCredits: async (projectData: CarbonProjectRequest): Promise<CarbonCreditsResponse> => {
    const response = await apiClient.post('/carbon-credits/calculate', projectData);
    return response.data;
  },

  // Get market information
  getMarketInfo: async () => {
    const response = await apiClient.get('/carbon-credits/market-info');
    return response.data;
  },

  // Get project templates
  getProjectTemplates: async () => {
    const response = await apiClient.get('/carbon-credits/project-templates');
    return response.data;
  },

  // Submit project for verification
  verifyProject: async (projectId: string, verificationData: any) => {
    const response = await apiClient.post('/carbon-credits/verify-project', {
      projectId,
      verificationData,
    });
    return response.data;
  },
};
