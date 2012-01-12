/*--------------------------------------------------------
 * Copyright (c) 2011, The Dojo Foundation
 * This software is distributed under the "Simplified BSD license",
 * the text of which is available at http://www.winktoolkit.org/licence.txt
 * or see the "license.txt" file for more details.
 *--------------------------------------------------------*/

/**
 * @fileOverview Api features detection.
 * 
 * @compatibility Iphone OS2, Iphone OS3, Iphone OS4, Android 1.1, Android 1.5, Android 2.1, Android 2.2, Android 2.3, Android 3.0, Android 3.1, BlackBerry 6, BlackBerry 7, Bada 1.0, Windows Phone 7.5
 * @author Sylvain LALANDE
 * 
 * @features:
 * 	--> TODO native-orientation
 * 	--> TODO native-sql-db
 * 	--> TODO native-indexeddb
 * 	--> TODO native-localstorage
 * 	--> TODO native-sessionstorage
 * 	--> TODO native-history-state
 */

define(['../../../_base/_base/js/base', './feat'], function(wink)
{
	var winkhas = wink.has,
		inquireMap = winkhas.inquireMap;

	inquireMap(
	{
		"native-geolocation": function() {
			return !!navigator.geolocation;
		},
		"native-device-orientation": function() {
			return ("ondeviceorientation" in window);
		},
		"native-device-motion": function() {
			return ("ondevicemotion" in window);
		}
	});
	
	return winkhas;
});