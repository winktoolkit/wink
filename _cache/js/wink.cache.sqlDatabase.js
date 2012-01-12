/*--------------------------------------------------------
 * Copyright (c) 2011, The Dojo Foundation
 * This software is distributed under the "Simplified BSD license",
 * the text of which is available at http://www.winktoolkit.org/licence.txt
 * or see the "license.txt" file for more details.
 *--------------------------------------------------------*/

/**
 * @class Manage the data storage in sql Database
 *
 * @param {object} properties The properties object
 * @param {string} [properties.dbName=wink] The name of the database
 * @param {string} [properties.dbTable=resources] The name of the resource table
 * @param {string} [properties.dbSize=5242880] The size of the database
 *
 * @author Donatien LEBARBIER
 */

wink.cache.sqlDatabase = function(properties)
{
	this._db = null;

	this._now = new Date().getTime();

	this._dbName = 'wink';
	this._dbTable = 'resources';
	this._dbSize = 5242880; // 5 * 1024 * 1024
	
	this._dbDescription = 'Local cache';

	this._initProperties(properties);
};

wink.cache.sqlDatabase.prototype = {

	/**
	 * Initialize datas with given properties
	 * 
	 * @param {object} properties The properties object
	 * @param {string} [properties.dbName=wink] The name of the database
	 * @param {string} [properties.dbTable=resources] The name of the resource table
	 * @param {string} [properties.dbSize=5242880] The size of the database
	 */
	_initProperties : function(properties)
	{
		if (properties.dbName)
		{
			this._dbName = properties.dbName;
		}
		if (properties.dbTable)
		{
			this._dbTable = properties.dbTable;
		}
		if (properties.dbSize)
		{
			this._dbSize = properties.dbSize;
		}
	},
	
	/**
	 * Test if browser supports sqlDatabase
	 * 
	 * @returns {boolean} Whether this type of storage is supported
	 */
	isSupported : function()
	{
		return !!window.openDatabase;
	},

	/**
	 * Open and initialize storage if not done
	 * 
	 * @param {function} callback Function called on success
	 * @param {function} errCallback Function called on error
	 */
	open : function(callback, errCallback)
	{
		if (this._db == null)
		{
			// console.log('_open');

			var _sqlError = function(transaction, data)
			{
				errCallback(this._getErrorMessage(data));
			};

			this._db = window.openDatabase(this._dbName, '1.0',
					this._dbDescription, this._dbSize);

			this
					._executeSql(
							'CREATE TABLE IF NOT EXISTS '
									+ this._dbTable
									+ '(id INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT, url TEXT NOT NULL UNIQUE, data TEXT NOT NULL, type TEXT NOT NULL, version REAL NOT NULL, expires REAL NOT NULL);',
							[], callback, _sqlError);
		} else
		{
			callback();
		}
	},

	/**
	 * Drop the data.
	 * 
	 * @param {function} callback Function called on success
	 * @param {function} errCallback Function called on error
	 */
	drop : function(callback, errCallback)
	{
		// console.log('_drop');

		var _sqlError = function(transaction, data)
		{
			errCallback(this._getErrorMessage(data));
		};

		this._executeSql('DROP TABLE ' + this._dbTable, [], callback, _sqlError);
	},

	/**
	 * Retrieve the expired resources and the resources no more used (synchronization)
	 * 
	 * @param {function} callback Function called on success
	 * @param {function} errCallback Function called on error
	 * @param {array} urls List of resources url (useful for synchronization)
	 */
	getExpiredItems : function(callback, errCallback, urls)
	{
		// console.log('_getExpiredItems');

		var _sqlSuccess = function(transaction, data)
		{
			var items = new Array();
			if (data && data.rows)
			{
				var rows = data.rows, l = rows.length;
				for ( var i = 0; i < l; i++)
				{
					items.push(rows.item(i));
				}
			}
			callback(items);
		};

		var _sqlError = function(transaction, data)
		{
			errCallback(this._getErrorMessage(data));
		};

		var parameters = [ this._now ];
		var $sql = 'SELECT url FROM ' + this._dbTable + ' WHERE expires<?';

		if (urls !== null)
		{
			var q = "";

			for ( var url in urls)
			{
				q += (q == "" ? "" : ", ") + "?";
				parameters.push(url);
			}

			$sql += 'OR url NOT IN (' + q + ');';
		}

		this._executeSql($sql, parameters, _sqlSuccess, _sqlError);
	},

	/**
	 * Retrieve a resource by its url from storage
	 * 
	 * @param {string} url Url of the resource to retrieve
	 * @param {function} callback Function called on success
	 * @param {function} errCallback Function called on error
	 */
	getItem : function(url, callback, errCallback)
	{
		// console.log('_getItem ' + url);

		var _sqlSuccess = function(transaction, data)
		{
			var item = null;
			if (data && data.rows && (data.rows.length == 1))
			{
				item = data.rows.item(0);
			}
			callback(item);
		};

		var _sqlError = function(transaction, data)
		{
			errCallback(this._getErrorMessage(data));
		};

		this._executeSql('SELECT version, expires, data FROM ' + this._dbTable
				+ ' WHERE url=?;', [ url ], _sqlSuccess, _sqlError);
	},

	/**
	 * Store a resource in storage
	 * 
	 * @param {string} url
	 * @param {string} type
	 * @param {number} version
	 * @param {number} expires
	 * @param {string} data
	 * @param {function} callback Function called on success
	 * @param {function} errCallback Function called on error
	 */
	storeResource : function(url, type, version, expires, data, callback,
			errCallback)
	{
		// console.log('_storeResource ' + url);

		var _sqlError = function(transaction, data)
		{
			errCallback(this._getErrorMessage(data));
		};

		this._executeSql('INSERT INTO ' + this._dbTable
				+ ' (url, type, version, expires, data) VALUES (?,?,?,?,?);', [
				url, type, version, (this._now + (expires * 1000)), data ],
				callback, _sqlError);
	},

	/**
	 * Delete a resource from storage
	 * 
	 * @param {string} url Url of the resource to delete
	 * @param {function} callback Function called on success
	 * @param {function} errCallback Function called on error
	 */
	deleteResource : function(url, callback, errCallback)
	{
		// console.log('_deleteResource ' + url);

		var _sqlError = function(transaction, data)
		{
			errCallback(this._getErrorMessage(data));
		};

		this._executeSql('DELETE FROM ' + this._dbTable + ' WHERE url=?;',
				[ url ], callback, _sqlError);
	},

	/**
	 * Action to execute at the end of a transaction
	 */
	endTransaction : function()
	{
	},

	/**
	 * Execute a sql request
	 * 
	 * @param {string} sqlStatement
	 * @param {array} parameters
	 * @param {function} callback Function called on success
	 * @param {function} errorCallback Function called on error
	 */
	_executeSql : function(sqlStatement, parameters, callback, errorCallback)
	{
		this._db.transaction(function(transaction)
		{
			transaction.executeSql(sqlStatement, parameters, callback,
					errorCallback);
		});
	},

	/**
	 * Return an error message from request result
	 * 
	 * @param {object} data
	 * @returns {String} The error message
	 */
	_getErrorMessage : function(data)
	{
		return '[SqlDbError] code: ' + data.code + ', Message: ' + data.message;
	}
};