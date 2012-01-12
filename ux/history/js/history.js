/*--------------------------------------------------------
 * Copyright (c) 2011, The Dojo Foundation
 * This software is distributed under the "Simplified BSD license",
 * the text of which is available at http://www.winktoolkit.org/licence.txt
 * or see the "license.txt" file for more details.
 *--------------------------------------------------------*/

/**
 * @fileOverview Browser history management. Handle the 'back' and 'forward' buttons of the browser by checking the URL hash changes. User can add new elements to the history and be notified when the user clicks on the 'back' or 'forward' buttons.
 * 
 * @compatibility Iphone OS2, Iphone OS3, Iphone OS4, Android 1.1, Android 1.5, Android 2.1, Android 2.2, Android 2.3, Android 3.0, Android 3.1, BlackBerry 6, BlackBerry 7, Bada 1.0
 * 
 * @author Jerome GIRAUD
 */

/**
 * The event is fired when the user clicks on the 'back' button
 * 
 * @name wink.ux.history#/history/events/back
 * @event
 * @param {object} param The parameters object
 * @param {string} param.id The identifier of the listening object (passed along the 'push' method)
 * @param {object|string|integer} param.params The parameters passed along the 'push' method by the listening object
 */

/**
 * The event is fired when the user clicks on the 'back' button. Note that if we are back to the first page, the return id will be set to 'main'
 * 
 * @name wink.ux.history#/history/events/forward
 * @event
 * @param {object} param The parameters object
 * @param {string} param.id The identifier of the listening object (passed along the 'push' method)
 * @param {object|string|integer} param.params The parameters passed along the 'push' method by the listening object
 */

define(['../../../_amd/core'], function(wink)
{
	/**
	 * @namespace Browser history management. Handle the 'back' and 'forward' buttons of the browser by checking the URL hash changes. User can add new elements to the history and be notified when the user clicks on the 'back' or 'forward' buttons.
	 * 
	 * The history component is a literal, so it doesn't need to be instantiated.
	 * As soon as you add the history script to your page, it will start listening to history changes.
	 * Use the 'push' method to add entries to the history and start listening the 'back' and 'forward' events
	 * 
	 * @example
	 * 
	 * wink.subscribe('/history/events/back', {method: 'back'});
	 * wink.subscribe('/history/events/forward', {method: 'forward'});
	 * wink.ux.history.push('test', 1);
	 * 
	 * @see <a href="WINK_ROOT_URL/ux/history/test/test_history.html" target="_blank">Test page</a>
	 */
	wink.ux.history =
	{
		_historyTimer: null,
		_historyQueue: [],
		_historyIndex: 0,
		_historyCheckInterval: 100,
		
		/**
		 * Start listening to history changes. This method is automatically called when you add the history script to your page, so you don't need to call it at page startup
		 */
		start: function()
		{
			window.location.hash = '';
			
			this._historyQueue.push({'hash': '', 'id': 'main', 'params': ''});
			
			if ('onhashchange' in window)
			{  
				window.addEventListener('hashchange', wink.bind(function(){this._check();}, this), true);
			} else
			{	
				this._historyTimer = wink.setInterval(this, '_check', this._historyCheckInterval);
			}
		},
		
		/**
		 * Stop listening to history changes
		 */
		stop: function()
		{
			if ('onhashchange' in window)
			{
				window.removeEventListener('hashchange', wink.bind(function(){this._check();}, this), true);
			} else
			{
				clearInterval(this._historyTimer);
			}
		},
		
		/**
		 * Add a new history entry
		 * 
		 * @param {string} id Unique identifier for the history listener. Multiple objects can listen to history events in the page (e.g.: a slider and a carousel), so it is a way to identify them
		 * @param {object|string|integer} params Parameters that will be given back with the 'back' or 'forward' events
		 * @param {string} hash Forces the component to use the specified hash
		 */
		push: function(id, params, hash)
		{
			if ( !wink.isSet(hash))
			{
				var hash = wink.getUId();
			}
			
			window.location.hash = hash;
			
			this._historyQueue.splice(this._historyIndex+1, this._historyQueue.length-this._historyIndex-1);
			this._historyQueue.push({'hash': hash, 'id': id, 'params': params});
			this._historyIndex = this._historyQueue.length-1;
		},
		
		/**
		 * Forces the History object to go back even if the user didn't click on the 'back' or 'forward' buttons
		 * 
		 * @param {integer} id The identifier of the object wanting to force the back
		 */
		pop: function(id)
		{
			for ( var i=this._historyIndex-1; i >=0; i-- )
			{
				if( this._historyQueue[i] && (this._historyQueue[i].id == id) )
				{
					window.history.back(i-this._historyIndex);
					this._historyIndex = i;
					return;
				}
			}
			window.history.back(-this._historyIndex);
			this._historyIndex = 0;
		},
		
		/**
		 * Change the history check interval. The default check interval is 100ms
		 * 
		 * @param {integer} interval The interval in milliseconds
		 */
		updateCheckInterval: function(interval)
		{
			if ('onhashchange' in window)
			{
				return
			}
			
			this.stop();
			this._historyCheckInterval = interval;
			this._historyTimer = wink.setInterval(this, '_check', this._historyCheckInterval);
		},
		
		/**
		 * Check if the hash changed
		 */
		_check: function()
		{
			if ( this._historyQueue.length > 0 )
			{
				var hash = window.location.hash.substring(1, window.location.hash.length);
				var l = this._historyQueue.length;
	
				for ( var i=0; i<l ; i++)
				{
					if ( hash == this._historyQueue[i].hash && i != this._historyIndex )
					{
						if ( i < this._historyIndex )
						{
							for ( var j=this._historyIndex; j>i; j--)
							{
								wink.publish('/history/events/back',{'id': this._historyQueue[j-1].id, 'params': this._historyQueue[j-1].params});
							}
						} else if ( i > this._historyIndex )
						{
							for ( var j=this._historyIndex; j<i; j++)
							{
								wink.publish('/history/events/forward',{'id': this._historyQueue[j+1].id, 'params': this._historyQueue[j+1].params});
							}
						}
						
						this._historyIndex = i;
						break;
					}
				}
			}
		}
	};
	
	wink.ux.history.start();
	
	return wink.ux.history;
});