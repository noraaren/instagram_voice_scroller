const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
const recognition = new SpeechRecognition();

recognition.continuous = true;
recognition.lang = 'en-US';
recognition.interimResults = false;

console.log("🎤 Voice control ready. You can start it by sending a message.");

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === "startRecognition") {
    recognition.start();
    startNoiseDetection();
    console.log("🎤 Voice control and noise detection started...");
  } else if (message.action === "stopRecognition") {
    recognition.stop();
    stopNoiseDetection();
    console.log("🛑 Voice control and noise detection stopped");
  }
});

// Move simulateKeyPress function to the global scope
const simulateKeyPress = (key) => {
    const event = new KeyboardEvent("keydown", {
        key: key,
        code: key,
        keyCode: key === " " ? 32 : key.charCodeAt(0),
        which: key === " " ? 32 : key.charCodeAt(0),
        bubbles: true,
        cancelable: true
    });
    document.dispatchEvent(event);
};

recognition.onresult = function(event) {
    const transcript = event.results[event.results.length - 1][0].transcript.trim().toLowerCase();
    console.log("Heard:", transcript);

    if (transcript.includes("next") || transcript.includes("down")) {
        simulateKeyPress(" ");
    } else if (transcript.includes("up") || transcript.includes("previous")) {
        simulateKeyPress("ArrowUp");
    } else if (transcript.includes("stop")) {
        recognition.stop();
        console.log("🛑 Voice control stopped");
    }
};

recognition.onerror = function(e) {
    console.error("Speech recognition error:", e);

    if (e.error === "no-speech") {
        console.log("No speech detected. Restarting recognition...");
        recognition.stop(); // Stop the current recognition session
        setTimeout(() => recognition.start(), 1000); // Restart recognition after a short delay
    }
};

// Noise detection functionality
let audioContext;
let analyser;
let microphone;
let javascriptNode;

function startNoiseDetection() {
    audioContext = new (window.AudioContext || window.webkitAudioContext)();
    analyser = audioContext.createAnalyser();
    analyser.fftSize = 256; // Determines the frequency resolution

    navigator.mediaDevices.getUserMedia({ audio: true }).then((stream) => {
        microphone = audioContext.createMediaStreamSource(stream);
        javascriptNode = audioContext.createScriptProcessor(256, 1, 1);

        microphone.connect(analyser);
        analyser.connect(javascriptNode);
        javascriptNode.connect(audioContext.destination);

        javascriptNode.onaudioprocess = () => {
            const dataArray = new Uint8Array(analyser.frequencyBinCount);
            analyser.getByteFrequencyData(dataArray);

            // Calculate the average volume
            const average = dataArray.reduce((sum, value) => sum + value, 0) / dataArray.length;

            if (average > 0) { // Log volume only if it's greater than 0
                console.log(`Noise detected with volume: ${average} dB`);
            }

            if (average > 60) { // Trigger keypress for noise above 60 dB
                console.log("Noise threshold exceeded! Triggering keypress...");
                simulateKeyPress(" ");
            }
        };
    }).catch((error) => {
        console.error("Error accessing microphone:", error);
    });
}

function stopNoiseDetection() {
    if (microphone) {
        microphone.disconnect();
        microphone = null; // Clear the reference
    }
    if (javascriptNode) {
        javascriptNode.disconnect();
        javascriptNode = null; // Clear the reference
    }
    if (audioContext && audioContext.state !== "closed") {
        audioContext.close();
        audioContext = null; // Clear the reference
    }
}