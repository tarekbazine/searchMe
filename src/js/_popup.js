$(document).ready(function() {
    $("input#regex_input").focus()

    // Activer l'extension
    $("a#active_btn").click(function () {
        console.log("turn on")
        $("div#img_container img")[0].src = "icons/on.png"
    })

    // Nettoyer le champs de la recherche
    $("a#clear").click(function () {
        console.log("clear")
        $("input#regex_input").val('')
        $("input#regex_input").focus()
    })

    // key pressed listener
    $("input#regex_input").on('input',function(event) {
        // search

        // save searched regex
        saveRegex($(this).val())


        passInputToContentScript();

        // get local storage
        chrome.storage.local.get(['regex'], function(result) {
            console.log('Value currently is ' + result.regex);
        });
    })
});

function saveRegex(regex) {
    chrome.storage.local.set({regex: regex});
}


const ERROR_COLOR = '#ff8989';
const WHITE_COLOR = '#ffffff';

let sentInput = false;
let processingKey = false;

/*** FUNCTIONS ***/
/* Validate that a given pattern string is a valid regex */
function isValidRegex(pattern) {
    try{
        var regex = new RegExp(pattern);
        return true;
    } catch(e) {
        return false;
    }
}

/* Send message to content script of tab to select next result */
function selectNext(){
    chrome.tabs.query({
            'active': true,
            'currentWindow': true
        },
        function(tabs) {
            if ('undefined' != typeof tabs[0].id && tabs[0].id) {
                chrome.tabs.sendMessage(tabs[0].id, {
                    'message' : 'selectNextNode'
                });
            }
        });
}

/* Send message to content script of tab to select previous result */
function selectPrev(){
    chrome.tabs.query({
            'active': true,
            'currentWindow': true
        },
        function(tabs) {
            if ('undefined' != typeof tabs[0].id && tabs[0].id) {
                chrome.tabs.sendMessage(tabs[0].id, {
                    'message' : 'selectPrevNode'
                });
            }
        });
}

/* Send message to pass input string to content script of tab to find and highlight regex matches */
function passInputToContentScript(){
    passInputToContentScript(false);
}

function passInputToContentScript(configurationChanged){
    // if (!processingKey) {
        var regexString = document.getElementById('regex_input').value;
        if  (!isValidRegex(regexString)) {
            console.log('not valide');
            document.getElementById('regex_input').style.backgroundColor = ERROR_COLOR;
        } else {
            console.log('valide');
            document.getElementById('regex_input').style.backgroundColor = WHITE_COLOR;
        }
        chrome.tabs.query(
            { 'active': true, 'currentWindow': true },
            function(tabs) {
                if ('undefined' != typeof tabs[0].id && tabs[0].id) {
                    processingKey = true;
                    console.log('search_ '+tabs[0].id)
                    chrome.tabs.sendMessage(tabs[0].id, {
                        'message' : 'search',
                        'regexString' : regexString,
                        'configurationChanged' : configurationChanged,
                        'getNext' : true
                    },function () {
                        console.log('search_ '+tabs[0].id)
                    });
                    sentInput = true;
                }
            }
        );
    // }
}

console.log(chrome.runtime.onMessage);
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    if ('search' == request.message) {
        console.log("ddd");
        search(request.regexString, request.configurationChanged);
    }
});

/*** LISTENERS ***/
document.getElementById('next').addEventListener('click', function() {
    selectNext();
});

document.getElementById('prev').addEventListener('click', function() {
    selectPrev();
});

document.getElementById('clear').addEventListener('click', function() {
    sentInput = false;
    document.getElementById('regex_input').value = '';
    passInputToContentScript();
    document.getElementById('regex_input').focus();
});

/* Received returnSearchInfo message, populate popup UI */
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    if ('returnSearchInfo' == request.message) {
        processingKey = false;
        if (request.numResults > 0) {
            document.getElementById('numResults').textContent = String(request.currentSelection+1) + ' of ' + String(request.numResults);
        } else {
            document.getElementById('numResults').textContent = String(request.currentSelection) + ' of ' + String(request.numResults);
        }
        if (!sentInput) {
            document.getElementById('regex_input').value = request.regexString;
        }
        if (request.regexString !== document.getElementById('regex_input').value) {
            passInputToContentScript();
        }
    }
});

/*** LISTENERS ***/


/*** INIT ***/

/* Get search info if there is any */
chrome.tabs.query({
        'active': true,
        'currentWindow': true
    },
    function(tabs) {
        if ('undefined' != typeof tabs[0].id && tabs[0].id) {
            chrome.tabs.sendMessage(tabs[0].id, {
                'message' : 'getSearchInfo'
            }, function(response){
                if (response) {
                    // Content script is active
                    console.log(response);
                } else {
                    console.log(response);
                    // 'Svp choisir une tab avec du text !'
                    // document.getElementById('error').textContent = ERROR_TEXT;
                }
            });
        }
    });

/*** INIT ***/

