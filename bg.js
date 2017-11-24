'use strict';


function goUp() {
  browser.tabs.query({'active': true, 'currentWindow': true}).then(tabs => {
    let currentTab = tabs.length && tabs[0] || null;
    if (!currentTab) {
      console.warn('No current tab?!');
      return;
    }
    let currentUrl = currentTab.url;

    let urls = getUrlsFor(currentUrl);
    let nextUrl = urls.list[urls.next];
    if (nextUrl) {
      browser.tabs.update(currentTab.id, {'url': nextUrl});
    }
  });
}

browser.browserAction.onClicked.addListener(goUp);
browser.commands.onCommand.addListener(command => {
  if (command == 'go-up') {
    goUp();
  } else if (command == 'menu') {
    // Oh "Activating a keyboard shortcut defined by the extension
    // (note: this is not currently supported in Firefox)." =(

    //browser.browserAction.openPopup();
  }
});
