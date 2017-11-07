# Documentation

The point of Uppity is to "go up" on the web.
It relies primarily on the fact that URLs are arranged in a way similar to a [file system](http://en.wikipedia.org/wiki/File_system), with other well defined pieces.
A URL can look something like this:

 http://www.example.com/path/to/file.txt?query=value#anchor

If you were on a page with that URL, Uppity would descend to these URLs, one by one, in this order:

 * http://www.example.com/path/to/file.txt?query=value
 * http://www.example.com/path/to/file.txt
 * http://www.example.com/path/to/
 * http://www.example.com/path/
 * http://www.example.com/
 * http://example.com/

Clicking either the button on the toolbar or status bar will move from one page to the next in that list.
The keyboard shortcut `ALT-Up` (`Option-Up` on the Mac) will also navigate this way.
Clicking the drop-down arrow next to the toolbar button will present that entire list, from where you can navigate directly to any of those options.  The `ALT-Down` (`Option-Down` on the Mac) key will also open this list.

Both of these buttons are disabled by default.
(Don't you hate when an extension thinks it's important enough to own your browser?  I do.)
So, pick which one you'd like to use and turn it on yourself.
The statusbar button is controlled by the extension options.
The toolbar button is controlled like any other toolbar button.
Right click on your toolbar, choose `Customize`, and then just drag-and-drop the Uppity button to where you like it.

# Changelog

 * Version 1.6 (pending)
  * Rewrite for WebExtension compatibility.
 * Version 1.5.8 (Jun 26, 2011)
  * Firefox 5.0 compatibility.
  * Updated translations from babelzilla.org.
 * Version 1.5.7 (Mar 5, 2011)
  * Firefox 4 compatibility
  * Attach a drop-down menu to the URL bar, for Alt-Down w/out toolbar button.
  * Special case file: URLs that sometimes contain extra slashes.
  * Translation updates.
 * Version 1.5.6 (Nov 15, 2009)
   * New translation: sr-RS.  Updated translation: fr-FR.
   * Firefox 3.6 compatibility flag.
   * Silence reported errors.
   * Fix an error case when there is no subdomain or path in the original URL.
 * Version 1.5.5 (June 14, 2009)
   * Fix recently introduced bug when visiting `file://` URLs. 
   * Add the list of possible upward navigations to the status bar context menu, just like the drop-down of the toolbar button.
 * Version 1.5.4 (May 20, 2009)
   * Throughout the entire system, more carefully consider which is the "current" and which is the "next" URL, if any.  This changed as of #236 to be more complex.
   * Repackage to include missed code, intended for 1.5.3 (#273, #274)
 * Version 1.5.3 (May 14, 2009)
   * Remove Apple-Up and Apple-Down key bindings, which blocked the defaults already on those keys.
   * Prevent duplicate menu items when there is a trailing slash in the path.
 * Version 1.5.2 (May 10, 2009)
   * Compatibility with Firefox 3.5.
   * Add a link to "www.example.com" when it is not already present.
   * Don't interfere with the context menu.
   * Like the back/forward menu, remember where you came from, present going "back down" as options, and indicate where you currently are in the list.
   * Apple-up and Apple-down keyboard shortcuts for the Mac.
   * Add translations: ar, mk-MK, uk-UA.
 * Version 1.5.1 (September 27, 2008)
   * Hard code compatibility with "3.0.*" into install.rdf, and upload this to AMO.
   * Strip extra leading slashes from URL path names.
 * Version 1.5 (May 3, 2008)
   * Add translations: cs-CZ, pl-PL, sk-SK, gl-ES, tr-TR
   * Add a new shortcut key (ALT-Down) to open the dropdown menu of the toolbar button.  From there, arrows and enter selects any item from the list.
   * Set enable/disable state also when switching tabs (including creating a new blank tab).
   * Compatibility with FF 3 betas.
 * Version 1.4.14 (Mar 28, 2007)
   * Deal with subdomain-stripping properly when the host includes a port number.
   * Add translations: ko-KR, ja-JP.
   * Update translations: da-DK, nl-NL, it-IT, fr-FR.
 * Version 1.4.12 (Feb 19, 2007)
   * Add translations: zh-CN, fi-FI, ca-AD
 * Version 1.4.11
   * Fix the keyboard shortcut, also broken in 1.4.7.
 * Version 1.4.10
   * Internal fix for locale translations.
 * Version 1.4.9
   * Fix the status bar button, broken in 1.4.7.
 * Version 1.4.8
   * Four new translations.
 * Version 1.4.7
   * Firefox 2.0 compatibility.
   * User submitted middle-click-opens-new-tab feature.
 * Version 1.4.6
   * Bugfix for poor enable/disable logic.  It is now as intelligent as it should have been.
 * Version 1.4.5
   * Bugfix removal of subdomains.
   * Add disabled state (for toolbar button) when there is no up to go.
 * Version 1.4.4
   * Internal version.
 * Version 1.4.3
   * Do not truncate hostnames that are numeric IP addresses.
   * Do not truncate hostnames down too far, i.e. "amazon.co.uk" to "co.uk".
 * Version 1.4.2
   * Translation updates.
 * Version 1.4.1
   * Seven language translations, thanks BabelZilla!
   * Bugfix: old sites' pages would show up in the drop-down menu.
 * Version 1.4
   * Compatibility with Firefox 1.5.
   * Attempted, mostly failed, french translation.
 * Version 1.2
   * Nice new graphics submitted by Lee Netherton.
 * Version 1.1
   * Drop-down menu to make navigating many-levels-up quick and simple.
   * Keyboard shortcut Alt-Up.
   * (Optional) button on the status bar.

# Credits

 * As of version 1.2, Uppity uses user-contributed icons from Lee Netherton.

# License

Uppity is released under the MIT license.
