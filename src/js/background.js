chrome.tabs.onCreated.addListener(function (tab) {
    // Search
    chrome.tabs.query(
        { 'active': false, 'currentWindow': false },
        function(tabs) {
            if ('undefined' != typeof tabs[0].id && tabs[0].id) {
                chrome.tabs.sendMessage(tabs[0].id, {
                    'message': 'search_new_tab'
                })
            }
        }
    );
})
/* Received returnSearchInfo message, set badge text with number of results */
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    if ('returnSearchInfo' == request.message) {
        chrome.browserAction.setBadgeText({
            'text': String(request.numResults),
            'tabId': sender.tab.id
        });
    }
});
