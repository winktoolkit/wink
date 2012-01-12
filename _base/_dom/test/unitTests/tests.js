/*--------------------------------------------------------
 * Copyright (c) 2011, The Dojo Foundation
 * This software is distributed under the "Simplified BSD license",
 * the text of which is available at http://www.winktoolkit.org/licence.txt
 * or see the "license.txt" file for more details.
 *--------------------------------------------------------*/

doh.register("wink._base._dom",
	[
	 	{
	 		name: "winkTranslate",
	 		setUp: function()
	 		{
	 			var nodeToTransform = $('test');
	 			
	 			nodeToTransform.winkTranslate('0');
	 			nodeToTransform.winkRotate('0');
	 			nodeToTransform.winkScale('1', '1');
	 		},
	 		
	 		// Test translate
	 		runTest: function(t)
	        {
	        	var d = new doh.Deferred();
	        	
	        	var nodeToTransform = $('test');
	
	        	nodeToTransform.winkTranslate('200');
	        	
	        	doh.is('200', wink.fx.getTransformPosition(nodeToTransform).x);
	        	doh.is('0', wink.fx.getTransformPosition(nodeToTransform).y);
	        	
	        	setTimeout( function()
	        	{
		        	if (confirm("Did the yellow square moved 200px to the right ?"))
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
    		
    		var nodeToTransform = $('test');
    
        	nodeToTransform.winkRotate('45');
        	
        	setTimeout( function()
        	{
	        	if (confirm("Did the yellow square rotate to 45 degrees ?"))
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
	 			var nodeToTransform = $('test');
	 			
	 			nodeToTransform.winkTranslate('0');
	 			nodeToTransform.winkRotate('0');
	 			nodeToTransform.winkScale('1', '1');
	 		},
	 		
	 		runTest: function(t)
	        {
	    		var d = new doh.Deferred();
	    		
	    		var nodeToTransform = $('test');
	    
	        	nodeToTransform.winkScale('0.5', '0.5');
	        	
	        	setTimeout( function()
	        	{
		        	if (confirm("Did the yellow square scale down by half ?"))
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
        
        // Test getLeftPosition
        function winkGetLeftPosition(t)
        {
    		var nodeToTransform = $('test');
    		
    		doh.assertTrue(wink.isInteger(nodeToTransform.winkGetLeftPosition()));
        },
        
        // Test getTopPosition
        function winkGetTopPosition(t)
        {
    		var nodeToTransform = $('test');
    		
    		doh.assertTrue(wink.isInteger(nodeToTransform.winkGetTopPosition()));
        }
        
        // Test listenToGesture --> TODO
        // Test unlistenToGesture --> TODO
    ]
);