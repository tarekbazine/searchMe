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
        $("input#regex_input").focus()
    })

    // key pressed listener
    $(this).on('input',function() {
        // search
        passInputToContentScript()

        // save searched regex
        saveRegex($("input#regex_input").val())

        // get local storage
        chrome.storage.local.get(['regex'], function(result) {
            console.log('Value currently is ' + result.regex);
        });
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
        var regex = new RegExp(pattern);
        return regex;
    } catch (e) {
        return false;
    }
}