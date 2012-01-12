/*--------------------------------------------------------
 * Copyright (c) 2011, The Dojo Foundation
 * This software is distributed under the "Simplified BSD license",
 * the text of which is available at http://www.winktoolkit.org/licence.txt
 * or see the "license.txt" file for more details.
 *--------------------------------------------------------*/

/**
 * @fileOverview event features detection.
 * 
 * @compatibility Iphone OS2, Iphone OS3, Iphone OS4, Android 1.1, Android 1.5, Android 2.1, Android 2.2, Android 2.3, Android 3.0, Android 3.1, BlackBerry 6, BlackBerry 7, Bada 1.0, Windows Phone 7.5
 * @author Sylvain LALANDE
 * 
 * @features:
 * 	--> TODO hashchange
 */

define(['../../../_base/_base/js/base', './feat'], function(wink)
{
	var winkhas = wink.has,
		inquireMap = winkhas.inquireMap,
		setProp = winkhas.setProp,
		deferProp = winkhas.deferProp,
		w = window,
		d = w.document,
		de = d.documentElement,
		events = {
			ts: "touchstart",
			tm: "touchmove",
			te: "touchend",
			gs: "gesturestart",
			gc: "gesturechange",
			ge: "gestureend",
			tre: "transitionend"
		};

	function hasEvent(name) {
		return (('on' + events[name]) in de);
	}
	
	deferProp(events.ts, events.ts);
	deferProp(events.tm, events.tm);
	deferProp(events.te, events.te);
	deferProp(events.tre, events.tre);
	
	inquireMap({
		"touchstart": function() {
			var ts = hasEvent("ts");
			setProp(events.ts, ts ? events.ts : 'mousedown');
			return ts;
		},
		"touchmove": function() {
			var ts = hasEvent("tm");
			setProp(events.tm, ts ? events.tm : 'mousemove');
			return ts;
		},
		"touchend": function() {
			var ts = hasEvent("te");
			setProp(events.te, ts ? events.te : 'mouseup');
			return ts;
		},
		"touch": function() {
			return winkhas(events.ts) && winkhas(events.tm) && winkhas(events.te);
		},
		"gesturestart": function() {
			return hasEvent("gs");
		},
		"gesturechange": function() {
			return hasEvent("gc");
		},
		"gestureend": function() {
			return hasEvent("ge");
		},
		"gesture": function() {
			return winkhas(events.gs) && winkhas(events.gc) && winkhas(events.ge);
		},
		"transitionend": function() {
			if (winkhas("css-transition")) {
				var prefix = winkhas.prefix;
				var val = events.tre;
				if (prefix == "-webkit-") {
					val = "webkitTransitionEnd";
				} else if (prefix == "-o-") {
					val = "oTransitionEnd";
				}
				setProp(events.tre, val);
				return true;
			}
			return false;
		}
	});
	
	return winkhas;
});