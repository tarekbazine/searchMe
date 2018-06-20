chrome.tabs.onCreated.addListener(function (tab) {

    chrome.storage.local.get(['extensionIsOn'],
        function (results) {

            // Search
            console.log("ttt " +results.extensionIsOn);
            if (results.extensionIsOn && 'undefined' != typeof tab.id && tab.id) {
                chrome.tabs.executeScript(tab.id, {file: "js/jquery-3.3.1.min.js"}, function () {
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


            console.log(results);
            chrome.browserAction.setIcon({
                path: '../icons/icon' + ((results.extensionIsOn == true) ? '' : '_off') + '.png'
            });
        });


})


/* 1- Received returnSearchInfo message, set badge text with number of results */
chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
    if ('returnSearchInfo' == request.message) {
        var isOn = true;
        chrome.storage.local.get(['extensionIsOn'],
            function (results) {
                isOn = results.extensionIsOn;
                chrome.browserAction.setBadgeText({
                    'text': (isOn == false) ? '' : String(request.numResults),
                    'tabId': sender.tab.id
                });
            });

        chrome.browserAction.setBadgeBackgroundColor({
            color: "#f44336"
        });
    } else if ('extensionStatChanged' == request.message) {
        chrome.browserAction.setIcon({
            path: '../icons/icon' + ((request.extensionIsOn == true) ? '' : '_off') + '.png',
            tabId: sender.tab.id
        });
    }
});

//case of ext icon for the first load
chrome.storage.local.get(['extensionIsOn'],
    function (results) {
        console.log(results);
        chrome.browserAction.setIcon({
            path: '../icons/icon' + ((results.extensionIsOn == true) ? '' : '_off') + '.png'
        });
    });

chrome.tabs.onUpdated.addListener(function (tabId,info,tab_) {

    chrome.storage.local.get(['extensionIsOn'],
        function (results) {

            // Search
            console.log("222ttt " +results.extensionIsOn);
            if (results.extensionIsOn && tabId) {
                chrome.tabs.executeScript(tabId, {file: "js/jquery-3.3.1.min.js"}, function () {
                    chrome.tabs.executeScript(tabId, {file: "js/content.js"}, function () {
                        chrome.tabs.executeScript(tabId, {file: "js/popup.js"}, function () {
                            const lastErr = chrome.runtime.lastError;
                            if (lastErr) console.log('tab: ' + tabId + ' lastError: ' + JSON.stringify(lastErr));
                            // This executes only after your content script executes
                            console.log("yessss");
                            chrome.tabs.query({active: true, currentWindow: true}, function (tabs) {
                                chrome.tabs.sendMessage(tabId, {
                                    'message': 'searchNt'
                                })
                            });
                        });
                    });
                });
            }


            console.log(results);
            chrome.browserAction.setIcon({
                path: '../icons/icon' + ((results.extensionIsOn == true) ? '' : '_off') + '.png'
            });
        });


})