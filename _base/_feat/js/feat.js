/*--------------------------------------------------------
 * Copyright (c) 2011, The Dojo Foundation
 * This software is distributed under the "Simplified BSD license",
 * the text of which is available at http://www.winktoolkit.org/licence.txt
 * or see the "license.txt" file for more details.
 *--------------------------------------------------------*/

/**
 * @fileOverview The wink feature detection provider.
 * 
 * @compatibility Iphone OS2, Iphone OS3, Iphone OS4, Android 1.1, Android 1.5, Android 2.1, Android 2.2, Android 2.3, Android 3.0, Android 3.1, BlackBerry 6, BlackBerry 7, Bada 1.0, Windows Phone 7.5
 * @author Sylvain LALANDE
 */

define(['../../../_base/_base/js/base'], function(wink)
{
	var features = {},
		properties = {},
		isFunc = wink.isFunction;
	
	
	/**
	 * @namespace Feature detection
	 * 
	 * @see <a href="WINK_ROOT_URL/_base/_feat/test/test_feat.html" target="_blank">Test page</a>
	 */
	wink.has = has;
	
	wink.has.prefixes = [ "-webkit-", "-moz-", "-o-", "ms-", "-khtml-" ];
	wink.has.prefix = null;
	
	/**
	 * Test if the given feature is supported
	 * 
	 * @function
	 * @name wink.has#has
	 * 
	 * @param {string} feature The feature to test
	 * 
	 * @returns {boolean} True if the feature is supported false otherwise
	 * 
	 * @example
	 * 
	 * if ( wink.has('native-geolocation') )
	 * {
	 * 	...
	 * }
	 * 
	 * // Supported features:
	 * 
	 * native-geolocation, 
	 * native-device-orientation, 
	 * native-device-motion, 
	 * css-transform, 
	 * css-transition, 
	 * css-translate3d, 
	 * css-border-radius, 
	 * css-text-shadow, 
	 * css-box-shadow, 
	 * css-gradient, 
	 * css-perspective, 
	 * css-matrix, 
	 * css-matrix-stack-inversed, 
	 * css-position-fixed, 
	 * touchstart, 
	 * touchmove, 
	 * touchend, 
	 * touch, 
	 * gesturestart, 
	 * gesturechange, 
	 * transitionend, 
	 * gestureend, 
	 * gesture, 
	 * json-parse
	 * 
	 */
	function has(feature) {
		if (isFunc(features[feature])) {
			features[feature] = features[feature]();
		}
		return features[feature];
	}
	
	/**
	 * Inquires about the given feature
	 * 
	 * @function
	 * @param {string} feature The feature to inquire
	 * @param {function} assertSupported The function that investigates or the boolean value if known
	 * @param {boolean} now Allows to investigate now
	 */
	wink.has.inquire = inquire;
	function inquire(feature, assertSupported, now) {
		if (typeof features[feature] != "undefined") {
			return;
		}
		var assert = assertSupported;
		if (now && isFunc(assertSupported)) {
			assert = assertSupported();
		}
		features[feature] = assert;
	}

	/**
	 * Inquires about a map of features
	 * 
	 * @function
	 * @param {object} map The map of features
	 * @param {boolean} now Allows to investigate now
	 */
	wink.has.inquireMap = inquireMap;
	function inquireMap(map, now) {
		if (!map || map.length == 0) {
			return;
		}
		for (var f in map) {
			inquire(f, map[f], now);
		}
	}
	
	/**
	 * Set a property associated to the feature detection
	 * 
	 * @function
	 * @param {string} key The property
	 * @param {string} value The value
	 */
	wink.has.setProp = setProp;
	function setProp(key, value) {
		properties[key] = value;
	}
	
	/**
	 * Defer the property recovery on a function or on a feature detection
	 * 
	 * @function
	 * @param {string} key The property
	 * @param {function} proc The defered process
	 */
	wink.has.deferProp = deferProp;
	function deferProp(key, proc) {
		if (isFunc(proc)) {
			setProp(key, proc);
		} else {
			setProp(key, function() {
				has(proc);
			});
		}
	}
	
	/**
	 * Get a property associated to the feature detection
	 * 
	 * @function
	 * @param {string} key The property
	 */
	wink.has.prop = prop;
	function prop(key) {
		var v = properties[key];
		if (isFunc(v)) {
			v();
			v = properties[key];
			if (isFunc(v)) {
				v = key;
			}
		}
		return v || key;
	}
	
	return wink.has;
});
