/*--------------------------------------------------------
 * Copyright (c) 2011, The Dojo Foundation
 * This software is distributed under the "Simplified BSD license",
 * the text of which is available at http://www.winktoolkit.org/licence.txt
 * or see the "license.txt" file for more details.
 *--------------------------------------------------------*/

/**
 * @fileOverview Object providing a layer of abstraction with all specifics related to the platform hosting the code.
 * 
 * @compatibility Iphone OS2, Iphone OS3, Iphone OS4, Android 1.1, Android 1.5, Android 2.1, Android 2.2, Android 2.3, Android 3.0, Android 3.1, BlackBerry 6, BlackBerry 7, Bada 1.0, Windows Phone 7.5
 * @author Sylvain LALANDE

 */
define(['../../../_base/_base/js/base'], function(wink)
{
	var a, b, c, d, e, f, g, h, i, j, k, l, m, n, o, p, q, r, t, u, v, w, bb, ba, op, ie;
	a = b = c = d = e = f = g = h = bb = ba = op = ie = false;
	i = j= k = l = m = n = o = p = q = r = 0;
	
	var isSet = wink.isSet;
	
	var regTest = function(reg, str) {
		return RegExp(reg).test(str);
	};
	var regExec = function(reg, str) {
		return RegExp(reg).exec(str);
	};
	
	/**
	 * Extracts the version number in the given string.
	 * 
	 * @param {string} str The working source string
	 * @param {string} reg The regular expression that identifies the working substring
	 * @param {string} separator The separator between the version parts
	 */
	var _ext = function(str, reg, separator) {
		var result = {
			v: 0,
			r: 0,
			u: 0
		};
		var fields = regExec(reg, str);
		if (isSet(fields) && fields.length > 1)
		{
			var versionString = fields[2];
			var invalidCharacter = regExec("[^\\" + separator + "0-9]", versionString);
			if (isSet(invalidCharacter))
			{
				versionString = versionString.slice(0, invalidCharacter.index);
			}
			var version = versionString.split(separator);
			if (version.length > 0)
			{
				result.v = version[0];
			}
			if (version.length > 1)
			{
				result.r = version[1];
			}
			if (version.length > 2)
			{
				result.u = version[2];
			}
			if (version.length > 3)
			{
				result.u += "." + version[3];
			}
		}
		return result;
	};

	t = navigator || {}, u = t.userAgent, v = t.platform, w = t.appVersion;

	// Retrieve all necessary informations about the platform.
	a = regTest(" AppleWebKit/", u);
	ba = regTest(/bada/gi, u);
	op = regTest(/Opera/gi, u);
		
	if (isSet(v))
	{
		if (regTest(/iphone/i, v))
		{
			c = true;
		}
		if (regTest(/ipod/i, v))
		{
			d = true;
		}
		if (regTest(/ipad/i, v))
		{
			e = true;
		}
		if (regTest(/blackberry/i, v))
		{
			bb = true;
		}
	}

	if (isSet(w))
	{
		if (regTest(/android/i, w))
		{
			f = true;
		}
		if (regTest(/safari/i, w))
		{
			g = true;
			
			var version = _ext(w, "( Version/)([^ ]+)", ".");
			l = version.v;
			m = version.r;
			n = version.u;
		}
		if (regTest(/MSIE/i, w))
		{
			ie = true;
			
			var version = _ext(w, "( MSIE )([^ ]+)", ".");
			l = version.v;
			m = version.r;
		}
	}
	
	if (!g && !a)
	{
		h = regTest(/mozilla/i, u);
	}
	
	b = c || d || f || bb || ba || regTest(" Mobile/", u);
	
	if (a)
	{
		var version = _ext(u, "( AppleWebKit/)([^ ]+)", ".");
		i = version.v;
		j = version.r;
		k = version.u;
	}
	
	if (b && isSet(w))
	{
		var regvOs = f ? [ "( Android )([^ ]+)", "." ] : [ "( OS )([^ ]+)", "_" ];
		if (bb) {
			regvOs = [ "( BlackBerry )([^ ]+)", "." ];
		}
		var vOs = _ext(w, regvOs[0], regvOs[1]);
		p = vOs.v;
		q = vOs.r;
		r = vOs.u;
	}

	/**
	 * @namespace User Agent properties
	 * 
	 * <pre>
	 * |-----------------------------------------------------------------------------------|
	 * | Plaform          | webkitV | wMV | wUV | browserV | bMV | bUV | osV | osMV | osUV |
	 * |-----------------------------------------------------------------------------------|
	 * |IPhone OS 3       | 528     | 18  | 0   | 4        | 0   | 0   | 3   | 1    | 2    |
	 * |IPhone OS 2       | 525     | 18  | 1   | 3        | 1   | 1   | 2   | 2    | 1    |
	 * |Android HTC Hero  | 528     | 5   | 0   | 3        | 1   | 2   | 1   | 5    | 0    |
	 * |PC                | 531     | 21  | 8   | 4        | 0   | 4   | 0   | 0    | 0    |
	 * |-----------------------------------------------------------------------------------|
	 * </pre>
	 * 
	 * @example
	 * 
	 * if ( wink.ua.isAndroid )
	 * {
	 * 	...
	 * }
	 * 
	 * @see <a href="WINK_ROOT_URL/_base/ua/test/test_ua.html" target="_blank">Test page</a>
	 */
	wink.ua = 
	{
		/**
		 * The webapp is running on webkit
		 * 
		 * @property isWebkit
		 * @type boolean
		 */
		isWebkit : a,
		/**
		 * The webapp is running on a mobile device
		 * 
		 * @property isMobile
		 * @type boolean
		 */
		isMobile : b,
		/**
		 * The webapp is running on an iPhone
		 * 
		 * @property isIPhone
		 * @type boolean
		 */
		isIPhone : c,
		/**
		 * The webapp is running on an iPod
		 * 
		 * @property isIPod
		 * @type boolean
		 */
		isIPod : d,
		/**
		 * The webapp is running on an iPad
		 * 
		 * @property isIPad
		 * @type boolean
		 */
		isIPad : e,
		/**
		 * The webapp is running on IOS
		 * 
		 * @property isIOS
		 * @type boolean
		 */
		isIOS : (c || d || e),
		/**
		 * The webapp is running on an android device
		 * 
		 * @property isAndroid
		 * @type boolean
		 */
		isAndroid : f,
		/**
		 * The webapp is running on a blackberry device
		 * 
		 * @property isBlackBerry
		 * @type boolean
		 */
		isBlackBerry : bb,
		/**
		 * The webapp is running on a bad device
		 * 
		 * @property isBada
		 * @type boolean
		 */
		isBada : ba,
		/**
		 * The webapp is running on Opera
		 * 
		 * @property isOpera
		 * @type boolean
		 */
		isOpera : op,
		/**
		 * The webapp is running on Safari
		 * 
		 * @property isSafari
		 * @type boolean
		 */
		isSafari : g,
		/**
		 * The webapp is running on Firefox
		 * 
		 * @property isMozilla
		 * @type boolean
		 */
		isMozilla : h,
		/**
		 * The webapp is running on Internet Explorer
		 * 
		 * @property isIE
		 * @type boolean
		 */
		isIE : ie,
		/**
		 * The webkit version
		 * 
		 * @property webkitVersion
		 * @type string
		 */
		webkitVersion : i,
		/**
		 * The webkit minor version
		 * 
		 * @property webkitMinorVersion
		 * @type string
		 */
		webkitMinorVersion : j,
		/**
		 * The webkit updateversion
		 * 
		 * @property webkitUpdateVersion
		 * @type string
		 */
		webkitUpdateVersion : k,
		/**
		 * The browser version
		 * 
		 * @property browserVersion
		 * @type string
		 */
		browserVersion : l,
		/**
		 * The browser minor version
		 * 
		 * @property browserMinorVersion
		 * @type string
		 */
		browserMinorVersion : m,
		/**
		 * The browser update version
		 * 
		 * @property browserUpdateVersion
		 * @type string
		 */
		browserUpdateVersion : n,
		/**
		 * The OS version
		 * 
		 * @property osVersion
		 * @type string
		 */
		osVersion : p,
		/**
		 * The OS minor version
		 * 
		 * @property osMinorVersion
		 * @type string
		 */
		osMinorVersion : q,
		/**
		 * The OS update version
		 * 
		 * @property osUpdateVersion
		 * @type string
		 */
		osUpdateVersion : r
	};
	
	return wink.ua;
});