const axios = require('axios');
const cheerio = require('cheerio');

class AgmarknetService {
  constructor() {
    this.baseUrl = 'https://agmarknet.gov.in';
    this.searchUrl = 'https://agmarknet.gov.in/SearchCmmMkt.aspx';
  }

  async getMarketPrices(commodity, state, market) {
    try {
      console.log(`🔍 Fetching prices for ${commodity} in ${market}, ${state}`);
      
      // First, get the session and viewstate
      const sessionResponse = await axios.get(this.searchUrl);
      const $ = cheerio.load(sessionResponse.data);
      
      const viewState = $('input[name="__VIEWSTATE"]').val();
      const viewStateGenerator = $('input[name="__VIEWSTATEGENERATOR"]').val();
      const eventValidation = $('input[name="__EVENTVALIDATION"]').val();

      // Prepare form data for search
      const formData = new URLSearchParams();
      formData.append('__VIEWSTATE', viewState);
      formData.append('__VIEWSTATEGENERATOR', viewStateGenerator);
      formData.append('__EVENTVALIDATION', eventValidation);
      formData.append('ctl00$cphBody$cboCommodity', commodity);
      formData.append('ctl00$cphBody$cboState', state);
      formData.append('ctl00$cphBody$cboMkt', market);
      formData.append('ctl00$cphBody$btnSubmit', 'Submit');

      // Submit the search form
      const searchResponse = await axios.post(this.searchUrl, formData, {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }
      });

      // Parse the results
      const $results = cheerio.load(searchResponse.data);
      const results = [];

      $results('#cphBody_GridView1 tr').each((index, element) => {
        if (index === 0) return; // Skip header row
        
        const cells = $results(element).find('td');
        if (cells.length >= 6) {
          const row = {
            'S.No': $results(cells[0]).text().trim(),
            'City': $results(cells[1]).text().trim(),
            'Commodity': $results(cells[2]).text().trim(),
            'Min Prize': $results(cells[3]).text().trim(),
            'Max Prize': $results(cells[4]).text().trim(),
            'Model Prize': $results(cells[5]).text().trim(),
            'Date': $results(cells[6]).text().trim()
          };
          results.push(row);
        }
      });

      return results;

    } catch (error) {
      console.error('❌ Error fetching Agmarknet data:', error.message);
      
      // Return mock data as fallback
      return this.getMockAgmarknetData(commodity, state, market);
    }
  }

  getMockAgmarknetData(commodity, state, market) {
    console.log(`🔄 Using mock data for ${commodity} in ${market}, ${state}`);
    
    const basePrice = this.getBasePrice(commodity);
    const today = new Date();
    
    return [
      {
        'S.No': '1',
        'City': market,
        'Commodity': commodity,
        'Min Prize': (basePrice * 0.9).toFixed(0),
        'Max Prize': (basePrice * 1.1).toFixed(0),
        'Model Prize': basePrice.toString(),
        'Date': today.toLocaleDateString('en-IN')
      },
      {
        'S.No': '2',
        'City': market,
        'Commodity': commodity,
        'Min Prize': (basePrice * 0.85).toFixed(0),
        'Max Prize': (basePrice * 1.05).toFixed(0),
        'Model Prize': (basePrice * 0.95).toString(),
        'Date': new Date(today.getTime() - 24*60*60*1000).toLocaleDateString('en-IN')
      }
    ];
  }

  getBasePrice(commodity) {
    const prices = {
      'Potato': 1600,
      'Tomato': 2000,
      'Onion': 1500,
      'Rice': 3000,
      'Wheat': 2500,
      'Sugarcane': 350,
      'Cotton': 6000,
      'Soybean': 4500,
      'Maize': 1800,
      'Pulses': 8000
    };
    return prices[commodity] || 2000;
  }

  async getAvailableCommodities() {
    return [
      'Potato', 'Tomato', 'Onion', 'Rice', 'Wheat', 
      'Sugarcane', 'Cotton', 'Soybean', 'Maize', 'Pulses'
    ];
  }

  async getAvailableStates() {
    return [
      'Karnataka', 'Maharashtra', 'Tamil Nadu', 'Andhra Pradesh',
      'Telangana', 'Kerala', 'Gujarat', 'Rajasthan', 'Madhya Pradesh',
      'Uttar Pradesh', 'Bihar', 'West Bengal', 'Odisha', 'Assam'
    ];
  }

  async getAvailableMarkets(state) {
    const markets = {
      'Karnataka': ['Bangalore', 'Mysore', 'Hubli', 'Mangalore'],
      'Maharashtra': ['Mumbai', 'Pune', 'Nagpur', 'Aurangabad'],
      'Tamil Nadu': ['Chennai', 'Coimbatore', 'Madurai', 'Salem'],
      'Andhra Pradesh': ['Hyderabad', 'Vijayawada', 'Guntur', 'Visakhapatnam'],
      'Telangana': ['Hyderabad', 'Warangal', 'Karimnagar', 'Nizamabad']
    };
    return markets[state] || ['Default Market'];
  }
}

module.exports = new AgmarknetService();
