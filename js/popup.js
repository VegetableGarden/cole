function getCurrentTabId(callback) {
    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
        if (callback) callback(tabs.length ? tabs[0].id : null);
    });
}

function sendMessageToContentScript(message, callback) {
    getCurrentTabId((tabId) => {
        chrome.tabs.sendMessage(tabId, message, function (response) {
            if (callback) callback(response);
        });
    });
}
$('#cole-popup-token-confirm').click(() => {
    var token = $('.cole-popup-token-input').val();
    var username = $('.cole-popup-username-input').val();
    sendMessageToContentScript({ cmd: 'save-cole-github-token-and-username', token, username }, function (response) { });
})