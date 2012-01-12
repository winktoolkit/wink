/*--------------------------------------------------------
 * Copyright (c) 2011, The Dojo Foundation
 * This software is distributed under the "Simplified BSD license",
 * the text of which is available at http://www.winktoolkit.org/licence.txt
 * or see the "license.txt" file for more details.
 *--------------------------------------------------------*/

doh.register("wink._base.json",
	[
        // Test parse
        function parseJSON(t)
        {
        	var test = wink.json.parse('{"object":{"name":"matt","age":"26"},"boolean":true,"numeric":3,"na":null}');
        	
        	doh.is("matt", test.object.name);
        	doh.is("26", test.object.age);
        	doh.is(true, test.boolean);
        	doh.is(3, test.numeric);
        	doh.is(null, test.na);
        },
        
        // Test stringify
        function stringify(t)
        {
        	var test = wink.json.stringify(
    		{
    			"object" :
    			{
    				"name" : "matt", 
    				"age" : "26"
    			},

    			"boolean": true,
    			"numeric": 3,
    			"NaN": NaN,
    			"null": null,
    			"undefined": undefined,
    			"function": function(){}
    		});
        	
        	doh.is('{"object":{"name":"matt","age":"26"},"boolean":true,"numeric":3,"NaN":null,"null":null}', test);
        },
        
        // Test concat
        function concat(t)
        {
        	TestJSON = function()
        	{
        		this.method1 = function()
        		{
        			// Do nothing
        		};
        	};
        	
        	wink.json.concat(TestJSON,
        	{
        		method2: function(params)
        		{
        			return (params+1);
        		}
        	});
        	
        	doh.is(2, TestJSON.method2(1));
        }
    ]
);