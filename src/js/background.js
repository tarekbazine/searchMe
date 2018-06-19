let extensionIsOn = true;
chrome.tabs.onCreated.addListener(function (tab) {
    // Search
    console.log(tab.id+" "+extensionIsOn);
    if (extensionIsOn && 'undefined' != typeof tab.id && tab.id) {
        chrome.tabs.executeScript(tab.id, {file:"js/jquery-3.3.1.min.js"}, function() {
            chrome.tabs.executeScript(tab.id, {file: "js/content.js"}, function () {
                chrome.tabs.executeScript(tab.id, {file: "js/popup.js"}, function () {
                    const lastErr = chrome.runtime.lastError;
                    if (lastErr) console.log('tab: ' + tab.id + ' lastError: ' + JSON.stringify(lastErr));
                    // This executes only after your content script executes
                    console.log("yessss");
                    chrome.tabs.query({active: true, currentWindow: true}, function (tabs) {
                        chrome.tabs.sendMessage(tab.id, {
                            'message': 'searchNt'
                        })
                    });
                });
            });
        });
    }
})


/* 1- Received returnSearchInfo message, set badge text with number of results */
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    if ('returnSearchInfo' == request.message) {
        chrome.browserAction.setBadgeText({
            'text': String(request.numResults),
            'tabId': sender.tab.id
        });
        chrome.browserAction.setBadgeBackgroundColor({
            color : "#f44336"
        });
    } else if('extensionStatChanged' == request.message){
        chrome.browserAction.setIcon({
            path: '../icons/icon'+((request.extensionIsOn == true)?'':'_off')+'.png',
            tabId: sender.tab.id
        });
        extensionIsOn = request.extensionIsOn;
    }
});
