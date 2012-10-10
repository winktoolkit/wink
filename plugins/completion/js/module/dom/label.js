/*--------------------------------------------------------
 * Copyright (c) 2011, The Dojo Foundation
 * This software is distributed under the "Simplified BSD license",
 * the text of which is available at http://www.winktoolkit.org/licence.txt
 * or see the "license.txt" file for more details.
 *--------------------------------------------------------*/

/**
 * The label dom module that handle all suggestions DOM node with "label" type
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
	 * Define the label completion DOM module
	 *
	 * @class LabelDomModule class
	 * 
	 * @param properties an array containing label module properties
	 * 
	 * @returns LabelDomModule the completion label DOM module
	 */
	wink.plugins.completion.module.dom.LabelDomModule = function(properties)
	{
	};
	
	wink.plugins.completion.module.dom.LabelDomModule.prototype = 
	{
	    /**
	     * Process the current suggestion
	     * Call the default module and append a decorator HTML element
	     * 
	     * @param object suggestion The current suggestion 
	     * @param HTMLElement domNode The suggestion DOM node 
	     */
	    processSuggestion: function(suggestion, domNode)
	    {      
	    	this._helper.getDefaultModule(this._manager)._defaultDisplay(suggestion, domNode, false);
	    }
	
	};
});