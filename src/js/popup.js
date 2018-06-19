ar ERROR_COLOR = '#ffb1a8';
var WHITE_COLOR = '#ffffff';

let extensionIsOn = true;

$(document).ready(function () {
    $("input#regex_input").focus()

    // Activer l'extension
    $("a#active_btn").click(function () {
        if (extensionIsOn) {
            console.log("turn off")
            $("input#regex_input").val('')
            passInputToContentScript()
            $("#regex_input").prop('disabled', true);
            $("div#img_container img")[0].src = "icons/off.png"
        } else {
            chrome.storage.local.get(['extensionIsOn', 'regex'],
                function (results) {
                    $("input#regex_input").val(results.regex);
                    passInputToContentScript();
                    $("#regex_input").prop('disabled', false);
                    $("div#img_container img")[0].src = "icons/on.png"
                });
            console.log("turn on")
            $("#regex_input").prop('disabled', false);
            $("div#img_container img")[0].src = "icons/on.png"
        }
        extensionIsOn = !extensionIsOn;
        extensionStatChanged();
    })

    // Nettoyer le champs de la recherche
    $("a#clear").click(function () {
        console.log("clear")
        $("input#regex_input").val('')
        passInputToContentScript()
        $("input#regex_input").focus()
    })

    // key pressed listener
    $("input#regex_input").on('input', function () {
        // search
        passInputToContentScript()

        // save searched regex
        var value = $(this).val();
        if (value != '' && value != undefined) {
            saveRegex(value)
        }
    })

    //init in case of click on the pop up
    chrome.storage.local.get(['extensionIsOn', 'regex'],
        function (results) {
            extensionIsOn = results.extensionIsOn == 'undefined' ? true : results.extensionIsOn;
            $("input#regex_input").val(results.regex);
            if (!extensionIsOn) {
                $("input#regex_input").val('');
                $("#regex_input").prop('disabled', true);
                $("div#img_container img")[0].src = "icons/off.png"
            } else {
                passInputToContentScript();
                $("#regex_input").prop('disabled', false);
                $("div#img_container img")[0].src = "icons/on.png"
            }
        });
});

function saveRegex(regex) {
    chrome.storage.local.set({regex: regex});
}


function passInputToContentScript() {
    var regexString = $("input#regex_input").val();
    if (!validateRegex(regexString)) {
        $("input#regex_input").css('background-color', ERROR_COLOR);
    } else {
        $("input#regex_input").css('background-color', WHITE_COLOR);
    }
    chrome.tabs.query(
        {'active': true, 'currentWindow': true},
        function (tabs) {
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
        var regex = new RegExp(pattern, 'i');
        return regex;
    } catch (e) {
        return false;
    }
}


/* Received returnSearchInfo message, set badge text with number of results */
chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
    if ('returnSearchInfo' == request.message) {
        updateRestuls(request.numResults);
    }
});

function updateRestuls(nbResults) {
    if (0 == nbResults)
        $('#result_container').css('background-color', '#ffebee');
    else if (nbResults < 200)
        $('#result_container').css('background-color', '#e1f5fe');
    else
        $('#result_container').css('background-color', '#a5d6a7');

    $('#nb_result').text(nbResults);
}


function extensionStatChanged() {
    chrome.tabs.query(
        {'active': true, 'currentWindow': true},
        function (tabs) {
            if ('undefined' != typeof tabs[0].id && tabs[0].id) {
                chrome.tabs.sendMessage(tabs[0].id, {
                    'message': 'extensionStatChanged',
                    'extensionIsOn': extensionIsOn
                })
            }
        }
    );
    chrome.storage.local.set({extensionIsOn: extensionIsOn});
}