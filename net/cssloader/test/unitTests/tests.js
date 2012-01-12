/*--------------------------------------------------------
 * Copyright (c) 2011, The Dojo Foundation
 * This software is distributed under the "Simplified BSD license",
 * the text of which is available at http://www.winktoolkit.org/licence.txt
 * or see the "license.txt" file for more details.
 *--------------------------------------------------------*/

doh.register("wink.net.cssloader",
	[
		//Test load success
		function load_success(t)
		{
			var d = new doh.Deferred();

			wink.testCssLoaderSuccess = function(params)
        	{
				wink.unsubscribe('/cssloader/events/load', {method: 'testCssLoaderSuccess', context: wink});
				
				try
				{
					doh.is(100, params.progress);
					doh.is(1, params.success);
					
					d.callback(true);
	
				} catch(e)
				{
					d.errback(e);
				}
        	};
        	
        	wink.subscribe('/cssloader/events/load', {method: 'testCssLoaderSuccess', context: wink});
        	
        	cssLoader = new wink.net.CssLoader();
        	cssLoader.load(['../../net/cssloader/test/unitTests/resource.css']);
			
        	return d;
		},
		
		//Test load error
		function load_error(t)
		{
			var d = new doh.Deferred();
			
			wink.testCssLoaderError = function(params)
        	{
				wink.unsubscribe('/cssloader/events/load', {method: 'testCssLoaderError', context: wink});
				
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

        	wink.subscribe('/cssloader/events/load', {method: 'testCssLoaderError', context: wink});
        	
        	cssLoader.load(['../../net/cssloader/test/unitTests/resource2.css']);
			
        	return d;
		}
    ]
);