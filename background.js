chrome.runtime.onInstalled.addListener(() => {
  console.log("Instagram Voice Scroller Extension Installed");
});

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === "triggerNativeScroll") {
    fetch("http://localhost:3000/press-down", { method: "POST" })
      .then(() => console.log("✅ Native keypress triggered"))
      .catch(err => console.error("❌ Native app not reachable:", err));
  }
});
