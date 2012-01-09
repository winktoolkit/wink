/*--------------------------------------------------------
 * Copyright (c) 2011, The Dojo Foundation
 * This software is distributed under the "Simplified BSD license",
 * the text of which is available at http://www.winktoolkit.org/licence.txt
 * or see the "license.txt" file for more details.
 *--------------------------------------------------------*/

doh.register("wink.net.jsloader",
	[
		//Test load success
		function load_success(t)
		{
			var d = new doh.Deferred();

			wink.testJsLoaderSuccess = function(params)
        	{
				wink.unsubscribe('/jsloader/events/load', {method: 'testJsLoaderSuccess', context: wink});
				
				try
				{
					doh.is(100, params.progress);
					doh.is(1, params.success);
					
					doh.is(3, wink.net.unitTestValue);
					
					d.callback(true);
	
				} catch(e)
				{
					d.errback(e);
				}
        	};
        	
        	wink.subscribe('/jsloader/events/load', {method: 'testJsLoaderSuccess', context: wink});
        	
        	jsLoader = new wink.net.JsLoader();
        	jsLoader.load(['../../net/jsloader/test/unitTests/resource.js']);
			
        	return d;
		},
		
		//Test load error
		function load_error(t)
		{
			var d = new doh.Deferred();
			
			wink.testJsLoaderError = function(params)
        	{
				wink.unsubscribe('/jsloader/events/load', {method: 'testJsLoaderError', context: wink});
				
				try
				{
					doh.is(100, params.progress);
					doh.is(-1, params.success);
					
					d.callback(true);
	
				} catch(e)
				{
					d.errback(e);
				}
        	};

        	wink.subscribe('/jsloader/events/load', {method: 'testJsLoaderError', context: wink});
        	
        	jsLoader.load(['../../net/jsloader/test/unitTests/resource2.js']);
			
        	return d;
		}
    ]
);