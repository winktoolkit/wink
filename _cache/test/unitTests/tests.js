/*--------------------------------------------------------
 * Copyright (c) 2011, The Dojo Foundation
 * This software is distributed under the "Simplified BSD license",
 * the text of which is available at http://www.winktoolkit.org/licence.txt
 * or see the "license.txt" file for more details.
 *--------------------------------------------------------*/

doh.register("wink._cache",
	[
	 	{
	 		name: "cache main",
	 		setUp: function()
	 		{
	 			if (wink.cache.unitTestValue != undefined )
	 			{
	 				d.errback(new Error("Resources already loaded"));
	 			}
	 		},
	 		
	 		// Test easy caching
	 		runTest: function(t)
	        {
	        	var d = new doh.Deferred();
	        	
	        	var resources =
    			[
    				{ url: '../../_cache/test/unitTests/resource.js', type: 'js' },
    				{ url: '../../_cache/test/unitTests/resource.css', type: 'css', expires: 1 }
    			];
	        	
	        	var check = function(result)
	        	{
	        		doh.is(3, wink.cache.unitTestValue);
	        		doh.is('rgb(204, 204, 204)', document.defaultView.getComputedStyle(document.body, "").getPropertyValue("background-color"));
	        		
	        		doh.assertTrue(result.loadTime > 0);
	        		doh.assertTrue(result.useOfLocalDatabase === true);
	        		doh.assertTrue((result.errors.length + result.loadErrors.length) == 0);
	        		doh.assertTrue(result.resourcesCleaned.length >= 0);
	        		doh.assertTrue(result.resourcesOldVersion.length == 0);
	        		
	        		d.callback(true);
	        	};
	        	
	        	wink.load(resources, check);
	        	
	        	return d;
	        },
	        
	        tearDown: function()
	 		{
	        	document.body.style.backgroundColor = 'transparent';
	        	wink.cache.resetDatabase(function(result) {
	 				doh.assertTrue(result.errors.length == 0, result.errors[0]);
	 			});
	 		}
	 	}
    ]
);