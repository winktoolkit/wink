/*--------------------------------------------------------
 * Copyright (c) 2011, The Dojo Foundation
 * This software is distributed under the "Simplified BSD license",
 * the text of which is available at http://www.winktoolkit.org/licence.txt
 * or see the "license.txt" file for more details.
 *--------------------------------------------------------*/

doh.register("wink._base.topics",
	[
		//Test subscribe
		function subscribe(t)
		{
			wink.subscribe('/tests/events/test', {method: 'log', context: wink});
			wink.subscribe('/tests/events/test', {method: 'log', context: null});
			wink.subscribe('/tests/events/test', {method: 'log'});
			
			doh.is(3, wink.topics._getTopics().length);
		},
		
		//Test unsubscribe
		function unsubscribe(t)
		{
			wink.unsubscribe('/tests/events/test', {method: 'log', context: wink});
			doh.is(2, wink.topics._getTopics().length);
			wink.unsubscribe('/tests/events/test', {method: 'log', context: null});
			doh.is(1, wink.topics._getTopics().length);
			wink.unsubscribe('/tests/events/test', {method: 'log'});
			doh.is(0, wink.topics._getTopics().length);
		},
		
        // Test publish
        function publish(t)
        {
        	var d = new doh.Deferred();
        	
        	TestTopics = function()
        	{
        		this.method1 = function(params)
        		{
        			try
    				{
    					doh.is('value1', params.result);
    					d.callback(true);
    	
    				} catch(e)
    				{
    					d.errback(e);
    				}
        		};
        		
        		wink.subscribe('/tests/events/test', {method: 'method1', context: this});
        	}();
        	
        	wink.publish('/tests/events/test', {result: 'value1'});
        	
        	return d;
        }
    ]
);