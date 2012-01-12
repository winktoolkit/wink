/*--------------------------------------------------------
 * Copyright (c) 2011, The Dojo Foundation
 * This software is distributed under the "Simplified BSD license",
 * the text of which is available at http://www.winktoolkit.org/licence.txt
 * or see the "license.txt" file for more details.
 *--------------------------------------------------------*/

doh.register("wink._base._base",
	[
        // Test byId
        function byId(t)
        {
        	doh.is(document.getElementById('test'), $('test'));
        	doh.is(null, $('dumb'));
        	doh.is(document.getElementById('test'), $(document.getElementById('test')));
        },
        
     	// Test query
        {
	 		name: "query",
	 		setUp: function()
	 		{
	 			test1 = document.createElement('span');
	 			test2 = document.createElement('span');
	 			
	 			test1.className = 'testQuery';
	 			test2.className = 'testQuery';
	 			
	 			document.body.appendChild(test1);
	 			document.body.appendChild(test2);
	 		},
	 		runTest: function(t)
	        {
	        	doh.is(2, $$('.testQuery').length);
	        },
	        tearDown: function()
	 		{
	        	document.body.removeChild(test1);
	        	document.body.removeChild(test2);
	        	
	        	test1 = null;
	        	test2 = null;
	 		}
        },
        
        // Test translate
        function translate(t)
        {
        	window.i18n = 
        	{
        		test: 'translated'
        	};
        	
        	doh.is('translated', wink.translate('test'));
        	
        	var component = function() {};
        	component.prototype = {
        		i18n: {
        			en_EN: {
        				word1: "word1_en"
        			},
        			fr_FR: {
        				word1: "word1_fr"
        			}
        		},
        		getText: function() {
        			return _('word1', this);
        		}
        	};
        	var instance = new component();
        	
        	doh.is('word1_en', wink.translate('word1', instance));
        	doh.is('word1_en', instance.getText());
        	
        	wink.setLocale('fr_FR');
        	doh.is('word1_fr', wink.translate('word1', instance));
        	doh.is('word1_fr', instance.getText());
        	
        	wink.setLocale('en_EN');
        	doh.is('word1_en', wink.translate('word1', instance));
        	doh.is('word1_en', instance.getText());
        	
        	doh.is('word2', wink.translate('word2', instance));
        	doh.is('word2', wink.translate('word2'));
        	
        	delete window.i18n;
        },
        
        // Test isUndefined
        function isUndefined(t)
        {
        	doh.assertTrue(wink.isUndefined(undefined));
        	doh.assertFalse(wink.isUndefined(null));
        	doh.assertFalse(wink.isUndefined(true));
        	doh.assertFalse(wink.isUndefined(1));
        	doh.assertFalse(wink.isUndefined('test'));
        	doh.assertFalse(wink.isUndefined(function(){}));
        },
        
        // Test isNull
        function isNull(t)
        {
        	doh.assertFalse(wink.isNull(undefined));
        	doh.assertTrue(wink.isNull(null));
        	doh.assertFalse(wink.isNull(true));
        	doh.assertFalse(wink.isNull(1));
        	doh.assertFalse(wink.isNull('test'));
        	doh.assertFalse(wink.isNull(function(){}));
        },
        
        // Test isSet
        function isSet(t)
        {
        	doh.assertFalse(wink.isSet(undefined));
        	doh.assertFalse(wink.isSet(null));
        	doh.assertTrue(wink.isSet(true));
        	doh.assertTrue(wink.isSet(1));
        	doh.assertTrue(wink.isSet('test'));
        	doh.assertTrue(wink.isSet(function(){}));
        },
        
     	// Test isCallback
        function isCallback(t)
        {
        	var valid_cb  = { context: this, method: 'test' };
        	var invalid_cb = { context: this };
        	
        	doh.assertTrue(wink.isCallback(valid_cb));
        	doh.assertFalse(wink.isCallback(invalid_cb));
        	doh.assertFalse(wink.isCallback(undefined));
        	doh.assertFalse(wink.isCallback(null));
        	doh.assertFalse(wink.isCallback(true));
        	doh.assertFalse(wink.isCallback(1));
        	doh.assertFalse(wink.isCallback('test'));
        	doh.assertFalse(wink.isCallback(function(){}));
        },
        
        // Test isString
        function isString(t)
        {
        	doh.assertTrue(wink.isString(new String('test')));
        	doh.assertTrue(wink.isString('test'));
        	doh.assertFalse(wink.isString(undefined));
        	doh.assertFalse(wink.isString(null));
        	doh.assertFalse(wink.isString(true));
        	doh.assertFalse(wink.isString(1));
        	doh.assertFalse(wink.isString(function(){}));
        },
        
        // Test isInteger
        function isInteger(t)
        {
        	doh.assertTrue(wink.isInteger(1));
        	doh.assertTrue(wink.isInteger(0));
        	doh.assertFalse(wink.isInteger(1.2));
        	doh.assertFalse(wink.isInteger(NaN));
        	doh.assertFalse(wink.isInteger(Infinity));
        	doh.assertFalse(wink.isInteger('1'));
        	doh.assertFalse(wink.isInteger(undefined));
        	doh.assertFalse(wink.isInteger(null));
        	doh.assertFalse(wink.isInteger(true));
        	doh.assertFalse(wink.isInteger(function(){}));
        },
        
        // Test isNumber
        function isNumber(t)
        {
        	doh.assertTrue(wink.isNumber(new Number(1)));
        	doh.assertTrue(wink.isNumber(1));
        	doh.assertTrue(wink.isNumber(1.2));
        	doh.assertTrue(wink.isNumber(NaN));
        	doh.assertTrue(wink.isNumber(Infinity));
        	doh.assertFalse(wink.isNumber('test'));
        	doh.assertFalse(wink.isNumber(undefined));
        	doh.assertFalse(wink.isNumber(null));
        	doh.assertFalse(wink.isNumber(true));
        	doh.assertFalse(wink.isNumber(function(){}));
        },
        
        // Test isArray
        function isArray(t)
        {
        	doh.assertTrue(wink.isArray(new Array()));
        	doh.assertTrue(wink.isArray([1, 2, 3]));
        	doh.assertFalse(wink.isArray('test'));
        	doh.assertFalse(wink.isArray(undefined));
        	doh.assertFalse(wink.isArray(null));
        	doh.assertFalse(wink.isArray(true));
        	doh.assertFalse(wink.isArray(1));
        	doh.assertFalse(wink.isArray(function(){}));
        },
        
        // Test isBoolean
        function isBoolean(t)
        {
        	doh.assertTrue(wink.isBoolean(new Boolean(1)));
        	doh.assertTrue(wink.isBoolean(true));
        	doh.assertFalse(wink.isBoolean('test'));
        	doh.assertFalse(wink.isBoolean(undefined));
        	doh.assertFalse(wink.isBoolean(null));
        	doh.assertFalse(wink.isBoolean(1));
        	doh.assertFalse(wink.isBoolean(function(){}));
        },
        
        // Test isBoolean
        function isFunction(t)
        {
        	doh.assertTrue(wink.isFunction(function(){}));
        	doh.assertTrue(wink.isFunction(doh.register));
        	doh.assertFalse(wink.isFunction('test'));
        	doh.assertFalse(wink.isFunction(undefined));
        	doh.assertFalse(wink.isFunction(null));
        	doh.assertFalse(wink.isFunction(1));
        },
        
        // Test trim
        function trim(t)
        {
        	doh.is("test", wink.trim(" test"));
        	doh.is("test", wink.trim("test "));
        	doh.is("test", wink.trim(" test "));
        },
        
        // Test bind
        function bind(t)
        {
        	var d = new doh.Deferred();
        	
        	wink.bindTest = function(version)
        	{
        		try
				{
        			doh.is(this.version, version);
					d.callback(true);
	
				} catch(e)
				{
					d.errback(e);
				}
        	};
        	
        	window.winkBindTest = wink.bind(wink.bindTest, wink);
        	window.winkBindTest(wink.version);
        	
        	return d;
        },
        
        // Test bind with args
        function bindWithArgs(t)
        {
        	var ctx = {
        		ctxAttr: "attrValue"
        	};
        	var method = function(value1, value2) {
        		doh.assertTrue(this.ctxAttr === "attrValue");
        		doh.assertTrue(value1 === "value1");
        		doh.assertTrue(value2 === "value2");
        	};
        	var bindedMethod = wink.bind(method, ctx, "value1");
        	bindedMethod("value2");
        },
        
        // Test call
        function call(t)
        {
        	var d = new doh.Deferred();
        	
        	wink.callTest = function(params)
        	{
        		try
				{
        			doh.is('test', params);
					d.callback(true);
	
				} catch(e)
				{
					d.errback(e);
				}
        	};
        	
        	wink.call({context: wink, method: 'callTest'}, 'test');
        	
        	return d;
        },
        
        // Test call
        function call_Array(t)
        {
        	var d = new doh.Deferred();
        	
        	wink.callTestArray = function(params)
        	{
        		try
				{
        			doh.is(2, params.length);
					d.callback(true);
	
				} catch(e)
				{
					d.errback(e);
				}
        	};
        	
        	wink.call({context: wink, method: 'callTestArray'}, ['test', 'test']);
        	
        	return d;
        },
        
        // Test call
        function call_Object(t)
        {
        	var d = new doh.Deferred();
      
        	wink.callTestObject = function(params)
        	{
        		try
				{
        			doh.is(2, params.test.length);
					d.callback(true);
	
				} catch(e)
				{
					d.errback(e);
				}
        	};
        	
        	wink.call({context: wink, method: 'callTestObject'}, {test: ['test', 'test']});
        	
        	return d;
        },
        
        // Test connect
        function connect(t)
        {
        	var d = new doh.Deferred();
      
        	wink.connectTest = function(param1, param2, param3, param4, param5)
        	{
        		try
				{
        			doh.is('test', param1);
        			doh.is(3, param2.length);
        			doh.is('test', param3.test);
        			doh.is('a', param4);
        			doh.is(1, param5[0]);
        			
					d.callback(true);
	
				} catch(e)
				{
					d.errback(e);
				}
        	};
        	
        	wink.connectTestTrigger = function(params)
        	{
        		// Call method
        	};
        	
        	wink.connect(wink, 'connectTestTrigger', {method: 'connectTest', context: wink, arguments: ['a', [1, 2]]});
        	wink.connectTestTrigger('test', [1, 2, 3], {test: 'test'});
        	
        	return d;
        },
        
        // Test connect multiple methods
        function connectMultipleMethods(t)
        {
        	wink.connect(wink, 'connectTestTrigger', {method: 'connectTest', context: wink});
        	doh.is(1, wink['connectTestTrigger'].cbs.length);
        },
        
        // Test disconnect
        function disconnect(t)
        {
        	wink.disconnect(wink, 'connectTestTrigger', {method: 'connectTest', context: wink});
        	doh.is(undefined, wink['connectTestTrigger'].cbs[0]);
        },
        
        // Test setTimeout
        function timeout(t)
        {
        	var d = new doh.Deferred();
      
        	wink.timeoutTest = function(params)
        	{
        		try
				{
					doh.is('test', params);
					d.callback(true);
	
				} catch(e)
				{
					d.errback(e);
				}
        	};
        	
        	wink.setTimeout(wink, 'timeoutTest', 100, 'test');
        	
        	return d;
        },
        
        // Test setInterval
        function interval(t)
        {
        	var d = new doh.Deferred();
      
        	wink.intervalTest = function(params)
        	{
        		clearInterval(wink.testInterval);
        		
        		try
				{
					doh.is('test', params);
					d.callback(true);
	
				} catch(e)
				{
					d.errback(e);
				}
        	};
        	
        	wink.testInterval = wink.setInterval(wink, 'intervalTest', 100, 'test');
        	
        	return d;
        },
        
        // Test UId
        function uid(t)
        {
        	var uid1 = wink.getUId();
        	var uid2 = wink.getUId();
        	doh.assertTrue(wink.isInteger(uid1));
        	doh.assertTrue(uid1 != uid2);
        }
    ]
);