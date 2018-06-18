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
    $(this).keypress(function(event) {
        // search

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