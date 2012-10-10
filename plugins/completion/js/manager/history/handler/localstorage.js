/*--------------------------------------------------------
 * Copyright (c) 2011, The Dojo Foundation
 * This software is distributed under the "Simplified BSD license",
 * the text of which is available at http://www.winktoolkit.org/licence.txt
 * or see the "license.txt" file for more details.
 *--------------------------------------------------------*/

/**
 * The local storage history handler
 *  
 * @winkVersion 1.4
 *  
 * @compatibility iOS2, iOS3, iOS4, Android 1.5, Android 2.1, Android 2.2, Android 2.3, Android 3.0, Android 3.1, Android 4.0, BlackBerry 6, BlackBerry 7
 * 
 * @author Guillaume WINTZER, Mathieu FABRE
 */

define(['../../../../../../_amd/core'], function(wink)
{
	/**
	 * Define the local storage history handler
	 *
	 * @class LocalStorageHistoryHandler class
	 * 
	 * @param properties an array containing local storage history handler properties
	 * @param [properties.storageName] Key name of the history local storage entry
	 * @param [properties.callbacks] The array containing all processable callbacks
	 * 		Available callbacks are :
	 * 		- "compareData" : Comparison function between the query and the suggestion value. 
	 * 		Return value must be an ordering number to sort the final suggestions list
	 * 
	 * @returns LocalStorageHistoryHandler the local storage history handler
	 */
	wink.plugins.completion.manager.history.handler.LocalStorageHistoryHandler = function(properties)
	{
	    /**
	     * Callbacks of the history module
	     * "compareData"
	     * 
	     * @param object
	     */
	    this.callbacks = {};
	    
	    /**
	     * Key name of the history local storage entry
	     * @type string
	     */
	    this.storageName = "cmpl_history";
	    
	    wink.mixin(this, properties);
	};
	
	wink.plugins.completion.manager.history.handler.LocalStorageHistoryHandler.prototype = 
	{    
	    /**
	     * Get the history suggestions
	     * for specified query
	     * 
	     * @param string query The searched query
	     * 
	     * @returns array Suggestions matching with the query
	     */
	    getHistoryData: function(query)
	    {	        
	        var historyList = [];
	        var historyWeightData = [];
	        
	        var historyList = [];
	        var historyWeightData = [];
	
	        // Check the local storage
	        if (!localStorage)
	            return historyList;
	        
	        var storage = localStorage.getItem(this.storageName);        
	        if (storage)
	        {
	            // Initialize the comparison callback
	            var compareCallBack = { context: this, method: "_defaultCompare", arguments: this._manager.stripAccents };
	            if (this.callbacks["compareData"] && wink.isCallBack(this.callbacks["compareData"]))
	                compareCallBack = this.callbacks["compareData"];

	            var localData = wink.parseJSON(storage);
	            for (var i = 0 ; i < localData.length ; i++) 
	            {
	                // check the query value
	                if (!localData[i]["value"])
	                    break;
	                
	                var order = wink.call(compareCallBack, { "query": query, "value": localData[i]["value"] });
	                if (order > 0) {
	                    historyWeightData.push({
	                        "index": i,
	                        "order": order
	                    });
	                }
	            }
	            
	            // Sort the weight array
	            historyWeightData.sort(function(a, b){return (b.order - a.order);});                
	            
	            // Loop on weight array from 0 to max and build response
	            for (var i = 0 ; i < historyWeightData.length && i < this._manager.maxHistory ; i++)
	                historyList.push(localData[historyWeightData[i].index]);
	        }
	    
	        return historyList;
	    },
	    
	    /**
	     * Compare the query with the suggestion text
	     * and return the order value
	     * 
	     * @param array the parameters array, first value is query, second value is suggestion
	     * 
	     * @returns integer
	     */
	    _defaultCompare: function(paramArray, stripAccents)
	    {
	        var queryLower = paramArray.query.toLowerCase();
	        if(stripAccents)
	        {
	        	queryLower = wink.plugins.completion.searchTools.stripAccents(queryLower);
	        }
	        var suggestionValueLower = paramArray.value.substr(0, paramArray.value.length - 1).toLowerCase();
	        if(stripAccents)
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
	     * Save the given suggestion in history storage
	     * 
	     * @param suggestion 
	     */
	    saveHistoryData: function(suggestion)
	    {               
	        // Check the local storage
	        if (!localStorage)
	            return false;
	        
	        // Retrieve current local storage data
	        var data = [];
	        if (wink.isSet(localStorage.getItem(this.storageName)) && localStorage.getItem(this.storageName).length)
	            data = wink.parseJSON(localStorage.getItem(this.storageName));
	        
	        // Check if the data already exist in storage
	        for (var i = 0 ; i < data.length ; i++)
	        {
	            if (data[i].value == suggestion.value)
	                return true;
	        }
	        
	        // Append and save the new suggestion      
	        data.unshift(suggestion);        
	        localStorage.setItem(this.storageName, wink.json.stringify(data));
	        
	        return true;
	    },
	    
	    /**
	     * Reset the history data in local storage
	     * 
	     * @returns boolean 
	     */
	    resetHistoryData: function()
	    {
	        if (!localStorage)
	            return false;
	                
	        // Remove item
	        localStorage.removeItem(this.storageName);        
	        
	        return true;
	    }
	    
	};
});