/*--------------------------------------------------------
 * Copyright (c) 2011, The Dojo Foundation
 * This software is distributed under the "Simplified BSD license",
 * the text of which is available at http://www.winktoolkit.org/licence.txt
 * or see the "license.txt" file for more details.
 *--------------------------------------------------------*/

/**
 * The direct link event module that handle all suggestions DOM node with "link" type
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
	 * Define the Direct Link completion Event module
	 *
	 * @class DirectLinkEventModule class
	 * 
	 * @param properties an array containing default module properties
	 * 
	 * @returns DirectLinkEventModule the completion default Event module
	 */
	wink.plugins.completion.module.event.DirectLinkEventModule = function(properties)
	{
	    return this;
	};
	
	wink.plugins.completion.module.event.DirectLinkEventModule.prototype = 
	{
			
		onClick: function(event, index)
		{
			this._helper.getDefaultModule(this._manager).onClick(event);
			
			if (wink.isSet(this._component.getSelectedSuggestion().clickUrl))
	        {
		        document.location.href = this._component.getSelectedSuggestion().clickUrl;
		        return false;
	        }
		}
	};
});