/*--------------------------------------------------------
 * Copyright (c) 2011, The Dojo Foundation
 * This software is distributed under the "Simplified BSD license",
 * the text of which is available at http://www.winktoolkit.org/licence.txt
 * or see the "license.txt" file for more details.
 *--------------------------------------------------------*/

doh.register("wink.net.imagesloader",
	[
		//Test load success
		function load_success(t)
		{
			var d = new doh.Deferred();

			wink.testImagesLoaderSuccess = function(params)
        	{
				wink.unsubscribe('/imagesloader/events/load', {method: 'testImagesLoaderSuccess', context: wink});
				
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
        	
        	wink.subscribe('/imagesloader/events/load', {method: 'testImagesLoaderSuccess', context: wink});
        	
        	imagesLoader = new wink.net.ImagesLoader();
        	imagesLoader.load(['../../ui/xy/carousel/test/img/carousel_thumbnail_01.png']);
			
        	return d;
		},
		
		//Test load error
		function load_error(t)
		{
			var d = new doh.Deferred();
			
			wink.testImagesLoaderError = function(params)
        	{
				wink.unsubscribe('/imagesloader/events/load', {method: 'testImagesLoaderError', context: wink});
				
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

        	wink.subscribe('/imagesloader/events/load', {method: 'testImagesLoaderError', context: wink});
        	
        	imagesLoader.load(['../../ui/xy/carousel/test/img/carousel_thumbnail_01_2.png']);
			
        	return d;
		}
    ]
);