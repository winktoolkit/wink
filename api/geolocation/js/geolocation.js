/*--------------------------------------------------------
 * Copyright (c) 2011, The Dojo Foundation
 * This software is distributed under the "Simplified BSD license",
 * the text of which is available at http://www.winktoolkit.org/licence.txt
 * or see the "license.txt" file for more details.
 *--------------------------------------------------------*/

/**
 * @fileOverview Implements a geographical locator
 * 
 * @compatibility Iphone OS2, Iphone OS3, Iphone OS4, Android 1.1, Android 1.5, Android 2.1, Android 2.2, Android 2.3, Android 3.0, Android 3.1, Windows Phone 7.5
 * @author Sylvain LALANDE
 */
define(['../../../_amd/core'], function(wink)
{
	/**
	 * @class Implements a geographical locator. It starts watching for position changes when a listener is adding and
	 * stops if there is no more listener. To optimize the data processing, it gets the stringent constraints (depends on listeners properties)
	 * which requires it to refresh datas more often and more precisely. Then it notifies listeners when it is deemed necessary 
	 * (depends on listeners properties : "notification interval", "only If Position Changed").
	 * 
	 * @example
	 * 
	 * var geoloc = new wink.api.GeoLocation();
	 * 
	 * geoloc.addListener({ context: window, method: "accuratePositionChanged" }, 60000, true, true);
	 * geoloc.addListener({ context: window, method: "positionChanged" }, 10000, true, false);
	 * 
	 * @see <a href="WINK_ROOT_URL/api/geolocation/test/test_geolocation.html" target="_blank">Test page</a>
	 */
	wink.api.GeoLocation = function()
	{
		if (wink.isUndefined(wink.api.GeoLocation.singleton))
		{
			/**
			 * Unique identifier
			 * 
			 * @property
			 * @type integer
			 */
			this.uId = 1;
			
			this._initGeolocation();
	
			wink.api.GeoLocation.singleton = this;
		} else
		{
			return wink.api.GeoLocation.singleton;
		}
	};
	
	wink.api.GeoLocation.prototype = 
	{
		_NOTIFICATION_INTERVAL_MIN:		1000,
		_NOTIFICATION_INTERVAL_MAX:		3600000, // one hour
		_WATCH_TIMEOUT:					60000,
		
		// Infos
		_timestamp:						null,
		_latitude:						null,
		_longitude:						null,
		_accuracy:						null,
		_altitude:						null,
		_altitudeAccuracy:				null,
		_heading:						null,
		_speed:							null,
		
		// Workers
		_listeners:						[],
		_notifier:						null,
		_watcher:						null,
		_geolocation:					null,
		
		// Status
		_positionChanged:				false,
		_notificationIntervalChanged:	false,
		_accuracyChanged:				false,
		_newListener:					false,
		_initialized:					false,
		
		// constraints
		_highAccuracy:					false,
		_notificationInterval:			3600000,
		_onlyIfPositionChanged:			true,
		
		/**
		 * Adds a Geo Location listener.
		 * 
		 * @param {object} callback The callback to invoke
		 * @param {integer} notificationInterval The interval between callback calls
		 * @param {boolean} onlyIfPositionChanged Indicates whether the callback must be invoked only if location changed
		 * @param {boolean} highAccuracy Indicates whether the high result accuracy is enabled
		 */
		addListener: function(callback, notificationInterval, onlyIfPositionChanged, highAccuracy)
		{
			if (!wink.isCallback(callback))
			{
				wink.log('[GeoLocation] Invalid callback: ' + callback);
				return false;
			}
			if (notificationInterval < this._NOTIFICATION_INTERVAL_MIN)
			{
				wink.log('[GeoLocation] Notification time interval too small [minimum=' + this._NOTIFICATION_INTERVAL_MIN + "]");
				return false;
			}
			
			var listener = this._createListener(callback, notificationInterval, onlyIfPositionChanged, highAccuracy);
			this._listeners.push(listener);
			this._newListener = true;
			
			this._updateConstraints();
			this._startWatcher();
			this._startNotifier();
		},
		/**
		 * Removes the given Geo Location listener.
		 * 
		 * @param {object} callback The callback that identifies the listener
		 */
		removeListener: function(callback)
		{
			if (!wink.isCallback(callback))
			{
				wink.log('[GeoLocation] Invalid callback: ' + callback);
				return false;
			}
			
			for (var i = 0; i < this._listeners.length; i++)
			{
				if (this._listeners[i].callback.context == callback.context && this._listeners[i].callback.method == callback.method)
				{
					this._listeners.splice(i, 1);
					break;
				}
			}
			this._updateConstraints();
			if (this._listeners.length == 0)
			{
				this._stopNotifier();
				this._stopWatcher();
			}
		},
		/**
		 * Returns the current geolocation informations or null if GeoLocation is not initialized.
		 * At least one listener must be added to initialize the GeoLocation.
		 * 
		 * @returns {object} The geolocation information
		 */
		getPosition: function()
		{
			if (this._initialized == false)
			{
				return null;
			}
	
			var geoLocationInfos = {
				timestamp: 				this._timestamp,
				latitude:				this._latitude,
				longitude:				this._longitude,
				accuracy:				this._accuracy,
				altitude:				this._altitude,
				altitudeAccuracy:		this._altitudeAccuracy,
				heading:				this._heading,
				speed:					this._speed
			};
			return geoLocationInfos;
		},
		/**
		 * Init the Geo location interface.
		 */
		_initGeolocation: function()
		{
			this._geolocation = navigator.geolocation;
			
			if (!wink.isSet(this._geolocation))
			{
				this._initGoogleGears();
				if (!wink.isUndefined(window.google))
				{
					this._geolocation = google.gears.factory.create('beta.geolocation');
				}
			}
			
			if (!wink.isSet(this._geolocation))
			{
				wink.log('[GeoLocation] No GeoLocation Support');
			}
		},
		/**
		 * Starts the Geo location watcher.
		 */
		_startWatcher: function()
		{
			if (!wink.isSet(this._geolocation))
			{
				return;
			}
			if (!wink.isSet(this._watcher) || this._notificationIntervalChanged || this._accuracyChanged)
			{
				if (wink.isSet(this._watcher))
				{
					this._stopWatcher();
				}
				var watcherProperties = {
					maximumAge: 		this._notificationInterval,
					timeout: 			this._WATCH_TIMEOUT,
					enableHighAccuracy: this._highAccuracy
				};
				var watcherFunction = wink.bind(function(position) {
					this._positionWatcher(this, position);
				}, this);
				this._watcher = this._geolocation.watchPosition(watcherFunction, this._handleWatchError, watcherProperties);
				this._accuracyChanged = false;
			}
		},
		/**
		 * Stops the Geo location watcher.
		 */
		_stopWatcher: function()
		{
			if (wink.isSet(this._watcher))
			{
				this._geolocation.clearWatch(this._watcher);
				this._watcher = null;
			}
		},
		/**
		 * Handle a position inspection that success.
		 * 
		 * @param {object} geoloc the geolocation information
		 * @param {object} position the current position
		 */
		_positionWatcher: function(geoloc, position)
		{
			if (geoloc._latitude != position.coords.latitude || geoloc._longitude != position.coords.longitude)
			{
				geoloc._timestamp 			= position.timestamp;
				geoloc._latitude 			= position.coords.latitude;
				geoloc._longitude 			= position.coords.longitude;
				geoloc._accuracy 			= position.coords.accuracy;
				geoloc._altitude 			= position.coords.altitude;
				geoloc._altitudeAccuracy 	= position.coords.altitudeAccuracy;
				geoloc._heading 			= position.coords.heading;
				geoloc._speed 				= position.coords.speed;
				
				geoloc._positionChanged 	= true;
			}
			this._initialized = true;
		},
		/**
		 * Handle a position inspection that failed.
		 * 
		 * @param {object} error The error raised by the geolocation API
		 */
		_handleWatchError: function(error) {
			wink.log('[GeoLocation] Error[' + error.code + ']: ' + error.message);
		},
		/**
		 * Starts the notification process.
		 */
		_startNotifier: function()
		{
			if (!wink.isSet(this._geolocation))
			{
				return;
			}
			if (!wink.isSet(this._notifier) || this._notificationIntervalChanged)
			{
				if (wink.isSet(this._notifier))
				{
					this._stopNotifier();
				}
				this._notifier = wink.setTimeout(this, "_notifierProcess", this._notificationInterval);
				this._notificationIntervalChanged = false;
			}
		},
		/**
		 * Stops the notification process.
		 */
		_stopNotifier: function()
		{
			if (wink.isSet(this._notifier))
			{
				clearTimeout(this._notifier);
				this._notifier = null;
			}
		},
		/**
		 * Run the notification process. This method is reentrant.
		 */
		_notifierProcess: function()
		{
			if (this._initialized && (this._newListener || this._onlyIfPositionChanged == false || (this._onlyIfPositionChanged && this._positionChanged)))
			{
				var currentTime = this._getTimeStamp();
				
				for (var i = 0; i < this._listeners.length; i++)
				{
					var listenerI = this._listeners[i];
					var mustBeNotified = false;
					var firstNotification = false;
					
					if (listenerI.notificationTimestamp == null)
					{
						listenerI.notificationTimestamp = this._getTimeStamp();
						firstNotification = true;
					}
					else
					{
						var durationSinceLastNotif = (currentTime - listenerI.notificationTimestamp);
						if (durationSinceLastNotif > listenerI.notificationInterval)
						{
							mustBeNotified = true;
						}
					}
					
					if (mustBeNotified || firstNotification)
					{
						var positionChanged = false;
						if (listenerI.latitude != this._latitude || listenerI.longitude != this._longitude)
						{
							listenerI.timestamp 		= this._timestamp;
							listenerI.latitude 			= this._latitude;
							listenerI.longitude 		= this._longitude;
							listenerI.accuracy 			= this._accuracy;
							listenerI.altitude 			= this._altitude;
							listenerI.altitudeAccuracy 	= this._altitudeAccuracy;
							listenerI.heading 			= this._heading;
							listenerI.speed 			= this._speed;
							
							positionChanged = true;
						}
						if (listenerI.onlyIfPositionChanged && positionChanged == false)
						{
							mustBeNotified = false;
						}
					}
					
					if (mustBeNotified || firstNotification)
					{
						wink.call(listenerI.callback, listenerI);
						listenerI.notificationTimestamp = currentTime;
					}
				}
				this._newListener = false;
				this._positionChanged = false;
			}
			
			// reentrancy
			this._notifier = wink.setTimeout(this, "_notifierProcess", this._notificationInterval);
		},
		/**
		 * Creates the listener structure with the givens parameters.
		 * 
		 * @param {object} callback The callback to invoke
		 * @param {integer} notificationInterval The interval between callback calls
		 * @param {boolean} onlyIfPositionChanged To invoke the callback only if location changed
		 * @param {boolean} highAccuracy To enabled high result accuracy
		 * 
		 * @returns {object} The listener
		 */
		_createListener: function(callback, notificationInterval, onlyIfPositionChanged, highAccuracy)
		{
			var listener = {
				callback: 				callback,
				notificationInterval: 	notificationInterval,
				onlyIfPositionChanged: 	onlyIfPositionChanged,
				highAccuracy: 			highAccuracy,
				notificationTimestamp:	null,
				
				timestamp: 				null,
				latitude:				null,
				longitude:				null,
				accuracy:				null,
				altitude:				null,
				altitudeAccuracy:		null,
				heading:				null,
				speed:					null
			};
			return listener;
		},
		/**
		 * Updates the stringent constraints for Geo locator.
		 */
		_updateConstraints: function()
		{
			var constraints = this._getStringentConstraints();
			this._onlyIfPositionChanged = constraints.onlyIfPositionChanged;
			
			if (this._highAccuracy != constraints.highAccuracy)
			{
				this._highAccuracy = constraints.highAccuracy;
				this._accuracyChanged = true;
			}
			if (this._notificationInterval != constraints.notificationInterval)
			{
				this._notificationInterval = constraints.notificationInterval;
				this._notificationIntervalChanged = true;
			}
		},
		/**
		 * Gets the stringent constraints for Geo locator which requires it to refresh datas more often and more precisely.
		 */
		_getStringentConstraints: function()
		{
			var constraints = {
				notificationInterval: this._NOTIFICATION_INTERVAL_MAX, // one hour
				onlyIfPositionChanged: true,
				highAccuracy: false
			};
			
			for (var i = 0; i < this._listeners.length; i++) {
				var listenerI = this._listeners[i];
				if (listenerI.notificationInterval < constraints.notificationInterval) {
					constraints.notificationInterval = listenerI.notificationInterval;
				}
				if (listenerI.onlyIfPositionChanged == false) {
					constraints.onlyIfPositionChanged = false;
				}
				if (listenerI.highAccuracy == true) {
					constraints.highAccuracy = true;
				}
			}
			
			return constraints;
		},
		/**
		 * Returns the current timestamp.
		 */
		_getTimeStamp: function()
		{
			return new Date().getTime();
		},
		/*
		// Copyright 2007, Google Inc.
		//
		// Redistribution and use in source and binary forms, with or without
		// modification, are permitted provided that the following conditions are met:
		//
		//  1. Redistributions of source code must retain the above copyright notice,
		//	     this list of conditions and the following disclaimer.
		//  2. Redistributions in binary form must reproduce the above copyright notice,
		//	     this list of conditions and the following disclaimer in the documentation
		//	     and/or other materials provided with the distribution.
		//  3. Neither the name of Google Inc. nor the names of its contributors may be
		//	     used to endorse or promote products derived from this software without
		//	     specific prior written permission.
		//
		// THIS SOFTWARE IS PROVIDED BY THE AUTHOR ``AS IS'' AND ANY EXPRESS OR IMPLIED
		// WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF
		// MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO
		// EVENT SHALL THE AUTHOR BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL,
		// SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO,
		// PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS;
		// OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY,
		// WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR
		// OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF
		// ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
		 */
		_initGoogleGears: function()
		{
			if (window.google && google.gears)
			{
				return;
			}
			var factory = null;
	
			// Firefox
			if (typeof GearsFactory != 'undefined')
			{
				factory = new GearsFactory();
			}
			else
			{
				// IE
				try
				{
					factory = new ActiveXObject('Gears.Factory');
					if (factory.getBuildInfo().indexOf('ie_mobile') != -1)
					{
						factory.privateSetGlobalObject(this);
					}
				} 
				catch (e) 
				{
					// Safari
					if (!wink.isUndefined(navigator.mimeTypes) && !wink.isUndefined(navigator.mimeTypes["application/x-googlegears"]))
					{
						factory = document.createElement("object");
						factory.style.display = "none";
						factory.width = 0;
						factory.height = 0;
						factory.type = "application/x-googlegears";
						document.documentElement.appendChild(factory);
					}
				}
			}
			if (!factory)
			{
				return;
			}
			if (!window.google)
			{
				window.google = {};
			}
			if (!window.google.gears)
			{
				window.google.gears = {factory: factory};
			}
		}
	};

	return wink.api.GeoLocation;
});