/*--------------------------------------------------------
 * Copyright (c) 2011, The Dojo Foundation
 * This software is distributed under the "Simplified BSD license",
 * the text of which is available at http://www.winktoolkit.org/licence.txt
 * or see the "license.txt" file for more details.
 *--------------------------------------------------------*/

/**
 * @fileOverview Implements a tracking object
 *
 * @compatibility Iphone OS2, Iphone OS3, Iphone OS4, Android 1.1, Android 1.5, Android 2.1, BlackBerry 6, BlackBerry 7, Bada 1.0, Windows Phone 7.5
 * @author Patrick BOSSE
 */

define(['../../../_amd/core'], function(wink)
{
	/**
	 * @class Implements a tracking object
	 * Send stat tracks to the given tracking system. Trackers are defined as plugins and MUST implement a "start" and "send" method. The default tracker of wink is wink.net.tracking.defaulttracker
	 * The tracking object takes a "tracking plugin" and a "flush interval" as parameters. You can then use the push method to add tracks to the tracking queue and use flush to send the data (if you specified a flush interval of 0, you will have to manually send your tracks using the flush method).
	 * 
	 * @param {object} properties The properties object
	 * @param {object} properties.statTracker The statistic tracker plugin (Google Analytics, Webtrends, etc). If null value, the WINK statistic tracker plugin is used instead. Authorized plugins defined below are : WINKStatTracker, GAStatTracker.
	 * @param {integer} properties.intervalFlush The automatic and regular flush interval (in seconds). Value "0" means no automatic flush.
	 * 
	 * @example
	 * 
	 * gaTracker = new wink.net.tracking.GaTracker({ gaUrchinAccount : "UA-xxxxxxx-x" });
	 * 
	 * tracking = new wink.net.Tracking({statTracker : gaTracker, intervalFlush : 0 });
	 * 
	 * tracking.push("/WINK/Test1");
	 * tracking.push("/WINK/Test2");
	 * 
	 * tracking.flush();
	 * 
	 * @see <a href="WINK_ROOT_URL/net/tracking/test/test_tracking.html" target="_blank">Test page</a>
	 */
	wink.net.Tracking = function(properties)
	{
		/**
		 * Unique identifier
		 * 
		 * @property
		 * @type integer
		 */
		this.uId = wink.getUId();
		
		
		this._properties    = properties;
		this._tracks        = [];
		this._timerFlush    =  null;
		this._statTracker   = null;
		this._intervalFlush = 0;
	
		if ( this._validateProperties() === false ) return;
		
		this._initProperties();	
	
		this._start();
	};
	
	wink.net.Tracking.prototype =
	{
		/**
		 * flush all pushed statistic tracks
		 */
		flush : function()
		{
			for ( var i = 0; i < this._tracks.length; i++ )
			{
				var msg = this._tracks[i];
				this._statTracker.send(msg);
			}
	
			this.reset();
		},
	
		/**
		 * Push a statistic track
		 * 
		 * @param {string} msg The message to track
		 */
		push : function(msg)
		{
			this._tracks.push(msg);
		},
	
		/**
		 * Reset all pushed statistic tracks
		 */
		reset : function()
		{
			this._tracks = [];
		},
	
		/**
		 * Set the flush interval 
		 * 
		 * @param {integer} interval The flush interval
		 */
		setIntervalFlush : function(interval)
		{
			this._intervalFlush = interval;
			this._setTimerFlush();
		},
	
		/**
		 * Set the statistic tracker plugin 
		 * 
		 * @param {object} statTracker The statistic tracker plugin
		 */
		setStatTracker : function(statTracker)
		{
			this._statTracker = statTracker;
			this._statTracker.start();
		},
	
		/**
		 * Initialize datas with given properties
		 */
		_initProperties : function()
		{
			this._statTracker = this._properties.statTracker;
			this._intervalFlush = this._properties.intervalFlush;
	
			if ( !wink.isSet(this._statTracker) )
			{
				this._statTracker = new wink.net.tracking.defaulttracker({ cbAfterSend : null });
			}
		},
	
		/**
		 * Set the flush timer
		 */
		_setTimerFlush : function()
		{
			if ( this._timerFlush )
			{
				clearInterval(this._timerFlush);
			}
	
			this._timerFlush = null;
	
			if ( this._intervalFlush > 0 )
			{
				this._timerFlush = wink.setInterval(this, 'flush', this._intervalFlush * 1000);
			}
		},
	
		/**
		 * Start the statistic
		 */
		_start : function()
		{
			this._statTracker.start();
			this._setTimerFlush();
		},
	
		/**
		 * Validate the properties of the component
		 * @returns {boolean} True if the properties are valid, false otherwise
		 */
		_validateProperties: function()
		{
			if ( !wink.isSet(this._properties.statTracker))
			{
				wink.log("[Tracking] the statistic tracker must be a valid Statistic Tracker Object");
				return false;
			}
	
			if ( this._properties.intervalFlush < 0 )
			{
				wink.log("[Tracking] the flush interval must be greater or equal to 0");
				return false;
			}
	
			return true;
		}
	};
	
	/**
     * @borrows wink.net.tracking as this
     */
	wink.net.tracking = wink.net.Tracking;
	
	/**
	 * Implement a default statistic tracker object
	 * 
	 * @class
	 * 
	 * @param {object} properties The properties object
	 * @param {object} properties.cbAfterSend The callback method called after sending the track.
	 */
	wink.net.tracking.DefaultTracker = function(properties)
	{
		/**
		 * Unique identifier
		 * 
		 * @property uId
		 * @type integer
		 */
		this.uId = wink.getUId();
		
		
		this._properties  = properties;
		this._cbAfterSend = null;
	
		if ( this._validateProperties() === false ) return;
		
		this._initProperties();	
	};
	
	wink.net.tracking.DefaultTracker.prototype =
	{
		/**
		 * Send a track
		 * 
		 * @param {string} msg The message to track
		 */
		send : function(msg)
		{
			var xhr = new wink.Xhr();
			xhr.sendData("defaulttracker.html", null, "GET", {context: this, method: "_onSuccess"}, {context: this, method: "_onFailure"});
		},
	
		/**
		 * Start the statistic tracker
		 */
		start : function()
		{
			this._init();
		},
	
	
		/**
		 * Initialize the statistic tracker
		 */
		_init : function()
		{
		},
	
		/**
		 * Initialize datas with given properties
		 */
		_initProperties : function()
		{
			this._cbAfterSend = this._properties.cbAfterSend;
		},
	
		/**
		 * Validate the properties of the component
		 * @returns {boolean} True if the properties are valid, false otherwise
		 */
		_validateProperties: function()
		{
			return true;
		},
		
		/**
		 * on success callback
		 * 
		 * @param {object} result The result of the xhr
		 */
		_onSuccess: function(result)
		{
			if ( result.xhrObject.responseText != "" )
			{
				if ( this._cbAfterSend )
				{
					this._cbAfterSend(result.xhrObject.responseText);
				}
			}
		},
		
		/**
		 * on failure callback
		 * 
		 * @param {object} result The result of the xhr
		 */
		_onfailure: function(result)
		{
			alert("Unable to load the page");
		}
	};
	
	return wink.net.Tracking;
});