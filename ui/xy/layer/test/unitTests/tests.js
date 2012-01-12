/*--------------------------------------------------------
 * Copyright (c) 2011, The Dojo Foundation
 * This software is distributed under the "Simplified BSD license",
 * the text of which is available at http://www.winktoolkit.org/licence.txt
 * or see the "license.txt" file for more details.
 *--------------------------------------------------------*/

doh.register("wink.ui.xy.layer",
	[
		//Test show
		function show(t)
		{
			var d = new doh.Deferred();
			
			wink.layer.color = '#ff0000';
			wink.layer.opacity = 0.8;
			
			wink.layer.show();
			
			setTimeout( function()
		    {
				if (confirm("Did the red layer appear ?"))
				 {
					 d.callback(true);
			     } else
			     {
			    	 d.errback(new Error("Layer failure"));
			     }
		    }, 200);
			
			return d;
		},
		
		//Test hide
		function hide(t)
		{
			var d = new doh.Deferred();
			
			wink.layer.hide();
			
			setTimeout( function()
			{
				if (confirm("Did the layer disappear ?"))
				{
					d.callback(true);
				} else
				{
					d.errback(new Error("Layer failure"));
				}
			}, 200);
			
			return d;
		}
    ]
);