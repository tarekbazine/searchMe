var ERROR_COLOR = '#ffb1a8';
var WHITE_COLOR = '#ffffff';

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
        passInputToContentScript()
        $("input#regex_input").focus()
    })

    // key pressed listener
    $("input#regex_input").on('input',function() {
        // search
        passInputToContentScript()

        // save searched regex
        var value = $(this).val();
        if (value != '' && value != undefined) {
            saveRegex(value)
        }
    })
});

function saveRegex(regex) {
    chrome.storage.local.set({regex: regex});
}


function passInputToContentScript(){
        var regexString = $("input#regex_input").val();
        if  (!validateRegex(regexString)) {
            $("input#regex_input").css('background-color' , ERROR_COLOR);
        } else {
            $("input#regex_input").css('background-color' , WHITE_COLOR);
        }
        chrome.tabs.query(
            { 'active': true, 'currentWindow': true },
            function(tabs) {
                if ('undefined' != typeof tabs[0].id && tabs[0].id) {
                    chrome.tabs.sendMessage(tabs[0].id, {
                        'message': 'search',
                        'regexString': regexString
                    }), function (response) {
                        if (response) {
                            // Content script is active
                            console.log(response);
                        } else {
                            console.log(response);

                        }
                    }
                }
            }
        );
}

function validateRegex(pattern) {
    try {
        var regex = new RegExp(pattern,'i');
        return regex;
    } catch (e) {
        return false;
    }
}


/* Received returnSearchInfo message, set badge text with number of results */
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    if ('returnSearchInfo' == request.message) {
        updateRestuls(request.numResults);
    }
});

function updateRestuls(nbResults) {
    if(0 == nbResults)
        $('#result_container').css('background-color', '#ffebee');
    else if(nbResults<200)
        $('#result_container').css('background-color', '#e1f5fe');
    else
        $('#result_container').css('background-color', '#a5d6a7');

    $('#nb_result').text(nbResults);
}


