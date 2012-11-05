/*--------------------------------------------------------
 * Copyright (c) 2011, The Dojo Foundation
 * This software is distributed under the "Simplified BSD license",
 * the text of which is available at http://www.winktoolkit.org/licence.txt
 * or see the "license.txt" file for more details.
 *--------------------------------------------------------*/

/**
 * A local data manager that handle all search process
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
	 * Define the completion local data manager with default values
	 *
	 * @class LocalDataManager class
	 * 
	 * @param properties an array containing all data manager properties
	 * @param properties.suggestions The local data suggestion to search on
	 * @param [properties.minQueryLength] The minimum required query length
	 * @param [properties.maxSearchedSuggestions] The maximum suggestions number to return in a request
	 * @param [properties.callbacks] The array containing all processable callbacks
	 * 		Available callbacks are :
	 * 		- "parseResponseData" : Function to call after retrieve the response from local data source. Return value must be the updated data (with a first specific separated label, for example) or null in order to hide the completion
	 * 		- "parseFinalSuggestions" : Function to call after processing all suggestions. Allow to update the internal suggestions list (for example to add a close label suggestion). Return value can be null in order to hide the completion
	 * 		- "compareData" : Comparison function between the query and the suggestion value. Return value must be an ordering number to sort the final suggestions list
	 * @param [properties.removeDuplicateSuggestions] Indicate if we have to remove duplicate suggestions
	 * 
	 * @returns LocalDataManager the completion local data manager
	 */
	wink.plugins.completion.manager.data.LocalDataManager = function(properties, component)
	{
	    /**
	     * Type of the manager
	     * @type string
	     */
	    this._type = "data";
	    
	    /**
	     * The data suggestion containing all suggestions
	     * @type array
	     */
	    this.suggestions = [];
	    
	    /**
	     * The minimum required query length
	     * to launch the remote request
	     * @type integer
	     */
	    this.minQueryLength = 1;
	    
	    /**
	     * Maximum suggestions number 
	     * to return in a search request
	     */
	    this.maxSearchedSuggestions = 10;
	    
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
	     * Indicate if we have to remove duplicate suggestions
	     * @type boolean
	     */
	    this.removeDuplicateSuggestions = true;
	    
	    /**
	     * Indicate if we use strip accents
	     */
	    this.stripAccents = true;
	    
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
	
	wink.plugins.completion.manager.data.LocalDataManager.prototype = 
	{    
	    /**
	     * Check the suggestion content
	     * Cast simple entry (string) in
	     * object entry
	     * 
	     */
	    _checkSuggestionContent: function()
	    {
	        var defaultModuleMapping = this._helper.getDefaultModule(this).mapping;
	
	        for(var i = 0 ; i < this.suggestions.length ; i++)
	        {
	            if (wink.isString(this.suggestions[i]))
	            {
	                var s = this.suggestions[i];
	                this.suggestions[i] = {};
	                this.suggestions[i][defaultModuleMapping["value"]] = s;
	            }
	        }        
	    },
	    
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
	            //wink.log("[LocalDataManager] Configuration failed");
	            return false;
	        }
	        
	        // Check the suggestion content
	        this._checkSuggestionContent();
	        
	        // start all modules if needed (modules has no mandatory start function
	        if (!this._helper.startModules(this._modules))
	        {
	            //wink.log("[LocalDataManager] Module could not be started");
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
	                var parseData;
	                // Check if current suggestion exist
	                if (this._cache[query])
	                    parseData = wink.plugins.completion.tools.clone(this._cache[query]);
	                else
	                {
	                    parseData = this._getDataForQuery(query);
	                    this.addCacheData(query, parseData);
	                }
	                                    
	                // process the response data
	                this._processResponse(query, parseData);
	                return;
	            }
	            else
	                this.addCacheData(query, []);
	        }
	        
	        this._component.processOnSearchFailed();
	    },
	    
	    /**
	     * Return the data for specified query
	     * using internal requests, suggestions
	     * and mapping arrays
	     * 
	     * @param string query the query
	     * 
	     * @returns array suggestions data
	     */
	    _getDataForQuery: function(query)
	    {
	        // Initialize result data
	        var responseData = [];
	        var responseWeightData = [];
	        
	        // Initialize the comparison callback
	        var compareCallBack = { context: this, method: "_defaultCompare" };
	        if (this.callbacks["compareData"] && wink.isCallBack(this.callbacks["compareData"]))
	            compareCallBack = this.callbacks["compareData"];
	        
	        // Get the default module mapping to use on user suggestions array 
	        var defaultModuleMapping = this._helper.getDefaultModule(this).mapping;
	        // Loop on suggestion and evaluate weights
	        for (var i = 0 ; i < this.suggestions.length ; i++) {
	            var order = wink.call(compareCallBack, { "query": query, "value": this.suggestions[i][defaultModuleMapping["value"]] });
	            if (order > 0) {
	                responseWeightData.push({
	                    "index": i,
	                    "order": order
	                });
	            }
	        }
	        
	        // Order the weight array
	        responseWeightData.sort(function(a, b){return (b.order - a.order);});
	        
	        // Loop on weight array from 0 to max and build response
	        for (var i = 0 ; i < responseWeightData.length && i < this.maxSearchedSuggestions ; i++)
	            responseData.push(this.suggestions[responseWeightData[i].index]);
	        
	        return responseData;
	    },
	    
	    /**
	     * Compare the query with the suggestion text
	     * and return the order value
	     * 
	     * @param array the parameters array, first value is query, second value is suggestion
	     * 
	     * @returns integer
	     */
	    _defaultCompare: function(paramArray)
	    {
	        var queryLower = paramArray.query.toLowerCase();
	        if(this.stripAccents)
	        {
	        	queryLower = wink.plugins.completion.searchTools.stripAccents(queryLower);
	        }
	        
	        var suggestionValueLower = paramArray.value.substr(0, paramArray.value.length - 1).toLowerCase();
	        if(this.stripAccents)
	        {
	        	suggestionValueLower = wink.plugins.completion.searchTools.stripAccents(suggestionValueLower);
	        }
	        
	        if (queryLower == suggestionValueLower)
	            return 100;
	        else if (suggestionValueLower.indexOf(queryLower) == 0)
	            return (queryLower.length * 100 / suggestionValueLower.length);
	        
	        return 0;
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