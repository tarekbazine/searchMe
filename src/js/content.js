// Set highlight colors

var DEFAULT_HIGHLIGHT_COLOR = '#f8ff4a';
var DEFAULT_SELECTED_COLOR = '#ff9623';
var DEFAULT_TEXT_COLOR = '#000000';

var UNEXPANDABLE = /(script|style|svg|audio|canvas|figure|video|select|input|textarea)/i;
var ELEMENT_NODE_TYPE = 1;

// Resultat de la recherche
var searchInfo;

// Attributs de la recherche
var HIGHLIGHT_TAG = 'highlight-tag';
var HIGHLIGHT_CLASS = 'highlighted';
var SELECTED_CLASS = 'selected';

chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    if ('search' == request.message) {
        search(request.regexString);
    }else if ('extensionStatChanged' == request.message){
        chrome.runtime.sendMessage({
            'message': 'extensionStatChanged',
            'extensionIsOn': request.extensionIsOn
        });
    }
});


/* Find and highlight regex matches in web page from a given regex string or pattern */
function search(regexString) {
    var regex = validateRegex(regexString);
    if (regex && regexString != '') { // new valid regex string
        removeHighlight();
        highlight(regex, DEFAULT_HIGHLIGHT_COLOR, DEFAULT_SELECTED_COLOR, DEFAULT_TEXT_COLOR);
        returnSearchInfo('search');
        initSearchInfo(regexString);
    } else { // blank string or invalid regex
        removeHighlight();
        initSearchInfo(regexString);
        returnSearchInfo('search');
    }
}

/* Highlight all text that matches regex */
function highlight(regex, highlightColor, selectedColor, textColor) {
    function highlightRecursive(node) {
        if (isTextNode(node)) {
            var index = node.data.search(regex);
            if (index >= 0 && node.data.length > 0) {
                var matchedText = node.data.match(regex)[0];
                var matchedTextNode = node.splitText(index);
                matchedTextNode.splitText(matchedText.length);
                var spanNode = document.createElement(HIGHLIGHT_TAG);
                spanNode.className = HIGHLIGHT_CLASS;
                spanNode.style.backgroundColor = highlightColor;
                spanNode.style.color = textColor;
                spanNode.appendChild(matchedTextNode.cloneNode(true));
                matchedTextNode.parentNode.replaceChild(spanNode, matchedTextNode);
                searchInfo.highlightedNodes.push(spanNode);
                searchInfo.length += 1;
                return 1;
            }
        } else if (isExpandable(node)) {
            var children = node.childNodes;
            for (var i = 0; i < children.length; ++i) {
                var child = children[i];
                i += highlightRecursive(child);
            }
        }
        return 0;
    }

    highlightRecursive(document.getElementsByTagName('body')[0]);
}

/* Check if the given node is a text node */
function isTextNode(node) {
    return node && node.nodeType === 3;
}

/* Check if the given node is an expandable node that will yield text nodes */
function isExpandable(node) {
    return node && node.nodeType === ELEMENT_NODE_TYPE && node.childNodes &&
        !UNEXPANDABLE.test(node.tagName);
}

/* Validate that a given pattern string is a valid regex */
function validateRegex(pattern) {
    try {
        var regex = new RegExp(pattern,'i');
        return regex;
    } catch (e) {
        return false;
    }
}


/* Remove all highlights from page */
function removeHighlight() {
    while (node = document.body.querySelector(HIGHLIGHT_TAG + '.' + HIGHLIGHT_CLASS)) {
        node.outerHTML = node.innerHTML;
    }
    while (node = document.body.querySelector(HIGHLIGHT_TAG + '.' + SELECTED_CLASS)) {
        node.outerHTML = node.innerHTML;
    }
};



function initSearchInfo(pattern) {
    var pattern = typeof pattern !== 'undefined' ? pattern : '';
    searchInfo = {
        regexString : pattern,
        selectedIndex : 0,
        highlightedNodes : [],
        length : 0
    }
}

/* Send message with search information for this tab */
function returnSearchInfo(cause) {
    chrome.runtime.sendMessage({
        'message' : 'returnSearchInfo',
        'regexString' : searchInfo.regexString,
        'currentSelection' : searchInfo.selectedIndex,
        'numResults' : searchInfo.length,
        'cause' : cause
    });
}

// listener
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    if ('searchNt' == request.message) {
        console.log("received!! "+extensionIsOn)
           // get local storage
            chrome.storage.local.get(['regex'], function (result) {
                search(result.regex);
            })
        }
});


initSearchInfo();