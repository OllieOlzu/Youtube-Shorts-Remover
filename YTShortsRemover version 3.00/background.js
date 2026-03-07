chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
    const toSet = {};

    if (message.stopScrolling !== undefined) toSet.stopScrolling = message.stopScrolling === true;
    if (message.removeShortsFromPages !== undefined) toSet.removeShortsFromPages = message.removeShortsFromPages === true;
    if (message.redirectShortsToYoutube !== undefined) toSet.redirectShortsToYoutube = message.redirectShortsToYoutube === true;

    if (Object.keys(toSet).length === 0) return;

    chrome.storage.sync.set(toSet, () => {
        sendResponse({ ok: true });
    });
    return true; // keep channel open for async sendResponse
});

// On first install/update, content scripts won't run in already-open tabs until refresh.
// Inject into existing YouTube tabs so the extension works immediately.
chrome.runtime.onInstalled.addListener(async () => {
    const tabs = await chrome.tabs.query({ url: "https://www.youtube.com/*" });
    for (const tab of tabs) {
        if (!tab.id) continue;
        try {
            await chrome.scripting.executeScript({
                target: { tabId: tab.id },
                files: ["content.js"]
            });
        } catch {
            // Ignore tabs we can't access (e.g. chrome://, restricted contexts)
        }
    }
});
