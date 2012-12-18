/*--------------------------------------------------------
 * Copyright (c) 2011, The Dojo Foundation
 * This software is distributed under the "Simplified BSD license",
 * the text of which is available at http://www.winktoolkit.org/licence.txt
 * or see the "license.txt" file for more details.
 *--------------------------------------------------------*/

/**
 * @fileOverview event features detection.
 * 
 * @compatibility iOS2, iOS3, iOS4, iOS5, iOS6, Android 1.1, Android 1.5, Android 2.1, Android 2.2, Android 2.3, Android 3.0, Android 3.1, Android 4.0, BlackBerry 6, BlackBerry 7, Bada 1.0, Windows Phone 7.5, Windows Phone 8
 * @author Sylvain LALANDE
 * 
 */

define(['../../../_amd/core'], function()
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
			tre: "transitionend",
			msd: "mspointerdown",
			msm: "mspointermove",
			msu: "mspointerup",
			msgs: "msgesturestart",
			msgc: "msgesturechange",
			msge: "msgestureend"
		};

	function hasEvent(name) {
		return (('on' + events[name]) in de);
	}
	
	deferProp(events.ts, events.ts);
	deferProp(events.tm, events.tm);
	deferProp(events.te, events.te);
	deferProp(events.gs, events.gs);
	deferProp(events.gc, events.gc);
	deferProp(events.ge, events.ge);
	deferProp(events.tre, events.tre);
	
	inquireMap({
		"touchstart": function() {
			var ts = hasEvent("ts");
			if (ts) {
				setProp(events.ts, events.ts);
			} else {
				ts = winkhas("mspointer") && hasEvent("msd");
				setProp(events.ts, ts ? 'MSPointerDown' : 'mousedown');
			}
			return ts;
		},
		"touchmove": function() {
			var ts = hasEvent("tm");
			if (ts) {
				setProp(events.tm, events.tm);
			} else {
				ts = winkhas("mspointer") && hasEvent("msm");
				setProp(events.tm, ts ? 'MSPointerMove' : 'mousemove');
			}
			return ts;
		},
		"touchend": function() {
			var ts = hasEvent("te");
			if (ts) {
				setProp(events.te, events.te);
			} else {
				ts = winkhas("mspointer") && hasEvent("msu");
				setProp(events.te, ts ? 'MSPointerUp' : 'mouseup');
			}
			return ts;
		},
		"touch": function() {
			return winkhas(events.ts) && winkhas(events.tm) && winkhas(events.te);
		},
		"mspointer": function() {
			return (w.navigator.msPointerEnabled === true);
		},
		"gesturestart": function() {
            var gs = hasEvent("gs");
            if(gs) {
                setProp(events.gs, events.gs);
            } else {
                gs = winkhas("mspointer") && hasEvent("msgs");
                setProp(events.gs, gs ? 'MSGestureStart': 'gesturestart');
            }
			return gs;
		},
		"gesturechange": function() {
            var gc = hasEvent("gc");
            if(gc) {
                setProp(events.gc, events.gc);
            } else {
                gc = winkhas("mspointer") && hasEvent("msgc");
                setProp(events.gc, gc ? 'MSGestureChange': 'gesturechange');
            }
			return gc;
		},
		"gestureend": function() {
            var ge = hasEvent("ge");
            if(ge) {
                setProp(events.ge, events.ge);
            } else {
                ge = winkhas("mspointer") && hasEvent("msge");
                setProp(events.ge, ge ? 'MSGestureEnd': 'gestureend');
            }
			return ge;
		},
		"gesture": function() {
			return winkhas(events.gs) && winkhas(events.gc) && winkhas(events.ge);
		},
		"transitionend": function() {
			if (winkhas("css-transition")) {
				var prefix = wink.has.prefix;
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
		},
		"hashchange": function() {
			return 'onhashchange' in w;
		},
		"orientationchange": function() {
			return 'onorientationchange' in w;
		}
	});
	
	return winkhas;
});