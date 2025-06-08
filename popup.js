document.getElementById("start").addEventListener("click", () => {
  chrome.tabs.query({ active: true, currentWindow: true }, ([tab]) => {
    chrome.scripting.executeScript({
      target: { tabId: tab.id },
      func: () => {
        window.focus(); // bring focus to the page
        // Optionally trigger keypress if needed:
        const down = new KeyboardEvent('keydown', {
          key: 'ArrowDown',
          code: 'ArrowDown',
          keyCode: 40,
          which: 40,
          bubbles: true
        });
        document.dispatchEvent(down);
      }
    });
    // Send the startRecognition message to the content script
    chrome.tabs.sendMessage(tab.id, { action: "startRecognition" });

    // Close the popup to return focus to the tab
    window.close();
  });
});


document.getElementById("stop").addEventListener("click", () => {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    chrome.tabs.sendMessage(tabs[0].id, { action: "stopRecognition" });
  });
});