let list = document.querySelector('ul');

browser.tabs.query({'active': true}).then(tabs => {
  let currentTab = tabs.length && tabs[0] || null;
  if (!currentTab) {
    console.warn('No current tab?!');
    return;
  }
  let currentUrl = currentTab.url;

  let urls = getUrlsFor(currentUrl);
  for (let url of urls.list) {
    let li = document.createElement('li');
    li.textContent = url;
    list.appendChild(li);
  }
});

// How to open this popup?!
