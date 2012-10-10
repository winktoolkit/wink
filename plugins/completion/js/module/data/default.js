/*--------------------------------------------------------
 * Copyright (c) 2011, The Dojo Foundation
 * This software is distributed under the "Simplified BSD license",
 * the text of which is available at http://www.winktoolkit.org/licence.txt
 * or see the "license.txt" file for more details.
 *--------------------------------------------------------*/

/**
 * The default data module that handle all suggestion with default type
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
	 * Define the default completion data module
	 *
	 * @class DefaultDataModule class
	 * 
	 * @param properties an array containing default module properties
	 * @param [properties.mapping] The mapping array between data key name and internal suggestion key name.
	 * 	Default mapping is : 
	 * 	{
	 * 		"value": "value",
	 * 		"type" : "type",
	 * 		"css"  : "css"
	 * 	}
	 * 
	 * @returns DefaultDataModule the completion default data module
	 */
	wink.plugins.completion.module.data.DefaultDataModule = function(properties)
	{
	    /**
	     * The module ready state
	     * @type boolean
	     */
	    this._ready = false;
	    
	    /**
	     * Default mapping for data conversion
	     * 
	     * @type object
	     */
	    this.mapping = {
	        "value": "value",
	        "type" : "type",
	        "css"  : "css"
	    };
	    
	    // Save properties
	    wink.mixin(this, properties);
	    
	    this._ready = true;
	};
	
	wink.plugins.completion.module.data.DefaultDataModule.prototype = 
	{    
	    /**
	     * Start the module
	     * 
	     * @returns boolean
	     */
	    start: function()
	    {
	        return this._ready;
	    },
	    
	    /**
	     * Process the current suggestion using data
	     *  
	     * @param object suggestion The current suggestion
	     * @param array data The parsed data
	     */
	    processSuggestion: function(suggestion, data)
	    {
	        for (var suggestionKey in this.mapping)
	        {
	            var sourceKey = this.mapping[suggestionKey];
	            
	            if (data[sourceKey])
	                suggestion[suggestionKey] = data[sourceKey];
	        }
	    }
	};
});