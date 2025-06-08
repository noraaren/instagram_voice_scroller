const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
const recognition = new SpeechRecognition();

recognition.continuous = true;
recognition.lang = 'en-US';
recognition.interimResults = false;

console.log("🎤 Voice control ready. You can start it by sending a message.");

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === "startRecognition") {
    recognition.start();
    console.log("🎤 Voice control started for Instagram scrolling...");
  } else if (message.action === "stopRecognition") {
    recognition.stop();
    console.log("🛑 Voice control stopped");
  }
});

recognition.onresult = function(event) {
    const transcript = event.results[event.results.length - 1][0].transcript.trim().toLowerCase();
    console.log("Heard:", transcript);

    if (transcript.includes("next") || transcript.includes("down")) {
        window.scrollBy({ top: 600, behavior: "smooth" });
    } else if (transcript.includes("up") || transcript.includes("previous")) {
        window.scrollBy({ top: -600, behavior: "smooth" });
    } else if (transcript.includes("stop")) {
        recognition.stop();
        console.log("🛑 Voice control stopped");
    }
};

recognition.onerror = function(e) {
    console.error("Speech recognition error", e);
};