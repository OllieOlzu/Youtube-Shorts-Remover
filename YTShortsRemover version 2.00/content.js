function removeNonZeroReels(root = document) {
    root.querySelectorAll('.reel-video-in-sequence-new').forEach(el => {
        if (el.id !== "0") {
            el.remove();
        }
    });
}


function StartObserver() {
    if (!document.body) {
        requestAnimationFrame(StartObserver); 
        return;
    }


    removeNonZeroReels();


    const observer = new MutationObserver(mutations => {
        mutations.forEach(mutation => {
            mutation.addedNodes.forEach(node => {
                if (node.nodeType === 1) { 
                    if (node.matches && node.matches('.reel-video-in-sequence-new')) {
                        if (node.id !== "0") node.remove();
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


StartObserver();