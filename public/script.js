// Enhanced script.js with chat history functionality
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM fully loaded');
    
    const sendButton = document.getElementById('sendButton');
    const userInput = document.getElementById('userInput');
    const aiResponse = document.getElementById('aiResponse');
    
    console.log('Elements found:', {
        sendButton: !!sendButton,
        userInput: !!userInput,
        aiResponse: !!aiResponse
    });

    // Get the mode buttons
    const supportiveMode = document.getElementById('supportiveMode');
    const bluntMode = document.getElementById('bluntMode');
    const mentorMode = document.getElementById('mentorMode');

    console.log('Mode buttons found:', {
        supportiveMode: !!supportiveMode,
        bluntMode: !!bluntMode,
        mentorMode: !!mentorMode
    });

    // Track the current active mode
    let currentMode = "Supportive Friend";
    
    // Store conversation history
    let chatHistory = [];

    // Add event listeners to mode buttons
    supportiveMode.addEventListener('click', () => setActiveMode(supportiveMode, "Supportive Friend"));
    bluntMode.addEventListener('click', () => setActiveMode(bluntMode, "Blunt Karen"));
    mentorMode.addEventListener('click', () => setActiveMode(mentorMode, "Wise Mentor"));

    // Function to set active mode
    function setActiveMode(button, mode) {
        console.log(`Setting active mode to: ${mode}`);
        
        // Remove active class from all buttons
        supportiveMode.classList.remove('active');
        bluntMode.classList.remove('active');
        mentorMode.classList.remove('active');
        
        // Add active class to selected button
        button.classList.add('active');
        
        // Update current mode
        currentMode = mode;
        console.log(`Mode changed to: ${mode}`);
    }

    // Add event listener to send button
    sendButton.addEventListener('click', () => {
        console.log('Send button clicked');
        sendMessage();
    });

    // Also send message when pressing Enter (but not with Shift+Enter)
    userInput.addEventListener('keydown', (event) => {
        if (event.key === 'Enter' && !event.shiftKey) {
            console.log('Enter key pressed (without shift)');
            event.preventDefault();
            sendMessage();
        }
    });

    // Test the API right away
    console.log('Testing API connection...');
    fetch('/api/test')
        .then(response => {
            console.log('API test response status:', response.status);
            return response.json();
        })
        .then(data => {
            console.log('API test successful:', data);
            // Clear the placeholder to start with an empty response box
            aiResponse.innerHTML = '';
        })
        .catch(error => {
            console.error('API test failed:', error);
            aiResponse.innerHTML = '<p class="response-placeholder">⚠️ API connection failed. Please check server.</p>';
        });

    function sendMessage() {
        const userMessage = userInput.value;
        console.log(`Preparing to send message: "${userMessage}"`);
        
        if (userMessage.trim() === '') {
            console.log('Message is empty, not sending');
            return;
        }

        // Add user message to chat history
        chatHistory.push({ role: 'user', content: userMessage });

        // Show loading indicator with Gen-Z language
        aiResponse.innerHTML = '<p>vibing with your thoughts...</p>';
        
        // Clear the textarea
        userInput.value = '';

        // Map UI friendly names to system prompts
        const modePrompts = {
            "Supportive Friend": "You are a supportive Gen-Z best friend who always validates feelings and offers encouragement. Use casual gen-z language and slang appropriately. Be warm, empathetic and positive. IMPORTANT: Keep track of the conversation context and remember what the user has previously said.",
            "Blunt Karen": "You are a blunt, no-nonsense middle-aged person who tells hard truths without sugar-coating. You're a little mean. Use direct language and give honest feedback without coddling. IMPORTANT: Keep track of the conversation context and remember what the user has previously said.",
            "Wise Mentor": "You are a wise, experienced mentor who offers thoughtful guidance and perspective. Speak calmly and with depth, give real world examples while answering. IMPORTANT: Keep track of the conversation context and remember what the user has previously said."
        };

        console.log(`Making fetch request to /api/chat with mode: "${currentMode}"`);
        console.log(`Using full URL: ${window.location.origin}/api/chat`);

        // Prepare messages array with system prompt and chat history
        const messages = [
            { role: 'system', content: modePrompts[currentMode] },
            ...chatHistory.slice(-10) // Send up to last 10 messages for context
        ];

        // Send the user message to the server using the full path
        fetch('/api/chat', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                message: userMessage,
                mode: modePrompts[currentMode],
                history: chatHistory.slice(0, -1) // Send previous messages as history
            }),
        })
        .then(response => {
            console.log('Response status:', response.status);
            console.log('Response headers:', [...response.headers].map(h => `${h[0]}: ${h[1]}`).join(', '));
            
            // First check if we got a successful response
            if (!response.ok) {
                throw new Error(`Server returned ${response.status}: ${response.statusText}`);
            }
            
            // Try to parse the response as JSON
            return response.json().catch(e => {
                console.error("Failed to parse JSON:", e);
                // Log the actual text response for debugging
                return response.text().then(text => {
                    console.error("Raw response text:", text);
                    throw new Error("Failed to parse server response as JSON");
                });
            });
        })
        .then(data => {
            console.log('Response received:', data);
            // Display AI's response
            if (data.reply) {
                aiResponse.innerHTML = data.reply;
                // Add AI response to chat history
                chatHistory.push({ role: 'assistant', content: data.reply });
            } else if (data.error) {
                aiResponse.innerHTML = `Error: ${data.error}`;
                console.error('API returned an error:', data.error);
            } else {
                aiResponse.innerHTML = 'Received an empty response from the server.';
            }
        })
        .catch(error => {
            console.error('Error getting AI response:', error);
            aiResponse.innerHTML = 'Something went wrong 😢 Please try again. Error: ' + error.message;
        });
    }
});