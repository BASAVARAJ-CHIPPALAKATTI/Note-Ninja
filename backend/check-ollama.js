const axios = require('axios');

async function checkOllama() {
  console.log('🔍 Checking Ollama connection...');
  console.log('----------------------------------------');
  
  const hosts = [
    'http://127.0.0.1:11434',
    'http://localhost:11434'
  ];

  let success = false;

  for (const host of hosts) {
    try {
      console.log(`🌐 Trying ${host}...`);
      const response = await axios.get(`${host}/api/tags`, { 
        timeout: 3000 
      });
      
      console.log(`✅ SUCCESS: Connected to ${host}`);
      console.log('📦 Available models:', response.data.models ? response.data.models.map(m => m.name) : 'Unknown');
      success = true;
      
      // Test if models are loaded
      if (response.data.models && response.data.models.length > 0) {
        console.log('🎯 Models are loaded and ready');
      } else {
        console.log('⚠️  No models found. Run: ollama pull mistral');
      }
      break;
      
    } catch (error) {
      console.log(`❌ FAILED: ${host} - ${error.message}`);
    }
    console.log('---');
  }

  return success;
}

async function testQuickAI() {
  console.log('\n⚡ Testing AI with quick prompt...');
  console.log('----------------------------------------');
  
  try {
    // Very quick test with tiny prompt
    const response = await axios.post('http://127.0.0.1:11434/api/generate', {
      model: 'mistral',
      prompt: 'OK', // Super short prompt
      stream: false,
      options: {
        num_predict: 3, // Very short response
        temperature: 0.1
      }
    }, {
      timeout: 8000 // 8 seconds
    });

    console.log('✅ AI Quick Test: SUCCESS');
    console.log('Response:', response.data.response);
    return true;
    
  } catch (error) {
    console.log('❌ AI Quick Test: FAILED');
    console.log('Error:', error.message);
    
    if (error.code === 'ETIMEDOUT') {
      console.log('💡 The model is taking too long. Try pulling a smaller model:');
      console.log('   ollama pull llama2'); // Smaller, faster model
    }
    
    return false;
  }
}

async function testSmallerModel() {
  console.log('\n🦙 Testing with smaller model suggestion...');
  console.log('----------------------------------------');
  
  try {
    // Try to see what models are available
    const models = await axios.get('http://127.0.0.1:11434/api/tags', { 
      timeout: 3000 
    });

    const availableModels = models.data.models || [];
    console.log('Available models:', availableModels.map(m => m.name));
    
    // Try a different model if available
    for (const model of availableModels) {
      if (model.name !== 'mistral') {
        console.log(`Trying ${model.name}...`);
        try {
          const response = await axios.post('http://127.0.0.1:11434/api/generate', {
            model: model.name,
            prompt: 'Hello',
            stream: false,
            options: {
              num_predict: 5,
              temperature: 0.1
            }
          }, {
            timeout: 5000
          });
          
          console.log(`✅ ${model.name} works:`, response.data.response);
          return true;
        } catch (modelError) {
          console.log(`❌ ${model.name} failed:`, modelError.message);
        }
      }
    }
    
  } catch (error) {
    console.log('Could not check available models:', error.message);
  }
  
  return false;
}

async function main() {
  console.log('🚀 Ollama Connection Diagnostic Tool');
  console.log('========================================\n');
  
  const isConnected = await checkOllama();
  
  if (!isConnected) {
    console.log('\n❌ Ollama is not running. Please start it:');
    console.log('1. Open a NEW Command Prompt window');
    console.log('2. Run: ollama serve');
    console.log('3. Wait for "Listening on [::]:11434" message');
    console.log('4. Run this test again');
    return;
  }

  console.log('\n✅ Ollama is running! Testing AI...');
  
  const aiWorks = await testQuickAI();
  
  if (!aiWorks) {
    console.log('\n⚠️  Mistral model is too slow. Trying smaller models...');
    await testSmallerModel();
    
    console.log('\n💡 Recommendations:');
    console.log('1. Pull a smaller model: ollama pull llama2');
    console.log('2. Or use the keyword-based search in your app');
    console.log('3. Make sure you have enough RAM (Mistral needs ~4GB)');
  } else {
    console.log('\n🎉 Everything is working! Your app should work now.');
  }
}

// Run the diagnostic
main().catch(console.error);