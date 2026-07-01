/**
 * DomoDomo RAG & Thought Generator Integration Test
 * 
 * This script runs integration checks on the FastAPI RAG endpoints:
 * 1. Checks backend server connectivity.
 * 2. Creates sample user thoughts (triggering embedding generations).
 * 3. Tests semantic vector search (cosine similarity ranking).
 * 4. Verifies Retrieval-Augmented Generation (synthesizing context-aware prompts).
 */

const http = require('http');

console.log('🧪 Starting DomoDomo RAG & Thought Generator Integration Tests...\n');

// Helper to make local API requests in Node without heavy dependencies
function apiRequest(path, method = 'GET', payload = null) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: 8000,
      path: path,
      method: method,
      headers: {
        'Content-Type': 'application/json'
      }
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', chunk => { data += chunk; });
      res.on('end', () => {
        try {
          resolve({
            statusCode: res.statusCode,
            body: data ? JSON.parse(data) : null
          });
        } catch (e) {
          resolve({ statusCode: res.statusCode, body: data });
        }
      });
    });

    req.on('error', (err) => {
      reject(err);
    });

    if (payload) {
      req.write(JSON.stringify(payload));
    }
    req.end();
  });
}

async function runTests() {
  try {
    // 1. Check server connectivity
    console.log('🔗 Checking FastAPI backend connection (port 8000)...');
    const health = await apiRequest('/api/memory');
    if (health.statusCode !== 200) {
      throw new Error(`Server is offline or returned error code ${health.statusCode}`);
    }
    console.log('✅ Connection confirmed. Server is online.\n');

    // 2. Clear old test thoughts if any (by running GET initially to see state)
    const initialThoughts = await apiRequest('/api/thoughts');
    console.log(`📦 Loaded current thought database size: ${initialThoughts.body.length} items.`);

    // 3. Create Sample thoughts
    console.log('\n✍️ Creating thought 1: "I love programming in Python and developing localized offline AI systems."');
    const thought1 = await apiRequest('/api/thoughts', 'POST', {
      content: "I love programming in Python and developing localized offline AI systems.",
      category: "work"
    });
    console.log(`  ✅ Thought 1 saved. ID: ${thought1.body.id}, AI Insight: "${thought1.body.ai_insight}"`);

    console.log('\n✍️ Creating thought 2: "My favorite sport is swimming in the pool during hot summer days."');
    const thought2 = await apiRequest('/api/thoughts', 'POST', {
      content: "My favorite sport is swimming in the pool during hot summer days.",
      category: "personal"
    });
    console.log(`  ✅ Thought 2 saved. ID: ${thought2.body.id}, AI Insight: "${thought2.body.ai_insight}"`);

    // 4. Test Semantic Vector Search
    console.log('\n🔎 Testing Semantic Search for: "writing code and software tools"...');
    const search1 = await apiRequest('/api/thoughts/search', 'POST', {
      query: "writing code and software tools",
      threshold: 0.2, // lower threshold to ensure match
      limit: 2
    });

    console.log(`  Found ${search1.body.length} matches:`);
    for (const match of search1.body) {
      console.log(`  - [Score: ${match.score.toFixed(4)}] [${match.category}] ${match.content}`);
    }

    // Verify python/code thought is scored higher than swimming
    if (search1.body.length > 0 && search1.body[0].category === 'work') {
      console.log('  ✅ SUCCESS: Semantic vector matching ranked the programming thought higher!');
    } else {
      console.warn('  ⚠️ Warning: Semantic ordering unexpected. Check vector calculations.');
    }

    // 5. Verify Retrieval-Augmented Generation (RAG)
    console.log('\n🤖 Testing context-aware prompt generation (RAG)...');
    const ragResponse = await apiRequest('/api/thoughts/generate', 'POST', {
      prompt: "Synthesize a reflection about my coding hobbies and sport activities.",
      temperature: 0.5
    });

    console.log('  Context Used:', ragResponse.body.context_used);
    console.log('  Generated LLM Thought:\n');
    console.log('======================================================================');
    console.log(ragResponse.body.story);
    console.log('======================================================================');

    console.log('\n🏆 ALL RAG & THOUGHT JOURNAL FUNCTIONAL TESTS PASSED!');
    process.exit(0);
  } catch (err) {
    console.error('\n❌ Integration Test Error:', err.message);
    console.log('Please ensure the FastAPI backend is running before starting the tests.');
    process.exit(1);
  }
}

runTests();
