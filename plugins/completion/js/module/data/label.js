/*--------------------------------------------------------
 * Copyright (c) 2011, The Dojo Foundation
 * This software is distributed under the "Simplified BSD license",
 * the text of which is available at http://www.winktoolkit.org/licence.txt
 * or see the "license.txt" file for more details.
 *--------------------------------------------------------*/

/**
 * The label data module that handle all suggestion with "label" type
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
	 * Define the label completion data module
	 *
	 * @class LabelDataModule class
	 * 
	 * @param properties an array containing label module properties
	 * @param [properties.mapping] The mapping array between data key name and internal suggestion key name.
	 * 	Default mapping is : 
	 * 	{
	 * 		"content": "content",
	 * 		"action": "action"
	 * 	}
	 * 
	 * @returns LabelDataModule the completion label data module
	 */
	wink.plugins.completion.module.data.LabelDataModule = function(properties)
	{
	    /**
         * The ready state of the module
         * @type boolean
         */
        this._ready = false;
        
	    /**
	     * Default mapping for data conversion
	     * 
	     * @type object
	     */
	    this.mapping = {
	        "content": "content",
	        "action": "action"
	    };
	    
	    // Save properties
	    wink.mixin(this, properties);
        
        this._ready = true;
	    
	    return;
	};
	
	wink.plugins.completion.module.data.LabelDataModule.prototype = 
	{
        /**
         * Start the module by returning
         * the state value
         * 
         * @returns boolean
         */
        start: function()
        {
            if (!this._ready)
            {
            	//wink.log("[LabelDataModule] Could not be started, configuration failed");
            }
                
            return this._ready;
        },
            
	    /**
	     * Process the current suggestion using data
	     *  
	     * @param integer suggestionIndex The suggestion index
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