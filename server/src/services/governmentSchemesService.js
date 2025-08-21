const axios = require('axios');
const cheerio = require('cheerio');
let puppeteer = null; // lazy-loaded

class GovernmentSchemesService {
    constructor() {
    console.log('GovernmentSchemesService initialized with enhanced web scraping');
    
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

  // Refresh cache with fresh data
  async refreshCache() {
    if (this.cache.isUpdating) return;
    
    this.cache.isUpdating = true;
    try {
      console.log('🔄 Refreshing schemes cache...');
      
      // Try API first, then fallback to scraping
      let schemes = [];
      try {
        schemes = await this.findMySchemeAPI('farmer', 'Agriculture, Rural & Environment');
        if (schemes.length) {
          console.log(`✅ API returned ${schemes.length} schemes`);
        }
      } catch (e) {
        console.log('API failed, falling back to scraping');
      }

      // If no API data, use fast scraping
      if (!schemes.length) {
        schemes = await this.scrapeSchemesFast();
      }

      if (schemes.length) {
        this.cache.schemes = schemes;
        this.cache.lastUpdated = new Date();
        console.log(`✅ Cache refreshed with ${schemes.length} schemes`);
      }
    } catch (error) {
      console.error('Cache refresh failed:', error.message);
    } finally {
      this.cache.isUpdating = false;
    }
  }

  // Fast scraping using existing browser instance
  async scrapeSchemesFast() {
    try {
      const browser = await this.getBrowser();
      const page = await browser.newPage();
      
      // Optimize page for speed
      await page.setRequestInterception(true);
      page.on('request', (req) => {
        if (['image', 'stylesheet', 'font'].includes(req.resourceType())) {
          req.abort();
        } else {
          req.continue();
        }
      });

      await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36');
      await page.setViewport({ width: 1366, height: 900 });

      const url = 'https://www.myscheme.gov.in/search?q=farmer';
      await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 20000 });

      // Wait for scheme links with shorter timeout
      try {
        await page.waitForSelector('a[href^="/schemes/"]', { timeout: 10000 });
      } catch (e) {
        console.log('No scheme links found, using fallback');
        return [];
      }

      const schemes = await page.evaluate(() => {
        const links = Array.from(document.querySelectorAll('a[href^="/schemes/"]'));
        const seen = new Set();
        const results = [];

        links.forEach(link => {
          const href = link.getAttribute('href') || '';
          if (!href || seen.has(href)) return;
          seen.add(href);

          const container = link.closest('article, .MuiCard-root, .card, li, .MuiPaper-root, .MuiGrid-item, div');
          const titleEl = container?.querySelector('h1,h2,h3,h4,.title,[class*="Title"],.MuiTypography-h5,.MuiTypography-h6') || link;
          const descEl = container?.querySelector('p,.description,[class*="desc"],.MuiTypography-body2,.MuiTypography-body1');

          const name = (titleEl?.textContent || '').trim();
          const description = (descEl?.textContent || '').trim();

          if (name && name.length > 6 && !/something went wrong|sign out|about us|contact|faq|terms|privacy/i.test(name)) {
            results.push({
              id: name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
              name,
              shortName: name.split(/\s+/).map(w => w[0]).join('').slice(0, 8).toUpperCase(),
              category: /irrigation|sinchai|water/i.test(name) ? 'Irrigation' : (/soil|fertilizer|health/i.test(name) ? 'Soil Management' : (/insurance|bima/i.test(name) ? 'Insurance' : (/mechanization|equipment|machine/i.test(name) ? 'Equipment' : (/kisan|farmer|income/i.test(name) ? 'Income Support' : 'Agriculture')))),
              description: description || `Government scheme: ${name}`,
              status: 'Active',
              source: 'MyScheme (Cached)',
              url: href.startsWith('http') ? href : `https://www.myscheme.gov.in${href}`,
              keywords: [],
              lastUpdated: new Date().toISOString()
            });
          }
        });

        return results;
      });

      await page.close();
      return schemes;
    } catch (error) {
      console.error('Fast scraping failed:', error.message);
      return [];
    }
  }

  // Get schemes from cache or scrape fresh if needed
  async getSchemesFromCache(query = 'farmer') {
    const cacheAge = this.cache.lastUpdated ? Date.now() - this.cache.lastUpdated.getTime() : Infinity;
    const cacheValid = cacheAge < 30 * 60 * 1000; // 30 minutes

    if (this.cache.schemes.length > 0 && cacheValid) {
      console.log(`📦 Serving ${this.cache.schemes.length} schemes from cache (age: ${Math.round(cacheAge / 1000)}s)`);
      return this.cache.schemes;
    }

    // Cache expired or empty, refresh in background
    if (!this.cache.isUpdating) {
      this.refreshCache(); // Non-blocking refresh
    }

    // Return cached data even if expired, or fallback
    if (this.cache.schemes.length > 0) {
      console.log('📦 Serving expired cache while refreshing...');
      return this.cache.schemes;
    }

    // No cache, scrape fresh (blocking)
    console.log('🔄 No cache available, scraping fresh...');
    return await this.scrapeSchemesFast();
  }

  async searchSchemes(query, filters = {}, page = 1) {
    try {
      const perPage = 9;
      const q = (query || '').trim() || 'farmer';
      const qLower = q.toLowerCase();

      // Get schemes from cache (fast) or scrape fresh
      let schemes = await this.getSchemesFromCache(q);

      // Relevance filter: only apply if query is specific (not default 'farmer')
      let filtered = schemes;
      if (q !== 'farmer' && q !== '') {
        filtered = schemes.filter((s) => {
          const text = `${s?.name || ''} ${s?.description || ''}`.toLowerCase();
          return text.includes(qLower);
        });
        
        // If filtering yields no results, show all schemes instead of empty results
        if (filtered.length === 0) {
          console.log(`No schemes match query "${q}", showing all ${schemes.length} schemes`);
          filtered = schemes;
        }
      }

      // Apply optional category/status filters after relevance
      if (filters?.category) {
        const c = String(filters.category).toLowerCase();
        filtered = filtered.filter((s) => String(s?.category || '').toLowerCase() === c);
      }
      if (filters?.status) {
        const st = String(filters.status).toLowerCase();
        filtered = filtered.filter((s) => String(s?.status || '').toLowerCase() === st);
      }

      // Pagination
      const totalResults = filtered.length;
      const totalPages = Math.ceil(totalResults / perPage);

      let currentPage = parseInt(page, 10);
      if (!Number.isInteger(currentPage) || currentPage < 1) currentPage = 1;

      let pagedSchemes = [];
      if (totalPages === 0) {
        pagedSchemes = [];
      } else if (currentPage > totalPages) {
        pagedSchemes = [];
      } else {
        const startIdx = (currentPage - 1) * perPage;
        pagedSchemes = filtered.slice(startIdx, startIdx + perPage);
      }

      console.log(`📊 Pagination: Page ${currentPage}/${totalPages}, showing ${pagedSchemes.length}/${totalResults} schemes`);
      
      return {
        success: true,
        data: {
          schemes: pagedSchemes,
          query: q,
          filters,
          pagination: {
            currentPage,
            totalPages,
            totalResults,
          },
        },
      };
    } catch (error) {
      console.error('Error in searchSchemes:', error);
      const fb = this.getFallbackSchemes();
      const perPage = 9;
      const totalResults = fb.length;
      const totalPages = Math.ceil(totalResults / perPage);
      const currentPage = 1;
      return {
        success: true,
        data: {
          schemes: fb.slice(0, perPage),
          query: (query || '').trim() || 'farmer',
          filters,
          pagination: { currentPage, totalPages, totalResults },
        },
      };
    }
  }
  
    async getSchemeDetails(schemeId) {
      try {
      // Find in search list first to get URL
      const baseList = await this.searchSchemes('', {});
      const basic = baseList.data.schemes.find(s => s.id === schemeId);

      if (basic?.url) {
        try {
          const detailed = await this.scrapeSchemeDetailsWithPuppeteer(basic.url);
          if (detailed) return { success: true, data: { ...basic, ...detailed } };
        } catch (e) {
          console.log('Puppeteer detail scrape failed:', e.message);
        }
      }

      if (basic) {
        return { success: true, data: this.enhanceSchemeWithDetails(basic) };
      }

      return { success: false, error: `Scheme not found: ${schemeId}` };
    } catch (error) {
      console.error('Error getting scheme details:', error.message);
      return { success: false, error: 'Failed to get scheme details' };
    }
  }

  checkEligibility(schemeId, farmerProfile) {
        return {
          success: true,
          data: {
        schemeId,
        eligible: null,
        reasons: ['Eligibility computation not available from data provider'],
        requirements: [],
        note: 'Please refer to the official scheme portal for detailed eligibility checks.'
      }
    };
  }

  async getApplicationGuide(schemeId) {
    try {
      const details = await this.getSchemeDetails(schemeId);
      if (!details.success) return details;
      const scheme = details.data;
        return {
          success: true,
        data: {
          schemeId,
          schemeName: scheme.name,
          documents: scheme.documents || [],
          process: scheme.applicationProcess || [],
          contactInfo: scheme.contactInfo || {},
          tips: this.generateGenericApplicationTips(scheme)
          }
        };
      } catch (error) {
      return { success: false, error: 'Failed to get application guide' };
    }
  }

  async getCategories() {
    try {
      const list = await this.searchSchemes('', {});
      const categories = Array.from(new Set(list.data.schemes.map(s => s.category).filter(Boolean)));
      return { success: true, data: categories };
    } catch (error) {
      return { success: true, data: ['Income Support', 'Irrigation', 'Soil Management', 'Equipment', 'Insurance', 'General'] };
    }
  }

  // Headless browser scraping for dynamic content - search page
  async scrapeMySchemeWithPuppeteer(searchTerm) {
    let browser;
    try {
      if (!puppeteer) puppeteer = require('puppeteer');
      browser = await puppeteer.launch({ headless: 'new', args: ['--no-sandbox', '--disable-setuid-sandbox'] });
      const page = await browser.newPage();
      await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120 Safari/537.36');
      await page.setViewport({ width: 1366, height: 900 });

      const url = `https://www.myscheme.gov.in/search?q=${encodeURIComponent(searchTerm)}`;
      await page.goto(url, { waitUntil: 'networkidle2', timeout: 45000 });

      // Wait specifically for scheme links
      await page.waitForSelector('a[href^="/schemes/"]', { timeout: 15000 });

      // Extract scheme cards by following /schemes/* links
      const schemes = await page.evaluate(() => {
        const links = Array.from(document.querySelectorAll('a[href^="/schemes/"]'));
        const seen = new Set();
        const results = [];

        links.forEach(link => {
          const href = link.getAttribute('href') || '';
          if (!href || seen.has(href)) return;
          seen.add(href);

          const container = link.closest('article, .MuiCard-root, .card, li, .MuiPaper-root, .MuiGrid-item, div');
          const titleEl = container?.querySelector('h1,h2,h3,h4,.title,[class*="Title"],.MuiTypography-h5,.MuiTypography-h6') || link;
          const descEl = container?.querySelector('p,.description,[class*="desc"],.MuiTypography-body2,.MuiTypography-body1');

          const name = (titleEl?.textContent || '').trim();
          const description = (descEl?.textContent || '').trim();

          if (name && name.length > 6 && !/something went wrong|sign out|about us|contact|faq|terms|privacy/i.test(name)) {
            results.push({
              id: name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
              name,
              shortName: name.split(/\s+/).map(w => w[0]).join('').slice(0, 8).toUpperCase(),
              category: /irrigation|sinchai|water/i.test(name) ? 'Irrigation' : (/soil|fertilizer|health/i.test(name) ? 'Soil Management' : (/insurance|bima/i.test(name) ? 'Insurance' : (/mechanization|equipment|machine/i.test(name) ? 'Equipment' : (/kisan|farmer|income/i.test(name) ? 'Income Support' : 'Agriculture')))),
              description: description || `Government scheme: ${name}`,
              status: 'Active',
              source: 'MyScheme (Rendered)',
              url: href.startsWith('http') ? href : `https://www.myscheme.gov.in${href}`,
              keywords: [],
              lastUpdated: new Date().toISOString()
            });
          }
        });

        return results;
      });

      await browser.close();
      return schemes;
    } catch (error) {
      try { await browser?.close(); } catch (_) {}
      throw error;
    }
  }

  // Find and use the actual JSON API endpoint from MyScheme
  async findMySchemeAPI(searchTerm = 'farmer', category = 'Agriculture, Rural & Environment') {
    try {
      console.log(`🔍 Searching MyScheme API for: "${searchTerm}" in category: "${category}"`);
      
      // Try different potential API endpoints based on network inspection
      const apiEndpoints = [
        `https://www.myscheme.gov.in/api/schemes?q=${encodeURIComponent(searchTerm)}&category=${encodeURIComponent(category)}`,
        `https://www.myscheme.gov.in/api/search?query=${encodeURIComponent(searchTerm)}&category=${encodeURIComponent(category)}`,
        `https://www.myscheme.gov.in/api/v1/schemes?search=${encodeURIComponent(searchTerm)}&category=${encodeURIComponent(category)}`,
        `https://www.myscheme.gov.in/api/schemes/search?q=${encodeURIComponent(searchTerm)}&category=${encodeURIComponent(category)}`,
        `https://www.myscheme.gov.in/api/schemes?search=${encodeURIComponent(searchTerm)}&category=${encodeURIComponent(category)}`
      ];

      for (const endpoint of apiEndpoints) {
        try {
          console.log(`Trying API endpoint: ${endpoint}`);
          const response = await axios.get(endpoint, {
            timeout: 10000,
            headers: {
              'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
              'Accept': 'application/json, text/plain, */*',
              'Accept-Language': 'en-US,en;q=0.9',
              'Referer': 'https://www.myscheme.gov.in/',
              'Origin': 'https://www.myscheme.gov.in'
            }
          });

          if (response.status === 200 && response.data) {
            console.log(`✅ Found working API endpoint: ${endpoint}`);
            console.log('API Response structure:', Object.keys(response.data));
            return this.parseMySchemeAPIResponse(response.data, searchTerm);
          }
        } catch (apiError) {
          console.log(`❌ API endpoint failed: ${endpoint} - ${apiError.message}`);
        }
      }

      // If no API endpoints work, try to find the actual endpoint by inspecting the page
      console.log('🔍 No direct API endpoints found, trying to extract from page source...');
      return await this.extractAPIEndpointFromPage(searchTerm, category);
      
    } catch (error) {
      console.error('Error in findMySchemeAPI:', error);
      return [];
    }
  }

  // Extract API endpoint by analyzing the page source
  async extractAPIEndpointFromPage(searchTerm, category) {
    try {
      const response = await axios.get('https://www.myscheme.gov.in/search', {
        timeout: 15000,
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
          'Accept-Language': 'en-US,en;q=0.5'
        }
      });

      if (response.status === 200) {
        const html = response.data;
        
        // Look for API endpoints in JavaScript code
        const apiPatterns = [
          /api\/schemes[^"'\s]*/g,
          /api\/search[^"'\s]*/g,
          /api\/v1\/[^"'\s]*/g,
          /fetch\(['"`]([^'"`]+)['"`]/g,
          /axios\.get\(['"`]([^'"`]+)['"`]/g,
          /url:\s*['"`]([^'"`]+)['"`]/g
        ];

        for (const pattern of apiPatterns) {
          const matches = html.match(pattern);
          if (matches) {
            console.log(`🔍 Found potential API patterns:`, matches);
            
            // Try to construct and test the API endpoint
            for (const match of matches) {
              if (match.includes('api') && !match.includes('http')) {
                const apiUrl = `https://www.myscheme.gov.in${match}`;
                try {
                  const apiResponse = await axios.get(apiUrl, { timeout: 5000 });
                  if (apiResponse.status === 200) {
                    console.log(`✅ Found working API: ${apiUrl}`);
                    return this.parseMySchemeAPIResponse(apiResponse.data, searchTerm);
                  }
                } catch (e) {
                  // Continue trying other patterns
                }
              }
            }
          }
        }

        // Look for GraphQL endpoints
        const graphqlPattern = /graphql[^"'\s]*/g;
        const graphqlMatches = html.match(graphqlPattern);
        if (graphqlMatches) {
          console.log(`🔍 Found GraphQL endpoint:`, graphqlMatches);
          // Try GraphQL query
          return await this.tryGraphQLEndpoint(graphqlMatches[0], searchTerm, category);
        }
      }
    } catch (error) {
      console.error('Error extracting API endpoint from page:', error);
    }

    return [];
  }

  // Try GraphQL endpoint
  async tryGraphQLEndpoint(endpoint, searchTerm, category) {
    try {
      const graphqlQuery = {
        query: `
          query SearchSchemes($search: String!, $category: String) {
            schemes(search: $search, category: $category) {
              id
              name
              description
              ministry
              category
              benefits
              eligibility
              documents
              applicationProcess
            }
          }
        `,
        variables: {
          search: searchTerm,
          category: category
        }
      };

      const response = await axios.post(`https://www.myscheme.gov.in${endpoint}`, graphqlQuery, {
        timeout: 10000,
        headers: {
          'Content-Type': 'application/json',
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
        }
      });

      if (response.status === 200 && response.data?.data?.schemes) {
        console.log('✅ GraphQL endpoint working!');
        return this.parseMySchemeAPIResponse(response.data.data, searchTerm);
      }
      } catch (error) {
      console.log('GraphQL endpoint failed:', error.message);
    }
    return [];
  }

  // Parse API response and convert to our scheme format
  parseMySchemeAPIResponse(apiData, searchTerm) {
    try {
      let schemes = [];
      
      // Handle different possible response structures
      if (Array.isArray(apiData)) {
        schemes = apiData;
      } else if (apiData.schemes && Array.isArray(apiData.schemes)) {
        schemes = apiData.schemes;
      } else if (apiData.data && Array.isArray(apiData.data)) {
        schemes = apiData.data;
      } else if (apiData.results && Array.isArray(apiData.results)) {
        schemes = apiData.results;
      } else {
        console.log('Unknown API response structure:', Object.keys(apiData));
        return [];
      }

      console.log(`📊 Parsing ${schemes.length} schemes from API response`);

      return schemes.map((scheme, index) => ({
        id: scheme.id || scheme.schemeId || `api-scheme-${index}`,
        name: scheme.name || scheme.schemeName || scheme.title || 'Unknown Scheme',
        shortName: (scheme.name || scheme.schemeName || scheme.title || 'Unknown').split(/\s+/).map(w => w[0]).join('').slice(0, 8).toUpperCase(),
        category: scheme.category || scheme.schemeCategory || 'Agriculture',
        description: scheme.description || scheme.summary || scheme.details || `Government scheme: ${scheme.name || 'Unknown'}`,
        status: scheme.status || 'Active',
        source: 'MyScheme API',
        url: scheme.url || scheme.link || scheme.schemeUrl || `https://www.myscheme.gov.in/schemes/${scheme.id || index}`,
        ministry: scheme.ministry || scheme.ministryName || 'Ministry of Agriculture',
        benefits: Array.isArray(scheme.benefits) ? scheme.benefits : (scheme.benefits ? [scheme.benefits] : []),
        eligibility: scheme.eligibility || scheme.eligibilityCriteria || {},
        documents: Array.isArray(scheme.documents) ? scheme.documents : (scheme.documents ? [scheme.documents] : []),
        applicationProcess: Array.isArray(scheme.applicationProcess) ? scheme.applicationProcess : (scheme.applicationProcess ? [scheme.applicationProcess] : []),
        keywords: this.extractKeywords(scheme.description || scheme.name || ''),
        lastUpdated: new Date().toISOString()
      }));

    } catch (error) {
      console.error('Error parsing API response:', error);
      return [];
    }
  }

  // Enhanced scheme details scraping with more comprehensive data extraction
  async scrapeSchemeDetailsWithPuppeteer(absoluteUrl) {
    let browser;
    try {
      if (!puppeteer) puppeteer = require('puppeteer');
      browser = await puppeteer.launch({ headless: 'new', args: ['--no-sandbox', '--disable-setuid-sandbox'] });
      const page = await browser.newPage();
      await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120 Safari/537.36');
      await page.setViewport({ width: 1366, height: 900 });

      await page.goto(absoluteUrl, { waitUntil: 'networkidle2', timeout: 45000 });

      // Enhanced data extraction with more comprehensive selectors
      const details = await page.evaluate(() => {
        const extractSection = (labelPatterns, containerSelectors = []) => {
          const patterns = Array.isArray(labelPatterns) ? labelPatterns : [labelPatterns];
          const containers = containerSelectors.length > 0 ? containerSelectors : ['section', '.MuiPaper-root', '.MuiBox-root', 'div', 'article'];
          
          for (const pattern of patterns) {
            const regex = new RegExp(pattern, 'i');
            
            // Try to find by heading text
            const headings = Array.from(document.querySelectorAll('h1,h2,h3,h4,h5,h6,strong,.MuiTypography-root,.section-title'));
            for (const heading of headings) {
              const text = (heading.textContent || '').trim();
              if (regex.test(text)) {
                // Find the container with content
                let container = heading.closest(containers.join(','));
                if (!container) {
                  // Look for next sibling or parent with content
                  container = heading.nextElementSibling || heading.parentElement;
                }
                
                if (container) {
                  const items = Array.from(container.querySelectorAll('li, p, .MuiTypography-body1, .MuiTypography-body2'))
                    .map(el => (el.textContent || '').trim())
                    .filter(text => text.length > 10); // Filter out very short text
                   
                  if (items.length > 0) return items;
                   
                  // If no list items, get the container text
                  const containerText = (container.textContent || '').trim();
                  if (containerText.length > 20) {
                    return [containerText];
                  }
                }
              }
            }
          }
          return [];
        };

        // Extract comprehensive scheme information
        const result = {
          // Basic details
          schemeName: document.querySelector('h1, .scheme-title, .MuiTypography-h4')?.textContent?.trim(),
          ministry: extractSection(['ministry', 'department', 'nodal agency'], ['.ministry-info', '.department-info', '.nodal-agency'])[0] || '',
          
          // Eligibility section
          eligibility: {
            criteria: extractSection(['eligibility', 'eligible', 'who can apply'], ['.eligibility', '.criteria', '.who-can-apply']),
            ageLimit: extractSection(['age limit', 'age requirement', 'minimum age'], ['.age-info', '.age-requirement'])[0] || '',
            incomeLimit: extractSection(['income limit', 'income criteria', 'annual income'], ['.age-info', '.income-criteria'])[0] || '',
            landRequirement: extractSection(['land requirement', 'land ownership', 'farm size'], ['.land-info', '.land-requirement'])[0] || '',
            documents: extractSection(['documents', 'required documents', 'supporting documents'], ['.documents', '.required-docs', '.supporting-docs'])
          },
          
          // Benefits section
          benefits: {
            financial: extractSection(['financial benefit', 'subsidy amount', 'grant amount', 'loan amount'], ['.financial-benefits', '.subsidy-info', '.grant-info']),
            nonFinancial: extractSection(['non-financial', 'training', 'support', 'assistance'], ['.age-info', '.training', '.support']),
            coverage: extractSection(['coverage', 'what is covered', 'includes'], ['.coverage', '.what-covered', '.includes'])
          },
          
          // Application process
          applicationProcess: {
            steps: extractSection(['how to apply', 'application process', 'steps to apply'], ['.application-process', '.how-to-apply', '.steps']),
            timeline: extractSection(['timeline', 'processing time', 'duration'], ['.timeline', '.processing-time', '.duration'])[0] || '',
            contactInfo: extractSection(['contact', 'helpline', 'email', 'phone'], ['.contact-info', '.helpline', '.support']),
            website: extractSection(['website', 'portal', 'online application'], ['.website', '.portal', '.online'])[0] || ''
          },
          
          // Additional details
          documents: extractSection(['documents', 'required documents', 'supporting documents'], ['.documents', '.required-docs', '.supporting-docs']),
          deadline: extractSection(['deadline', 'last date', 'closing date', 'due date'], ['.deadline', '.last-date', '.closing-date'])[0] || '',
          status: extractSection(['status', 'current status', 'scheme status'], ['.status', '.current-status', '.scheme-status'])[0] || 'Active',
          
          // Contact information
          contactInfo: {
            website: document.querySelector('a[href^="http"]')?.href || '',
            email: extractSection(['email', 'e-mail', 'contact email'], ['.email', '.contact-email'])[0] || '',
            phone: extractSection(['phone', 'helpline', 'toll free', 'contact number'], ['.phone', '.helpline', '.contact-number'])[0] || '',
            address: extractSection(['address', 'office address', 'contact address'], ['.address', '.office-address'])[0] || ''
          }
        };

        return result;
      });

      await browser.close();
      return details;
    } catch (error) {
      try { await browser?.close(); } catch (_) {}
      console.error('Error in enhanced scheme details scraping:', error);
      return null;
    }
  }

  // Enhanced MyScheme portal scraping
  async scrapeMySchemePortal(searchQuery = '') {
    try {
      console.log('🔍 Scraping MyScheme portal for schemes...');
      
      // Try to find actual scheme data endpoints first
      let schemes = await this.trySchemeDataEndpoints();
      if (schemes.length > 0) {
        console.log(`✅ Found ${schemes.length} schemes via data endpoints`);
        return schemes;
      }

      // Try multiple MyScheme URLs with better scraping
      const urls = [
        'https://www.myscheme.gov.in/',
        'https://www.myscheme.gov.in/search',
        'https://www.myscheme.gov.in/schemes'
      ];

      for (const url of urls) {
        try {
          console.log(`Trying URL: ${url}`);
          const response = await axios.get(url, {
            timeout: 15000,
            headers: {
              'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
              'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
              'Accept-Language': 'en-US,en;q=0.5',
              'Accept-Encoding': 'gzip, deflate, br',
              'Connection': 'keep-alive',
              'Upgrade-Insecure-Requests': '1',
              'Cache-Control': 'no-cache',
              'Pragma': 'no-cache'
            }
          });

          if (response.status === 200) {
            const $ = cheerio.load(response.data);
            
            // Look for scheme data in JavaScript variables or JSON
            schemes = this.extractSchemesFromJavaScript($, response.data);
            if (schemes.length > 0) {
              console.log(`✅ Found ${schemes.length} schemes in JavaScript data`);
              break;
            }

            // Try multiple selectors to find schemes
            schemes = this.extractSchemesWithSelectors($);
            if (schemes.length > 0) {
              console.log(`✅ Found ${schemes.length} schemes with selectors`);
              break;
            }

            // Look for hidden scheme data
            schemes = this.extractHiddenSchemeData($);
            if (schemes.length > 0) {
              console.log(`✅ Found ${schemes.length} schemes in hidden data`);
              break;
            }
          }
        } catch (urlError) {
          console.log(`Failed to scrape ${url}: ${urlError.message}`);
          continue;
        }
      }

      // If no schemes found, return fallback
      if (schemes.length === 0) {
        console.log('No schemes found on MyScheme portal, using fallback');
        return this.getFallbackSchemes();
      }

      // Remove duplicates and limit results
      const uniqueSchemes = this.removeDuplicates(schemes);
      console.log(`Total unique schemes found: ${uniqueSchemes.length}`);
      
      return uniqueSchemes.slice(0, 20); // Return up to 20 schemes
      
    } catch (error) {
      console.error('MyScheme portal scraping failed:', error.message);
      throw error;
    }
  }

  // Try to find actual scheme data endpoints
  async trySchemeDataEndpoints() {
    const endpoints = [
      'https://www.myscheme.gov.in/api/schemes',
      'https://www.myscheme.gov.in/api/v1/schemes',
      'https://www.myscheme.gov.in/data/schemes.json',
      'https://www.myscheme.gov.in/assets/data/schemes.js',
      'https://www.myscheme.gov.in/js/schemes.js'
    ];

    for (const endpoint of endpoints) {
      try {
        console.log(`Trying endpoint: ${endpoint}`);
        const response = await axios.get(endpoint, {
          timeout: 10000,
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
          }
        });

        if (response.status === 200) {
          const schemes = this.parseSchemeData(response.data, endpoint);
          if (schemes.length > 0) {
            return schemes;
          }
        }
      } catch (error) {
        console.log(`Endpoint ${endpoint} failed: ${error.message}`);
      }
    }

    return [];
  }

  // Extract schemes from JavaScript data
  extractSchemesFromJavaScript($, htmlContent) {
    const schemes = [];
    
    try {
      // Look for JSON data in script tags
      $('script').each((i, script) => {
        const scriptContent = $(script).html();
        if (scriptContent) {
          // Look for scheme data patterns
          const jsonMatches = scriptContent.match(/schemes?\s*[:=]\s*(\[.*?\])/gi);
          if (jsonMatches) {
            jsonMatches.forEach(match => {
              try {
                const jsonStr = match.match(/\[.*?\]/)[0];
                const data = JSON.parse(jsonStr);
                if (Array.isArray(data)) {
                  data.forEach(item => {
                    if (item.name || item.title) {
                      schemes.push(this.createSchemeFromData(item));
                    }
                  });
                }
              } catch (e) {
                // Continue with next match
              }
            });
          }
        }
      });

      // Look for window.schemes or similar variables
      const windowMatches = htmlContent.match(/window\.schemes?\s*=\s*(\[.*?\])/gi);
      if (windowMatches) {
        windowMatches.forEach(match => {
          try {
            const jsonStr = match.match(/\[.*?\]/)[0];
            const data = JSON.parse(jsonStr);
            if (Array.isArray(data)) {
              data.forEach(item => {
                if (item.name || item.title) {
                  schemes.push(this.createSchemeFromData(item));
                }
              });
            }
          } catch (e) {
            // Continue with next match
          }
        });
      }

      } catch (error) {
      console.log('Error extracting from JavaScript:', error.message);
    }

    return schemes;
  }

  // Extract schemes using multiple selectors
  extractSchemesWithSelectors($) {
    const schemes = [];
    
    // Try multiple selectors to find schemes
    const selectors = [
      'a[href*="scheme"]',
      '.scheme-item',
      '.card',
      '.program-card',
      '[class*="scheme"]',
      '[class*="program"]',
      '.benefit-item',
      '.service-item',
      '.scheme-card',
      '.program-item',
      '[data-scheme]',
      '[data-program]'
    ];

    for (const selector of selectors) {
      $(selector).each((i, element) => {
        try {
          const $el = $(element);
          const name = $el.text().trim();
          const href = $el.attr('href');
          
          // Filter out navigation and non-scheme elements
          if (name && 
              name.length > 15 && 
              name.length < 200 &&
              !name.includes('Home') &&
              !name.includes('About') &&
              !name.includes('Contact') &&
              !name.includes('Login') &&
              !name.includes('Sign') &&
              !name.includes('Privacy') &&
              !name.includes('Terms')) {
            
            // Determine category based on content
            const category = this.determineSchemeCategory(name, $el);
            const keywords = this.extractKeywords(name, $el);
            
            schemes.push({
              id: this.slugify(name),
              name: name,
              shortName: this.toAcronym(name),
              category: category,
              description: this.generateDescription(name, category),
              status: 'Active',
              source: 'MyScheme Portal',
              url: href ? this.resolveUrl(href, 'https://www.myscheme.gov.in') : undefined,
              keywords: keywords,
              lastUpdated: new Date().toISOString()
            });
          }
        } catch (err) {
          // Continue with next element
        }
      });
      
      if (schemes.length > 0) {
        console.log(`Found ${schemes.length} schemes using selector: ${selector}`);
        break;
      }
    }

    return schemes;
  }

  // Extract hidden scheme data
  extractHiddenSchemeData($) {
    const schemes = [];
    
    try {
      // Look for data attributes
      $('[data-scheme], [data-program], [data-title]').each((i, element) => {
        const $el = $(element);
        const name = $el.attr('data-scheme') || $el.attr('data-program') || $el.attr('data-title');
        
        if (name && name.length > 10) {
          schemes.push({
            id: this.slugify(name),
            name: name,
            shortName: this.toAcronym(name),
            category: 'General',
            description: `Government scheme: ${name}`,
            status: 'Active',
            source: 'MyScheme Portal (Hidden Data)',
            keywords: this.extractKeywords(name, $el),
            lastUpdated: new Date().toISOString()
          });
        }
      });

      // Look for hidden divs with scheme info
      $('div[style*="display: none"], .hidden, [hidden]').each((i, element) => {
        const $el = $(element);
        const name = $el.text().trim();
        
        if (name && name.length > 15 && name.length < 200) {
          schemes.push({
            id: this.slugify(name),
            name: name,
            shortName: this.toAcronym(name),
            category: 'General',
            description: `Government scheme: ${name}`,
            status: 'Active',
            source: 'MyScheme Portal (Hidden Content)',
            keywords: this.extractKeywords(name, $el),
            lastUpdated: new Date().toISOString()
          });
        }
      });

    } catch (error) {
      console.log('Error extracting hidden data:', error.message);
    }

    return schemes;
  }

  // Parse scheme data from various formats
  parseSchemeData(data, source) {
    const schemes = [];
    
    try {
      if (typeof data === 'string') {
        // Try to parse as JSON
        try {
          const jsonData = JSON.parse(data);
          if (Array.isArray(jsonData)) {
            jsonData.forEach(item => {
              if (item.name || item.title) {
                schemes.push(this.createSchemeFromData(item));
              }
            });
          }
        } catch (e) {
          // Try to extract from JavaScript
          const matches = data.match(/schemes?\s*[:=]\s*(\[.*?\])/gi);
          if (matches) {
            matches.forEach(match => {
              try {
                const jsonStr = match.match(/\[.*?\]/)[0];
                const jsonData = JSON.parse(jsonStr);
                if (Array.isArray(jsonData)) {
                  jsonData.forEach(item => {
                    if (item.name || item.title) {
                      schemes.push(this.createSchemeFromData(item));
                    }
                  });
                }
              } catch (e) {
                // Continue with next match
              }
            });
          }
        }
      } else if (Array.isArray(data)) {
        data.forEach(item => {
          if (item.name || item.title) {
            schemes.push(this.createSchemeFromData(item));
          }
        });
      } else if (typeof data === 'object') {
        // Single object or object with schemes property
        if (data.schemes && Array.isArray(data.schemes)) {
          data.schemes.forEach(item => {
            if (item.name || item.title) {
              schemes.push(this.createSchemeFromData(item));
            }
          });
        } else if (data.name || data.title) {
          schemes.push(this.createSchemeFromData(data));
        }
      }
    } catch (error) {
      console.log('Error parsing scheme data:', error.message);
    }

    return schemes;
  }

  // Create scheme object from data
  createSchemeFromData(item) {
        return {
      id: this.slugify(item.name || item.title || item.id),
      name: item.name || item.title || 'Government Scheme',
      shortName: this.toAcronym(item.name || item.title),
      category: item.category || this.determineSchemeCategory(item.name || item.title),
      description: item.description || this.generateDescription(item.name || item.title, item.category),
      status: item.status || 'Active',
      source: 'MyScheme Portal (API)',
      url: item.url || item.link || item.href,
      keywords: item.keywords || this.extractKeywords(item.name || item.title),
      lastUpdated: new Date().toISOString()
    };
  }

  // Get detailed scheme information from MyScheme
  async getDetailedSchemeFromMyScheme(schemeId) {
    try {
      // Try to find the scheme in our scraped data first
      const schemes = await this.scrapeMySchemePortal();
      const scheme = schemes.find(s => s.id === schemeId);
      
      if (!scheme) return null;

      // Try to get more details from the scheme URL if available
      if (scheme.url) {
        try {
          const response = await axios.get(scheme.url, {
            timeout: 15000,
            headers: {
              'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
            }
          });

          if (response.status === 200) {
            const $ = cheerio.load(response.data);
            
            // Extract additional details from the scheme page
            const additionalDetails = this.extractSchemePageDetails($);
        
        return {
              ...scheme,
              ...additionalDetails
            };
          }
        } catch (detailError) {
          console.log('Failed to get detailed scheme info:', detailError.message);
        }
      }

      // Return enhanced scheme with generated details
      return this.enhanceSchemeWithDetails(scheme);
      
      } catch (error) {
      console.error('Error getting detailed scheme from MyScheme:', error.message);
      return null;
    }
  }

  // Extract additional details from scheme page
  extractSchemePageDetails($) {
    const details = {};
    
    try {
      // Try to find eligibility criteria
      const eligibilityText = $('p:contains("eligibility"), p:contains("eligible"), div:contains("eligibility")').text();
      if (eligibilityText) {
        details.eligibility = this.parseEligibilityText(eligibilityText);
      }

      // Try to find benefits
      const benefitsText = $('p:contains("benefit"), p:contains("advantage"), div:contains("benefit")').text();
      if (benefitsText) {
        details.benefits = this.parseBenefitsText(benefitsText);
      }

      // Try to find documents required
      const documentsText = $('p:contains("document"), p:contains("required"), div:contains("document")').text();
      if (documentsText) {
        details.documents = this.parseDocumentsText(documentsText);
      }

      // Try to find application process
      const processText = $('p:contains("process"), p:contains("apply"), div:contains("process")').text();
      if (processText) {
        details.applicationProcess = this.parseProcessText(processText);
      }

      // Try to find contact information
      const contactText = $('p:contains("contact"), p:contains("helpline"), div:contains("contact")').text();
      if (contactText) {
        details.contactInfo = this.parseContactText(contactText);
      }

    } catch (error) {
      console.log('Error extracting scheme page details:', error.message);
    }

    return details;
  }

  // Parse eligibility text into structured data
  parseEligibilityText(text) {
    const eligibility = {
      landOwnership: 'Check official portal',
      farmSize: 'Varies by scheme',
      incomeLimit: 'Check official portal',
      location: 'All India',
      cropType: 'Varies by scheme'
    };

    const textLower = text.toLowerCase();
    
    if (textLower.includes('land') || textLower.includes('property')) {
      eligibility.landOwnership = 'Land ownership required';
    }
    
    if (textLower.includes('income') || textLower.includes('salary')) {
      eligibility.incomeLimit = 'Income limit applies';
    }
    
    if (textLower.includes('farmer') || textLower.includes('agriculture')) {
      eligibility.cropType = 'Agricultural activities';
    }

    return eligibility;
  }

  // Parse benefits text
  parseBenefitsText(text) {
    const benefits = [
      'Financial assistance',
      'Technical support',
      'Training programs'
    ];

    const textLower = text.toLowerCase();
    
    if (textLower.includes('subsidy') || textLower.includes('grant')) {
      benefits.push('Subsidies and grants');
    }
    
    if (textLower.includes('loan') || textLower.includes('credit')) {
      benefits.push('Low-interest loans');
    }
    
    if (textLower.includes('insurance') || textLower.includes('coverage')) {
      benefits.push('Insurance coverage');
    }

    return benefits;
  }

  // Parse documents text
  parseDocumentsText(text) {
    const documents = [
      'Aadhaar card',
      'Land ownership documents'
    ];

    const textLower = text.toLowerCase();
    
    if (textLower.includes('income') || textLower.includes('salary')) {
      documents.push('Income certificate');
    }
    
    if (textLower.includes('bank') || textLower.includes('account')) {
      documents.push('Bank passbook');
    }
    
    if (textLower.includes('photo') || textLower.includes('picture')) {
      documents.push('Passport size photos');
    }

    return documents;
  }

  // Parse application process text
  parseProcessText(text) {
    const process = [
      'Visit official scheme portal',
      'Check eligibility criteria'
    ];

    const textLower = text.toLowerCase();
    
    if (textLower.includes('online') || textLower.includes('website')) {
      process.push('Apply online through portal');
    }
    
    if (textLower.includes('office') || textLower.includes('visit')) {
      process.push('Visit nearest government office');
    }
    
    if (textLower.includes('document') || textLower.includes('submit')) {
      process.push('Submit required documents');
    }

    return process;
  }

  // Parse contact information text
  parseContactText(text) {
    const contactInfo = {
      helpline: '1800-180-1551',
      website: 'https://www.myscheme.gov.in/',
      email: 'support@myscheme.gov.in'
    };

    const textLower = text.toLowerCase();
    
    // Try to extract phone numbers
    const phoneMatch = text.match(/(\d{3,4}[-.\s]?\d{3,4}[-.\s]?\d{4})/);
    if (phoneMatch) {
      contactInfo.helpline = phoneMatch[1];
    }
    
    // Try to extract email
    const emailMatch = text.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/);
    if (emailMatch) {
      contactInfo.email = emailMatch[0];
    }

    return contactInfo;
  }

  // Determine scheme category based on content
  determineSchemeCategory(name, $el) {
    const nameLower = name.toLowerCase();
    const textLower = $el.text().toLowerCase();
    
    if (nameLower.includes('kisan') || nameLower.includes('farmer') || nameLower.includes('income')) {
      return 'Income Support';
    }
    
    if (nameLower.includes('irrigation') || nameLower.includes('water') || nameLower.includes('sinchai')) {
      return 'Irrigation';
    }
    
    if (nameLower.includes('soil') || nameLower.includes('health') || nameLower.includes('fertilizer')) {
      return 'Soil Management';
    }
    
    if (nameLower.includes('equipment') || nameLower.includes('machine') || nameLower.includes('mechanization')) {
      return 'Equipment';
    }
    
    if (nameLower.includes('insurance') || nameLower.includes('bima') || nameLower.includes('coverage')) {
      return 'Insurance';
    }
    
    if (nameLower.includes('seed') || nameLower.includes('crop') || nameLower.includes('agriculture')) {
      return 'Agriculture';
    }
    
    return 'General';
  }

  // Extract keywords from scheme content
  extractKeywords(name, $el) {
    const keywords = [];
    const text = $el.text().toLowerCase();
    
    // Common agricultural keywords
    const commonKeywords = [
      'farmer', 'agriculture', 'crop', 'irrigation', 'soil', 'equipment',
      'subsidy', 'loan', 'insurance', 'training', 'support', 'assistance'
    ];
    
    commonKeywords.forEach(keyword => {
      if (text.includes(keyword)) {
        keywords.push(keyword);
      }
    });
    
    return keywords;
  }

  // Generate description based on scheme name and category
  generateDescription(name, category) {
    const descriptions = {
      'Income Support': `Government scheme providing financial assistance to farmers: ${name}`,
      'Irrigation': `Water management and irrigation support scheme: ${name}`,
      'Soil Management': `Soil health and fertility improvement scheme: ${name}`,
      'Equipment': `Farm mechanization and equipment subsidy scheme: ${name}`,
      'Insurance': `Crop and agricultural insurance scheme: ${name}`,
      'Agriculture': `Agricultural development and support scheme: ${name}`,
      'General': `Government scheme for farmers: ${name}`
    };
    
    return descriptions[category] || descriptions['General'];
  }

  // Resolve relative URLs to absolute URLs
  resolveUrl(href, baseUrl) {
    if (href.startsWith('http')) {
      return href;
    }
    
    if (href.startsWith('/')) {
      const url = new URL(baseUrl);
      return `${url.protocol}//${url.host}${href}`;
    }
    
    return `${baseUrl}/${href}`;
  }

  // Remove duplicate schemes
  removeDuplicates(schemes) {
    const seen = new Set();
    return schemes.filter(scheme => {
      const key = scheme.name.toLowerCase();
      if (seen.has(key)) {
        return false;
      }
      seen.add(key);
      return true;
    });
  }

  // Enhance scheme with additional details
  enhanceSchemeWithDetails(scheme) {
        return {
      ...scheme,
      eligibility: {
        landOwnership: 'Check official portal',
        farmSize: 'Varies by scheme',
        incomeLimit: 'Check official portal',
        location: 'All India',
        cropType: 'Varies by scheme'
      },
      benefits: [
        'Financial assistance',
        'Technical support',
        'Training programs',
        'Subsidies and grants'
      ],
      documents: [
        'Aadhaar card',
        'Land ownership documents',
        'Income certificate',
        'Bank passbook',
        'Passport size photos'
      ],
      applicationProcess: [
        'Visit official scheme portal',
        'Check eligibility criteria',
        'Submit required documents',
        'Follow application process',
        'Track application status'
      ],
      contactInfo: {
        helpline: '1800-180-1551',
        website: 'https://www.myscheme.gov.in/',
        email: 'support@myscheme.gov.in'
      },
      deadline: 'Ongoing',
      source: scheme.source || 'MyScheme Portal'
    };
  }

  // Fallback schemes - always reliable
  getFallbackSchemes() {
    return [
      {
        id: 'pm-kisan',
        name: 'PM-KISAN (Pradhan Mantri Kisan Samman Nidhi)',
        shortName: 'PM-KISAN',
        category: 'Income Support',
        description: 'Direct income support of ₹6,000 per year to eligible farmer families.',
        status: 'Active',
        source: 'Fallback Schemes',
        keywords: ['farmer', 'income', 'support', 'assistance'],
        lastUpdated: new Date().toISOString()
      },
      {
        id: 'pmksy',
        name: 'PM Krishi Sinchai Yojana',
        shortName: 'PMKSY',
        category: 'Irrigation',
        description: '50% subsidy on drip irrigation equipment for water conservation.',
        status: 'Active',
        source: 'Fallback Schemes',
        keywords: ['irrigation', 'water', 'equipment', 'subsidy'],
        lastUpdated: new Date().toISOString()
      },
      {
        id: 'soil-health',
        name: 'Soil Health Card Scheme',
        shortName: 'SHC',
        category: 'Soil Management',
        description: 'Free soil testing and personalized fertilizer recommendations.',
        status: 'Active',
        source: 'Fallback Schemes',
        keywords: ['soil', 'health', 'testing', 'fertilizer'],
        lastUpdated: new Date().toISOString()
      },
      {
        id: 'farm-mechanization',
        name: 'Farm Mechanization Subsidy',
        shortName: 'FMS',
        category: 'Equipment',
        description: '40% subsidy on farm equipment purchase to increase productivity.',
        status: 'Active',
        source: 'Fallback Schemes',
        keywords: ['equipment', 'mechanization', 'subsidy', 'productivity'],
        lastUpdated: new Date().toISOString()
      },
      {
        id: 'crop-insurance',
        name: 'PM Fasal Bima Yojana',
        shortName: 'PMFBY',
        category: 'Insurance',
        description: 'Comprehensive crop insurance coverage for farmers against natural calamities.',
        status: 'Active',
        source: 'Fallback Schemes',
        keywords: ['insurance', 'crop', 'coverage', 'calamities'],
        lastUpdated: new Date().toISOString()
      }
    ];
  }

  // Fallback scheme for details
  getFallbackScheme(schemeId) {
    const schemes = this.getFallbackSchemes();
    const scheme = schemes.find(s => s.id === schemeId);
    
    if (!scheme) {
      return {
        id: schemeId,
        name: 'Government Scheme',
        shortName: 'GS',
        category: 'General',
        description: 'Government scheme details. Please visit the official portal for more information.',
        status: 'Active',
        source: 'Fallback'
      };
    }

    return scheme;
  }

  // Utility methods
  toAcronym(name) {
    return String(name)
      .split(/\s+/)
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 8);
  }

  slugify(text) {
    return String(text).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
  }

  generateGenericApplicationTips(scheme) {
      const tips = [
        'Ensure all documents are properly attested',
        'Keep photocopies of all submitted documents',
        'Follow up with the office after submission',
        'Maintain records of all communications'
      ];
      
    if ((scheme.category || '').toLowerCase().includes('equipment')) {
        tips.push('Compare prices from multiple vendors before purchase');
        tips.push('Ensure equipment is from approved manufacturers list');
      }
      
    if ((scheme.category || '').toLowerCase().includes('irrigation')) {
        tips.push('Get technical consultation before installation');
        tips.push('Plan irrigation system based on crop requirements');
      }
      
      return tips;
    }
  }
  
  module.exports = new GovernmentSchemesService();