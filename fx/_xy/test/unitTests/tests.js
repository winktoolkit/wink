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
	 			wink.fx.addClass(wink.byId('sandbox'), 'testCSS');
	 			doh.is('sandbox testCSS', wink.byId('sandbox').className);
			}
	 	},
	 	//Test hasClass
		function hasClass(t)
		{     
	 		doh.assertTrue(wink.fx.hasClass(wink.byId('sandbox'), 'testCSS'));
		},
	 	//Test removeClass
		function removeClass(t)
		{
	 		wink.fx.removeClass(wink.byId('sandbox'), 'testCSS');
	 		doh.is('sandbox', wink.byId('sandbox').className);
		},
		
		// Test applyTransition
		{
	 		name: "applyTransition",
	 		timeout: 2000,
	 		
	 		setUp: function()
	 		{
	 			wink.fx.applyTransition(wink.byId('test'), 'width', '1s', '0ms', 'linear');
	 			wink.byId('test').style.width = '200px';
	 		},
	 		
	 		tearDown: function()
	 		{
	 			wink.fx.applyTransition(wink.byId('test'), 'width', '0ms', '0ms', '');
	 			wink.byId('test').style.width = '50px';
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
	 			wink.fx.applyTransformTransition(wink.byId('test'), '1s', '0ms', 'linear');
	 			wink.fx.translate(wink.byId('test'), '200');
	 		},
	 		
	 		tearDown: function()
	 		{
	 			wink.fx.applyTransformTransition(wink.byId('test'), '0ms', '0ms', '');
	 			wink.fx.translate(wink.byId('test'), 0);
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
	 			wink.fx.applyTransformTransition(wink.byId('test'), '500ms', '0ms', 'linear');
	 			wink.fx.onTransitionEnd(wink.byId('test'), function() {
	 				wink.byId('test').style.backgroundColor = 'blue';
	 			});
	 			wink.fx.translate(wink.byId('test'), 50, 50);
	 		},
	 		
	 		tearDown: function()
	 		{
	 			wink.fx.applyTransformTransition(wink.byId('test'), '0ms', '0ms', '');
	 			wink.byId('test').style.backgroundColor = '';
	 			wink.fx.translate(wink.byId('test'), 0, 0);
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
	 			wink.fx.applyTransformTransition(wink.byId('test'), '500ms', '0ms', 'linear');
	 			wink.fx.translate(wink.byId('test'), 10, 20);
	 		},
	 		
	 		runTest: function(t)
	        {
	 			var d = new doh.Deferred();

	        	setTimeout(function()
	        	{
	        		var position = wink.fx.getTransformPosition(wink.byId('test'));
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

	 	{
	 		name: "winkTranslate",
	 		setUp: function()
	 		{
	 			var nodeToTransform = wink.byId('test2');
	 			
	 			wink.fx.translate(nodeToTransform, '0');
	 			wink.fx.rotate(nodeToTransform, '0');
	 			wink.fx.scale(nodeToTransform, '1', '1');
	 		},
	 		
	 		// Test translate
	 		runTest: function(t)
	        {
	        	var d = new doh.Deferred();
	        	
	        	var nodeToTransform = wink.byId('test2');
	        	
	        	wink.fx.translate(nodeToTransform, '200');
	        	
	        	doh.is('200', wink.fx.getTransformPosition(nodeToTransform).x);
	        	doh.is('0', wink.fx.getTransformPosition(nodeToTransform).y);
	        	
	        	setTimeout( function()
	        	{
		        	if (confirm("Did the red square moved 200px to the right ?"))
		        	 {
		        		 d.callback(true);
		             } else
		             {
		            	 d.errback(new Error("Translation failed"));
		             }
	        	}, 200);
	        	
	        	return d;
	        }
	 	},
        
        // Test rotate
        function winkRotate(t)
        {
    		var d = new doh.Deferred();
    		
    		var nodeToTransform = wink.byId('test2');
    
    		wink.fx.rotate(nodeToTransform, '45');
        	
        	setTimeout( function()
        	{
	        	if (confirm("Did the red square rotate to 45 degrees ?"))
	        	 {
	        		 d.callback(true);
	             } else
	             {
	            	 d.errback(new Error("Rotation failed"));
	             }
        	}, 200);
        	
        	return d;
        },
        
        // Test scale
        {
        	name: "winkScale",
	 		tearDown: function()
	 		{
	 			var nodeToTransform = wink.byId('test2');
	 			
	 			wink.fx.translate(nodeToTransform, '0');
	 			wink.fx.rotate(nodeToTransform, '0');
	 			wink.fx.scale(nodeToTransform, '1', '1');
	 		},
	 		
	 		runTest: function(t)
	        {
	    		var d = new doh.Deferred();
	    		
	    		var nodeToTransform = wink.byId('test2');
	    		
	        	wink.fx.scale(nodeToTransform, '0.5', '0.5');
	        	
	        	setTimeout( function()
	        	{
		        	if (confirm("Did the red square scale down by half ?"))
		        	 {
		        		 d.callback(true);
		             } else
		             {
		            	 d.errback(new Error("Scaling failed"));
		             }
	        	}, 200);
	        	
	        	return d;
	        }
        },
	 	
	 	// Test getTransform
		{
	 		name: "getTransform",
	 		
	 		tearDown: function()
	 		{
	 			wink.fx.applyTransformTransition(wink.byId('test'), '0ms', '0ms', '');
	 			wink.fx.translate(wink.byId('test'), '0');
	 		},
	 		
	 		runTest: function(t)
	        {
	        	var transform = wink.fx.getTransform(wink.byId('test'));
	        	
	        	doh.assertTrue(wink.isString(transform));
	        }
	 	}
	 	
	 	// Test setTransform --> integrated into test applyTransformTransition
    ]
);
