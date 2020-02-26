window.localStorage.clear();

chrome.browserAction.onClicked.addListener(function(tab){
  chrome.tabs.executeScript(tab.id, {code: "window.sessionStorage.show='true';"});
  exec(tab, true);
});

chrome.tabs.onUpdated.addListener(function(tadid, changeinfo, tab) {
  if (changeinfo.status == "complete" && tab.url.match("editorialmanager.com") != null) {
    state = window.localStorage.getItem(tab.id);
    if (state == "true") {
      exec(tab, true);
    } else {
      chrome.tabs.executeScript(tab.id, {code: "window.sessionStorage.clear();"});
      exec(tab, false);
    }
  }
});

chrome.runtime.onMessage.addListener(function (message, sender){
  tabid = sender.tab.id;
  if (message == "ok") {
    window.localStorage.setItem(tabid, "true");
  } else {
    window.localStorage.setItem(tabid, "false");
  }
});

chrome.tabs.onRemoved.addListener(function(tabId, removeInfo){
  window.localStorage.removeItem(tabId);
});

function exec(tab, show) {
  if (tab.url.match("editorialmanager.com") != null) {
    chrome.tabs.executeScript(tab.id, {file: 'libs/content.js', allFrames: true});
    chrome.tabs.executeScript(tab.id, {file: 'libs/scholarone.js', allFrames: true});
  }
  chrome.tabs.executeScript(tab.id, {file: 'libs/jquery.min.js', allFrames: true});
  chrome.tabs.executeScript(tab.id, {file: 'libs/jquery.json.js', allFrames: true});
  chrome.tabs.executeScript(tab.id, {file: 'libs/jquery.soap.js', allFrames: true});
  chrome.tabs.executeScript(tab.id, {file: 'src/queryAPI.js', allFrames: false}, function(){});
  chrome.tabs.executeScript(tab.id, {file: 'src/analyze.js', allFrames: false}, function(){});

  chrome.tabs.executeScript(tab.id, {file: 'src/createUI.js', allFrames: false}, function(){
    //if (show) chrome.tabs.executeScript(tab.id, {code: "$('#side').show();"});
  });
}

