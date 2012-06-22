/*--------------------------------------------------------
 * Copyright (c) 2011, The Dojo Foundation
 * This software is distributed under the "Simplified BSD license",
 * the text of which is available at http://www.winktoolkit.org/licence.txt
 * or see the "license.txt" file for more details.
 *--------------------------------------------------------*/

/**
 * @fileOverview Implements the database management methods for the Iphone
 * 
 * @author Jerome GIRAUD
 */
define(['../../../_amd/core', './storage'], function(wink)
{
	/**
	 * @class Implements the database management methods for the Iphone
	 * 
	 * @compatibility Android 1.1, Android 1.5
	 */
	wink.api.storage.GearsDb = function()
	{
		/**
		 * Unique identifier
		 * 
		 * @property
		 * @type integer
		 */
		this.uId = wink.getUId();
		
		/**
		 * The local storage component
		 * 
		 * @property
		 * @type object
		 */
		this.database = null;
		
		this._descriptor = null;
	};
	
	wink.api.storage.GearsDb.prototype = 
	{
		/**
		 * Connection/creation to/of the specified database
		 * 
		 * @param {object} descriptor The database descriptor
		 */
		connect: function(descriptor)
		{
			this._descriptor = descriptor;
		
			try
			{
				this.database = google.gears.factory.create('beta.database');
				this.database.open(this._descriptor.name);
			} catch (error)
			{
				wink.log("[GearsDb] Unknown error " + error + ".");
				return false;
			}
			return true;
		},
		
		/**
		 * Insert a new entry into a database table
		 * 
		 * @param {string} tableName The name of the table
		 * @param {object} entry An object representing an element of the table
		 * @param {object|function} callback The callback method to invoke after the result
		 */
		insert: function(tableName, entry, callback)
		{
			var request = wink.api.storage.sqlite.getInsertRequest(this._descriptor, tableName, entry);
			
			if(!request)
			{
				return;
			}
			
			this.database.execute(request.request, request.params);
			
			if ( callback )
			{
				if(this.database.rowsAffected)
				{
					entry.id = this.database.lastInsertRowId;
					wink.call(callback, entry);
				} else
				{
					wink.call(callback);
				}
			}
		},
		
		/**
		 * Update a particular entry
		 * 
		 * @param {string} tableName The name of the table
		 * @param {object} entry An object representing an element of the table and containing the id of the element to update
		 * @param {object|function} callback The callback method to invoke after the result
		 */
		update: function(tableName, entry, callback)
		{
			var request = wink.api.storage.sqlite.getUpdateRequest(this._descriptor, tableName, entry);
			
			if(!request)
			{
				return;
			}
			
			this.database.execute(request.request, request.params);
			
			if ( callback )
			{
				if(this.database.rowsAffected)
				{
					wink.call(callback, entry);
				} else
				{
					wink.call(callback);
				}
			}
		},
		
		/**
		 * Remove a particular entry
		 * 
		 * @param {string} tableName The name of the table
		 * @param {integer} entryId The id of the element to remove
		 * @param {object|function} callback The callback method to invoke after the result
		 */
		remove: function(tableName, entryId, callback)
		{
			var request = wink.api.storage.sqlite.getRemoveRequest(this._descriptor, tableName, entryId);
			
			if(!request)
			{
				return;
			}
			
			this.database.execute(request.request, request.params);
	
			if ( callback )
			{
				if(this.database.rowsAffected)
				{
					wink.call(callback, entryId);
				} else
				{
					wink.call(callback);
				}
			}
		},
		
		/**
		 * Get all the entries of a table
		 * 
		 * @param {string} tableName The name of the table
		 * @param {object|function} callback The callback method to invoke after the result
		 */
		getList: function(tableName, callback)
		{
			var request = wink.api.storage.sqlite.getSelectRequest(this._descriptor, tableName);
			
			if(!request)
			{
				return;
			}
			
			var result = this.database.execute(request.request, request.params);
			
			if ( callback )
			{
				var callbackResult = [];
				while (result.isValidRow())
				{
					var row = {};
					for(var i=0; i<result.fieldCount(); i++)
					{
						if(this._descriptor.tables[tableName][result.fieldName(i)] == wink.api.storage.fieldtypes.BLOB_B64)
						{
							row[result.fieldName(i)] = wink.api.storage.utils.decode(result.field(i));
						} else
						{
							row[result.fieldName(i)] = result.field(i);
						}					
					}
					callbackResult.push(row);
					result.next();
				}
				result.close();
				
				wink.call(callback, callbackResult);
			}
		},
		
		/**
		 * Get all the entries with the specified value in the specified field
		 * 
		 * @param {string} tableName The name of the table
		 * @param {string} fieldName The search field criteria
		 * @param {string} fieldValue The search field value
		 * @param {object|function} callback The callback method to invoke after the result
		 */
		getListByField: function(tableName, fieldName, fieldValue, callback)
		{
			var request = wink.api.storage.sqlite.getSelectRequest(this._descriptor, tableName, fieldName, fieldValue);
			
			if(!request)
			{
				return;
			}
			
			var result = this.database.execute(request.request, request.params);
			
			if ( callback )
			{
				var callbackResult = [];
				while (result.isValidRow())
				{
					var row = {};
					for(var i=0; i<result.fieldCount(); i++)
					{
						if(this._descriptor.tables[tableName][result.fieldName(i)] == wink.api.storage.fieldtypes.BLOB_B64)
						{
							row[result.fieldName(i)] = wink.api.storage.utils.decode(result.field(i));
						} else
						{
							row[result.fieldName(i)] = result.field(i);
						}
					}
					callbackResult.push(row);
					result.next();
				}
				result.close();
		
				wink.call(callback, callbackResult);
			}
		},
		
		/**
		 * Get the entry with the specified id
		 * 
		 * @param {string} tableName The name of the table
		 * @param {integer} entryId The id of the element to get
		 * @param {object|function} callback The callback method to invoke after the result
		 */
		getById: function(tableName, entryId, callback)
		{
			var request = wink.api.storage.sqlite.getSelectRequest(this._descriptor, tableName, 'id', entryId);
			
			if(!request)
			{
				return;
			}
			
			var result = this.database.execute(request.request, request.params);
			
			if ( callback )
			{
				var callbackResultRow = {};
				if (result.isValidRow())
				{
					for(var i=0; i<result.fieldCount(); i++)
					{
						if(this._descriptor.tables[tableName][result.fieldName(i)] == wink.api.storage.fieldtypes.BLOB_B64)
						{
							callbackResultRow[result.fieldName(i)] = wink.api.storage.utils.decode(result.field(i));
						} else
						{
							callbackResultRow[result.fieldName(i)] = result.field(i);
						}
					}
					result.next();
				} else
				{
					callbackResultRow = null;
				}
				result.close();
				
				wink.call(callback, callbackResultRow);
			}
		},
		
		/**
		 * Get the list of all the tables in the database
		 * 
		 * @param {object|function} callback The callback method to invoke after the result
		 */
		getTableList: function(callback)
		{
			var request = wink.api.storage.sqlite.getTableListRequest();
			
			if(!request)
			{
				return;
			}
			
			var result = this.database.execute(request.request, request.params);
			
			if ( callback )
			{
				var callbackResult = [];
				while (result.isValidRow())
				{
					callbackResult.push(result.fieldByName('name'));
					result.next();
				}
				result.close();
				
				wink.call(callback, callbackResult);
			}
		},
		
		/**
		 * Create the tables described in the descriptor (erase all the previously stored datas)
		 */
		createTables: function()
		{
			var requests = wink.api.storage.sqlite.getCreateTablesRequests(this._descriptor);
			
			for(var i=0; i<requests.length; i++)
			{
				this.database.execute(requests[i]);
			}
		},
		
		/**
		 * Remove all the datas and the tables from the database
		 */
		emptyDatabase: function()
		{
			this.getTableList({context:this, method:'_dropTables'});
		},
		
		/**
		 * Drop tables
		 * 
		 * @param {array} tableList The list of tables to delete
		 */
		_dropTables: function(tableList)
		{
			for(var i=0; i<tableList.length; i++)
			{
				var request = wink.api.storage.sqlite.getDropTableRequest(this._descriptor, tableList[i]);
				
				if(!request)
				{
					return;
				}
				
				this.database.execute(request.request);
			}
		}
	};
	
	return wink.api.storage.GearsDb;
});

///////////////////////////////////////////////////////////////
//GOOGLE GEARS INIT PART
///////////////////////////////////////////////////////////////

//Copyright 2007, Google Inc.
//
//Redistribution and use in source and binary forms, with or without
//modification, are permitted provided that the following conditions are met:
//
//1. Redistributions of source code must retain the above copyright notice,
//  this list of conditions and the following disclaimer.
//2. Redistributions in binary form must reproduce the above copyright notice,
//  this list of conditions and the following disclaimer in the documentation
//  and/or other materials provided with the distribution.
//3. Neither the name of Google Inc. nor the names of its contributors may be
//  used to endorse or promote products derived from this software without
//  specific prior written permission.
//
//THIS SOFTWARE IS PROVIDED BY THE AUTHOR ``AS IS'' AND ANY EXPRESS OR IMPLIED
//WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF
//MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO
//EVENT SHALL THE AUTHOR BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL,
//SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO,
//PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS;
//OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY,
//WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR
//OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF
//ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
//
//Sets up google.gears.*, which is *the only* supported way to access Gears.
//
//Circumvent this file at your own risk!
//
//In the future, Gears may automatically define google.gears.* without this
//file. Gears may use these objects to transparently fix bugs and compatibility
//issues. Applications that use the code below will continue to work seamlessly
//when that happens.

(function()
{
	// We are already defined. Hooray!
	if (window.google && google.gears)
	{
		return;
	}

	var factory = null;

	// Firefox
	if (typeof GearsFactory != 'undefined')
	{
		factory = new GearsFactory();
	} else
	{
		// IE
		try
		{
			factory = new ActiveXObject('Gears.Factory');
			// privateSetGlobalObject is only required and supported on IE Mobile on
			// WinCE.
			if (factory.getBuildInfo().indexOf('ie_mobile') != -1)
			{
				factory.privateSetGlobalObject(this);
			}
		} catch (e)
		{
			// Safari
			if ((typeof navigator.mimeTypes != 'undefined') && navigator.mimeTypes["application/x-googlegears"])
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

	// *Do not* define any objects if Gears is not installed. This mimics the
	// behavior of Gears defining the objects in the future.
	if (!factory)
	{
		return;
	}

	// Now set up the objects, being careful not to overwrite anything.
	//
	// Note: In Internet Explorer for Windows Mobile, you can't add properties to
	// the window object. However, global objects are automatically added as
	// properties of the window object in all browsers.
	if (!window.google)
	{
		google = {};
	}

	if (!google.gears)
	{
		google.gears =
		{
			factory: factory
		};
	}
})();