/*--------------------------------------------------------
 * Copyright (c) 2011, The Dojo Foundation
 * This software is distributed under the "Simplified BSD license",
 * the text of which is available at http://www.winktoolkit.org/licence.txt
 * or see the "license.txt" file for more details.
 *--------------------------------------------------------*/

/** 
 * @class Manage the data storage in indexed Database
 * 
 * @param {object} properties The properties object
 * @param {string} properties.dbName The name of the database
 * @param {string} properties.dbTable The name of the resource table
 *
 * @author Donatien LEBARBIER
 */

wink.cache.indexedDatabase = function(properties)
{
	this._db = null;
	
	this._now = new Date().getTime();
	this._version = '1.0';
	this._keyPath = 'url';
	this._indexName = 'url';
	
	this._dbName = 'wink';
	this._dbTable = 'resources';
	
	this._dbDescription = 'Local cache';
	
	this._initProperties(properties);
};

wink.cache.indexedDatabase.prototype =
{
	/**
	 * Initialize datas with given properties
	 * 
	 * @param {object} properties The properties object
	 * @param {string} [properties.dbName=wink] The name of the database
	 * @param {string} [properties.dbTable=resources] The name of the resource table
	 */
	_initProperties: function(properties)
	{
		if(properties.dbName)
		{
			this._dbName = properties.dbName;
		}
		if(properties.dbTable)
		{
			this._dbTable = properties.dbTable;
		}
	},
	
	/**
	 * Test if browser supports indexedDatabase
	 * 
	 * @returns {boolean} Whether this type of storage is supported
	 */
	isSupported: function()
	{
		var domPrefixes = 'Webkit Moz O ms Khtml'.split(' ');
		for ( var i = -1, len = domPrefixes.length; ++i < len; )
		{
	        if ( window[domPrefixes[i].toLowerCase() + 'IndexedDB'] )
	        {
	          return true;
	        }
	      }
	      return !!window.indexedDB;
	},
	
	/**
	 * Open and initialize storage if not done
	 * 
	 * @param {function} callback Function called on success
	 * @param {function} errCallback Function called on error
	 */
	open: function(callback, errCallback)
	{
		
		if(this._db == null)
		{
			// console.log('_open');
			
			var _this = this;
			
			var request = window.webkitIndexedDB.open(this._dbName, this._dbDescription);
			/**
			 * @ignore
			 */
			request.onsuccess = function(event)
			{
				_this._db = event.target.result;
				
				if(_this._db.version != _this._version)
				{
					var vtx = _this._db.setVersion(_this._version);
					vtx.onsuccess = function(event)
					{
						var store = _this._db.createObjectStore(_this._dbTable, {keyPath: _this._keyPath}, true);
						
						store.createIndex(_this._indexName, _this._keyPath, true);
						
						callback();
					};
					vtx.onerror = function(event)
					{
						errCallback(_this._getErrorMessage(event));
					};
				} else
				{
					callback();
				}
			};
			/**
			 * @ignore
			 */
			request.onerror = function(event)
			{
				errCallback(_this._getErrorMessage(event));
			};
		} else
		{
			callback();
		}
	},
	
	/**
	 * Drop the data
	 * 
	 * @param {function} callback Function called on success
	 * @param {function} errCallback Function called on error
	 */
	drop: function(callback, errCallback)
	{
		// console.log('_drop');
		
		var _this = this;
		
		var vtx = this._db.setVersion('1.1');
		/**
		 * @ignore
		 */
		vtx.onsuccess = function(event)
		{
			_this._db.deleteObjectStore(_this._dbTable);
	
			callback();
		};
		/**
		 * @ignore
		 */
		vtx.onerror = function(event)
		{
			errCallback(_this._getErrorMessage(event));
		};
	},
	
	/**
	 * Retrieve the expired resources and the resources no more used (synchronization)
	 * 
	 * @param {function} callback Function called on success
	 * @param {function} errCallback Function called on error
	 * @param {array} urls List of resources url (useful for synchronization)
	 */
	getExpiredItems: function(callback, errCallback, urls)
	{
		// console.log('_getExpiredItems');
		
		var _this = this;
		
		var items = new Array();
		
		var tx = this._db.transaction(this._db.objectStoreNames, 1);
		var store = tx.objectStore(this._dbTable);
		var request = store.openCursor();
		/**
		 * @ignore
		 */
		request.onsuccess = function(event)
		{
			var result = event.target.result;
		    if(!!result == false)
		    {
		    	callback(items);
		    	return;
		    }

		    var item = result.value;
		    if ((urls !== null) && ((urls[url] === undefined) || (urls[url] === null)))
		    {
				items.push(item);
			} else
			{
			    if(item.expires < _this._now)
			    {
				    items.push(item);
			    }
			}
		    result.continue();
		};
		/**
		 * @ignore
		 */
		request.onerror = function(event)
		{
			errCallback(_this._getErrorMessage(event));
		};
	},
	
	/**
	 * Retrieve a resource by its url from storage
	 * 
	 * @param {string} url Url of the resource to retrieve
	 * @param {function} callback Function called on success
	 * @param {function} errCallback Function called on error
	 */
	getItem: function(url, callback, errCallback)
	{
		// console.log('_getItem '+url);
	
		var tx = this._db.transaction(this._db.objectStoreNames, 1);
		var store = tx.objectStore(this._dbTable);
		
		var index = store.index(this._indexName);
		index.get(url).onsuccess = function(event)
		{
			callback(event.target.result); 
		};
		index.get(url).onerror = function(event)
		{
			callback(null);
		};
	},
	
	/**
	 * Store a resource in storage
	 * 
	 * @param {string} url
	 * @param {string} type
	 * @param {number} version
	 * @param {number} expires
	 * @param {string} data
	 * @param {function} callback Function called if success
	 * @param {function} errCallback Function called if error
	 */
	storeResource: function(url, type, version, expires, data, callback, errCallback)
	{
		// console.log('_storeResource '+url);
		
		var _this = this;
		
		var tx = this._db.transaction(this._db.objectStoreNames, 1);
		var store = tx.objectStore(this._dbTable);
		var request = store.put({url: url, type: type, version: version, expires: (this._now + (expires * 1000)), data: data});
		/**
		 * @ignore
		 */
		request.onsuccess = function(event)
		{
			callback(event);
		};
		/**
		 * @ignore
		 */
		request.onerror = function(event)
		{
			errCallback(_this._getErrorMessage(event));
		};
	},
	
	/**
	 * Delete a resource from storage
	 * 
	 * @param {string} url Url of the resource to delete
	 * @param {function} callback Function called on success
	 * @param {function} errCallback Function called on error
	 */
	deleteResource: function(url, callback, errCallback)
	{
		// console.log('_deleteResource '+url);
		
		var _this = this;
		
		var tx = this._db.transaction(this._db.objectStoreNames, 1);
		var store = tx.objectStore(this._dbTable);
		var request = store.delete(url);
		/**
		 * @ignore
		 */
		request.onsuccess = function(event)
		{
			callback();
		};
		/**
		 * @ignore
		 */
		request.onerror = function(event)
		{
			errCallback(_this._getErrorMessage(event));
		};
	},
	
	/**
	 * Action to execute at the end of a transaction
	 */
	endTransaction: function()
	{
	},
	
	/**
	 * Return an error message from request result
	 * 
	 * @param {object} event
	 * @returns {String} The error message
	 */
	_getErrorMessage : function(event)
	{
		return '[IndexedDbError] code: ' + event.target.errorCode + ', Message: ' + event.target.webkitErrorMessage;
	}
};