/*--------------------------------------------------------
 * Copyright (c) 2011, The Dojo Foundation
 * This software is distributed under the "Simplified BSD license",
 * the text of which is available at http://www.winktoolkit.org/licence.txt
 * or see the "license.txt" file for more details.
 *--------------------------------------------------------*/

doh.register("wink.fx._xy",
	[
		//Test addClass
		{
	 		name: "addClass",
            
            setUp: function()
	 		{
				var style = document.createElement('style');
				style.type = 'text/css';
				
				var rule = document.createTextNode(".testCSS { background-color: black; }");

				style.appendChild(rule);

				var head = document.getElementsByTagName("head")[0];
				head.appendChild(style);
	 		},
	 		
            runTest: function(t)
			{
	 			wink.fx.addClass($('sandbox'), 'testCSS');
	 			doh.is('sandbox testCSS', $('sandbox').className);
			}
	 	},
	 	
	 	//Test removeClass
		function removeClass(t)
		{
	 		wink.fx.removeClass($('sandbox'), 'testCSS');
	 		doh.is('sandbox', $('sandbox').className);
		},
		
		// Test applyTransition
		{
	 		name: "applyTransition",
	 		timeout: 2000,
	 		
	 		setUp: function()
	 		{
	 			wink.fx.applyTransition($('test'), 'width', '1s', '0ms', 'linear');
	 			$('test').style.width = '200px';
	 		},
	 		
	 		tearDown: function()
	 		{
	 			wink.fx.applyTransition($('test'), 'width', '0ms', '0ms', '');
	 			$('test').style.width = '50px';
	 		},
	 		
	 		runTest: function(t)
	        {
	        	var d = new doh.Deferred();

	        	setTimeout(function()
	        	{
		        	if (confirm("Did the yellow square grow 200px wide, expanding with a smooth transition ?"))
		        	 {
		        		 d.callback(true);
		             } else
		             {
		            	 d.errback(new Error("Transition failed"));
		             }
	        	}, 1100);
	        	
	        	return d;
	        }
	 	},
	 	
	 	// Test applyTransformTransition
		{
	 		name: "applyTransformTransition",
	 		timeout: 2000,
	 		
	 		setUp: function()
	 		{
	 			wink.fx.applyTransformTransition($('test'), '1s', '0ms', 'linear');
	 			$('test').winkTranslate('200');
	 		},
	 		
	 		tearDown: function()
	 		{
	 			wink.fx.applyTransformTransition($('test'), '0ms', '0ms', '');
	 			$('test').winkTranslate(0);
	 		},
	 		
	 		runTest: function(t)
	        {
	        	var d = new doh.Deferred();

	        	setTimeout(function()
	        	{
		        	if (confirm("Did the yellow square move smoothly to the right ?"))
		        	 {
		        		 d.callback(true);
		             } else
		             {
		            	 d.errback(new Error("Transition failed"));
		             }
	        	}, 1100);
	        	
	        	return d;
	        }
	 	},
	 	
	 	{
	 		name: "onTransitionEnd",
	 		timeout: 2000,
	 		
	 		setUp: function()
	 		{
	 			wink.fx.applyTransformTransition($('test'), '500ms', '0ms', 'linear');
	 			wink.fx.onTransitionEnd($('test'), function() {
	 				$('test').style.backgroundColor = 'blue';
	 			});
	 			$('test').winkTranslate(50, 50);
	 		},
	 		
	 		tearDown: function()
	 		{
	 			wink.fx.applyTransformTransition($('test'), '0ms', '0ms', '');
	 			$('test').style.backgroundColor = '';
	 			$('test').winkTranslate(0, 0);
	 		},
	 		
	 		runTest: function(t)
	        {
	        	var d = new doh.Deferred();

	        	setTimeout(function()
	        	{
		        	if (confirm("Is that the square turned blue at the end of the transition ?"))
		        	 {
		        		 d.callback(true);
		             } else
		             {
		            	 d.errback(new Error("onTransitionEnd failed"));
		             }
	        	}, 1100);
	        	
	        	return d;
	        }
	 	},
	 	
	 	// Test getTransformPosition
		{
	 		name: "getTransformPosition",
	 		timeout: 2000,
	 		
	 		setUp: function()
	 		{
	 			wink.fx.applyTransformTransition($('test'), '500ms', '0ms', 'linear');
	 			$('test').winkTranslate(10, 20);
	 		},
	 		
	 		runTest: function(t)
	        {
	 			var d = new doh.Deferred();

	        	setTimeout(function()
	        	{
	        		var position = wink.fx.getTransformPosition($('test'));
	        		if (position.x == 10 && position.y == 20)
		        	 {
		        		 d.callback(true);
		             } else
		             {
		            	 d.errback(new Error("getTransformPosition failed"));
		             }
	        	}, 1100);
	        	
	        	return d;
	        }
	 	},
	 	
	 	// Test applyTranslate --> See "dom" unit tests 
	 	
	 	// Test applyRotate --> See "dom" unit tests 
	 	
		// Test applyScale --> See "dom" unit tests 
	 	
	 	// Test getTransform
		{
	 		name: "getTransform",
	 		
	 		tearDown: function()
	 		{
	 			wink.fx.applyTransformTransition($('test'), '0ms', '0ms', '');
	 			$('test').winkTranslate('0');
	 		},
	 		
	 		runTest: function(t)
	        {
	        	var transform = wink.fx.getTransform($('test'));
	        	
	        	doh.assertTrue(wink.isString(transform));
	        }
	 	}
	 	
	 	// Test setTransform --> integrated into test applyTransformTransition
    ]
);