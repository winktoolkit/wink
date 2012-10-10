/*--------------------------------------------------------
 * Copyright (c) 2011, The Dojo Foundation
 * This software is distributed under the "Simplified BSD license",
 * the text of which is available at http://www.winktoolkit.org/licence.txt
 * or see the "license.txt" file for more details.
 *--------------------------------------------------------*/

/**
 * A Simple History manager that handle all history process
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
	 * Define the completion history manager with default values
	 * 
	 * @class SimpleHistoryManager class
	 * 
	 * @param properties an array containing all history manager properties
	 * @param [properties.minQueryLength] The minimum query length
	 * @param [properties.maxHistory] The maximum history size
	 * @param [properties.callbacks] The array containing all processable callbacks
	 * 		Available callbacks are :
	 * 		- "parseHistoryData" : Function to call after retrieve the history data. 
	 * 		Return value must be the updated data (with a first specific separated label, 
	 * 		for example) or null in order to hide the completion
	 * 
	 * @returns SimpleEventManager the completion history manager
	 */
	wink.plugins.completion.manager.history.SimpleHistoryManager = function(properties, component)
	{
	    /**
	     * Type of the manager
	     * @type string
	     */
	    this._type = "history";
	    
	    /**
         * State of the history storage
         * @type boolean
         */
        this.enable = true;
        
	    /**
	     * The callback object containing all callbacks
	     * "parseHistoryData"
	     * 
	     * @type object
	     */
	    this.callbacks = {};
	    
	    /**
	     * The module object containing all modules
	     * @type object
	     */
	    this._handler = null;
	    
	    /**
	     * The minimum required query length
	     * to launch the history request
	     * @type integer
	     */
	    this.minQueryLength = 1;
	    
	    /**
	     * The max history suggestion count
	     * @integer
	     */
	    this.maxHistory = 2;
	    
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
	     * The ready state of the manager
	     * @type boolean
	     */
	    this._ready = false;
	    
	    // Save properties
	    wink.mixin(this, properties);    
	    
	    // Create the history handler
	    if (!this._createHandler())
	        return;
	
	    // Finally set the ready state to true
	    this._ready = true;
	};
	
	wink.plugins.completion.manager.history.SimpleHistoryManager.prototype = 
	{
	    /**
	     * Instanciate the history handler
	     * using the classname parameter
	     * 
	     */
	    _createHandler: function()
	    {
	        // Loop on the handler configuration
	        for (var handlerName in this.handler)
	        {
	            var instanceClassName = wink.plugins.completion.tools.ucFirst(handlerName) + "HistoryHandler";
	            if (!wink.plugins.completion.manager.history.handler[instanceClassName])
	            {
	                //wink.log("[SimpleHistoryManager] The history handler " + instanceClassName + " could not be instanciated");
	                return false;
	            }
	            
	            this._handler = new wink.plugins.completion.manager.history.handler[instanceClassName](this.handler[handlerName]);
	            this._handler._manager = this;
	            this._handler._component = this._component;
	            //process only the first handler
	            break;
	        }
	        
	        return true;
	    },
	    
	    /**
	     * Start the manager
	     * 
	     */
	    start: function()
	    {
	        // Check the manager ready state
	        if (!this._ready)
	        {
	            //wink.log("[SimpleHistoryManager] Configuration failed");
	            return false;
	        }
	        
	        // start the handler if needed (handler has no mandatory start function
	        if (this._handler.start && !this._handler.start())
	        {
	            //wink.log("[SimpleHistoryManager] Handler " + this.handler + " could not be started");
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
	     * Append the history data in the suggestion
	     * list using the query and the history
	     * module
	     * 
	     * @param string query the initial query string
	     */
	    searchHistoryData: function(query)
	    {
	        if (!this.enable)
	            return;
	        
	        if (!wink.isString(query) || query == '' 
	            || query.length < this.minQueryLength)
	            return;
	        
	        // Retrieve history data concerning the query
	        var historyData = this._handler.getHistoryData(query, this.maxHistory, this.stripAccents);
	        
	        // Manage the parse data callback
	        if (this.callbacks.parseHistoryData)
	        {
	            historyData = wink.call(this.callbacks.parseHistoryData, historyData);
	            if (wink.isNull(historyData))
	                return;
	        }
	        
	        // Loop on each history suggestion and add it
	        for (var i = 0 ; i < historyData.length ; i++)
	        {
	            historyData[i].fromHistory = true;
	            this._component.addSuggestion(historyData[i]);
	        }
	    },
	    
	    /**
	     * Save the suggestion in history
	     * using the history handler
	     * 
	     * @param object suggestion the suggestion object
	     * 
	     * @returns boolean
	     */
	    saveHistoryData: function(suggestion)
	    {
	        if (this.enable && this._handler.saveHistoryData(suggestion))
	            return true;
	        
	        return false;
	    },
	    
	    /**
	     * Reset the history data
	     * using the history handler
	     * 
	     */
	    resetHistory: function()
	    {
	        return (this.enable && this._handler.resetHistoryData()); 
	    }
	    
	};
});