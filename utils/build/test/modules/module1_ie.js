/*--------------------------------------------------------
 * Copyright (c) 2011, The Dojo Foundation
 * This software is distributed under the "Simplified BSD license",
 * the text of which is available at http://www.winktoolkit.org/licence.txt
 * or see the "license.txt" file for more details.
 * ращ
 *--------------------------------------------------------*/

wink.api = {
	IMPL: "IE"	
};

wink.byId = function(id)
{
	wink.log("Wink Log");
	console.log("Console Log");
	return "IE byId Impl щ";
};

wink.isUndefined = function(object) 
{
	return "IE isUndefined Impl";
};

(function(w) {
	w.ua = 
	{
		isWebkit 	: false,
		isMobile 	: true
	};
	w.a = function() {
		
	};
})(wink);

function addUaTest(ctx) {
	ctx.ua.isSafari = false;
};
addUaTest(wink);

function addUaTest2(ua) {
	ua.isIE = true;
};
addUaTest2(wink.ua);
