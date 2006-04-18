function gotoURL(url) {
	var w=getBrowser().contentWindow;
	w.document.location.assign(url);
}