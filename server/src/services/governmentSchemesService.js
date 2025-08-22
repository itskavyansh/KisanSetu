const axios = require('axios');
const cheerio = require('cheerio');
let puppeteer = null; // lazy-loaded

class GovernmentSchemesService {
    constructor() {
    console.log('GovernmentSchemesService initialized with myScheme.gov.in integration');
    
    // Browser instance management
    this.browser = null;
    this.browserPromise = null;
    
    // Caching system
    this.cache = {
      schemes: [],
      lastUpdated: null,
      isUpdating: false
    };
    
    // Details cache (URL or ID keyed)
    this.detailsCache = new Map(); // key -> { data, lastUpdated }
    this.DETAILS_TTL_MS = 12 * 60 * 60 * 1000; // 12 hours
    
    // myScheme.gov.in API configuration
    this.MYSCHEME_BASE_URL = 'https://www.myscheme.gov.in';
    this.MYSCHEME_SEARCH_URL = 'https://www.myscheme.gov.in/search';
    this.MYSCHEME_API_URL = 'https://www.myscheme.gov.in/api';
    
    // Initialize browser and cache in background
    this.initializeBackground();
  }

  // Helper: get cached details if fresh
  getCachedDetails(key) {
    const entry = this.detailsCache.get(key);
    if (!entry) return null;
    const age = Date.now() - entry.lastUpdated;
    if (age > this.DETAILS_TTL_MS) return null;
    return entry.data;
  }

  // Helper: set cached details
  setCachedDetails(key, data) {
    this.detailsCache.set(key, { data, lastUpdated: Date.now() });
  }

  // Initialize browser and cache in background (non-blocking)
  async initializeBackground() {
    setTimeout(async () => {
      try {
        await this.getBrowser();
        await this.refreshCache();
        console.log('✅ Background initialization completed');
      } catch (error) {
        console.log('⚠️ Background initialization failed:', error.message);
      }
    }, 1000);
  }

  // Get or create browser instance (reused across requests)
  async getBrowser() {
    if (this.browser && this.browser.isConnected()) {
      return this.browser;
    }

    if (this.browserPromise) {
      return this.browserPromise;
    }

    this.browserPromise = this.createBrowser();
    try {
      this.browser = await this.browserPromise;
      return this.browser;
    } finally {
      this.browserPromise = null;
    }
  }

  // Create new browser instance
  async createBrowser() {
    if (!puppeteer) puppeteer = require('puppeteer');
    return await puppeteer.launch({ 
      headless: 'new', 
      args: [
        '--no-sandbox', 
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-accelerated-2d-canvas',
        '--no-first-run',
        '--no-zygote',
        '--disable-gpu'
      ]
    });
  }

  // Enhanced myScheme.gov.in scraping with proper pagination
  async scrapeMySchemeGovIn(page = 1, searchQuery = '', category = '') {
    try {
      const browser = await this.getBrowser();
      const browserPage = await browser.newPage();
      
      // Set user agent to avoid detection
      await browserPage.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');
      
      // Navigate to myScheme.gov.in search page
      const searchUrl = `${this.MYSCHEME_SEARCH_URL}?page=${page}&search=${encodeURIComponent(searchQuery)}&category=${encodeURIComponent(category)}`;
      console.log(`🔍 Scraping myScheme.gov.in: ${searchUrl}`);
      
      await browserPage.goto(searchUrl, { 
        waitUntil: 'networkidle2',
        timeout: 30000 
      });

      // Wait for content to load
      await browserPage.waitForTimeout(3000);

      // Extract schemes from the page
      const schemes = await browserPage.evaluate(() => {
        const schemeElements = document.querySelectorAll('.scheme-card, .scheme-item, [data-scheme], .card');
        const schemes = [];

        schemeElements.forEach((element) => {
          try {
            // Extract scheme information
            const nameElement = element.querySelector('.scheme-name, .title, h3, h4, .name');
            const descriptionElement = element.querySelector('.scheme-description, .description, .desc, p');
            const statusElement = element.querySelector('.scheme-status, .status, .badge');
            const categoryElement = element.querySelector('.scheme-category, .category, .tag');
            const linkElement = element.querySelector('a[href*="scheme"], a[href*="detail"]');

            if (nameElement) {
              const scheme = {
                id: linkElement?.href?.split('/').pop() || `scheme-${Date.now()}-${Math.random()}`,
                name: nameElement.textContent?.trim() || 'Unknown Scheme',
                description: descriptionElement?.textContent?.trim() || 'No description available',
                status: statusElement?.textContent?.trim() || 'Active',
                category: categoryElement?.textContent?.trim() || 'General',
                url: linkElement?.href || '',
                source: 'myScheme.gov.in'
              };
              schemes.push(scheme);
            }
    } catch (error) {
            console.error('Error parsing scheme element:', error);
          }
        });

        return schemes;
      });

      await browserPage.close();
      console.log(`✅ Scraped ${schemes.length} schemes from myScheme.gov.in page ${page}`);
      return schemes;

    } catch (error) {
      console.error('❌ Error scraping myScheme.gov.in:', error);
      throw error;
    }
  }

  // Get all schemes with pagination
  async getAllSchemes(searchQuery = '', category = '', maxPages = 50) {
    const allSchemes = [];
    let currentPage = 1;
    let hasMorePages = true;

    console.log(`🔄 Fetching all schemes from myScheme.gov.in (max ${maxPages} pages)`);

    while (hasMorePages && currentPage <= maxPages) {
      try {
        const schemes = await this.scrapeMySchemeGovIn(currentPage, searchQuery, category);
        
        if (schemes.length === 0) {
          hasMorePages = false;
          break;
        }

        allSchemes.push(...schemes);
        console.log(`📄 Page ${currentPage}: Found ${schemes.length} schemes (Total: ${allSchemes.length})`);
        
        currentPage++;
        
        // Add delay between requests to be respectful
        await new Promise(resolve => setTimeout(resolve, 2000));
        
    } catch (error) {
        console.error(`❌ Error on page ${currentPage}:`, error);
        hasMorePages = false;
        break;
      }
    }

    console.log(`✅ Total schemes fetched: ${allSchemes.length}`);
    return allSchemes;
  }

  // Refresh cache with fresh data from myScheme.gov.in
  async refreshCache() {
    if (this.cache.isUpdating) return;
    
    this.cache.isUpdating = true;
    try {
      console.log('🔄 Refreshing schemes cache from myScheme.gov.in...');
      
      // Get all schemes from myScheme.gov.in
      const schemes = await this.getAllSchemes();
      
      this.cache.schemes = schemes;
      this.cache.lastUpdated = Date.now();
      
      console.log(`✅ Cache refreshed with ${schemes.length} schemes`);

    } catch (error) {
      console.error('❌ Failed to refresh cache:', error);
      // Keep existing cache if refresh fails
    } finally {
      this.cache.isUpdating = false;
    }
  }

  // Search schemes with pagination
  async searchSchemes(query = '', filters = {}, page = 1, pageSize = 20) {
    try {
      // If cache is empty or old, refresh it
      if (this.cache.schemes.length === 0 || 
          !this.cache.lastUpdated || 
          Date.now() - this.cache.lastUpdated > 24 * 60 * 60 * 1000) {
        await this.refreshCache();
      }

      // If cache is still empty after refresh, use fallback data
      if (this.cache.schemes.length === 0) {
        console.log('⚠️ Using fallback scheme data');
        this.cache.schemes = this.getFallbackSchemes();
        this.cache.lastUpdated = Date.now();
      }

      let filteredSchemes = [...this.cache.schemes];

      // Apply search filter
      if (query) {
        const searchLower = query.toLowerCase();
        filteredSchemes = filteredSchemes.filter(scheme => 
          scheme.name.toLowerCase().includes(searchLower) ||
          scheme.description.toLowerCase().includes(searchLower) ||
          (scheme.category && scheme.category.toLowerCase().includes(searchLower))
        );
      }

      // Apply category filter
      if (filters.category) {
        filteredSchemes = filteredSchemes.filter(scheme => 
          scheme.category && scheme.category.toLowerCase().includes(filters.category.toLowerCase())
        );
      }

      // Apply status filter
      if (filters.status) {
        filteredSchemes = filteredSchemes.filter(scheme => 
          scheme.status && scheme.status.toLowerCase().includes(filters.status.toLowerCase())
        );
      }

      // Calculate pagination
      const totalResults = filteredSchemes.length;
      const totalPages = Math.ceil(totalResults / pageSize);
      const startIndex = (page - 1) * pageSize;
      const endIndex = startIndex + pageSize;
      const paginatedSchemes = filteredSchemes.slice(startIndex, endIndex);

      console.log(`✅ Search completed: ${paginatedSchemes.length} schemes on page ${page} of ${totalPages} (Total: ${totalResults})`);

      return {
        success: true,
        data: {
          schemes: paginatedSchemes,
          pagination: {
            currentPage: page,
            totalPages,
            totalResults,
            pageSize,
            hasNextPage: page < totalPages,
            hasPrevPage: page > 1
          }
        }
      };
      
    } catch (error) {
      console.error('❌ Search error:', error);
      // Return fallback data on error
      const fallbackSchemes = this.getFallbackSchemes();
      const totalResults = fallbackSchemes.length;
      const totalPages = Math.ceil(totalResults / pageSize);
      const startIndex = (page - 1) * pageSize;
      const endIndex = startIndex + pageSize;
      const paginatedSchemes = fallbackSchemes.slice(startIndex, endIndex);

      return {
        success: true,
        data: {
          schemes: paginatedSchemes,
          pagination: {
            currentPage: page,
            totalPages,
            totalResults,
            pageSize,
            hasNextPage: page < totalPages,
            hasPrevPage: page > 1
          }
        }
      };
    }
  }

  // Get fallback schemes when scraping fails
  getFallbackSchemes() {
    return [
      {
        id: 'pm-kisan-1',
        name: 'PM-KISAN (Pradhan Mantri Kisan Samman Nidhi)',
        description: 'Direct income support of ₹6,000 per year to eligible farmer families',
        category: 'Financial Support',
              status: 'Active',
        url: 'https://www.myscheme.gov.in/schemes/pm-kisan',
        eligibility: 'Small and marginal farmers',
        benefits: '₹6,000 per year in three equal installments'
      },
      {
        id: 'pm-fasal-bima-2',
        name: 'PM Fasal Bima Yojana',
        description: 'Comprehensive crop insurance scheme for farmers',
        category: 'Crop Insurance',
            status: 'Active',
        url: 'https://www.myscheme.gov.in/schemes/pm-fasal-bima',
        eligibility: 'All farmers growing notified crops',
        benefits: 'Crop insurance coverage against natural calamities'
      },
      {
        id: 'soil-health-3',
        name: 'Soil Health Card Scheme',
        description: 'Provides soil health cards to farmers with crop-wise recommendations',
        category: 'Soil Health',
            status: 'Active',
        url: 'https://www.myscheme.gov.in/schemes/soil-health-card',
        eligibility: 'All farmers',
        benefits: 'Free soil testing and recommendations'
      },
      {
        id: 'neem-coated-urea-4',
        name: 'Neem Coated Urea',
        description: 'Promotes use of neem coated urea to improve soil health',
        category: 'Agriculture',
        status: 'Active',
        url: 'https://www.myscheme.gov.in/schemes/neem-coated-urea',
        eligibility: 'All farmers',
        benefits: 'Subsidized neem coated urea'
      },
      {
        id: 'organic-farming-5',
        name: 'Paramparagat Krishi Vikas Yojana (PKVY)',
        description: 'Promotes organic farming practices among farmers',
        category: 'Organic Farming',
        status: 'Active',
        url: 'https://www.myscheme.gov.in/schemes/pkvy',
        eligibility: 'Farmers interested in organic farming',
        benefits: 'Financial assistance for organic farming'
      },
      {
        id: 'irrigation-6',
        name: 'PMKSY (Pradhan Mantri Krishi Sinchayee Yojana)',
        description: 'Comprehensive irrigation scheme for water management',
        category: 'Irrigation',
        status: 'Active',
        url: 'https://www.myscheme.gov.in/schemes/pmksy',
        eligibility: 'Farmers with irrigation needs',
        benefits: 'Irrigation infrastructure and water management'
      },
      {
        id: 'technology-7',
        name: 'Digital Agriculture Mission',
        description: 'Promotes use of technology in agriculture',
        category: 'Technology',
        status: 'Active',
        url: 'https://www.myscheme.gov.in/schemes/digital-agriculture',
        eligibility: 'All farmers',
        benefits: 'Digital tools and technology support'
      },
      {
        id: 'women-farmers-8',
        name: 'Mahila Kisan Sashaktikaran Pariyojana',
        description: 'Empowers women farmers through training and support',
        category: 'Women Empowerment',
        status: 'Active',
        url: 'https://www.myscheme.gov.in/schemes/mahila-kisan',
        eligibility: 'Women farmers',
        benefits: 'Training, credit, and support for women farmers'
      },
      {
        id: 'youth-9',
        name: 'Agri-Clinics and Agri-Business Centres',
        description: 'Supports agricultural graduates to set up agri-businesses',
        category: 'Youth Programs',
        status: 'Active',
        url: 'https://www.myscheme.gov.in/schemes/agri-clinics',
        eligibility: 'Agricultural graduates',
        benefits: 'Financial support for agri-business ventures'
      },
      {
        id: 'marketing-10',
        name: 'eNAM (National Agriculture Market)',
        description: 'Online trading platform for agricultural commodities',
        category: 'Marketing',
        status: 'Active',
        url: 'https://www.myscheme.gov.in/schemes/enam',
        eligibility: 'All farmers and traders',
        benefits: 'Transparent price discovery and online trading'
      }
    ];
  }

  // Get scheme details
  async getSchemeDetails(schemeId) {
    try {
      // Check cache first
      const cached = this.getCachedDetails(schemeId);
      if (cached) {
        return {
          success: true,
          data: cached
        };
      }

      // Find scheme in cache
      let scheme = this.cache.schemes.find(s => s.id === schemeId);
      
      // If not found in cache, check fallback schemes
      if (!scheme) {
        const fallbackSchemes = this.getFallbackSchemes();
        scheme = fallbackSchemes.find(s => s.id === schemeId);
      }

      if (!scheme) {
        return {
          success: false,
          error: 'Scheme not found'
        };
      }

      // Create detailed scheme information
      const detailedScheme = {
        ...scheme,
        eligibility: scheme.eligibility ? [scheme.eligibility] : ['Check official website for eligibility criteria'],
        benefits: scheme.benefits ? [scheme.benefits] : ['Financial assistance and support'],
        documents: [
          'Aadhaar Card',
          'Land documents',
          'Income certificate',
          'Bank account details',
          'Passport size photographs'
        ],
        deadline: 'Ongoing',
        applicationProcess: [
          'Visit the official myScheme.gov.in website',
          'Search for the scheme by name',
          'Click on "Apply Now" or "Register"',
          'Fill in your personal and farm details',
          'Upload required documents',
          'Submit the application',
          'Track your application status'
        ],
        contactInfo: {
          helpline: '1800-XXX-XXXX',
          email: 'support@myscheme.gov.in',
          website: 'https://www.myscheme.gov.in'
        },
        additionalInfo: {
          lastUpdated: new Date().toISOString(),
          source: 'myScheme.gov.in',
          notes: 'For the most accurate and up-to-date information, please visit the official website.'
        }
      };

      // Cache the detailed scheme
      this.setCachedDetails(schemeId, detailedScheme);
        
        return {
        success: true,
        data: detailedScheme
      };
      
      } catch (error) {
      console.error('❌ Get scheme details error:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Check eligibility for a scheme
  async checkEligibility(schemeId, farmerProfile) {
    try {
      const schemeResponse = await this.getSchemeDetails(schemeId);
      
      if (!schemeResponse.success) {
        return {
          success: false,
          error: schemeResponse.error
        };
      }

      const scheme = schemeResponse.data;
      
      // Basic eligibility check based on common criteria
    const eligibility = {
        isEligible: true,
        reasons: [],
        recommendations: []
      };

      // Check land ownership
      if (farmerProfile.landOwnership === 'tenant' && scheme.name.toLowerCase().includes('land')) {
        eligibility.reasons.push('Land ownership required for this scheme');
        eligibility.recommendations.push('Consider land lease or partnership options');
      }

      // Check farm size
      if (farmerProfile.farmSize < 0.5) {
        eligibility.reasons.push('Minimum farm size requirement may not be met');
        eligibility.recommendations.push('Check if there are schemes for small farmers');
      }

      // Check income
      if (farmerProfile.annualIncome > 800000) {
        eligibility.reasons.push('Income may exceed the scheme limit');
        eligibility.recommendations.push('Check income criteria for this specific scheme');
      }

      if (eligibility.reasons.length > 0) {
        eligibility.isEligible = false;
      }

      return {
        success: true,
        data: {
          scheme: scheme.name,
          eligibility,
          profile: farmerProfile
        }
      };

    } catch (error) {
      console.error('❌ Eligibility check error:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Get application guide
  async getApplicationGuide(schemeId) {
    try {
      const schemeResponse = await this.getSchemeDetails(schemeId);
      
      if (!schemeResponse.success) {
        return {
          success: false,
          error: schemeResponse.error
        };
      }

      const scheme = schemeResponse.data;
      
      return {
        success: true,
        data: {
          scheme: scheme.name,
          steps: scheme.applicationProcess || [
            'Visit the official myScheme.gov.in website',
            'Search for the scheme by name',
            'Click on "Apply Now" or "Register"',
            'Fill in your personal and farm details',
            'Upload required documents',
            'Submit the application',
            'Track your application status'
          ],
          documents: scheme.documents || ['Aadhaar Card', 'Land documents', 'Income certificate'],
          contact: scheme.contactInfo ? 
            `For assistance, contact: ${scheme.contactInfo.helpline} or ${scheme.contactInfo.email}` : 
            'For assistance, contact the scheme helpline or visit your nearest government office',
          website: scheme.contactInfo?.website || 'https://www.myscheme.gov.in'
        }
      };

    } catch (error) {
      console.error('❌ Get application guide error:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Get scheme categories
  async getCategories() {
    try {
      const categories = new Set();
      
      // Add categories from cache if available
      if (this.cache.schemes && this.cache.schemes.length > 0) {
        this.cache.schemes.forEach(scheme => {
          if (scheme.category) {
            categories.add(scheme.category);
          }
        });
      }

      // Add fallback categories if cache is empty
      if (categories.size === 0) {
        const fallbackCategories = [
          'Agriculture',
          'Farmer Support',
          'Crop Insurance',
          'Irrigation',
          'Soil Health',
          'Organic Farming',
          'Technology',
          'Education',
          'Infrastructure',
          'Marketing',
          'Financial Support',
          'Women Empowerment',
          'Youth Programs',
          'Disaster Relief'
        ];
        fallbackCategories.forEach(cat => categories.add(cat));
      }

      return {
        success: true,
        data: {
          categories: Array.from(categories).sort()
        }
      };

    } catch (error) {
      console.error('❌ Get categories error:', error);
      // Return fallback categories on error
        return {
        success: true,
        data: {
          categories: [
            'Agriculture',
            'Farmer Support',
            'Crop Insurance',
            'Irrigation',
            'Soil Health',
            'Organic Farming',
            'Technology',
            'Education',
            'Infrastructure',
            'Marketing',
            'Financial Support',
            'Women Empowerment',
            'Youth Programs',
            'Disaster Relief'
          ]
        }
      };
    }
  }

  // Cleanup browser on service shutdown
  async cleanup() {
    if (this.browser) {
      await this.browser.close();
      this.browser = null;
    }
    }
  }
  
  module.exports = new GovernmentSchemesService();