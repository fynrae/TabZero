chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.command === "new_tab_silent" || message.command === "new_tab") {
        const options = {
            active: message.command === "new_tab"
        };

        if (message.url) {
            let fullUrl = message.url;
            if (!fullUrl.startsWith('http://') && !fullUrl.startsWith('https://')) {
                fullUrl = 'https://' + fullUrl;
            }
            options.url = fullUrl;
        } else {
            options.url = "https://www.duckduckgo.com";
        }

        chrome.tabs.create(options);
        return true;
    } else if (message.command === "close_tab") {
        const targetIndex = message.index - 1;

        chrome.tabs.query({ currentWindow: true }, (tabs) => {
            if (tabs && targetIndex >= 0 && targetIndex < tabs.length) {
                const tabToCloseId = tabs[targetIndex].id; chrome.tabs.remove(tabToCloseId);
            } else {
                console.error("Cannot close tab: Invalid index", message.index);
            }
        });
    } else if (message.command === "focus_tab") {
        chrome.tabs.query({ currentWindow: true }, (tabs) => {
            let tabToFocus = null;

            if (message.query) {
                const query = message.query.toLowerCase();
                tabToFocus = tabs.find(tab =>
                    (tab.title && tab.title.toLowerCase().includes(query)) ||
                    (tab.url && tab.url.toLowerCase().includes(query))
                );
            } else if (message.index) {
                let targetIndex;
                if (message.index === 'last') {
                    targetIndex = tabs.length - 1;
                } else {
                    targetIndex = message.index - 1;
                }
                if (targetIndex >= 0 && targetIndex < tabs.length) {
                    tabToFocus = tabs[targetIndex];
                }
            }

            if (tabToFocus) {
                chrome.windows.update(tabToFocus.windowId, { focused: true });
                chrome.tabs.update(tabToFocus.id, { active: true });
            } else {
                console.log("Could not find a tab matching:", message.query || message.index);
            }
        });

        return true;
    } else if (message.command === "move_tab") {
        const fromIndex = message.from - 1;
        const toIndex = message.to - 1;

        chrome.tabs.query({ currentWindow: true }, (tabs) => {
            if (tabs && fromIndex >= 0 && fromIndex < tabs.length) {

                const tabToMoveId = tabs[fromIndex].id;

                chrome.tabs.move(tabToMoveId, { index: toIndex });

            } else {
                console.error("Cannot move tab: Invalid 'from' index provided.", message.from);
            }
        });

        return true;
    }
});
