/*--------------------------------------------------------
 * Copyright (c) 2011, The Dojo Foundation
 * This software is distributed under the "Simplified BSD license",
 * the text of which is available at http://www.winktoolkit.org/licence.txt
 * or see the "license.txt" file for more details.
 *--------------------------------------------------------*/

/**
 * @fileOverview Definition of wink core dependencies to use in conjunction with an AMD loader
 * 
 * @compatibility iOS2, iOS3, iOS4, iOS5, iOS6, Android 1.1, Android 1.5, Android 2.1, Android 2.2, Android 2.3, Android 3.0, Android 3.1, Android 4.0, Android 4.1.2, BlackBerry 6, BlackBerry 7, BB10, Bada 1.0, Windows Phone 7.5, Windows Phone 8
 * @author Jerome GIRAUD
 */

define(
	[
		'../_base/_base/js/base',
		'../_base/error/js/error',
		'../math/_basics/js/basics',
		'../_base/_feat/js/feat',
		'../_base/_feat/js/feat_json',
		'../_base/_feat/js/feat_css',
		'../_base/_feat/js/feat_event',
		'../_base/_feat/js/feat_dom',
		'../_base/json/js/json',
		'../_base/ua/js/ua',
		'../_base/topics/js/topics',
		'../fx/_xy/js/2dfx',
		'../net/xhr/js/xhr',
		'../ui/xy/layer/js/layer',
		'../ux/event/js/event',
		'../ux/touch/js/touch'
	], 
	function(wink)
	{
		return wink;
	}
);