/*--------------------------------------------------------
 * Copyright (c) 2011, The Dojo Foundation
 * This software is distributed under the "Simplified BSD license",
 * the text of which is available at http://www.winktoolkit.org/licence.txt
 * or see the "license.txt" file for more details.
 *--------------------------------------------------------*/

/**
 * @fileOverview dom features detection.
 * 
 * @compatibility iOS2, iOS3, iOS4, iOS5, iOS6, Android 1.1, Android 1.5, Android 2.1, Android 2.2, Android 2.3, Android 3.0, Android 3.1, Android 4.0, BlackBerry 6, BlackBerry 7, BB10, Bada 1.0, Windows Phone 7.5, Windows Phone 8
 * @author Sylvain LALANDE
 * 
 */

define(['../../../_amd/core'], function()
{
	var winkhas = wink.has,
		inquireMap = winkhas.inquireMap,
		w = window,
		d = w.document,
		de = d.documentElement;
	
	inquireMap({
		"dynamicBase": function() {
			var base,
				ce = function(name) {
					return d.createElement(name);
				},
				headf = ce('head'),
				bodyf = ce('body'),
				baseL = d.getElementsByTagName('base'),
				baseUrl = location.protocol + '//' + location.host,
				url = baseUrl + '/old/';
			
			de.appendChild(headf);
			de.appendChild(bodyf);

			if (baseL.length > 0) {
				base = baseL[0];
				url = base.href;
			} else {
				base = ce('base');
				base.href = url;
				headf.appendChild(base);
			}
			
			var link = ce('a');
			link.href = 'rlt';
			bodyf.appendChild(link);
			
			var oldpath = link.pathname;
			base.href = baseUrl + '/new/';
			var newpath = link.pathname;
			
			de.removeChild(headf);
			de.removeChild(bodyf);
			base.href = url;

			return (oldpath !== newpath);
		}
	});

	return wink.has;
});