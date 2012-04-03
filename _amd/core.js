/*--------------------------------------------------------
 * Copyright (c) 2011, The Dojo Foundation
 * This software is distributed under the "Simplified BSD license",
 * the text of which is available at http://www.winktoolkit.org/licence.txt
 * or see the "license.txt" file for more details.
 *--------------------------------------------------------*/

/**
 * @fileOverview Definition of wink core dependencies to use in conjunction with an AMD loader
 * 
 * @compatibility Iphone OS2, Iphone OS3, Iphone OS4, Android 1.1, Android 1.5, Android 2.1, Android 2.2, Android 2.3, Android 3.0, Android 3.1, BlackBerry 6, BlackBerry 7, Bada 1.0, Windows Phone 7.5
 * @author Jerome GIRAUD
 */

var dojoBaseUrl = '../..';

define(
	[
	 	'./wink.dojo',
		
		'../_base/error/js/error',
		'../_base/_feat/js/feat',
		'../_base/_feat/js/feat_css',
		'../_base/_feat/js/feat_event',
		'../_base/_feat/js/feat_dom',
		'../_base/ua/js/ua',
		'../_base/_dom/js/dom',
		'../fx/_xy/js/2dfx',
		'../net/xhr/js/xhr',
		'../ux/event/js/event',
		'../ux/touch/js/touch'
	], 
	function(wink)
	{
		return wink;
	}
);