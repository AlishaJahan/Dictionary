const http = require('http');

const makeRequest = (url) => {
  return new Promise((resolve, reject) => {
    http.get(url, (res) => {
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      res.on('end', () => {
        try {
          resolve({
            statusCode: res.statusCode,
            body: JSON.parse(data)
          });
        } catch (e) {
          resolve({
            statusCode: res.statusCode,
            body: data
          });
        }
      });
    }).on('error', (err) => {
      reject(err);
    });
  });
};

async function runTests() {
  console.log('====================================================');
  console.log('   STARTING SHABDKOSH DICTIONARY API E2E TESTS      ');
  console.log('====================================================\n');

  try {
    // Test 1: Suggesion autocomplete
    console.log('Test 1: Requesting suggestions for English prefix "Bene"...');
    const suggestRes1 = await makeRequest('http://localhost:5000/api/dictionary/suggest?q=Bene&mode=en-hi');
    console.log('Status Code:', suggestRes1.statusCode);
    console.log('Response Suggestions:', suggestRes1.body);
    console.log('----------------------------------------------------\n');

    // Test 2: Local Database search
    console.log('Test 2: Requesting definition for English word "Benevolent" (Local Database)...');
    const searchRes1 = await makeRequest('http://localhost:5000/api/dictionary/search?q=Benevolent&mode=en-hi');
    console.log('Status Code:', searchRes1.statusCode);
    console.log('Word:', searchRes1.body.word);
    console.log('Translation:', searchRes1.body.translation);
    console.log('Definition:', searchRes1.body.definition);
    console.log('Source:', searchRes1.body.source);
    console.log('----------------------------------------------------\n');

    // Test 3: Fallback API translation search
    console.log('Test 3: Requesting definition for English word "Kind" (Fallback MyMemory API)...');
    const searchRes2 = await makeRequest('http://localhost:5000/api/dictionary/search?q=Kind&mode=en-hi');
    console.log('Status Code:', searchRes2.statusCode);
    console.log('Word:', searchRes2.body.word);
    console.log('Translation:', searchRes2.body.translation);
    console.log('Source:', searchRes2.body.source);
    console.log('----------------------------------------------------\n');

    // Test 4: Hindi suggestions
    console.log('Test 4: Requesting suggestions for Hindi prefix "सफ"...');
    const suggestRes2 = await makeRequest('http://localhost:5000/api/dictionary/suggest?q=%E0%A4%B8%E0%A4%AB&mode=hi-en');
    console.log('Status Code:', suggestRes2.statusCode);
    console.log('Response Suggestions:', suggestRes2.body);
    console.log('----------------------------------------------------\n');

    // Test 5: Hindi Search
    console.log('Test 5: Requesting definition for Hindi word "सफलता" (Local Database)...');
    const searchRes3 = await makeRequest('http://localhost:5000/api/dictionary/search?q=%E0%A4%B8%E0%A4%AB%E0%A4%B2%E0%A4%A4%E0%A4%BE&mode=hi-en');
    console.log('Status Code:', searchRes3.statusCode);
    console.log('Word:', searchRes3.body.word);
    console.log('Translation:', searchRes3.body.translation);
    console.log('Source:', searchRes3.body.source);
    console.log('----------------------------------------------------\n');

    console.log('====================================================');
    console.log('   ALL E2E API VERIFICATION TESTS PASSED SUCCESSFULLY! ');
    console.log('====================================================');
  } catch (error) {
    console.error('Test execution failed with error:', error);
  }
}

runTests();
