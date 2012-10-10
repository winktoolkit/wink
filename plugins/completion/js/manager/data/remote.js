/*--------------------------------------------------------
 * Copyright (c) 2011, The Dojo Foundation
 * This software is distributed under the "Simplified BSD license",
 * the text of which is available at http://www.winktoolkit.org/licence.txt
 * or see the "license.txt" file for more details.
 *--------------------------------------------------------*/

/**
 * A Remote data manager that handle all search process
 *  
 * @winkVersion 1.4
 *  
 * @compatibility iOS2, iOS3, iOS4, Android 1.5, Android 2.1, Android 2.2, Android 2.3, Android 3.0, Android 3.1, Android 4.0, BlackBerry 6, BlackBerry 7
 * 
 * @author Guillaume WINTZER, Mathieu FABRE
 */

define(['../../../../../_amd/core'], function(wink)
{
	/**
	 * Define the completion remote data manager with default values
	 *
	 * @class RemoteDataManager class
	 * 
	 * @param properties an array containing all data manager properties
	 * @param properties.url The Remote server URL to call
	 * @param properties.queryParamName The query parameter name to use in the URL
	 * @param [properties.sendMethod] The send method to use (GET or POST) Default is GET
	 * @param [properties.minQueryLength] The minimum query length
	 * @param [properties.callbacks] The array containing all processable callbacks
	 * 		Available callbacks are :
	 * 		- "getDataContent" : The remote server can encapsulate the response content in high-level array (for example, to get the request status). Return value must be the data content or null in order to hide the completion
	 * 		- "parseResponseData" : Function to call after retrieve the response from local data source. Return value must be the updated data (with a first specific separated label, for example) or null in order to hide the completion
	 * 		- "parseFinalSuggestions" : Function to call after processing all suggestions. Allow to update the internal suggestions list (for example to add a close label suggestion). Return value can be null in order to hide the completion
	 * @param [properties.removeDuplicateSuggestions] The boolean that indicate if we have to remove duplicate suggestions

	 * 
	 * @returns RemoteDataManager the completion remote data manager
	 */
	wink.plugins.completion.manager.data.RemoteDataManager = function(properties, component)
	{    
	    /**
	     * Type of the manager
	     * @type string
	     */
	    this._type = "data";
	    
	    /**
	     * The remote URL to call
	     * @type string
	     */
	    this.url = null;
	    
	    /**
	     * The name of query parameter inside the url.
	     * @type string
	     */
	    this.queryParamName = null;
	    
	    /**
	     * The send method used in XHR
	     * Should be POST or GET
	     * @type string
	     * @default GET
	     */
	    this.sendMethod = 'GET';
	    
	    /**
	     * The minimum required query length
	     * to launch the remote request
	     * @type integer
	     */
	    this.minQueryLength = 1;
	    
	    /**
	     * The callback object containing all callbacks
	     * @type object
	     */
	    this.callbacks = {};
	    
	    /**
	     * The data cache array
	     * @type object
	     */
	    this._cache = {};
	        
	    /**
	     * The module object containing all modules
	     * @type object
	     */
	    this._modules = {};
	    
	    /**
	     * The XHR component to send request
	     * using Ajax
	     * @type XHR
	     */
	    this._xhrManager = new wink.Xhr();
	    
	    /**
	     * XHR timer to avoid too much requests
	     */
	    this._xhrTimer = null;
	    
	    /**
	     * Indicate if we have to remove duplicate suggestions
	     * @type boolean
	     */
	    this.removeDuplicateSuggestions = true;
	    
	    /**
	     * The component reference
	     * @type Component
	     */
	    this._component = component;
	    
	    /**
	     * The manager helper
	     * @type ManagerHelper
	     */
	    this._helper = component._helper;
	    
	    /**
	     * The ready value if the manager is well configured
	     * @type boolean
	     */
	    this._ready = false;
	    
	    // Save properties
	    wink.mixin(this, properties);
	    
	    // Create all modules
	    if (!this._helper.createModules(this, this._type))
	        return;
	    
	    // Finally set the manager ready
	    this._ready = true;
	};
	
	wink.plugins.completion.manager.data.RemoteDataManager.prototype = 
	{
	    /**
	     * Start the manager
	     * 
	     * @returns boolean
	     */
	    start: function()
	    {
	        // Check the manager ready state
	        if (!this._ready)
	        {
	            //wink.log("[RemoteDataManager] Configuration failed");
	            return false;
	        }
	        
	        // start all modules if needed (modules has no mandatory start function
	        if (!this._helper.startModules(this._modules))
	        {
	            //wink.log("[RemoteDataManager] Module could not be started");
	            return false;
	        }
	        
	        return true;
	    },
	
	    /**
	     * Stop the manager
	     */
	    stop: function()
	    {
	        return true;
	    },
	
	    /**
	     * Run the search process using
	     * the specified query string
	     * 
	     * @param string query
	     */
	    searchData: function(query)
	    {
	        // Check if the value is not empty and > minimum required size
	        if (wink.isString(query) && query != '' && query.length >= this.minQueryLength)
	        {
	            // Try to retrieve the previous suggestion (1 letter less)
	            var previousSuggestion = this._cache[query.substring(0, query.length - 1)];
	            
	            // Check if the previous is not empty or null
	            if (!previousSuggestion || previousSuggestion.length != 0)
	            {
	                // Check if current suggestion exist
	                if (this._cache[query])
	                {
	                    // Suggestion exist in cache, just process it
	                    this._processResponse(query, wink.plugins.completion.tools.clone(this._cache[query]));
	                    return;
	                }
	                else
	                {
	                	this._abortXhr();
	                	this._xhrTimer = wink.setTimeout(this, '_launchXhr', 300, query);
	                    return;
	                }
	            }
	            else
	            {
	                this.addCacheData(query, []);
	            }
	        }
	        else
	        {
	        	this._abortXhr();
	        }
	        
	        this._component.processOnSearchFailed();
	    },
	    
		/**
		 * abort the request if needed
		 */
		_abortXhr: function()
		{
			if (this._xhrTimer)
			{
				clearTimeout(this._xhrTimer);
				this._xhrTimer = null;
				this._xhrManager.request.xhrObject.abort();
			}
		},
	    
	    /**
	     * Do the request
	     * 
	     * @param string query
	     */
	    _launchXhr: function(query) {
	    	var _self = this;
            // Call XmlHttpRequest and wait for response
            var successCallback = { context: _self, method: "_completionSearchSuccessCallback", arguments: query };
            var failureCallback = { context: _self, method: "_completionSearchFailureCallback", arguments: query };
            this._xhrManager.sendData(this.url,
            		[{
            			name: this.queryParamName,
            			value: query
            		}],
            		this.sendMethod.toUpperCase(),
            		successCallback,
            		failureCallback,
            		null);
	    },
	    
	    /**
	     * Handle the completion result in success case
	     * 
	     * @param object response the response object
	     * @param string query the query string
	     */
	    _completionSearchSuccessCallback: function(response, query)
	    {
	        // Check that we have a response text
	        if (!response.xhrObject.responseText)
	            return;
	        
	        var parseData = wink.parseJSON(response.xhrObject.responseText);
	
	        // add the response in cache
	        this.addCacheData(query, parseData);
	        
	        this._processResponse(query, parseData);
	    },
	    
	    /**
	     * Save the query in the cache
	     * 
	     * @param string query the query string
	     * @param object data the data to save
	     */
	    addCacheData: function(query, data)
	    {
	        this._cache[query] = wink.plugins.completion.tools.clone(data);
	    },
	    
	    /**
	     * Process the data response
	     * for each line of the data response, call the
	     * processSuggestion
	     * 
	     * @param object data response data as object
	     */
	    _processResponse: function(query, data)
	    {
	        // Extract the data content from the server response
	        if (this.callbacks.getDataContent)
	        {
	            data = wink.call(this.callbacks.getDataContent, data);
	            if (wink.isNull(data))
	            {
	                this._component.processOnSearchFailed();
	                return;
	            }
	        }
	        
	        // Check if we have to remove duplicate suggestions
	        if (this.removeDuplicateSuggestions)
	            data = wink.plugins.completion.tools.removeDuplicate(data, this._component.getSuggestions(), this._helper.getDefaultModule(this).mapping["value"], "value");
	        
	        // Run the parseResponseData callback if exist
	        if (this.callbacks.parseResponseData)
	        {
	            data = wink.call(this.callbacks.parseResponseData, data);
	            if (wink.isNull(data))
	            {
	                this._component.processOnSearchFailed();
	                return;
	            }
	        }
	        
	        // Process all suggestion
	        this._processSuggestions(data);
	        
	        // Run the parseResponseData callback if exist
	        if (this.callbacks.parseFinalSuggestions)
	        {
	            data = wink.call(this.callbacks.parseFinalSuggestions, this._component.getSuggestions());
	            if (wink.isNull(data))
	            {
	                this._component.processOnSearchFailed();
	                return;
	            }
	        }
	        
	        // Finally build the completion
	        this._component.processOnSearchSuccess(query);
	    },
	    
	    /**
	     * Loop on each data result row and add it 
	     * in the suggestions list
	     * 
	     * @param array data the list of suggestions
	     */
	    _processSuggestions: function(data)
	    {
	        for(var i = 0 ; i < data.length ; i++)
	        {
	            // Create a new empty suggestion
	            var suggestion = {};
	            
	            // Loop on each module and let them fill the suggestion
	            for (var type in this._modules)
	            {
	                if (this._modules[type].processSuggestion)
	                    this._modules[type].processSuggestion(suggestion, data[i]);
	            }
	            
	            // Try to add the suggestion
	            this._component.addSuggestion(suggestion);
	        }
	    },
	    
	    /**
	     * Handle the completion result in failure case
	     * 
	     * @param object response the response object
	     */
	    _completionSearchFailureCallback: function(response, query)
	    {
	        this._component.processOnSearchFailed();
	    }
	    
	};
});