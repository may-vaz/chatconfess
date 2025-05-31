// test_api.js - Run this with Node.js to test your API without a browser
// Usage: node test_api.js

const fetch = (...args) => import('node-fetch').then(({ default: fetch }) => fetch(...args));

const API_URL = 'http://localhost:3000/api/chat';
const TEST_MESSAGE = 'Hello, this is a test message';
const TEST_MODE = 'Supportive Friend';

async function testApiConnection() {
    console.log('Testing basic API connection...');
    try {
        const response = await fetch('http://localhost:3000/api/test');
        const data = await response.json();
        console.log('✅ Basic API connection successful:', data);
        return true;
    } catch (error) {
        console.error('❌ Basic API connection failed:', error.message);
        console.log('Make sure your server is running with "node server.js"');
        return false;
    }
}

async function testChatEndpoint() {
    console.log('\nTesting /api/chat endpoint...');
    try {
        console.log(`Sending test message: "${TEST_MESSAGE}"`);
        console.log(`Using test mode: "${TEST_MODE}"`);
        
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                message: TEST_MESSAGE,
                mode: TEST_MODE
            }),
        });
        
        console.log('Response status:', response.status);
        
        if (!response.ok) {
            console.error(`❌ Server returned ${response.status}: ${response.statusText}`);
            try {
                const errorText = await response.text();
                console.log('Response body:', errorText);
            } catch (e) {
                console.log('Could not read response body');
            }
            return false;
        }
        
        const data = await response.json();
        console.log('✅ Chat API response received:');
        console.log(data);
        return true;
    } catch (error) {
        console.error('❌ Chat API test failed:', error.message);
        return false;
    }
}

async function runTests() {
    console.log('🔍 API TESTING TOOL 🔍');
    console.log('======================');
    
    const basicConnectionSuccess = await testApiConnection();
    if (!basicConnectionSuccess) {
        console.log('\n❌ Basic API connection test failed. Stopping tests.');
        return;
    }
    
    const chatEndpointSuccess = await testChatEndpoint();
    
    console.log('\n======================');
    console.log('TEST RESULTS SUMMARY:');
    console.log(`Basic API Connection: ${basicConnectionSuccess ? '✅ PASS' : '❌ FAIL'}`);
    console.log(`Chat Endpoint: ${chatEndpointSuccess ? '✅ PASS' : '❌ FAIL'}`);
    
    if (!chatEndpointSuccess) {
        console.log('\nTROUBLESHOOTING TIPS:');
        console.log('1. Check if your OpenRouter API key is correctly set in the .env file');
        console.log('2. Make sure your server.js has the correct /api/chat route defined');
        console.log('3. Check server logs for more detailed error information');
    }
}

runTests();