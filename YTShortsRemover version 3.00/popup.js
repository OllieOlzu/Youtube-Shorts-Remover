// Must match content.js – single source of truth for default settings
const DEFAULT_SETTINGS = {
    stopScrolling: true,
    removeShortsFromPages: true,
    redirectShortsToYoutube: true
};

const stopScrollingCheckbox = document.getElementById("stopScrolling");
const removeShortsCheckbox = document.getElementById("removeShortsFromPages");
const redirectShortsCheckbox = document.getElementById("redirectShortsToYoutube");

chrome.storage.sync.get(DEFAULT_SETTINGS, (data) => {
    stopScrollingCheckbox.checked = data.stopScrolling === true;
    removeShortsCheckbox.checked = data.removeShortsFromPages === true;
    redirectShortsCheckbox.checked = data.redirectShortsToYoutube === true;
});

stopScrollingCheckbox.addEventListener("change", () => {
    const value = stopScrollingCheckbox.checked;
    chrome.storage.sync.set({ stopScrolling: value });
    chrome.runtime.sendMessage({ stopScrolling: value });
});

removeShortsCheckbox.addEventListener("change", () => {
    const value = removeShortsCheckbox.checked;
    chrome.storage.sync.set({ removeShortsFromPages: value });
    chrome.runtime.sendMessage({ removeShortsFromPages: value });
});

redirectShortsCheckbox.addEventListener("change", () => {
    const value = redirectShortsCheckbox.checked;
    chrome.storage.sync.set({ redirectShortsToYoutube: value });
    chrome.runtime.sendMessage({ redirectShortsToYoutube: value });
});
