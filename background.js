chrome.tabs.onUpdated.addListener(function(tabId, changeInfo, tab) {
    if (tab.url && /https:\/\/github.com\/jquery\/[^\/]+\/pull\//.test( tab.url ) ) {
        chrome.pageAction.show(tabId);
    }
});