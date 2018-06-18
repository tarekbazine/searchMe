const DEFAULT_INSTANT_RESULTS = true;
var ERROR_COLOR = '#ff8989';
var WHITE_COLOR = '#ffffff';
var ERROR_TEXT = "Content script was not loaded. Are you currently in the Chrome Web Store or in a chrome:// page? If you are, content scripts won't work here. If not, please wait for the page to finish loading or refresh the page.";
var ENABLE_CASE_INSENSITIVE_TITLE = "Enable case insensitive search";
var DISABLE_CASE_INSENSITIVE_TITLE = "Disable case insensitive search";
var DEFAULT_CASE_INSENSITIVE = false;
var MAX_HISTORY_LENGTH = 30;

let sentInput = false;
var processingKey = false;
var searchHistory = null;
var maxHistoryLength = MAX_HISTORY_LENGTH;

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
  if (!processingKey) {
    var regexString = document.getElementById('inputRegex').value;
    if  (!isValidRegex(regexString)) {
      document.getElementById('inputRegex').style.backgroundColor = ERROR_COLOR;
    } else {
      document.getElementById('inputRegex').style.backgroundColor = WHITE_COLOR;
    }
    chrome.tabs.query(
      { 'active': true, 'currentWindow': true },
      function(tabs) {
        if ('undefined' != typeof tabs[0].id && tabs[0].id) {
          processingKey = true;
          chrome.tabs.sendMessage(tabs[0].id, {
            'message' : 'search',
            'regexString' : regexString,
            'configurationChanged' : configurationChanged,
            'getNext' : true
          });
          sentInput = true;
        }
      }
    );
  }
}

function setCaseInsensitiveElement() {
  var caseInsensitive = chrome.storage.local.get({'caseInsensitive':DEFAULT_CASE_INSENSITIVE},
  function (result) {
    document.getElementById('insensitive').title = result.caseInsensitive ? DISABLE_CASE_INSENSITIVE_TITLE : ENABLE_CASE_INSENSITIVE_TITLE;
    if(result.caseInsensitive) {
      document.getElementById('insensitive').className = 'selected';
    } else {
      document.getElementById('insensitive').className = '';
    }
  });

}

function toggleCaseInsensitive() {
  var caseInsensitive = document.getElementById('insensitive').className == 'selected';
  document.getElementById('insensitive').title = caseInsensitive ? ENABLE_CASE_INSENSITIVE_TITLE : DISABLE_CASE_INSENSITIVE_TITLE;
  if(caseInsensitive) {
    document.getElementById('insensitive').className = '';
  } else {
    document.getElementById('insensitive').className = 'selected';
  }
  sentInput = false;
  chrome.storage.local.set({caseInsensitive: !caseInsensitive});
  passInputToContentScript(true);
}


/*** LISTENERS ***/
document.getElementById('next').addEventListener('click', function() {
  selectNext();
});

document.getElementById('prev').addEventListener('click', function() {
  selectPrev();
});

document.getElementById('clear').addEventListener('click', function() {
  sentInput = false;
  document.getElementById('inputRegex').value = '';
  passInputToContentScript();
  document.getElementById('inputRegex').focus();
});

document.getElementById('insensitive').addEventListener('click', function() {
  toggleCaseInsensitive();
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
      document.getElementById('inputRegex').value = request.regexString;
    }
    if (request.regexString !== document.getElementById('inputRegex').value) {
      passInputToContentScript();
    }
  }
});

/* Key listener for selectNext and selectPrev */
 var map = [];
onkeydown = onkeyup = function(e) {
    map[e.keyCode] = e.type == 'keydown';
    if (document.getElementById('inputRegex') === document.activeElement) { //input element is in focus
      if (!map[16] && map[13]) { //ENTER
        if (sentInput) {
          selectNext();
        } else {
          passInputToContentScript();
        }
      } else if (map[16] && map[13]) { //SHIFT + ENTER
        selectPrev();
      }
    }
}
/*** LISTENERS ***/

/*** INIT ***/
/* Retrieve from storage whether we should use instant results or not */
chrome.storage.local.get({
    'instantResults' : DEFAULT_INSTANT_RESULTS,
    'maxHistoryLength' : MAX_HISTORY_LENGTH,
    'searchHistory' : null,
    'isSearchHistoryVisible' : false},
  function(result) {
    if(result.instantResults) {
      document.getElementById('inputRegex').addEventListener('input', function() {
        passInputToContentScript();
      });
    } else {
      document.getElementById('inputRegex').addEventListener('change', function() {
        passInputToContentScript();
      });
    }
    console.log(result);
    if(result.maxHistoryLength) {
      maxHistoryLength = result.maxHistoryLength;
    }
    if(result.searchHistory) {
      searchHistory = result.searchHistory.slice(0);
    } else {
      searchHistory = [];
    }
  }
);

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
        document.getElementById('error').textContent = ERROR_TEXT;
      }
    });
  }
});

/* Focus onto input form */
document.getElementById('inputRegex').focus();
window.setTimeout( 
  function(){document.getElementById('inputRegex').select();}, 0);

setCaseInsensitiveElement();
/*** INIT ***/

