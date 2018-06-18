$(document).ready(function() {
    $("a#active_btn").click(function () {
        console.log("turn on")
        $("div#img_container img")[0].src = "icons/on.png"
    })
});