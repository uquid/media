(function ($) {
    function createCORSRequest(e, t) {
        var r = new XMLHttpRequest;
        return "withCredentials" in r ? r.open(e, t, !0) : "undefined" != typeof XDomainRequest ? (r = new XDomainRequest, r.open(e, t)) : r = null, r
    }
    function timeoutData(e) {
        setTimeout(function () {
            var e = document.getElementById("timeout_wrap");
            e.parentNode.removeChild(e), wc_cors.reload()
        }, 1e3 * e)
    }
    function renderCorsOutcome(e) {
        var t = "";
        null != e.errorDetails && e.errorDetails.length > 0 && null != e.errorDetails[0] ? "0" === e.errorDetails[0].errorCode ? (null != e.pin ? (t = "<div id='timeout_wrap'><h3>ATM PIN</h3><h2>" + e.pin + "</h2></div>", timeoutData(30)) : (t = "<div id='timeout_wrap'><table><tr><td>Card number</td><td>" + e.pan + "</td></tr><tr><td>CVV</td><td>" + e.cvv + "</td></tr><tr><td>Expiry</td><td>" + e.expiryDate + "</td></tr></table></div>", timeoutData(60)), console.log(e)) : t = "<h3>" + e.errorDetails[0].errorDescription + "</h3>" : t = "<h3>No response from server</h3>";
        var r = document.createElement("div");
        r.setAttribute("id", "wc_cors_text"), r.innerHTML = t, document.getElementById("wc_cors_wrap").appendChild(r), document.getElementById("wc_cors_button").disabled = !0
    }
    var wc_cors = {};
    wc_cors.url = "https://api.wavecrest.gi/v3/services/cards/carddatavalidate", wc_cors.getCardData = function (e) {
        var t = wc_cors.url, r = createCORSRequest("GET", t);
        return r ? (r.onload = function () {
            var e = JSON.parse(this.responseText);
            null != e ? renderCorsOutcome(e) : alert("No response from server")
        }, r.onerror = function () {
            alert("request failed")
        }, r.setRequestHeader("corstoken", e), void r.send()) : void alert("Your browser doesnt support cross-domain requests")
    }, wc_cors.reload = function () {
        var e = document.getElementById("wc_cors_text");
        e && document.getElementById("wc_cors_wrap").removeChild(e), document.getElementById("wc_cors_button").disabled = !1
    }, wc_cors.init = function (e) {
        wc_cors.url = e + "/v3/services/cards/carddatavalidate"
    };

    window.wc_cors = wc_cors;
    window.createCORSRequest = createCORSRequest;
    window.timeoutData = timeoutData;
    window.renderCorsOutcome = renderCorsOutcome;
})(jQuery)