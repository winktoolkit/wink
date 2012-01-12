/*--------------------------------------------------------
 * Copyright (c) 2011, The Dojo Foundation
 * This software is distributed under the "Simplified BSD license",
 * the text of which is available at http://www.winktoolkit.org/licence.txt
 * or see the "license.txt" file for more details.
 *--------------------------------------------------------*/

/**
 * @fileOverview Implement a script loader utility
 * 
 * @compatibility Iphone OS2, Iphone OS3, Iphone OS4, Android 1.1, Android 1.5, Android 2.1, Android 2.2, Android 2.3, Android 3.0, Android 3.1, BlackBerry 6, BlackBerry 7, Bada 1.0, Windows Phone 7.5
 * @author Jerome GIRAUD
 */

/**
 * Starts preloading scripts
 * 
 * @name wink.net.JsLoader#/jsloader/events/loadstart
 * 
 * @event
 * 
 * @param {object} param The parameters object
 * @param {integer} param.items The list of items currently being processed
 */

/**
 * A script has been loaded
 * 
 * @name wink.net.JsLoader#/jsloader/events/load
 * 
 * @event
 * 
 * @param {object} param The parameters object
 * @param {integer} param.items The list of items currently being processed
 * @param {integer} param.progress The index of the currently loaded item in the list of items
 * @param {boolean} param.success True if the file was loaded successfuly, false otherwise
 */

/**
 * All the scripts have been preloaded
 * 
 * @name wink.net.JsLoader#/jsloader/events/loadend
 * 
 * @event
 * 
 * @param {object} param The parameters object
 * @param {integer} param.items The list of items currently being processed
 */

define(['../../../_amd/core'], function(wink)
{
	/**
	 * @class Implement a script loader utility. You can preload scripts using the load method.
	 * Load JS files and warn the user when the task is complete
	 * 
	 * @example
	 * 
	 * datas = new Array('./script_1.js', './script_2.js');
	 * 
	 * jsLoader = new wink.net.JsLoader();
	 * 
	 * jsLoader.load(datas);
	 * 
	 * @see <a href="WINK_ROOT_URL/net/jsloader/test/test_jsloader.html" target="_blank">Test page</a>
	 */
	wink.net.JsLoader = function()
	{
		if (wink.isUndefined(wink.net.JsLoader.singleton)) 
		{
			/**
			 * Unique identifier
			 * 
			 * @property
			 * @type integer
			 */
			this.uId = 1;
			
			
			this._index        = 0;
			this._currentData  = null;
			this._isProcessing = false;
			this._queue        = [];
	
			wink.net.JsLoader.singleton = this;
			
		} else
		{
			return wink.net.JsLoader.singleton;
		}
	};
	
	wink.net.JsLoader.prototype =
	{
		/**
		 * Start processing the datas
		 * datas can be a single script or a collection of scripts
		 * 
		 * @param {array} data The script(s) you want to preload. It must be a string or an array of strings
		 */
		load: function(data)
		{
			this._addToQueue(data);
			this._process();
		},
		
		/**
		 * Add the datas to the processing queue
		 * 
		 * @param {array} data The script(s) you want to be added to the queue
		 */
		_addToQueue: function(data)
		{
			if ( wink.isString(data) )
				data = [data];
			
			if ( wink.isArray(data) )
				this._queue.push(data);
		},
		
		/**
		 * Starts processing the eldest element in the queue if no processing is already ongoing
		 */
		_process: function()
		{
			var _this = this;
		
			if ( this._isProcessing === false )
			{
				if ( this._queue.length > 0 )
				{
					this._isProcessing = true;
					
					this._currentData = this._queue[0];
					this._queue.splice(0, 1);
					
					wink.publish('/jsloader/events/loadstart', {'items': this._currentData});
					
					if ( this._currentData instanceof Array)
					{
						var l = this._currentData.length;
						for ( var i=0; i<l; i++)
						{
							var script = document.createElement('script');
							script.type = 'text/javascript';
							script.src = this._currentData[i];
							script.value = i;
							
							script.onload = function ()
							{
								_this._processDownloadedScript(1, this.value);
							};
							
							script.onerror = function ()
							{
								_this._processDownloadedScript(-1, this.value);
							};
							
							document.getElementsByTagName("head")[0].appendChild(script);
						}
					}
				}
			}
		},
		
		/**
		 * Handle the end of a script preloading
		 * Sends a load event containing information about the current processing progress
		 * and the status of the downloaded script
		 * 
		 * @param {integer} returnValue The progress status of the current script loading
		 * @param {integer} [index] The index of the images
		 */
		_processDownloadedScript: function(returnValue, index)
		{
			this._index++;
		
			if ( this._index == this._currentData.length )
			{
				wink.publish('/jsloader/events/load', {'items': this._currentData, 'currentItem': index, 'progress': 100, 'success': returnValue});
				wink.publish('/jsloader/events/loadend', {'items': this._currentData});
				this._cleanup();
			} else
			{
				var progress = Math.floor((this._index/this._currentData.length)*100);
				wink.publish('/jsloader/events/load', {'items': this._currentData, 'currentItem': index, 'progress': progress, 'success': returnValue});
			}
		},
		
		/**
		 * Cleans the objects variables after an element in the queue has been entirely processed
		 * Start processing the next element in queue
		 */
		_cleanup: function()
		{
			this._index        = 0;
			this._currentData  = null;
			this._isProcessing = false;
			
			this._process();
		}
	};
	
	return wink.net.JsLoader;
});