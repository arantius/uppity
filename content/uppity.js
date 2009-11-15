var uppity={

reportErrors:false,

goUp:function(e) {
	var URLs=this.getUrls();
	if (0==URLs.length) return;

	if (e && 'undefined'!=typeof e.target.value) {
		openUILink(URLs.list[e.target.value], e);
	} else {
		if (URLs.next) {
			openUILink(URLs.list[URLs.next], e);
		}
	}
},

getPref:function(type, name) {
	var pref = Components.classes['@mozilla.org/preferences-service;1'].getService(Components.interfaces.nsIPrefBranch);
	try {
		switch(type) {
		case 'bool':   return pref.getBoolPref(name);
		case 'int':    return pref.getIntPref(name);
		case 'string':
		default:       return pref.getCharPref(name);
		}
	} catch (e) {
		if (uppity.reportErrors) Components.utils.reportError(e);
	}
	return '';
},

setPref:function(type, name, value) {
	var pref = Components.classes['@mozilla.org/preferences-service;1'].getService(Components.interfaces.nsIPrefBranch);
	try {
		switch (type) {
		case 'bool':   pref.setBoolPref(name, value); break;
		case 'int':    pref.setIntPref(name, value); break;
		case 'string':
		default:       pref.setCharPref(name, value); break;
		}
	} catch (e) {
		if (uppity.reportErrors) Components.utils.reportError(e);
	}
},

loadOptions:function() {
	try {
		window.document.getElementById('uppity-sb-icon')
			.checked=this.getPref('bool', 'uppity.sb-icon');
	} catch (e) {
		if (uppity.reportErrors) Components.utils.reportError(e);
	}
	return true;
},

saveOptions:function() {
	try {
		this.setPref('bool', 'uppity.sb-icon',
			Boolean(window.document.getElementById('uppity-sb-icon').checked)
		);

		//this might be a little dirty ....
		window.opener.opener.uppity.setSBButtonVis();
	} catch (e) {
		if (uppity.reportErrors) Components.utils.reportError(e);
	}

	return true;
},

setSBButtonVis:function() {
	var show=this.getPref('bool', 'uppity.sb-icon');
	var sb=document.getElementById('status-bar-uppity');
	if (!sb) return;
	sb.style.display=(show?'-moz-box':'none');
},

turnOffSBButton:function() {
	this.setPref('bool', 'uppity.sb-icon', false);
	this.setSBButtonVis();
},

openTbMenu:function() {
	var btn=document.getElementById('tb-uppity');
	if (!btn) return;
	btn.open=true;
},

showTbDropDown:function(e) {
	var box=e.target;
	//remove any existing entries
	var children = box.childNodes;
	while (children[0]) {
		try {
			box.removeChild(children[0]);
		} catch (e) {
			if (uppity.reportErrors) Components.utils.reportError(e);
		}
	}

	uppity.addDropDownEntries(box);
},

showSbDropDown:function(e) {
	var box=e.target;
	//remove any existing entries
	while (box.lastChild && 'menuseparator'!=box.lastChild.tagName) {
		try {
			box.removeChild(box.lastChild);
		} catch (e) { }
	}

	uppity.addDropDownEntries(box);

	var haveItems=('menuseparator'!=box.lastChild.tagName)
	document.getElementById('status-bar-uppity-separator')
		.setAttribute(
			'collapsed',
			( haveItems ? 'false' : 'true' )
		);
	document.getElementById('status-bar-uppity-goup')
		.setAttribute(
			'disabled',
			( haveItems ? 'false' : 'true' )
		);
},

addDropDownEntries:function(box) {	
	//create new entries
	var origUrl=getBrowser().contentWindow.location.href;
	var URLs=this.getUrls(), m;
	if (0==URLs.length) return;// false;
	for (var i=0; i<URLs.list.length; i++) {
		m=document.createElement("menuitem");
		m.setAttribute('label', URLs.list[i]);
		m.setAttribute('index', i);
		m.setAttribute('value', i);
		m.setAttribute('type', 'radio');
		if (i==URLs.curr) {
			m.setAttribute('checked', 'true');
		}
		box.appendChild(m);
	}
},

parseUrlRegex:new RegExp('([a-z]+://)([^/]*)(/.*)'),
parseUrl:function(url) {
	var m=uppity.parseUrlRegex.exec(url);
	if (!m) throw new Error('could not parse URL: '+url);

	return {
		'scheme':m[1],
		'host':m[2],
		'path':m[3],
	}
},

getUrls:function() {
	// http://kevin.vanzonneveld.net
	function in_array(needle, haystack, argStrict) {
		var found = false, key, strict = !!argStrict;
	 
		for (key in haystack) {
			if ((strict && haystack[key] === needle) || (!strict && haystack[key] == needle)) {
				found = true;
				break;
			}
		}
	 
		return found;
	}

	var b=getBrowser();
	var thisUrl=b.contentWindow.location.href;
	var lastUrl=b.uppityLastUrl;

	try {
		//check for validity
		if ('about:'==thisUrl.substr(0, 6)) throw new Error('bad scheme: '+thisUrl);

		if (lastUrl && in_array(thisUrl, uppity.getUrlsFor(lastUrl).list)) {
			// If this location comes from uppity-ing the last location, start
			// making choices from that previous location.
			thisUrl=lastUrl;
		} else {
			// Otherwise save this location, for possible recall later.
			// We make up an object that is a shallow copy -- otherwise, we get
			// a reference which is updated as we browse.
			b.uppityLastUrl=thisUrl;
		}

		return uppity.getUrlsFor(thisUrl);
	} catch (e) {
		// For any problem, including our made up ones, return empty list.
		if (uppity.reportErrors) Components.utils.reportError(e);
		return {'list':[], 'curr':null, 'next':null};
	}
},

getUrlsFor:function(url) {
	if (!url) throw new Error('url required!');

	var URLs=[url];
	var loc=uppity.parseUrl(url);

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
	} catch (e) {
		if (uppity.reportErrors) Components.utils.reportError(e);
	}
	
	// Find the "current" and "next" index.
	var here=getBrowser().contentWindow.location.href;
	var curr=null, next=null
	for (var i=0, url=null; url=URLs[i]; i++) {
		if (here==url) {
			curr=i;
			if (URLs[i+1]) next=i+1;
			break
		}
	}
	
	return {'list':URLs, 'curr':curr, 'next':next};
},

setDisabled:function(url) {
	// if they don't have the toolbar button, don't toggle it
	if (!document.getElementById('tb-uppity')) return;

	if (uppity.getUrls().list.length>0) {
		document.getElementById('tb-uppity').removeAttribute('disabled');
	} else {
		document.getElementById('tb-uppity').setAttribute('disabled', true);
	}
},

webProgressListener:{
	onProgressChange:function (wp, req, cur, max, curtotal, maxtotal) {},
	onStateChange:function (wp, req, state, status) {},
	onLocationChange:function (wp, req, loc) {
		uppity.setDisabled(loc?loc.asciiSpec:null);
	},
	onStatusChange:function (wp, req, status, message) {},
	onSecurityChange:function (wp, req, state) {},
	startDocumentLoad:function(req) {},
	endDocumentLoad:function(req, status) {}
}

}//close var uppity

window.addEventListener('load', function() {
	// set initial status
	uppity.setDisabled();
	uppity.setSBButtonVis();
	uppity.reportErrors=uppity.getPref('bool', 'uppity.reportErrors');

	// set load progress listener
	var doc=document.getElementById('content');
	if (doc) doc.addProgressListener(uppity.webProgressListener);
	// also listen for when there are new tabs created
	var cont=gBrowser.tabContainer;
	if (cont) cont.addEventListener('TabSelect', uppity.setDisabled, false);
}, false);
