const CSS_LINK_ID = "yt-shorts-remover-styles";

// Must match popup.js – single source of truth for default settings
const DEFAULT_SETTINGS = {
    stopScrolling: true,
    removeShortsFromPages: true,
    redirectShortsToYoutube: true
};

let StopScrolling = DEFAULT_SETTINGS.stopScrolling;
let RemoveShortsFromPages = DEFAULT_SETTINGS.removeShortsFromPages;
let RedirectShortsToYoutube = DEFAULT_SETTINGS.redirectShortsToYoutube;

function injectHideShortsCss() {
    if (document.getElementById(CSS_LINK_ID)) return;
    const link = document.createElement("link");
    link.id = CSS_LINK_ID;
    link.rel = "stylesheet";
    link.href = chrome.runtime.getURL("hide-shorts.css");
    (document.head || document.documentElement).appendChild(link);
}

function removeHideShortsCss() {
    document.getElementById(CSS_LINK_ID)?.remove();
}

function applyRemoveShortsFromPages(enabled) {
    if (enabled) injectHideShortsCss();
    else removeHideShortsCss();
}

function removeNonZeroReels(root = document) {
    if (!StopScrolling) return;

    root.querySelectorAll('.reel-video-in-sequence-new').forEach(el => {
        if (el.id !== "0") {
            el.remove();
        }
    });
}

function startObserver() {
    if (!document.body) {
        requestAnimationFrame(startObserver);
        return;
    }

    applyRemoveShortsFromPages(RemoveShortsFromPages);
    if (StopScrolling) removeNonZeroReels();

    const observer = new MutationObserver(mutations => {
        mutations.forEach(mutation => {
            mutation.addedNodes.forEach(node => {
                if (node.nodeType === 1) {
                    if (node.matches && node.matches('.reel-video-in-sequence-new')) {
                        if (StopScrolling && node.id !== "0") node.remove();
                    } else {
                        removeNonZeroReels(node);
                    }
                }
            });
        });
    });

    observer.observe(document.body, {
        childList: true,
        subtree: true
    });
}

function isShortsPath(pathname) {
    return /^\/shorts(\/|$)/.test(pathname || window.location.pathname);
}

function tryRedirectIfOnShorts() {
    if (!RedirectShortsToYoutube || !isShortsPath()) return;
    alert("Short blocked!");
    location.replace("https://www.youtube.com/");
}

// Redirect when navigating to Shorts via SPA (e.g. clicking a Shorts link on main page)
// canIntercept is true only for same-document navigations, so we don't double-fire on full page load
if (typeof navigation !== "undefined" && navigation.addEventListener) {
    navigation.addEventListener("navigate", (e) => {
        if (!e.canIntercept) return;
        const path = new URL(e.destination.url).pathname;
        if (!isShortsPath(path)) return;
        chrome.storage.sync.get({ redirectShortsToYoutube: DEFAULT_SETTINGS.redirectShortsToYoutube }, (data) => {
            if (data.redirectShortsToYoutube === true) {
                alert("Short blocked!");
                location.replace("https://www.youtube.com/");
            }
        });
    });
}

chrome.storage.sync.get(DEFAULT_SETTINGS, (data) => {
    StopScrolling = data.stopScrolling === true;
    RemoveShortsFromPages = data.removeShortsFromPages === true;
    RedirectShortsToYoutube = data.redirectShortsToYoutube === true;

    if (RedirectShortsToYoutube && isShortsPath()) {
        tryRedirectIfOnShorts();
        return;
    }
    startObserver();
});

chrome.storage.onChanged.addListener((changes, areaName) => {
    if (areaName !== "sync") return;
    if (changes.stopScrolling !== undefined) {
        StopScrolling = changes.stopScrolling.newValue === true;
    }
    if (changes.removeShortsFromPages !== undefined) {
        RemoveShortsFromPages = changes.removeShortsFromPages.newValue === true;
        applyRemoveShortsFromPages(RemoveShortsFromPages);
    }
    if (changes.redirectShortsToYoutube !== undefined) {
        RedirectShortsToYoutube = changes.redirectShortsToYoutube.newValue === true;
    }
});
