<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Ephemeral Geo-Note</title>
    
    <style>
        @import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@400;700&family=Roboto:wght@300;400&display=swap');

        :root {
            --color-bg: #0d1117;
            --color-primary: #00ff9d;
            --color-secondary: #0a2f35;
            --color-text: #c9d1d9;
            --color-border: rgba(0, 255, 157, 0.2);
            --font-primary: 'Orbitron', sans-serif;
            --font-secondary: 'Roboto', sans-serif;
        }

        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        body {
            font-family: var(--font-secondary);
            background-color: var(--color-bg);
            color: var(--color-text);
            display: grid;
            place-items: center;
            min-height: 100vh;
            padding: 1rem;
            overflow: hidden;
            background-image: 
                radial-gradient(circle at 1px 1px, rgba(0, 255, 157, 0.1) 1px, transparent 0),
                radial-gradient(circle at 10px 10px, rgba(0, 255, 157, 0.05) 1px, transparent 0);
            background-size: 20px 20px;
        }

        .geo-container {
            width: 100%;
            max-width: 450px;
            background: rgba(13, 17, 23, 0.8);
            backdrop-filter: blur(10px);
            border: 1px solid var(--color-border);
            border-radius: 15px;
            box-shadow: 0 0 40px rgba(0, 255, 157, 0.1);
            padding: 2rem;
            text-align: center;
        }

        h1 {
            font-family: var(--font-primary);
            color: var(--color-primary);
            font-size: 2rem;
            margin-bottom: 0.5rem;
            letter-spacing: 1px;
            text-shadow: 0 0 10px var(--color-primary);
        }

        .subtitle {
            font-size: 0.9rem;
            color: var(--color-text);
            margin-bottom: 2rem;
        }

        .note-input {
            width: 100%;
            height: 100px;
            background: var(--color-secondary);
            border: 1px solid var(--color-border);
            border-radius: 8px;
            padding: 1rem;
            color: var(--color-text);
            font-family: var(--font-secondary);
            font-size: 1rem;
            resize: none;
            margin-bottom: 1rem;
        }

        .note-input:focus {
            outline: none;
            border-color: var(--color-primary);
            box-shadow: 0 0 15px rgba(0, 255, 157, 0.3);
        }

        .button-group {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 1rem;
            margin-bottom: 1.5rem;
        }

        .geo-button {
            width: 100%;
            padding: 0.8rem 1rem;
            border: 1px solid var(--color-primary);
            border-radius: 8px;
            background: transparent;
            color: var(--color-primary);
            font-family: var(--font-primary);
            font-size: 0.9rem;
            cursor: pointer;
            transition: all 0.3s ease;
            position: relative;
            overflow: hidden;
        }

        .geo-button::before {
            content: '';
            position: absolute;
            top: 0;
            left: -100%;
            width: 100%;
            height: 100%;
            background: var(--color-primary);
            transition: all 0.3s ease;
            z-index: -1;
        }
        
        .geo-button:hover {
            color: var(--color-bg);
            box-shadow: 0 0 20px rgba(0, 255, 157, 0.5);
        }
        
        .geo-button:hover::before {
            left: 0;
        }

        .geo-button:disabled {
            border-color: #555;
            color: #555;
            cursor: not-allowed;
        }
        
        .geo-button:disabled:hover {
            color: #555;
            box-shadow: none;
        }
        
        .geo-button:disabled::before {
            left: -100%;
        }

        .output-area {
            width: 100%;
            min-height: 150px;
            background: var(--color-secondary);
            border: 1px solid var(--color-border);
            border-radius: 8px;
            padding: 1.5rem;
            text-align: left;
        }

        .output-area h2 {
            font-family: var(--font-primary);
            color: var(--color-primary);
            margin-bottom: 1rem;
            border-bottom: 1px solid var(--color-border);
            padding-bottom: 0.5rem;
        }

        .status-message {
            color: var(--color-text);
            font-size: 0.9rem;
            font-style: italic;
        }

        .note-item {
            background: rgba(0, 255, 157, 0.05);
            border-left: 3px solid var(--color-primary);
            padding: 0.8rem 1rem;
            margin-bottom: 0.8rem;
            border-radius: 0 4px 4px 0;
        }
        
        .note-item p {
            font-size: 0.95rem;
            color: #fff;
            margin-bottom: 0.25rem;
        }
        
        .note-item .distance {
            font-size: 0.8rem;
            font-weight: 300;
            color: var(--color-text);
        }

        .note-item .edit-btn {
            background: transparent;
            border: 1px solid var(--color-primary);
            color: var(--color-primary);
            padding: 3px 8px;
            font-size: 0.75rem;
            border-radius: 4px;
            cursor: pointer;
            float: right; /* Puts the button on the right */
            transition: all 0.2s ease;
        }
        
        .note-item .edit-btn:hover {
            background: var(--color-primary);
            color: var(--color-bg);
        }

        #scanner-animation {
            width: 100%;
            height: 3px;
            background: var(--color-primary);
            border-radius: 5px;
            box-shadow: 0 0 10px var(--color-primary), 0 0 20px var(--color-primary);
            display: none; /* Hidden by default */
            margin-top: 1rem;
            animation: scan 2s ease-in-out infinite;
        }

        @keyframes scan {
            0% { transform: translateY(0); opacity: 0; }
            10% { opacity: 1; }
            90% { opacity: 1; }
            100% { transform: translateY(140px); opacity: 0; }
        }
    </style>
</head>
<body>

    <div class="geo-container">
        <h1>Geo-Note</h1>
        <p class="subtitle">Leave ephemeral notes at your location.</p>
        
        <textarea id="note-input" class="note-input" placeholder="Your secret note (max 150 chars)..." maxlength="150"></textarea>
        
        <div class="button-group">
            <button id="leave-note-btn" class="geo-button">Leave Note</button>
            <button id="find-notes-btn" class="geo-button">Find Notes</button>
        </div>
        
        <div id="output-area" class="output-area">
            <h2>Scan Results</h2>
            <p id="status-message" class="status-message">Press 'Find Notes' to scan your area...</p>
            <div id="scanner-animation"></div>
        </div>
    </div>

    <script>
        // --- Config ---
        // 1. FOR TESTING ON YOUR COMPUTER:
        // const API_URL = 'http://localhost:3000'; 
        
        // 2. FOR PRODUCTION (after deploying to Render):
        // Replace with your live Render URL
        const API_URL = 'https://geo-note-62db.onrender.com'; 

        // --- DOM Elements ---
        const noteInput = document.getElementById('note-input');
        const leaveNoteBtn = document.getElementById('leave-note-btn');
        const findNotesBtn = document.getElementById('find-notes-btn');
        const outputArea = document.getElementById('output-area');
        
        // --- Event Listeners ---
        leaveNoteBtn.addEventListener('click', leaveNote);
        findNotesBtn.addEventListener('click', findNotes);

        /**
         * 1. Get user's current location.
         */
        function getCurrentLocation() {
            return new Promise((resolve, reject) => {
                if (!navigator.geolocation) {
                    reject(new Error('Geolocation is not supported by your browser.'));
                    return;
                }
                setLoadingState(true, 'Acquiring GPS lock...');
                
                navigator.geolocation.getCurrentPosition(
                    (position) => {
                        setLoadingState(false);
                        resolve({
                            lat: position.coords.latitude,
                            lon: position.coords.longitude
                        });
                    },
                    (error) => {
                        let errorMessage;
                        switch(error.code) {
                            case error.PERMISSION_DENIED: errorMessage = "Location permission denied."; break;
                            case error.POSITION_UNAVAILABLE: errorMessage = "Location information is unavailable."; break;
                            case error.TIMEOUT: errorMessage = "Location request timed out."; break;
                            default: errorMessage = "An unknown error occurred."; break;
                        }
                        setLoadingState(false);
                        reject(new Error(errorMessage));
                    },
                    { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
                );
            });
        }

        /**
         * 2. Leave a Note (Uses fetch POST)
         */
        async function leaveNote() {
            const noteText = noteInput.value.trim();
            if (noteText.length === 0) {
                setStatus('Cannot leave an empty note.', 'error');
                return;
            }

            try {
                // "Encrypt" the text
                const encodedText = btoa(unescape(encodeURIComponent(noteText)));
                const coords = await getCurrentLocation();
                
                setLoadingState(true, 'Sending note to server...');
                
                const response = await fetch(`${API_URL}/api/note`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        text: encodedText,
                        lat: coords.lat,
                        lon: coords.lon
                    })
                });
                
                setLoadingState(false);
                if (!response.ok) throw new Error(`Server error: ${response.statusText}`);
                
                setStatus(`Note left successfully!`, 'success');
                noteInput.value = '';
                
            } catch (error) {
                setLoadingState(false);
                setStatus(error.message, 'error');
            }
        }
        
        /**
         * 3. Find Nearby Notes (Uses fetch GET)
         */
        async function findNotes() {
            try {
                const userCoords = await getCurrentLocation();
                
                outputArea.innerHTML = '<h2>Scan Results</h2><div id="scanner-animation" style="display: block;"></div>';
                setLoadingState(true, 'Scanning for nearby notes...');
                
                const response = await fetch(`${API_URL}/api/notes?lat=${userCoords.lat}&lon=${userCoords.lon}`);
                
                setLoadingState(false);
                if (!response.ok) throw new Error(`Server error: ${response.statusText}`);
                
                const nearbyNotes = await response.json();
                
                setTimeout(() => {
                    displayFoundNotes(nearbyNotes);
                }, 500);

            } catch (error) {
                setLoadingState(false);
                setStatus(error.message, 'error');
            }
        }

        /**
         * 4. Display the notes found
         */
        function displayFoundNotes(notes) {
            outputArea.innerHTML = '<h2>Scan Results</h2>'; 
            
            if (notes.length === 0) {
                setStatus('No notes found within 50 meters. The area is clear.', 'neutral');
                return;
            }

            notes.forEach(note => {
                const noteEl = document.createElement('div');
                noteEl.className = 'note-item';
                
                let decryptedText;
                try {
                    decryptedText = decodeURIComponent(escape(atob(note.text)));
                } catch (e) {
                    decryptedText = "[Error: Could not decrypt note]";
                }

                noteEl.innerHTML = `
                    <button class="edit-btn" data-id="${note.id}">Edit</button>
                    <p class="note-text">${decryptedText.replace(/</g, "&lt;").replace(/>/g, "&gt;")}</p>
                    <span class="distance">Found nearby</span>
                `;
                outputArea.appendChild(noteEl);
            });
        }

        // --- EDIT NOTE LOGIC ---

        // Listen for clicks on the 'Edit' buttons
        outputArea.addEventListener('click', (e) => {
            if (e.target.classList.contains('edit-btn')) {
                const button = e.target;
                const noteId = button.dataset.id;
                const noteTextElement = button.closest('.note-item').querySelector('.note-text');
                const currentText = noteTextElement.textContent;

                const newText = prompt("Enter the new note text:", currentText);

                if (newText && newText.trim() !== "") {
                    updateNote(noteId, newText.trim(), noteTextElement);
                }
            }
        });

        /**
         * 5. Update a Note (Uses fetch PATCH)
         */
        async function updateNote(id, newText, textElement) {
            const encodedText = btoa(unescape(encodeURIComponent(newText)));

            setLoadingState(true, 'Updating note...');
            try {
                const response = await fetch(`${API_URL}/api/note/${id}`, {
                    method: 'PATCH',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ text: encodedText })
                });

                setLoadingState(false);
                if (!response.ok) throw new Error(`Server error: ${response.statusText}`);

                textElement.textContent = newText;
                setStatus('Note updated successfully!', 'success');

            } catch (error) {
                setLoadingState(false);
                setStatus(error.message, 'error');
            }
        }
        
        // --- HELPER FUNCTIONS ---

        function setLoadingState(isLoading, message = '') {
            leaveNoteBtn.disabled = isLoading;
            findNotesBtn.disabled = isLoading;
            if (isLoading) {
                setStatus(message, 'neutral');
            }
        }
        
        function setStatus(message, type) {
            // Find or create the status element
            let statusEl = document.getElementById('status-message');
            if (!statusEl) {
                // Clear output area and add the status message
                outputArea.innerHTML = '<h2>Scan Results</h2>';
                statusEl = document.createElement('p');
                statusEl.id = 'status-message';
                statusEl.className = 'status-message';
                outputArea.appendChild(statusEl);
            }

            statusEl.textContent = message;
            
            if(type === 'error') statusEl.style.color = '#ff6b6b';
            if(type === 'success') statusEl.style.color = 'var(--color-primary)';
            if(type === 'neutral') statusEl.style.color = 'var(--color-text)';
        }

        // --- INITIAL CHECK ---
        if (!navigator.geolocation) {
            setStatus("Geolocation is not supported. This app will not work.", "error");
            leaveNoteBtn.disabled = true;
            findNotesBtn.disabled = true;
        }

    </script>

</body>
</html>
