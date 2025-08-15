class GovernmentSchemesService {
    constructor() {
      // Mock government schemes data - we'll replace with real data later
      this.schemes = [
        {
          id: 'pmksy',
          name: 'PM Krishi Sinchai Yojana',
          shortName: 'PMKSY',
          category: 'Irrigation',
          description: '50% subsidy on drip irrigation equipment for water conservation and efficient water use.',
          eligibility: {
            landOwnership: 'Yes',
            farmSize: 'Any size',
            incomeLimit: 'No limit',
            location: 'All India',
            cropType: 'All crops'
          },
          benefits: [
            '50% subsidy on drip irrigation equipment',
            'Technical support and training',
            'Water conservation benefits',
            'Increased crop yield'
          ],
          documents: [
            'Land ownership documents',
            'Aadhaar card',
            'Bank passbook',
            'Passport size photos',
            'Soil test report'
          ],
          applicationProcess: [
            'Visit nearest agriculture office',
            'Submit application with documents',
            'Field verification by officials',
            'Approval and subsidy disbursement'
          ],
          contactInfo: {
            helpline: '1800-180-1551',
            website: 'https://pmksy.gov.in',
            email: 'pmksy@gov.in'
          },
          deadline: '2024-12-31',
          status: 'Active'
        },
        {
          id: 'soil-health',
          name: 'Soil Health Card Scheme',
          shortName: 'SHC',
          category: 'Soil Management',
          description: 'Free soil testing and personalized fertilizer recommendations for optimal crop production.',
          eligibility: {
            landOwnership: 'Yes',
            farmSize: 'Any size',
            incomeLimit: 'No limit',
            location: 'All India',
            cropType: 'All crops'
          },
          benefits: [
            'Free soil testing',
            'Personalized fertilizer recommendations',
            'Crop-specific advice',
            'Improved soil fertility'
          ],
          documents: [
            'Land ownership documents',
            'Aadhaar card',
            'Previous soil test reports (if any)'
          ],
          applicationProcess: [
            'Visit nearest Krishi Vigyan Kendra',
            'Submit application form',
            'Soil sample collection',
            'Receive soil health card'
          ],
          contactInfo: {
            helpline: '1800-180-1551',
            website: 'https://soilhealth.dac.gov.in',
            email: 'soilhealth@gov.in'
          },
          deadline: 'Ongoing',
          status: 'Active'
        },
        {
          id: 'farm-mechanization',
          name: 'Farm Mechanization Subsidy',
          shortName: 'FMS',
          category: 'Equipment',
          description: '40% subsidy on farm equipment purchase to increase productivity and reduce manual labor.',
          eligibility: {
            landOwnership: 'Yes',
            farmSize: 'Minimum 2 acres',
            incomeLimit: 'Annual income < ₹8 lakhs',
            location: 'All India',
            cropType: 'All crops'
          },
          benefits: [
            '40% subsidy on farm equipment',
            'Loans at reduced interest rates',
            'Training on equipment usage',
            'Maintenance support'
          ],
          documents: [
            'Land ownership documents',
            'Income certificate',
            'Aadhaar card',
            'Bank statements',
            'Equipment quotation'
          ],
          applicationProcess: [
            'Select equipment from approved list',
            'Submit application with documents',
            'Bank approval and loan disbursement',
            'Equipment purchase and subsidy claim'
          ],
          contactInfo: {
            helpline: '1800-180-1551',
            website: 'https://farmmechanization.gov.in',
            email: 'fms@gov.in'
          },
          deadline: '2024-03-31',
          status: 'Active'
        }
      ];
    }
  
    async searchSchemes(query, filters = {}) {
      try {
        let results = this.schemes;
        
        // Text search
        if (query) {
          const searchTerm = query.toLowerCase();
          results = results.filter(scheme => 
            scheme.name.toLowerCase().includes(searchTerm) ||
            scheme.description.toLowerCase().includes(searchTerm) ||
            scheme.category.toLowerCase().includes(searchTerm)
          );
        }
        
        // Apply filters
        if (filters.category) {
          results = results.filter(scheme => 
            scheme.category.toLowerCase() === filters.category.toLowerCase()
          );
        }
        
        if (filters.status) {
          results = results.filter(scheme => 
            scheme.status.toLowerCase() === filters.status.toLowerCase()
          );
        }
        
        return {
          success: true,
          data: {
            schemes: results,
            total: results.length,
            query,
            filters
          }
        };
      } catch (error) {
        throw new Error(`Failed to search schemes: ${error.message}`);
      }
    }
  
    async getSchemeDetails(schemeId) {
      try {
        const scheme = this.schemes.find(s => s.id === schemeId);
        
        if (!scheme) {
          throw new Error(`Scheme not found: ${schemeId}`);
        }
        
        return {
          success: true,
          data: scheme
        };
      } catch (error) {
        throw new Error(`Failed to get scheme details: ${error.message}`);
      }
    }
  
    async checkEligibility(schemeId, farmerProfile) {
      try {
        const scheme = this.schemes.find(s => s.id === schemeId);
        
        if (!scheme) {
          throw new Error(`Scheme not found: ${schemeId}`);
        }
        
        const eligibility = scheme.eligibility;
        const results = {
          eligible: true,
          reasons: [],
          requirements: []
        };
        
        // Check land ownership
        if (eligibility.landOwnership === 'Yes' && !farmerProfile.landOwnership) {
          results.eligible = false;
          results.reasons.push('Land ownership required');
          results.requirements.push('Provide land ownership documents');
        }
        
        // Check farm size
        if (eligibility.farmSize !== 'Any size') {
          if (eligibility.farmSize === 'Minimum 2 acres' && farmerProfile.farmSize < 2) {
            results.eligible = false;
            results.reasons.push('Minimum farm size requirement not met');
            results.requirements.push('Farm size must be at least 2 acres');
          }
        }
        
        // Check income limit
        if (eligibility.incomeLimit !== 'No limit') {
          if (farmerProfile.annualIncome >= 800000) { // ₹8 lakhs
            results.eligible = false;
            results.reasons.push('Income exceeds limit');
            results.requirements.push('Annual income must be less than ₹8 lakhs');
          }
        }
        
        return {
          success: true,
          data: {
            schemeId,
            schemeName: scheme.name,
            ...results
          }
        };
      } catch (error) {
        throw new Error(`Failed to check eligibility: ${error.message}`);
      }
    }
  
    async getApplicationGuide(schemeId) {
      try {
        const scheme = this.schemes.find(s => s.id === schemeId);
        
        if (!scheme) {
          throw new Error(`Scheme not found: ${schemeId}`);
        }
        
        return {
          success: true,
          data: {
            schemeId,
            schemeName: scheme.name,
            documents: scheme.documents,
            process: scheme.applicationProcess,
            contactInfo: scheme.contactInfo,
            tips: this.generateApplicationTips(scheme)
          }
        };
      } catch (error) {
        throw new Error(`Failed to get application guide: ${schemeId}`);
      }
    }
  
    generateApplicationTips(scheme) {
      const tips = [
        'Ensure all documents are properly attested',
        'Keep photocopies of all submitted documents',
        'Follow up with the office after submission',
        'Maintain records of all communications'
      ];
      
      if (scheme.category === 'Equipment') {
        tips.push('Compare prices from multiple vendors before purchase');
        tips.push('Ensure equipment is from approved manufacturers list');
      }
      
      if (scheme.category === 'Irrigation') {
        tips.push('Get technical consultation before installation');
        tips.push('Plan irrigation system based on crop requirements');
      }
      
      return tips;
    }
  }
  
  module.exports = new GovernmentSchemesService();