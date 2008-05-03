var uppity={

goUp:function(e) {
	var URLs=this.getURLs();
	if (0==URLs.length) return;

	if (e && 'undefined'!=typeof e.target.value) {
		openUILink(URLs[e.target.value], e);
	} else {
		openUILink(URLs[0], e);
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
	} catch (e) { }
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
	} catch (e) { }
},

loadOptions:function() {
	try {
	window.document.getElementById('uppity-sb-icon').checked=this.getPref('bool', 'uppity.sb-icon');
	} catch (e) { }
	return true;
},

saveOptions:function() {
	try {
	this.setPref('bool', 'uppity.sb-icon',
		Boolean(window.document.getElementById('uppity-sb-icon').checked)
	);

	//this might be a little dirty ....
	window.opener.opener.uppity.setSBButtonVis();
	} catch (e) { }
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

openMenu:function() {
	var btn=document.getElementById('tb-uppity');
	if (!btn) return;
	btn.open=true;
},

showDropDown:function(e) {
	var box=e.target;
	//remove any existing entries
	var children = box.childNodes;
	while (children[0]) {
		try {
			box.removeChild(children[0]);
		} catch (e) { }
	}

	//create new entries
	var URLs=this.getURLs(), m;
	if (0==URLs.length) return;// false;
	for (var i=0; i<URLs.length; i++) {
		m=document.createElement("menuitem");
		m.setAttribute('label', URLs[i]);
		m.setAttribute('index', i);
		m.setAttribute('value', i);
		box.appendChild(m);
	}
	//return true;
},

getURLs:function() {
	var URLs=[], loc=getBrowser().contentWindow.location;
	try {
		//check for validity
		if ('about:'==loc.protocol) return URLs;

		//get the URL
		var path=loc.href;
		//strip off the scheme and host
		path=path.replace(/^.*:\/\/[^\/]*\//, '');
		//and the trailing slash if there
		path=path.replace(/\/$/, '');
		var host=loc.host;
		var scheme=loc.protocol+'//';
		var emptyPath=(''==path);

		//strip hash if there
		if (path.indexOf('#')>0) {
			path=path.replace(/#.*/, '');
			URLs[URLs.length]=scheme+host+'/'+path;
		}
		//strip querystring if there
		if (path.indexOf('?')>0) {
			path=path.replace(/\?.*/, '');
			URLs[URLs.length]=scheme+host+'/'+path;
		}
		//strip files/directories if there
		while (path.indexOf('/')>0) {
			path=path.replace(/\/[^\/]*$/, '');
			URLs[URLs.length]=scheme+host+'/'+path+'/';
		}
		//host only
		if (!emptyPath) URLs[URLs.length]=scheme+host+'/';

		//strip subdomains if there
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
				host=host.replace(/[^.]*\./, '');
				URLs[URLs.length]=scheme+host+hostSuffix+'/';
			}
		}
	} catch (e) { }
	return URLs;
},

setDisabled:function(url) {
	// if they don't have the toolbar button, don't toggle it
	if (!document.getElementById('tb-uppity')) return;

	if (uppity.getURLs().length>0) {
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
	// turn on/off status bar button
	uppity.setSBButtonVis();

	// set initial disabled status
	uppity.setDisabled();

	// set load progress listener
	var doc=document.getElementById('content');
	if (doc) doc.addProgressListener(uppity.webProgressListener);
	// also listen for when there are new tabs created
	var cont=gBrowser.tabContainer;
	if (cont) cont.addEventListener('TabSelect', uppity.setDisabled, false);
}, false);
