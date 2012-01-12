/*--------------------------------------------------------
 * Copyright (c) 2011, The Dojo Foundation
 * This software is distributed under the "Simplified BSD license",
 * the text of which is available at http://www.winktoolkit.org/licence.txt
 * or see the "license.txt" file for more details.
 *--------------------------------------------------------*/

doh.register("wink.net.xhr",
	[
		//Test sendData
		function sendGet(t)
		{
			var d = new doh.Deferred();
			
			var parameters = 
			[
				{name: 'parameter1', value: 'test1'},
				{name: 'parameter2', value: 'test2'}
			];
			
			var a1 = new wink.net.Xhr(parameters);
			
			/**
			 * @ignore
			 */
			successCallback = function(params)
			{
				try
				{
					doh.is(2, params.params.length);
					d.callback(true);
	
				} catch(e)
				{
					d.errback(e);
				}
			};
			
			/**
			 * @ignore
			 */
			errorCallback = function(params)
			{
				d.errback(new Error("GET request failed : cause = " + params.xhrObject.status));
			};
			
			a1.sendData('doh/runner.js', parameters, 'GET', {method: 'successCallback'}, {method: 'errorCallback'}, null);
			
			return d;
		},
		
		//Test sendData
		function sendPost(t)
		{
			var d = new doh.Deferred();
			
			var parameters = 
			[
				{name: 'parameter1', value: 'test1'},
				{name: 'parameter2', value: 'test2'}
			];
			
			var a1 = new wink.net.Xhr(parameters);
			
			/**
			 * @ignore
			 */
			successCallback = function(params)
			{
				try
				{
					doh.is(2, params.params.length);
					d.callback(true);
	
				} catch(e)
				{
					d.errback(e);
				}
			};
			
			/**
			 * @ignore
			 */
			errorCallback = function(params)
			{
				d.errback(new Error("POST request failed : cause = " + params.xhrObject.status));
			};
			
			a1.sendData('../base64.php', parameters, 'POST', {method: 'successCallback'}, {method: 'errorCallback'}, null);
			
			return d;
		},
		
		//Test sendData
		function sendWrongRequest(t)
		{
			var d = new doh.Deferred();
		
			var a1 = new wink.net.Xhr();
			
			/**
			 * @ignore
			 */
			successCallback = function(params)
			{
				d.errback(new Error("Error: should have received a 404 statement"));
			};
			
			/**
			 * @ignore
			 */
			errorCallback = function(params)
			{
				try
				{
					doh.is('404', params.xhrObject.status);
					d.callback(true);
	
				} catch(e)
				{
					d.errback(e);
				}
			};
			
			a1.sendData('unavailable.html', null, 'GET', {method: 'successCallback'}, {method: 'errorCallback'}, null);
			
			return d;
		}
    ]
);