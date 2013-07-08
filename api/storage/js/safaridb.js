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
	 * @compatibility iOS2, iOS3, iOS4, iOS5, iOS6, Android 2.1, Android 2.2, Android 2.3, Android 3.0, Android 3.1, Android 4.0, Android 4.1.2, BlackBerry 6, BlackBerry 7, BB10, Bada 1.0
	 */
	wink.api.storage.SafariDb = function()
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
	
	wink.api.storage.SafariDb.prototype =
	{
		/**
		 * The size of the database
		 * 
		 * @property
		 * @type integer
		 * @default 5Mb
		 */
		MAX_SIZE: 5*1024*1024,
		
		/**
		 * The version of the database
		 * 
		 * @property
		 * @type string
		 * @default 1.0
		 */
		VERSION: '1.0',
		
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
				this.database = window.openDatabase(this._descriptor.name, this.VERSION, this._descriptor.name, this.MAX_SIZE);
			} catch (error)
			{
				if (error == 2)
				{
					wink.log("[SafariDb] Invalid database version. Update Not Implemented");
					return false;
				} else
				{
					wink.log("[SafariDb] Unknown error " + error + ".");
					return false;
				}
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
			
			var callback_success = this._insertSuccessHandler;
			var callback_error = this._insertErrorHandler;
			
			this.database.transaction(
				function(transaction)
				{
					transaction.callback = callback;
					transaction.entry = entry;
					transaction.executeSql(request.request, request.params, callback_success, callback_error);
				}
			);
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
			
			var callback_success = this._updateSuccessHandler;
			var callback_error = this._updateErrorHandler;
			
			this.database.transaction(
				function(transaction)
				{
					transaction.callback = callback;
					transaction.entry = entry;
					transaction.executeSql(request.request, request.params, callback_success, callback_error);
				}
			);
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
			
			var callback_success = this._removeSuccessHandler;
			var callback_error = this._removeErrorHandler;
	
			this.database.transaction(
				function(transaction)
				{
					transaction.callback = callback;
					transaction.entryId = entryId;
					transaction.executeSql(request.request, request.params, callback_success, callback_error);
				}
			);
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
			
			var callback_success = this._selectListSuccessHandler;
			var callback_error = this._selectListErrorHandler;
			
			var dbmgr = this;
			this.database.transaction(
				function(transaction)
				{
					transaction.callback = callback;
					transaction.tb_descriptor = dbmgr._descriptor.tables[tableName];
					transaction.executeSql(request.request, request.params, callback_success, callback_error);
				}
			);
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
			
			var callback_success = this._selectListSuccessHandler;
			var callback_error = this._selectListErrorHandler;
			
			var dbmgr = this;
			this.database.transaction(
				function(transaction)
				{
					transaction.callback = callback;
					transaction.tb_descriptor = dbmgr._descriptor.tables[tableName];
					transaction.executeSql(request.request, request.params, callback_success, callback_error);
				}
			);
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
			
			var callback_success = this._selectByIdSuccessHandler;
			var callback_error = this._selectByIdErrorHandler;
			
			var dbmgr = this;
			this.database.transaction(
				function(transaction)
				{
					transaction.callback = callback;
					transaction.tb_descriptor = dbmgr._descriptor.tables[tableName];
					transaction.executeSql(request.request, request.params, callback_success, callback_error);
				}
			);
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
			
			var callback_success = this._getTableListSuccessHandler;
			var callback_error = this._getTableListErrorHandler;
			
			this.database.transaction(
				function(transaction)
				{
					transaction.callback = callback;
					transaction.executeSql(request.request, request.params, callback_success, callback_error);
				}
			);
		},
		
		/**
		 * Create the tables described in the descriptor (erase all the previously stored datas)
		 */
		createTables: function()
		{
			var requests = wink.api.storage.sqlite.getCreateTablesRequests(this._descriptor);
			
			var callback_success = this._nullDataHandler;
			var callback_error = this._createTablesErrorHandler;
			
			this.database.transaction(
				function(transaction)
				{
					for(var i=0; i<requests.length; i++)
					{
						transaction.executeSql(requests[i], [], callback_success, callback_error);
					}
				}
			);
		},
		
		/**
		 * Remove all the datas and the tables from the database
		 */
		emptyDatabase: function()
		{
			this.getTableList({context:this, method:'_dropTables'});
		},
		
		/**
		 * Insert success handler
		 * 
		 * @param {object} transaction The current transaction
		 * @param {object} result The result of the transaction
		 */
		_insertSuccessHandler: function(transaction, result)
		{
			if ( transaction.callback )
			{
				if (result.rowsAffected)
				{
					transaction.entry.id = result.insertId;
					wink.call(transaction.callback, transaction.entry);
				} else
				{
					wink.call(transaction.callback);
				}
			}
		},
		
		/**
		 * Insert error handler
		 * 
		 * @param {object} transaction The current transaction
		 * @param {object} error The result of the transaction
		 */
		_insertErrorHandler: function(transaction, error)
		{
			wink.log('[SafariDb] insertErrorHandler : "' + error.message + '" (Code ' + error.code + ')');
		},
		
		/**
		 * Update success handler
		 * 
		 * @param {object} transaction The current transaction
		 * @param {object} result The result of the transaction
		 */
		_updateSuccessHandler: function(transaction, result)
		{
			if ( transaction.callback )
			{
				if (result.rowsAffected)
				{
					wink.call(transaction.callback, transaction.entry);
				} else
				{
					wink.call(transaction.callback);
				}
			}
		},
		
		/**
		 * Update error handler
		 * 
		 * @param {object} transaction The current transaction
		 * @param {object} error The result of the transaction
		 */
		_updateErrorHandler: function(transaction, error)
		{
			wink.log('[SafariDb] updateErrorHandler : "' + error.message + '" (Code ' + error.code + ')');
		},
		
		/**
		 * Remove success handler
		 * 
		 * @param {object} transaction The current transaction
		 * @param {object} result The result of the transaction
		 */
		_removeSuccessHandler: function(transaction, result)
		{
			if ( transaction.callback )
			{
				if (result.rowsAffected)
				{
					wink.call(transaction.callback, transaction.entryId);
				} else
				{
					wink.call(transaction.callback);
				}
			}
		},
		
		/**
		 * Remove error handler
		 * 
		 * @param {object} transaction The current transaction
		 * @param {object} error The result of the transaction
		 */
		_removeErrorHandler: function(transaction, error)
		{
			wink.log('[SafariDb] removeErrorHandler : "' + error.message + '" (Code ' + error.code + ')');
		},
		
		/**
		 * Select success handler
		 * 
		 * @param {object} transaction The current transaction
		 * @param {object} result The result of the transaction
		 */
		_selectListSuccessHandler: function(transaction, results)
		{
			if ( transaction.callback )
			{
				var callbackResult = new Array();
				
				if (results.rows.length)
				{
					for (var i = 0; i < results.rows.length; i++)
					{
						var row = results.rows.item(i);
						var rowResult = {};
						for(var field in row)
						{
							if(transaction.tb_descriptor[field] == wink.api.storage.fieldtypes.BLOB_B64)
							{
								rowResult[field] = Base64.decode(row[field]);
							} else
							{
								rowResult[field] = row[field];
							}
						}
						callbackResult.push(rowResult);
					}
				}
				
				wink.call(transaction.callback, callbackResult);
			}
		},
		
		/**
		 * Delect error handler
		 * 
		 * @param {object} transaction The current transaction
		 * @param {object} error The result of the transaction
		 */
		_selectListErrorHandler: function(transaction, error)
		{
			wink.log('[SafariDb] selectListErrorHandler : "' + error.message + '" (Code ' + error.code + ')');
		},
		
		/**
		 * Select by id success handler
		 * 
		 * @param {object} transaction The current transaction
		 * @param {object} result The result of the transaction
		 */
		_selectByIdSuccessHandler: function(transaction, results)
		{
			if ( transaction.callback )
			{
				if (results.rows.length)
				{
					var row = results.rows.item(0);
					var rowResult = {};
					for(var field in row)
					{
						if(transaction.tb_descriptor[field] == wink.api.storage.fieldtypes.BLOB_B64)
						{
							rowResult[field] = wink.api.storage.utils.decode(row[field]);
						} else
						{
							rowResult[field] = row[field];
						}
					}
					wink.call(transaction.callback, rowResult);
				} else
				{
					wink.call(transaction.callback);
				}
			}
		},
		
		/**
		 * Select by id error handler
		 * 
		 * @param {object} transaction The current transaction
		 * @param {object} error The result of the transaction
		 */
		_selectByIdErrorHandler: function(transaction, error)
		{
			wink.log('[SafariDb] selectErrorHandler : "' + error.message + '" (Code ' + error.code + ')');
		},
		
		/**
		 * Get tables success handler
		 * 
		 * @param {object} transaction The current transaction
		 * @param {object} result The result of the transaction
		 */
		_getTableListSuccessHandler: function(transaction, results)
		{
			if ( transaction.callback )
			{
				var callbackResult = [];
				if (results.rows.length)
				{
					for (var i = 0; i < results.rows.length; i++)
					{
						var row = results.rows.item(i);
						callbackResult.push(row.name);
					}
					
					wink.call(transaction.callback, callbackResult);
				} else
				{
					wink.call(transaction.callback);
				}
			}
		},
		
		/**
		 * Get tables error handler
		 * 
		 * @param {object} transaction The current transaction
		 * @param {object} error The result of the transaction
		 */
		_getTableListErrorHandler: function(transaction, error)
		{
			wink.log('[SafariDb] getTableListErrorHandler : "' + error.message + '" (Code ' + error.code + ')');
		},
		
		/**
		 * Create/drop tables handler
		 * 
		 * @param {object} transaction The current transaction
		 * @param {object} result The result of the transaction
		 */
		_nullDataHandler: function(transaction, result)
		{
			
		},
		
		/**
		 * Create tables error handler
		 * 
		 * @param {object} transaction The current transaction
		 * @param {object} error The result of the transaction
		 */
		_createTablesErrorHandler: function(transaction, error)
		{
			wink.log('[SafariDb] Error while creating tables !');
		},
		
		/**
		 * Drop tables error handler
		 * 
		 * @param {object} transaction The current transaction
		 * @param {object} error The result of the transaction
		 */
		_dropTableErrorHandler: function(transaction, error)
		{
			wink.log('[SafariDb] dropTableErrorHandler : "' + error.message + '" (Code ' + error.code + ')');
		},
		
		/**
		 * Drop tables
		 * 
		 * @param {array} tableList The list of tables to delete
		 */
		_dropTables: function(tableList)
		{
			var callback_success = this._nullDataHandler;
			var callback_error = this._dropTableErrorHandler;
			
			var requests = [];
			for(var i=0; i<tableList.length; i++)
			{
				var request = wink.api.storage.sqlite.getDropTableRequest(this._descriptor, tableList[i]);
				
				if(!request)
				{
					return;
				}
				
				requests.push(request.request);
			}
			
			this.database.transaction(
				function(transaction)
				{
					for(var j=0; j<requests.length; j++)
					{
						transaction.executeSql(requests[j], [], callback_success, callback_error);
					}				
				}
			);
		}
	};
	
	return wink.api.storage.SafariDb;
});
