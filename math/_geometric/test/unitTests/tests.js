/*--------------------------------------------------------
 * Copyright (c) 2011, The Dojo Foundation
 * This software is distributed under the "Simplified BSD license",
 * the text of which is available at http://www.winktoolkit.org/licence.txt
 * or see the "license.txt" file for more details.
 *--------------------------------------------------------*/

doh.register("wink.math._geometric",
	[
        // Test radToDeg
        function radToDeg(t)
        {
        	doh.is(90, wink.math.radToDeg(Math.PI/2));
        	doh.is(0, wink.math.radToDeg(0));
        	doh.is(180, wink.math.radToDeg(Math.PI));
        	doh.is(360, wink.math.radToDeg(2*Math.PI));
        },
        
        // Test degToRad
        function degToRad(t)
        {
        	doh.is(Math.PI/2, wink.math.degToRad(90));
        	doh.is(0, wink.math.degToRad(0));
        	doh.is(Math.PI, wink.math.degToRad(180));
        	doh.is(2*Math.PI, wink.math.degToRad(360));
        },
        
    	// Test getAngle
        function getAngle(t)
        {
        	doh.is(Math.acos(0.875), wink.math.getAngle(10, 5));
        },
        
        // Test getNormVector
        function getNormVector(t)
        {
        	var v1 = [1, 2, 3];
        	
        	doh.is(Math.sqrt(14), wink.math.getNormVector(v1));
        }
    ]
);