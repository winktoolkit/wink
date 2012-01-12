/*--------------------------------------------------------
 * Copyright (c) 2011, The Dojo Foundation
 * This software is distributed under the "Simplified BSD license",
 * the text of which is available at http://www.winktoolkit.org/licence.txt
 * or see the "license.txt" file for more details.
 *--------------------------------------------------------*/

/**
 * @fileOverview Implement a Google Analytics statistic tracker object
 * 
 * @compatibility Iphone OS2, Iphone OS3, Iphone OS4, Android 1.1, Android 1.5, Android 2.1, Android 2.2, Android 2.3, Android 3.0, Android 3.1, BlackBerry 6, BlackBerry 7, Bada 1.0, Windows Phone 7.5
 * @author Patrick BOSSE
 */
define(['../../../_amd/core', './tracking'], function(wink)
{
	/**
	 * @class Implement a Google Analytics statistic tracker object
	 * 
	 * @param {object} properties The properties object
	 * @param {string} properties.gaUrchinAccount The Google Analytics account
	 * 
	 * @example
	 * 
	 * gaTracker = new wink.net.tracking.GaTracker({ gaUrchinAccount : "UA-xxxxxxx-x" });
	 * 
	 */
	wink.net.tracking.GaTracker = function(properties)
	{
		/**
		 * Unique identifier
		 * 
		 * @property
		 * @type integer
		 */
		this.uId = wink.getUId();
		
		
		this._properties      = properties;
		this._gaTracker       = null;
		this._gaUrchinAccount = null;
		
		this._initProperties();	
	};
	
	wink.net.tracking.GaTracker.prototype =
	{
		/**
		 * Send a track
		 * 
		 * @param {string} msg The message to track
		 */
		send : function(msg)
		{
			this._gaTracker._trackPageview(msg);
		},
	
		/**
		 * Start the statistic tracker
		 */
		start : function()
		{
			this._loadJS((("https:" == document.location.protocol) ? "https://ssl." : "http://www.") + "google-analytics.com/ga.js", this, this._init);
		},
	
		/**
		 * Initialize the statistic tracker
		 */
		_init : function()
		{
			this._gaTracker = _gat._getTracker(this._gaUrchinAccount);
		},
	
		/**
		 * Initialize datas with given properties
		 */
		_initProperties : function()
		{
			this._gaUrchinAccount = this._properties.gaUrchinAccount;
		},
	
		/**
		 * Load a JS script
		 * 
		 * @param {string} url The address of the script to load
		 * @param {object} ctx The context of the callback
		 * @param {function} cb The callback method
		 */
		_loadJS : function(url, ctx, cb)
		{
			var script = document.createElement("script");
			script.src = url;
			script.onload = script.onreadystatechange = function()
			{
				if ( !this.readyState || (this.readyState == "loaded") || (this.readyState == "complete") )
				{
					cb.apply(ctx, []);
				}
			};
			document.body.appendChild(script);
			script = null;
		}
	};
	
	return wink.net.tracking.GaTracker;
});