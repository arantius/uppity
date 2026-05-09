'use strict';


async function getNextUrl() {
  let tabs = await browser.tabs.query({'active': true, 'currentWindow': true});
  let currentTab = tabs.length && tabs[0] || null;
  if (!currentTab) {
    console.warn('No current tab?!');
    return;
  }
  let currentUrl = currentTab.url;
  let urls = getUrlsFor(currentUrl);
  return urls.list[urls.next];
}

browser.browserAction.onClicked.addListener(async () => {
  let nextUrl = await getNextUrl();
  browser.tabs.update({'url': nextUrl});
});
browser.commands.onCommand.addListener(async command => {
  let nextUrl = await getNextUrl();
  if (!nextUrl) return;
  if (command == 'go-up') {
    browser.tabs.update({'url': nextUrl});
  } else if (command == 'menu') {
    browser.browserAction.setPopup({'popup': 'popup.html'});
    browser.browserAction.openPopup();
    browser.browserAction.setPopup({'popup': null});
  }
});
