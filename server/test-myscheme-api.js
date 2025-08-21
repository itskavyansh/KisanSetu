const governmentSchemesService = require('./src/services/governmentSchemesService');

async function testMySchemeAPI() {
  console.log('🚀 Testing MyScheme API Integration...\n');
  
  try {
    // Test 1: Search for farmer schemes
    console.log('📋 Test 1: Searching for "farmer" schemes...');
    const farmerResults = await governmentSchemesService.searchSchemes('farmer', {}, 1);
    console.log(`✅ Found ${farmerResults.data.schemes.length} schemes`);
    console.log(`📊 Total: ${farmerResults.data.pagination.totalResults}, Pages: ${farmerResults.data.pagination.totalPages}\n`);
    
    // Test 2: Search for crop schemes
    console.log('📋 Test 2: Searching for "crop" schemes...');
    const cropResults = await governmentSchemesService.searchSchemes('crop', {}, 1);
    console.log(`✅ Found ${cropResults.data.schemes.length} schemes`);
    console.log(`📊 Total: ${cropResults.data.pagination.totalResults}, Pages: ${cropResults.data.pagination.totalPages}\n`);
    
    // Test 3: Search for agriculture schemes
    console.log('📋 Test 3: Searching for "agriculture" schemes...');
    const agriResults = await governmentSchemesService.searchSchemes('agriculture', {}, 1);
    console.log(`✅ Found ${agriResults.data.pagination.totalResults} schemes`);
    console.log(`📊 Total: ${agriResults.data.pagination.totalResults}, Pages: ${agriResults.data.pagination.totalPages}\n`);
    
    // Test 4: Get details of first scheme
    if (farmerResults.data.schemes.length > 0) {
      const firstScheme = farmerResults.data.schemes[0];
      console.log(`📋 Test 4: Getting details for "${firstScheme.name}"...`);
      const details = await governmentSchemesService.getSchemeDetails(firstScheme.id);
      if (details.success) {
        console.log('✅ Scheme details retrieved successfully');
        console.log(`📝 Description: ${details.data.description}`);
        if (details.data.eligibility) {
          console.log(`👥 Eligibility: ${JSON.stringify(details.data.eligibility, null, 2)}`);
        }
        if (details.data.benefits) {
          console.log(`💰 Benefits: ${JSON.stringify(details.data.benefits, null, 2)}`);
        }
      } else {
        console.log('❌ Failed to get scheme details:', details.error);
      }
    }
    
    // Test 5: Test pagination
    console.log('\n📋 Test 5: Testing pagination...');
    if (farmerResults.data.pagination.totalPages > 1) {
      const page2Results = await governmentSchemesService.searchSchemes('farmer', {}, 2);
      console.log(`✅ Page 2: ${page2Results.data.schemes.length} schemes`);
      console.log(`📊 Current Page: ${page2Results.data.pagination.currentPage}`);
    } else {
      console.log('ℹ️ Only one page available, skipping pagination test');
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

// Run the test
testMySchemeAPI();
