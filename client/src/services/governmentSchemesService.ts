import apiClient from './apiService';

export interface SchemeSearchParams {
  q?: string;
  category?: string;
  status?: string;
  page?: number;
}

export interface Scheme {
  id: string;
  name: string;
  shortName: string;
  category: string;
  description: string;
  eligibility: Record<string, string>;
  benefits: string[];
  documents: string[];
  deadline: string;
  status: string;
}

export interface EligibilityCheckRequest {
  landOwnership: boolean;
  farmSize: number;
  annualIncome: number;
}

export const governmentSchemesAPI = {
  // Search schemes
  searchSchemes: async (params: SchemeSearchParams) => {
    const response = await apiClient.get('/schemes/search', { params });
    return response.data;
  },

  // Get scheme details
  getSchemeDetails: async (schemeId: string) => {
    const response = await apiClient.get(`/schemes/${schemeId}`);
    return response.data;
  },

  // Check eligibility
  checkEligibility: async (schemeId: string, farmerProfile: EligibilityCheckRequest) => {
    const response = await apiClient.post(`/schemes/${schemeId}/eligibility`, farmerProfile);
    return response.data;
  },

  // Get application guide
  getApplicationGuide: async (schemeId: string) => {
    const response = await apiClient.get(`/schemes/${schemeId}/application-guide`);
    return response.data;
  },

  // Get scheme categories
  getCategories: async () => {
    const response = await apiClient.get('/schemes/categories');
    return response.data;
  },
};