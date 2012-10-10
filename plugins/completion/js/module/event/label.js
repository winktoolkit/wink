/*--------------------------------------------------------
 * Copyright (c) 2011, The Dojo Foundation
 * This software is distributed under the "Simplified BSD license",
 * the text of which is available at http://www.winktoolkit.org/licence.txt
 * or see the "license.txt" file for more details.
 *--------------------------------------------------------*/

/**
 * The label event module that handle all suggestions DOM node with "label" type
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
	 * Define the label completion Event module
	 *
	 * @class LabelEventModule class
	 * 
	 * @param properties an array containing label module properties
	 * 
	 * @returns LabelEventModule the completion label Event module
	 */
	wink.plugins.completion.module.event.LabelEventModule = function(properties)
	{
	};
	
	wink.plugins.completion.module.event.LabelEventModule.prototype = 
	{      
	    /**
	     * Manage the onMouseDown event
	     * For label, do nothing
	     * 
	     * @param Event the Mouse Event
	     * @param integer index the index of the suggestion
	     * 
	     */
	    onMouseDown: function(event, index)
	    {
	    },
	    
	    /**
	     * Manage the onClick event
	     * For label, just call an action callback if exists
	     * 
	     * 
	     * @param Event event The mouse Event
	     * @param integer index the index of the suggestion
	     */
	    onClick: function(event, index)
	    {
	        var suggestion = this._component.getSuggestion(index);
	        if (!wink.isUndefined(suggestion) && suggestion.action && wink.isCallback(suggestion.action))
	            wink.call(suggestion.action, index);
	    }
	};
});