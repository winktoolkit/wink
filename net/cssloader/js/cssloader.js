/*--------------------------------------------------------
 * Copyright (c) 2011, The Dojo Foundation
 * This software is distributed under the "Simplified BSD license",
 * the text of which is available at http://www.winktoolkit.org/licence.txt
 * or see the "license.txt" file for more details.
 *--------------------------------------------------------*/

/**
 * @fileOverview Implement a stylesheet loader utility. You can preload stylesheets using the load method.
 * 
 * @compatibility Iphone OS2, Iphone OS3, Iphone OS4, Android 1.1, Android 1.5, Android 2.1, Android 2.2, Android 2.3, Android 3.0, Android 3.1, BlackBerry 6, BlackBerry 7, Bada 1.0, Windows Phone 7.5
 * @author Jerome GIRAUD
 */

/**
 * Starts preloading stylesheets
 * 
 * @name wink.net.CssLoader#/cssloader/events/loadstart
 * 
 * @event
 * 
 * @param {object} param The parameters object
 * @param {integer} param.items The list of items currently being processed
 */

/**
 * A stylesheet has been loaded
 * 
 * @name wink.net.CssLoader#/cssloader/events/load
 * 
 * @event
 * 
 * @param {object} param The parameters object
 * @param {integer} param.items The list of items currently being processed
 * @param {integer} param.progress The index of the currently loaded item in the list of items
 * @param {boolean} param.success True if the file was loaded successfuly, false otherwise
 */

/**
 * All the stylesheets have been preloaded
 * 
 * @name wink.net.CssLoader#/cssloader/events/loadend
 * 
 * @event
 * 
 * @param {object} param The parameters object
 * @param {integer} param.items The list of items currently being processed
 */

define(['../../../_amd/core'], function(wink)
{
	/**
	 * @class Implement a stylesheet loader utility. You can preload stylesheets using the load method.
	 * Load CSS files and warn the user when the task is complete
	 * 
	 * @example
	 * 
	 * datas = new Array('./styles_1.css', './styles_2.css');
	 * 
	 * cssLoader = new wink.net.CssLoader();
	 * 
	 * cssLoader.load(datas);
	 * 
	 * @see <a href="WINK_ROOT_URL/net/cssloader/test/test_cssloader.html" target="_blank">Test page</a>
	 */
	wink.net.CssLoader = function()
	{
		if (wink.isUndefined(wink.net.CssLoader.singleton)) 
		{
			/**
			 * Unique identifier
			 * 
			 * @property
			 * @type integer
			 */
			this.uId  = 1;
			
			
			this._index        = 0;
			this._currentData  = null;
			this._isProcessing = false;
			this._queue        = [];
			
			wink.net.CssLoader.singleton = this;
		} else
		{
			return wink.net.CssLoader.singleton;
		}
	};
	
	wink.net.CssLoader.prototype =
	{
		/**
		 * Start processing the datas
		 * datas can be a single stylesheet or a collection of stylesheets
		 * 
		 * @param {array} data The stylesheet(s) you want to preload. It must be a string or an array of strings
		 */
		load: function(data)
		{
			this._addToQueue(data);
			this._process();
		},
		
		/**
		 * Add the datas to the processing queue
		 * 
		 * @param {array} data The stylesheet(s) you want to be added to the queue
		 */
		_addToQueue: function(data)
		{
			if ( wink.isString(data) )
				data = [data];
			
			if ( wink.isArray(data))
				this._queue.push(data);
		},
		
		/**
		 * Starts processing the eldest element in the queue if no processing is already ongoing
		 */
		_process: function()
		{
			if ( this._isProcessing === false )
			{
				if ( this._queue.length > 0 )
				{
					this._isProcessing = true;
					
					this._currentData = this._queue[0];
					this._queue.splice(0, 1);
					
					wink.publish('/cssloader/events/loadstart', {'items': this._currentData});
					
					if ( this._currentData instanceof Array)
					{
						var l = this._currentData.length;
						for ( var i=0; i<l; i++)
						{			
							var xhr = new wink.Xhr({'caller': this, 'index': i, 'src': this._currentData[i]});
	
							xhr.sendData(this._currentData[i], null, 'GET', {context: this, method: '_onSuccess'}, {context: this, method: '_onFailure'});
						}
					}
				}
			}
		},
		
		/**
		 * Callback method called if the stylesheet was sucessfully loaded
		 * 
		 * @param {object} result The result of the xhr call
		 */
		_onSuccess: function(result)
		{
			if (result.xhrObject.responseText != '') 
			{
				var style = document.createElement('link');
				style.type = 'text/css';
				style.rel = 'stylesheet';
				style.href = result.params.src;
	
				document.getElementsByTagName("head")[0].appendChild(style);
				
				result.params.caller._processDownloadedStyle(1, result.params.index);
			}
		},
		
		/**
		 * Callback method called if the stylesheet was unsucessfully loaded
		 * 
		 * @param {object} result The result of the xhr call
		 */
		_onFailure: function(result)
		{
			result.params.caller._processDownloadedStyle(-1, result.params.index);
		},
		
		/**
		 * Handle the end of a stylesheet preloading
		 * Sends a load event containing information about the current processing progress
		 * and the status of the downloaded stylesheet
		 * 
		 * @param {integer} returnValue The progress status of the current stylesheet loading
		 * @param {integer} [index] The index of the stylesheet
		 */
		_processDownloadedStyle: function(returnValue, index)
		{
			this._index++;
		
			if ( this._index == this._currentData.length )
			{
				wink.publish('/cssloader/events/load', {'items': this._currentData, 'currentItem': index, 'progress': 100, 'success': returnValue});
				wink.publish('/cssloader/events/loadend', {'items': this._currentData});
				this._cleanup();
			} else
			{
				var progress = Math.floor((this._index/this._currentData.length)*100);
				wink.publish('/cssloader/events/load', {'items': this._currentData, 'currentItem': index, 'progress': progress, 'success': returnValue});
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
	
	return wink.net.CssLoader;
});