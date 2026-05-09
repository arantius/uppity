let list = document.querySelector('ul');
let currentTab = null;


function go(event) {
  const focusedEl = document.activeElement;
  if (!focusedEl) return;
  let url = focusedEl.textContent;
  browser.tabs.update({'url': url});
  window.close();
}

function handleArrowKey(event) {
  const focusedEl = document.activeElement;
  if (focusedEl && event.key == 'Enter') {
    go();
    return;
  }
  if (event.key != 'ArrowDown' && event.key != 'ArrowUp') return;

  const listItems = Array.from(list.children);
  event.preventDefault(); // Prevent default scroll behavior

  let nextIndex = -1;
  if (!focusedEl) {
    nextIndex = 0;
  } else {
    const currentIndex = listItems.indexOf(focusedEl);

    if (event.key === 'ArrowDown') {
      nextIndex = (currentIndex + 1) % listItems.length;
    } else if (event.key === 'ArrowUp') {
      nextIndex = (currentIndex - 1 + listItems.length) % listItems.length;
    }
  }

  if (nextIndex !== -1) {
    listItems[nextIndex].focus();
  }
}


browser.tabs.query({'active': true}).then(tabs => {
  currentTab = tabs.length && tabs[0] || null;
  if (!currentTab) {
    console.warn('No current tab?!');
    return;
  }

  let urls = getUrlsFor(currentTab.url);
  let i = 1;
  for (let url of urls.list.slice(1)) {
    let li = document.createElement('li');
    li.textContent = url;
    li.tabIndex = i++;
    list.appendChild(li);
  }
});


window.addEventListener('keydown', handleArrowKey);
list.addEventListener('click', go);
