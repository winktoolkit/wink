/*--------------------------------------------------------
 * Copyright (c) 2011, The Dojo Foundation
 * This software is distributed under the "Simplified BSD license",
 * the text of which is available at http://www.winktoolkit.org/licence.txt
 * or see the "license.txt" file for more details.
 *--------------------------------------------------------*/

(function(winkloader) {

/*
 * Detect the appropriate target. "default" by default.
 * The result may be based on user-agent detection, feature detection...
 * To improve as needed.
 */
winkloader.detectTarget = function() {
	var result = "default";
	
	var n = navigator || {}, ua = n.userAgent, pf = n.platform, av = n.appVersion;
	var set = {
		webkit: (function() { return RegExp(" AppleWebKit/").test(ua) })(),
		ios: (function() { return (RegExp(/iphone/i).test(pf) || RegExp(/ipod/i).test(pf) || RegExp(/ipad/i).test(pf) ) })(),
		android: (function() { return RegExp(/android/i).test(av) })(),
		opera: (function() { return RegExp(/Opera/gi).test(ua) })(),
		blackberry: (function() { return RegExp(/blackberry/i).test(pf) })(),
		bada: (function() { return RegExp(/bada/gi).test(ua) } )(),
		firefox: (function() { return RegExp(/firefox/i).test(ua) } )(),
		ie: (function() { return RegExp(/MSIE/i).test(ua) } )()
	};
	
	if (!set.webkit && set.ie) {
		result = "ie";
	}
	return result;
};

/*
 * @param parent
 * @param url
 * @param callback
 * @param errorCallback
 */
var _addScript = function(parent, url, callback, errorCallback) {
	var s = document.createElement('script');
	s.type = 'text/javascript';
	
	if (s.addEventListener) {
		var loadCb = function(e) {
			s.removeEventListener("load", loadCb, false);
			s.removeEventListener("error", errorCb, false);
			callback();
		};
		var errorCb = function(e) {
			s.removeEventListener("load", loadCb, false);
			s.removeEventListener("error", errorCb, false);
			errorCallback();
		};
		s.addEventListener("load", loadCb, false);
		s.addEventListener("error", errorCb, false);
	} else {
		var cb = function(evt) {
			var node = evt.currentTarget || evt.srcElement;
			if (/^(complete|loaded)$/.test(node.readyState)) {
				s.detachEvent("onreadystatechange", cb);
				callback();
			}
		};
		s.attachEvent("onreadystatechange", cb);
	}
	
	s.src = url;
	parent.appendChild(s);
};

winkloader.setMethods(_addScript);

})(winkloader);
