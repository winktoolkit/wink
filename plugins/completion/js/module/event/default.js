/*--------------------------------------------------------
 * Copyright (c) 2011, The Dojo Foundation
 * This software is distributed under the "Simplified BSD license",
 * the text of which is available at http://www.winktoolkit.org/licence.txt
 * or see the "license.txt" file for more details.
 *--------------------------------------------------------*/

/**
 * The default event module that handle all suggestions DOM node with default type
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
	 * Define the default completion Event module
	 *
	 * @class DefaultEventModule class
	 * 
	 * @param properties an array containing default module properties
	 * 
	 * @returns DefaultEventModule the completion default Event module
	 */
	wink.plugins.completion.module.event.DefaultEventModule = function(properties)
	{
	    return this;
	};
	
	wink.plugins.completion.module.event.DefaultEventModule.prototype = 
	{    
	    /**
	     * Highlight the suggestion
	     * using the index of the selected HTML element
	     * 
	     * @param Event the Mouse Event
	     * @param integer index the index of the suggestion
	     * 
	     */
	    onMouseDown: function(event, index)
	    {
	        this._component.highlight(index);
	    },
	    
	    /**
	     * Manage the onClick event on a suggestion.
	     * Update the input value and the current value of the component
	     * Update the selected index with the highlighted index value
	     * Hide the completion and submit
	     * 
	     * @param Event event The mouse Event
	     * @param integer index the index of the suggestion
	     */
	    onClick: function(event, index)
	    {
	        this._component.hideCompletion();
	        this._component.processOnSuggestionClicked();
	    }
	};
});