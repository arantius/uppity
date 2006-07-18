var uppity={
//this is directly adapted from a bookmarklet I wrote some time ago
//so the variables are all terse.  a later version should see a 
//revamp of this code but I'm proud to finally have written my first
//firefox extension from scratch!
goUp:function(e) {
	var URLs=this.getURLs(), URL;
	if (0==URLs.length) return;
	if (e) {
		URL=URLs[e.target.value];
	} else {
		URL=URLs[0];
	}
	getBrowser().contentWindow.location.assign(URL);
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
	} catch (e) { this.dumpErr(e) }
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
	} catch (e) { this.dumpErr(e) }
},

loadOptions:function() {
	try {
	window.document.getElementById('uppity-sb-icon').checked=this.getPref('bool', 'uppity.sb-icon');
	} catch (e) { this.dumpErr(e) }
	return true;
},

saveOptions:function() {
	try {
	this.setPref('bool', 'uppity.sb-icon',
		Boolean(window.document.getElementById('uppity-sb-icon').checked)
	);

	//this might be a little dirty ....
	window.opener.opener.uppity.setSBButtonVis();
	} catch (e) { this.dumpErr(e) }
	return true;
},

dumpErr:function(e) {
	var s='Error in uppity:  ';
	s+='Line: '+e.lineNumber+'  ';
	s+=e.name+': '+e.message+'\n';
	//s+='Stack:\n'+e.stack+'\n\n';
	dump(s);
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

showDropDown:function(e) {
	var box=e.target;
	//remove any existing entries
	var children = box.childNodes;
	while (children[0]) {
		try {
			box.removeChild(children[0]);
		} catch (e) { this.dumpErr(e); }
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
		if (!host.match(/([0-9]+\.)+/)) { // if it's not a numeric IP
			var hostSuff=host.substr(host.length-6);
			host=host.substr(0, host.length-6);

			while (host.match(/\..*\./)) {
				host=host.replace(/[^.]*\./, '');
				URLs[URLs.length]=scheme+host+hostSuff+'/';
			}
		}
	} catch (e) { this.dumpErr(e); }
	return URLs;
},

}//close var uppity

window.addEventListener('load', function() {
	//turn on/off status bar button
	uppity.setSBButtonVis();
}, false); // end window.addEventListener('load'...)
