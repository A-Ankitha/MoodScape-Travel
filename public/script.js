document.addEventListener('DOMContentLoaded', () => {
    // === DOM Elements ===
    const chatWindow = document.getElementById('chat-window');
    const messageInput = document.getElementById('message-input');
    const sendButton = document.getElementById('send-button');
    const moodSelector = document.getElementById('mood-selector');
    const typingIndicator = document.getElementById('typing-indicator');
    const animationCanvas = document.getElementById('animation-canvas');
    const newChatBtn = document.getElementById('new-chat-btn');

    let chatHistory = [];
    let animationInterval = null; 
    let userLocation = null;
    let currentChatController = null;

    // === Event Listeners ===
    newChatBtn.addEventListener('click', startNewChat);
    sendButton.addEventListener('click', handleUserInput);
    messageInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') { e.preventDefault(); handleUserInput(); }
    });
    document.querySelectorAll('.mood-choice').forEach(btn => {
        btn.addEventListener('click', () => {
            const mood = btn.dataset.mood;
            handleMoodClick(mood, btn.innerText);
        });
    });

    startNewChat(); // Initialize first chat on load

    // === Core Functions ===
    function startNewChat() {
        if (currentChatController) {
            currentChatController.abort();
            console.log('API request cancelled due to new chat.');
        }

        chatHistory = [];
        chatWindow.innerHTML = '';
        moodSelector.style.display = 'block';
        requestUserLocation();
        displayMessage('model', 'Hello! 👋 I\'m MoodScape. How are you feeling today?');
        setMoodTheme('default');
    }

    function handleUserInput() {
        const userMessage = messageInput.value.trim();
        if (!userMessage) return;
        displayMessage('user', userMessage);
        chatHistory.push({ role: 'user', parts: [{ text: userMessage }] });
        messageInput.value = '';
        moodSelector.style.display = 'none';
        callBackendAPI();
    }
    
    function handleMoodClick(mood, moodText) {
        setMoodTheme(mood);
        const moodMessage = `I'm feeling ${moodText.replace(/^[^\w]*/, '').trim()}!`;
        displayMessage('user', moodMessage);
        chatHistory.push({ role: 'user', parts: [{ text: moodMessage }] });
        moodSelector.style.display = 'none';
        callBackendAPI();
    }

    function requestUserLocation() {
        if ('geolocation' in navigator) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    userLocation = {
                        lat: position.coords.latitude,
                        lon: position.coords.longitude
                    };
                },
                (error) => {
                    console.warn('Could not get location:', error.message);
                }
            );
        }
    }

    // === Display Messages with string safety (MODIFIED) ===
    function displayMessage(role, textOrParts, sources = []) {
        // If textOrParts is an object with 'parts', join all texts
        let text = '';
        if (typeof textOrParts === 'string') {
            text = textOrParts;
        } else if (Array.isArray(textOrParts?.parts)) {
            text = textOrParts.parts.map(p => p.text).join('\n');
        } else {
            text = JSON.stringify(textOrParts); // fallback
        }

        const messageWrapper = document.createElement('div');
        messageWrapper.classList.add('flex', 'flex-col');

        const messageDiv = document.createElement('div');
        messageDiv.classList.add('chat-bubble', 'max-w-md', 'p-3', 'rounded-xl', 'shadow');

        // **REFINED MARKDOWN -> HTML CONVERSION**
        let content = text
            // 1. Remove Headers (##, #) but keep the text bolded
            .replace(/^#+\s*(.*)$/gm, '<strong>$1</strong>')
            // 2. Strong/Bold
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
            // 3. Emphasis/Italics
            .replace(/\*(.*?)\*/g, '<em>$1</em>');
            
        // 4. Handle Lists: Convert "- Place Name: Description" to <li>
        const listRegex = /^\s*- (.*)/gm;
        
        let listItems = content.match(listRegex);
        
        if (listItems) {
            // Replace list items with <li>, preserving content
            content = content.replace(listRegex, '<li class="ml-4 list-disc">$1</li>');
            
            // Simple logic to wrap blocks of <li> tags in a <ul>
            // This prevents wrapping everything if there are paragraphs between lists
            content = content.split('\n').map(line => {
                if (line.trim().startsWith('<li')) {
                    // This is an over-simplification but generally works for chat output
                    return line;
                }
                return `</p><p>${line}</p>`; 
            }).join('').replace(/<p><\/p>/g, ''); // Remove empty paragraphs

            // Wrap contiguous <li> blocks with <ul>
            content = content.replace(/(<li.*<\/li>(\s*<li.*<\/li>)*)/g, '<ul class="space-y-1 my-2">$1</ul>');
            
            // Remove remaining <br> or newlines within the list, and fix wrapping
            content = content.replace(/<\/li>\s*<ul/g, '</li><ul');
            content = content.replace(/<\/ul><ul/g, '</ul><ul');
            
            // Remove any trailing <p> or <br> tags around lists
            content = content.replace(/<p>/g, '').replace(/<\/p>/g, '');
        }
        
        // 5. Replace remaining newlines with <br> (for paragraphs)
        content = content.replace(/\n/g, '<br>');

        messageDiv.innerHTML = content;

        if (role === 'user') {
            messageDiv.classList.add('user-bubble', 'text-white', 'self-end', 'rounded-br-none');
        } else {
            messageDiv.classList.add('bg-slate-200', 'text-slate-800', 'self-start', 'rounded-bl-none');
        }

        messageWrapper.appendChild(messageDiv);

        if (sources.length > 0) {
            const sourcesDiv = document.createElement('div');
            sourcesDiv.classList.add('mt-2', 'p-2', 'max-w-md', 'bg-white/50', 'rounded-lg', 'border', 'border-slate-200', 'self-start');
            let sourcesHtml = '<h4 class="text-xs font-semibold text-slate-600 mb-1">Sources:</h4><ul class="space-y-1">';
            sources.forEach((source, index) => {
                sourcesHtml += `<li class="text-xs text-blue-600 truncate">
                    <a href="${source.uri}" target="_blank" rel="noopener noreferrer" class="hover:underline">
                        ${index + 1}. ${source.title}
                    </a>
                </li>`;
            });
            sourcesHtml += '</ul>';
            sourcesDiv.innerHTML = sourcesHtml;
            messageWrapper.appendChild(sourcesDiv);
        }

        chatWindow.appendChild(messageWrapper);
        chatWindow.scrollTop = chatWindow.scrollHeight;
    }
    
    function showTypingIndicator() {
        typingIndicator.style.display = 'block';
    }
    function hideTypingIndicator() {
        typingIndicator.style.display = 'none';
    }
    
    // === Backend Call with Error Handling ===
    async function callBackendAPI() {
        showTypingIndicator();
        currentChatController = new AbortController();
        const signal = currentChatController.signal;

        try {
            const response = await fetch('http://localhost:3000/api/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ chatHistory, location: userLocation }),
                signal: signal 
            });

            if (!response.ok) {
                const err = await response.json().catch(() => ({ error: response.statusText }));
                throw new Error(err.error || 'Server error');
            }

            const data = await response.json();
            const { botText, sources } = data;

            hideTypingIndicator();
            displayMessage('model', botText, sources);
            chatHistory.push({ role: 'model', parts: [{ text: botText }] });

        } catch (error) {
            if (error.name === 'AbortError') {
                console.log('Fetch request was aborted successfully.');
                return;
            }
            hideTypingIndicator();
            displayMessage('model', `Oh no! I had trouble connecting: ${error.message}`);
        } finally {
            currentChatController = null; 
        }
    }

    // === UI & Animation Functions ===
    function clearAnimations() {
        if (animationInterval) clearInterval(animationInterval);
        animationInterval = null;
        animationCanvas.innerHTML = '';
        animationCanvas.className = '';
    }

    function setMoodTheme(mood) {
        clearAnimations();
        document.body.className = document.body.className.replace(/\bmood-\S+/g, '');
        if (mood && mood !== 'default') {
            document.body.classList.add(`mood-${mood}`);
            switch (mood) {
                case 'romantic': animationCanvas.classList.add('bg-romantic'); animationInterval = setInterval(createFallingHeart, 400); break;
                case 'relaxed': createSparkles(100); break;
                case 'adventurous': createFlyingPlane(); break;
                case 'curious': createFloatingOrbs(30); break;
                case 'budget-friendly': animationInterval = setInterval(createFallingCoin, 500); break;
            }
        }
    }

    function createFallingHeart() {
        const heart = document.createElement('div');
        heart.classList.add('heart');
        heart.innerText = ['❤️','💖','💕'][Math.floor(Math.random()*3)];
        heart.style.left = `${Math.random()*100}vw`;
        heart.style.animationDuration = `${Math.random()*5 + 7}s`;
        heart.style.fontSize = `${Math.random()*16 + 10}px`;
        animationCanvas.appendChild(heart);
        setTimeout(() => heart.remove(), 12000);
    }

    function createSparkles(count) {
        for (let i = 0; i < count; i++) {
            const sparkle = document.createElement('div');
            sparkle.classList.add('sparkle');
            sparkle.style.setProperty('--start-x', `${Math.random()*100}vw`);
            sparkle.style.setProperty('--start-y', `${Math.random()*100}vh`);
            sparkle.style.setProperty('--end-x', `${Math.random()*100}vw`);
            sparkle.style.setProperty('--end-y', `${Math.random()*100}vh`);
            sparkle.style.animationDuration = `${5 + Math.random()*10}s`;
            sparkle.style.animationDelay = `${Math.random()*15}s`;
            sparkle.style.opacity = 0.6 + Math.random()*0.4;
            sparkle.style.width = sparkle.style.height = `${2 + Math.random()*4}px`;
            sparkle.style.boxShadow = `0 0 6px rgba(255,255,255,0.8)`;
            animationCanvas.appendChild(sparkle);
        }
    }

    function createFlyingPlane() {
        const plane = document.createElement('div');
        plane.classList.add('plane');
        plane.style.left = '0';
        plane.style.bottom = '0';
        // Note: The animation keyframes in style.css handle the initial transform/rotation and movement
        plane.style.animation = 'flyPlane 10s linear forwards';
        animationCanvas.appendChild(plane);
        setTimeout(() => plane.remove(), 10000);
    }

    function createFloatingOrbs(count) {
        for (let i = 0; i < count; i++) {
            const orb = document.createElement('div');
            orb.classList.add('orb');
            const size = Math.random()*80 + 20;
            orb.style.width = orb.style.height = `${size}px`;
            orb.style.left = `${Math.random()*100}vw`;
            orb.style.animationDuration = `${Math.random()*20 + 15}s`;
            orb.style.animationDelay = `${Math.random()*10}s`;
            animationCanvas.appendChild(orb);
        }
    }

    function createFallingCoin() {
        const coin = document.createElement('div');
        coin.classList.add('coin');
        coin.innerText = ['🪙','💰','✨'][Math.floor(Math.random()*3)];
        coin.style.left = `${Math.random()*100}vw`;
        coin.style.animationDuration = `${Math.random()*4 + 6}s`;
        coin.style.fontSize = `${Math.random()*10 + 15}px`;
        animationCanvas.appendChild(coin);
        setTimeout(() => coin.remove(), 10000);
    }
});