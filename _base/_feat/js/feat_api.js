/*--------------------------------------------------------
 * Copyright (c) 2011, The Dojo Foundation
 * This software is distributed under the "Simplified BSD license",
 * the text of which is available at http://www.winktoolkit.org/licence.txt
 * or see the "license.txt" file for more details.
 *--------------------------------------------------------*/

/**
 * @fileOverview Api features detection.
 * 
 * @compatibility Iphone OS2, Iphone OS3, Iphone OS4, Android 1.1, Android 1.5, Android 2.1, Android 2.2, Android 2.3, Android 3.0, Android 3.1, Android 4.0, BlackBerry 6, BlackBerry 7, Bada 1.0, Windows Phone 7.5
 * @author Sylvain LALANDE
 * 
 */

define(['../../../_amd/core'], function()
{
	var winkhas = wink.has,
		inquireMap = winkhas.inquireMap,
		n = navigator,
		w = window;

	inquireMap(
	{
		"native-geolocation": function() {
			return "geolocation" in n;
		},
		"native-device-orientation": function() {
			return "ondeviceorientation" in w;
		},
		"native-device-motion": function() {
			return "ondevicemotion" in w;
		},
		"native-localstorage": function() {
			return "localStorage" in w;
		},
		"native-sessionstorage": function() {
			return "sessionStorage" in w;
		},
		"native-websockets": function() {
			return "WebSocket" in w;
		},
		"native-worker": function() {
			return "Worker" in w;
		},
		"native-getusermedia": function() {
			return "getUserMedia" in n;
		}
	});
	
	return winkhas;
});