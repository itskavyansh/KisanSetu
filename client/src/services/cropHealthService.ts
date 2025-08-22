import apiClient from './apiService';

export interface CropAnalysisRequest {
  image: File;
  cropType?: string;
}

export interface CropAnalysisResponse {
  success: boolean;
  data: {
    isPlant: boolean;
    message: string;
    disease: string;
    confidence: number;
    treatments: string[];
    prevention: string[];
    marketImpact: string;
  };
}

export const cropHealthAPI = {
  // Analyze crop image
  analyzeCrop: async (data: CropAnalysisRequest): Promise<CropAnalysisResponse> => {
    const formData = new FormData();
    formData.append('image', data.image);
    if (data.cropType) {
      formData.append('cropType', data.cropType);
    }

    const response = await apiClient.post('/crop-health/analyze', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  // Get crop health history
  getHistory: async () => {
    const response = await apiClient.get('/crop-health/history');
    return response.data;
  },
};
