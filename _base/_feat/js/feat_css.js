/*--------------------------------------------------------
 * Copyright (c) 2011, The Dojo Foundation
 * This software is distributed under the "Simplified BSD license",
 * the text of which is available at http://www.winktoolkit.org/licence.txt
 * or see the "license.txt" file for more details.
 *--------------------------------------------------------*/

/**
 * @fileOverview css features detection.
 * 
 * @compatibility Iphone OS2, Iphone OS3, Iphone OS4, Android 1.1, Android 1.5, Android 2.1, Android 2.2, Android 2.3, Android 3.0, Android 3.1, BlackBerry 6, BlackBerry 7, Bada 1.0, Windows Phone 7.5
 * @author Sylvain LALANDE
 * 
 * @features:
 * 	--> TODO css-rgba
 * 
 */

define(['../../../_base/_base/js/base', './feat'], function(wink) 
{
	var winkhas = wink.has,
		inquireMap = winkhas.inquireMap,
		setProp = winkhas.setProp,
		deferProp = winkhas.deferProp,
		w = window,
		d = w.document,
		el = d.createElement("div"),
		style = el.style,
		prefixes = winkhas.prefixes,
		stringV = "string",
		cssKeys = {
			a: "transform-property",
			b: "transition-property",
			c: "transition-duration",
			d: "transition-delay",
			e: "transition-timing-function",
			f: "border-radius",
			g: "text-shadow",
			h: "box-shadow",
			i: "gradient",
			j: "perspective",
			k: "transform-origin",
			l: "transform-style",
			m: "transform",
			n: "css-transition",
			o: "css-perspective",
			p: "css-transform",
			q: "perspective-origin",
			r: "backface-visibility",
			s: "tap-highlight-color",
			t: "user-select",
			bg: "background-image"
		};
	
	function normalizeKey(key) {
		var result = key;
		var keyReg = /(-)([a-z])/;
		var matches = key.match(keyReg);
		while (matches != null) {
			result = result.replace(keyReg, RegExp["$2"].toUpperCase());
			matches = result.match(keyReg);
		}
		return result;
	}
	
	function hasCss(prop) {
		var supported = false;
		if (typeof style[prop] == stringV) {
			setProp(prop, prop);
			supported = true;
		} else {
			var pr = winkhas.prefix;
			var prfs = (pr != null) ? [ pr ] : prefixes;
	    	var i, l = prfs.length;
	    	for (i = 0; i < l; i++) {
				var key = normalizeKey(prfs[i] + prop);
				if (typeof style[key] == stringV) {
					winkhas.prefix = prfs[i];
					setProp(prop, key);
					supported = true;
					break;
				}
			}
		}
		return supported;
    }
	
	deferProp(cssKeys.a, cssKeys.p);
	deferProp(cssKeys.m, cssKeys.p);
	deferProp(cssKeys.b, cssKeys.n);
	deferProp(cssKeys.c, cssKeys.n);
	deferProp(cssKeys.d, cssKeys.n);
	deferProp(cssKeys.e, cssKeys.n);
	deferProp(cssKeys.f, "css-border-radius");
	deferProp(cssKeys.g, "css-text-shadow");
	deferProp(cssKeys.h, "css-box-shadow");
	deferProp(cssKeys.i, "css-gradient");
	deferProp(cssKeys.j, cssKeys.o);
	deferProp(cssKeys.k, cssKeys.o);
	deferProp(cssKeys.l, cssKeys.o);
	deferProp(cssKeys.q, cssKeys.o);
	
	function singleProp(p) {
		return function() {
			hasCss(p);
		};
	}
	deferProp(cssKeys.r, singleProp(cssKeys.r));
	deferProp(cssKeys.s, singleProp(cssKeys.s));
	deferProp(cssKeys.t, singleProp(cssKeys.t));
	
	inquireMap({
		"css-transform": function() {
			var support = hasCss(cssKeys.m);
			
			var pr = winkhas.prefix;
	    	var trp = cssKeys.m;
	    	if (pr != null) {
	    		trp = (pr + trp);
	    	}

	    	if (!support) {
	    		setProp(cssKeys.a, cssKeys.m);
	    	} else {
	    		setProp(cssKeys.a, winkhas.prop(cssKeys.m));
	    	}
	    	setProp(cssKeys.m, trp);
			
			return support;
	    },
	    "css-transition": function() {
	    	var support = true;
	    	support = support && hasCss(cssKeys.b);
	    	support = support && hasCss(cssKeys.c);
	    	support = support && hasCss(cssKeys.d);
	    	support = support && hasCss(cssKeys.e);
	    	return support;
	    },
		"css-translate3d": function() {
			return winkhas("css-matrix");
		},
	    "css-border-radius": function() {
			return hasCss(cssKeys.f);
	    },
	    "css-text-shadow": function() {
			return hasCss(cssKeys.g);
	    },
	    "css-box-shadow": function() {
			return hasCss(cssKeys.h);
	    },
	    "css-gradient": function() {
	    	var prop = cssKeys.i,
	    		bg = cssKeys.bg,
            	gr = prop,
            	grval = '(linear,left top,right bottom,from(#9f9),to(white));';
	    	
	    	var pr = winkhas.prefix;
	    	var prfs = (pr != null) ? [ "", pr ] : [ "" ].concat(prefixes);
	    	var i, l = prfs.length;
	    	for (i = 0; i < l; i++) {
				var ps = (prfs[i] + gr);
				var s = ps + grval;
				style.cssText = bg + ":" + s;
				if (style[bg] && style[bg].indexOf(prop) != -1) {
					setProp(prop, ps);
	    			return true;
				}
			}
	    	return false;
	    },
	    "css-perspective": function() {
	    	var prs = hasCss(cssKeys.j) && hasCss(cssKeys.k) && hasCss(cssKeys.l) && hasCss(cssKeys.q);
	    	prs = prs && hasCss(cssKeys.k + "-x") && hasCss(cssKeys.k + "-y") && hasCss(cssKeys.k + "-z");
	    	if (!prs) {
	    		return false;
	    	}
	    	var pr = winkhas.prefix || "";
	    	var s = d.createElement('style');
	    	s.textContent = '@media (' + pr + 'transform-3d){#wink_has{height:2px}}';
	    	d.getElementsByTagName('head')[0].appendChild(s);
	    	el.id = 'wink_has';
	    	d.documentElement.appendChild(el);
	    	var result = (el.offsetHeight === 2);
	    	s.parentNode.removeChild(s);
	    	el.parentNode.removeChild(el);
	    	return result;
	    },
	    "css-matrix": function() {
	    	var wcm = w["WebKitCSSMatrix"];
	    	if (typeof wcm == "undefined") {
	    		return false;
	    	}
	    	var m = new wcm("matrix(1,0,0,1,6,7)");
	    	var sp = (m.m41 == 6 && m.m42 == 7) && (m.m41 == m.e && m.m42 == m.f);
	    	if (sp) {
	    		var m2 = new wcm("matrix3d(1,0,0,0,0,1,0,0,0,0,1,0,6,7,8,1)");
	    		sp = sp && (m.m41 == m2.m41) && (m.m42 == m2.m42) && (m2.m43 == 8);
	    	}
	    	return sp;
	    },
	    "css-matrix-stack-inversed": function() {
	    	var ua = wink.ua;
	    	if (!winkhas("css-matrix") || !ua) {
	    		return false;
	    	}
	    	
	    	var v = ua.isIOS ? parseInt("" + ua.osVersion + ua.osMinorVersion + ua.osUpdateVersion) : 500;
	    	var vandroid = ua.isAndroid ? parseInt("" + ua.osVersion + ua.osMinorVersion + ua.osUpdateVersion) : 300;
	    	return (v < 421 || vandroid < 300);
	    },
	    "css-position-fixed": function() {
	    	var ua = wink.ua;
	    	if((ua.isAndroid && (ua.osVersion == 2) && (ua.osMinorVersion == 1)) || ua.isBada)
	    	{
	    		return false;
	    	}
	    	
	    	if (ua.isIOS)
	    	{
	    		if (ua.osVersion < 5)
	    		{
	    			return false;
	    		}
	    		else
	    		{
	    			return true;
	    		}
	    	}
	    	
	    	var container = document.body;
			if (document.createElement && container && container.appendChild && container.removeChild)
			{
				if (!el.getBoundingClientRect)
				{
					return null;
				}
				el.innerHTML = "x";
				el.style.cssText = "position:fixed;top:100px;";
				container.appendChild(el);
				var originalHeight = container.style.height, originalScrollTop = container.scrollTop;
				container.style.height = "3000px";
				container.scrollTop = 500;
				var elementTop = el.getBoundingClientRect().top;
				container.style.height = originalHeight;
				var isSupported = elementTop === 100;
				container.removeChild(el);
				container.scrollTop = originalScrollTop;
				
				return isSupported;
			}
			return false;
	    }
	});
	
	return winkhas;
});
