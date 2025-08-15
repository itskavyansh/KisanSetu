class CarbonCreditService {
  constructor() {
    // Mock carbon credit rates and calculations
    this.carbonRates = {
      'tree_planting': {
        teak: 0.8,      // kg CO2 per tree per year
        mango: 0.6,     // kg CO2 per tree per year
        coconut: 0.7,   // kg CO2 per tree per year
        neem: 0.9,      // kg CO2 per tree per year
        general: 0.7    // kg CO2 per tree per year
      },
      'rice_cultivation': {
        'alternate_wetting_drying': 0.3,  // kg CO2 per sq meter per season
        'direct_seeding': 0.2,            // kg CO2 per sq meter per season
        'organic_farming': 0.4            // kg CO2 per sq meter per season
      },
      'soil_management': {
        'cover_cropping': 0.1,            // kg CO2 per sq meter per year
        'composting': 0.15,               // kg CO2 per sq meter per year
        'no_till': 0.2                    // kg CO2 per sq meter per year
      }
    };
    
    // Mock carbon credit market prices (₹ per kg CO2)
    this.marketPrices = {
      current: 900,      // ₹900 per tonne CO2
      historical: [850, 880, 920, 900, 950, 900],
      trend: 'stable'
    };
  }

  async calculateCarbonCredits(projectData) {
    try {
      const { projectType, details, location, startDate } = projectData;
      let totalCredits = 0;
      let breakdown = {};

      switch (projectType) {
        case 'tree_planting':
          totalCredits = this.calculateTreePlantingCredits(details);
          breakdown = {
            method: 'Tree Plantation',
            trees: details.treeCount,
            species: details.species,
            annualSequestration: totalCredits,
            lifetimeCredits: totalCredits * 20 // Assuming 20-year project life
          };
          break;

        case 'rice_cultivation':
          totalCredits = this.calculateRiceCultivationCredits(details);
          breakdown = {
            method: 'Climate-Smart Rice Cultivation',
            area: details.area,
            practice: details.practice,
            seasonalCredits: totalCredits,
            annualCredits: totalCredits * 2 // Assuming 2 seasons per year
          };
          break;

        case 'soil_management':
          totalCredits = this.calculateSoilManagementCredits(details);
          breakdown = {
            method: 'Soil Carbon Sequestration',
            area: details.area,
            practices: details.practices,
            annualCredits: totalCredits
          };
          break;

        default:
          throw new Error(`Unsupported project type: ${projectType}`);
      }

      // Calculate financial benefits
      const annualEarnings = totalCredits * this.marketPrices.current / 1000; // Convert to tonnes
      const lifetimeEarnings = breakdown.lifetimeCredits ? 
        breakdown.lifetimeCredits * this.marketPrices.current / 1000 : 
        annualEarnings * 10; // Assume 10 years for non-tree projects

      return {
        success: true,
        data: {
          projectType,
          location,
          startDate,
          carbonCredits: {
            annual: totalCredits,
            lifetime: breakdown.lifetimeCredits || totalCredits * 10,
            unit: 'kg CO2 equivalent'
          },
          financialBenefits: {
            annualEarnings: Math.round(annualEarnings),
            lifetimeEarnings: Math.round(lifetimeEarnings),
            currency: 'INR',
            marketPrice: this.marketPrices.current
          },
          breakdown,
          verification: {
            status: 'Pending',
            requirements: this.getVerificationRequirements(projectType),
            nextSteps: this.getNextSteps(projectType)
          },
          timestamp: new Date().toISOString()
        }
      };
    } catch (error) {
      throw new Error(`Failed to calculate carbon credits: ${error.message}`);
    }
  }

  calculateTreePlantingCredits(details) {
    const { treeCount, species } = details;
    const rate = this.carbonRates.tree_planting[species] || this.carbonRates.tree_planting.general;
    return treeCount * rate;
  }

  calculateRiceCultivationCredits(details) {
    const { area, practice } = details;
    const rate = this.carbonRates.rice_cultivation[practice] || 0.2;
    return area * rate;
  }

  calculateSoilManagementCredits(details) {
    const { area, practices } = details;
    let totalCredits = 0;
    
    practices.forEach(practice => {
      const rate = this.carbonRates.soil_management[practice] || 0.1;
      totalCredits += area * rate;
    });
    
    return totalCredits;
  }

  getVerificationRequirements(projectType) {
    const requirements = {
      'tree_planting': [
        'GPS coordinates of plantation area',
        'Before and after photos',
        'Tree count verification',
        'Species documentation',
        'Maintenance records'
      ],
      'rice_cultivation': [
        'Field area measurements',
        'Cultivation practice documentation',
        'Seasonal photos',
        'Water management records',
        'Yield data comparison'
      ],
      'soil_management': [
        'Soil test reports (before/after)',
        'Practice implementation photos',
        'Area measurements',
        'Crop yield data',
        'Soil health indicators'
      ]
    };
    
    return requirements[projectType] || [];
  }

  getNextSteps(projectType) {
    const steps = {
      'tree_planting': [
        'Submit GPS coordinates and photos',
        'Schedule field verification visit',
        'Provide maintenance records',
        'Receive verification certificate',
        'Start earning carbon credits'
      ],
      'rice_cultivation': [
        'Document current practices',
        'Implement climate-smart techniques',
        'Record seasonal data',
        'Submit verification documents',
        'Begin carbon credit accumulation'
      ],
      'soil_management': [
        'Conduct baseline soil testing',
        'Implement soil improvement practices',
        'Monitor soil health indicators',
        'Submit progress reports',
        'Qualify for carbon credits'
      ]
    };
    
    return steps[projectType] || [];
  }

  async getCarbonMarketInfo() {
    try {
      return {
        success: true,
        data: {
          currentPrice: this.marketPrices.current,
          priceHistory: this.marketPrices.historical,
          trend: this.marketPrices.trend,
          marketCap: '₹2.5 billion',
          tradingVolume: '₹150 million daily',
          lastUpdated: new Date().toISOString()
        }
      };
    } catch (error) {
      throw new Error(`Failed to get market info: ${error.message}`);
    }
  }

  async getProjectTemplates() {
    try {
      return {
        success: true,
        data: [
          {
            id: 'tree_plantation',
            name: 'Tree Plantation Project',
            description: 'Plant trees to sequester carbon and earn credits',
            requirements: ['Land area', 'Water source', 'Maintenance capability'],
            estimatedCredits: '500-2000 kg CO2/year',
            estimatedEarnings: '₹450-1800/year',
            difficulty: 'Medium'
          },
          {
            id: 'climate_smart_rice',
            name: 'Climate-Smart Rice Cultivation',
            description: 'Adopt sustainable rice farming practices',
            requirements: ['Rice field', 'Water management', 'Record keeping'],
            estimatedCredits: '100-500 kg CO2/season',
            estimatedEarnings: '₹90-450/season',
            difficulty: 'Low'
          },
          {
            id: 'soil_carbon',
            name: 'Soil Carbon Sequestration',
            description: 'Improve soil health and capture carbon',
            requirements: ['Agricultural land', 'Organic materials', 'Testing capability'],
            estimatedCredits: '50-200 kg CO2/year',
            estimatedEarnings: '₹45-180/year',
            difficulty: 'Low'
          }
        ]
      };
    } catch (error) {
      throw new Error(`Failed to get project templates: ${error.message}`);
    }
  }
}

module.exports = new CarbonCreditService();
