'use strict';

const parseUrlRegex = new RegExp('(file:/+|[a-z]+://)([^/]*)(/.*)');


function parseUrl(url) {
  var m=parseUrlRegex.exec(url);
  if (!m) throw new Error('could not parse URL: '+url);

  return {
    'scheme':m[1],
    'host':m[2],
    'path':m[3]
  };
}


function getUrlsFor(url) {
  if (!url) throw new Error('url required!');

  if (url.match(/^(about|chrome|data|file|javascript):/)) {
    return {'list':[], 'curr':null, 'next':null};
  }

  var URLs=[url];
  var loc=parseUrl(url);

  try {
    //get the URL
    var scheme=loc.scheme;
    var host=loc.host;
    var path=loc.path
        .replace(/\/$/, '')
        .replace(/^\/+/, '');
    var emptyPath=(''==path);

    //strip hash if there
    if (path.indexOf('#')>0) {
      path=path.replace(/#.*/, '');
      URLs.push(scheme+host+'/'+path);
    }
    //strip querystring if there
    if (path.indexOf('?')>0) {
      path=path.replace(/\?.*/, '');
      URLs.push(scheme+host+'/'+path);
    }
    //strip files/directories if there
    path=path.replace(/\/+$/, '');
    while (path.indexOf('/')>0) {
      path=path.replace(/\/[^\/]*$/, '');
      URLs.push(scheme+host+'/'+path+'/');
    }
    //host only
    if (!emptyPath && ''!=host) URLs.push(scheme+host+'/');

    //strip subdomains if there
    var subs=0;
    if (!host.match(/^([0-9]+\.)+$/)) { // if it's not a numeric IP
      var hostSuffix='';
      // strip port
      var x=host.lastIndexOf(':');
      if (x>0) {
        hostSuffix=host.substr(x);
        host=host.substr(0, x);
      }
      // strip TLD
      hostSuffix=host.substr(host.length-6)+hostSuffix;
      host=host.substr(0, host.length-6);

      while (-1!=host.indexOf('.')) {
        subs++;
        host=host.replace(/[^.]*\./, '');
        URLs.push(scheme+host+hostSuffix+'/');
      }
    }

    // If the original URL does NOT start with 'www.' (and this isn't a
    // "file://" link, with no host), then put in an entry that does.
    var lastUrl=URLs[URLs.length-1];
    if ('www.'!=loc.host.substr(0, 4) && 'file://'!=loc.scheme) {
      var wwwUrl=lastUrl.replace(/^([a-z]+:\/\/)/, '$1www.');
      if (subs) {
        // If there were subdomains stripped, put the "www" choice
        // between them and the bare domain.
        URLs.splice(URLs.length-1, 0, wwwUrl);
      } else {
        // Otherwise, put the "www." choice at the end of the list.
        URLs.push(wwwUrl);
      }
    }
  } catch (e) { }

  // Find the "current" and "next" index.
  var curr=null, next=null;
  for (var i=0, x=null; x=URLs[i]; i++) {
    if (x==url) {
      curr=i;
      if (URLs[i+1]) next=i+1;
      break;
    }
  }

  return {'list':URLs, 'curr':curr, 'next':next};
}


function setDisabled(url) {
  if (getUrlsFor(url).list.length>0) {
    browser.browserAction.enable();
  } else {
    browser.browserAction.disable();
  }
}


browser.webNavigation.onCompleted.addListener(detail => {
  setDisabled(detail.url);
});
browser.tabs.onActivated.addListener(event => {
  browser.tabs.query({'active': true}).then(tabs => {
    let currentTab = tabs.length && tabs[0] || null;
    if (!currentTab) {
      console.warn('No current tab?!');
      return;
    }
    setDisabled(currentTab.url);
  });
});
