/*--------------------------------------------------------
 * Copyright (c) 2011, The Dojo Foundation
 * This software is distributed under the "Simplified BSD license",
 * the text of which is available at http://www.winktoolkit.org/licence.txt
 * or see the "license.txt" file for more details.
 *--------------------------------------------------------*/

/**
 * @fileOverview Implements a access layer to the local storage mechanism. Must be used with a DB plugin (e.g.: SafariDB, GearsDB...)
 * 
 * @compatibility Iphone OS2, Iphone OS3, Iphone OS4, Android 1.1, Android 1.5, Android 2.1, Android 2.2, Android 2.3, Android 3.0, Android 3.1, BlackBerry 6, BlackBerry 7, Bada 1.0
 * @author Jerome GIRAUD
 */
define(['../../../_amd/core'], function(wink)
{
	/**
	 * @class Implements a access layer to the local storage mechanism. Must be used with a DB plugin (e.g.: SafariDB, GearsDB...)
	 * 
	 * @example
	 * 
	 * var descriptor =
	 * {
	 * 	name: 'dummy_db',
	 * 	tables:
	 * 	{
	 * 		contacts:
	 * 		{
	 * 			lastname : wink.api.storage.fieldtypes.TEXT,
	 * 			firstname : wink.api.storage.fieldtypes.TEXT,
	 * 			age : wink.api.storage.fieldtypes.INTEGER,
	 * 			phone : wink.api.storage.fieldtypes.TEXT,
	 * 			email : wink.api.storage.fieldtypes.TEXT
	 * 		}
	 * 	}
	 * }
	 * 
	 * storage = new wink.api.Storage();
	 * 
	 * storage.connect(descriptor);
	 * 
	 * @see <a href="WINK_ROOT_URL/api/storage/test/test_storage.html" target="_blank">Test page</a>
	 */
	wink.api.Storage = function()
	{
		if (wink.isUndefined(wink.api.Storage.singleton))
		{
			/**
			 * Unique identifier
			 * 
			 * @property
			 * @type integer
			 */
			this.uId = 1;
			
			/**
			 * True if a local storage is available, false otherwise
			 * 
			 * @property
			 * @type boolean
			 */
			this.dbAvailable = false;
			
			
			this._db = null;
			
			this._init();
			
			wink.api.Storage.singleton = this;
		} else
		{
			return wink.api.Storage.singleton;
		}
	};
	
	wink.api.Storage.prototype = 
	{	
		/**
		 * Connection/creation to/of the specified database
		 * 
		 * @param {object} descriptor The database descriptor
		 * 
		 * @example
		 * 
		 * //Note: fieldTypes are defined in the DatabaseFieldTypes object (INTEGER, TEXT, BLOB, BLOB_B64, REAL)
		 * 
		 * //Descriptor example:
		 * 
		 * descriptor =
		 * {
		 * 	name = the name of the database
		 * 	tables:
		 * 	{
		 * 		tableName1:
		 * 		{
		 * 			fieldName1 : fieldType1,
		 * 			fieldName2 : fieldType2,
		 * 			fieldName3 : fieldType3
		 * 		},
		 * 
		 * 		tableName2:
		 * 		{
		 * 			fieldName1 : fieldType1,
		 * 			fieldName2 : fieldType2,
		 * 			fieldName3 : fieldType3
		 * 		}
		 * 	}
		 * }
		 */
		connect: function(descriptor)
		{
			if ( this._db )
			{
				if( this._db.connect(descriptor) )
				{
					this._db.createTables();
				} else
				{
					wink.log('[Storage] cannot create database');
				}
			}
		},
		
		/**
		 * Insert a new entry into a database table
		 * 
		 * @param {string} tableName The name of the table
		 * @param {object} entry An object representing an element of the table
		 * @param {object} [callback] The callback to invoke after the result
		 */
		insert: function(tableName, entry, callback)
		{
			if ( this._db )
			{
				if ( !wink.isSet(callback))
				{
					callback = {context: null, method: null};
				}
				
				this._db.insert(tableName, entry, callback);
			}
		},
		
		/**
		 * Update a particular entry
		 * 
		 * @param {string} tableName The name of the table
		 * @param {object} entry An object representing an element of the table and containing the id of the element to update
		 * @param {object} [callback] The callback to invoke after the result
		 */
		update: function(tableName, entry, callback)
		{
			if ( this._db )
			{
				if ( !wink.isSet(callback))
				{
					callback = {context: null, method: null};
				}
				
				this._db.update(tableName, entry, callback);
			}
		},
		
		/**
		 * Remove a particular entry
		 * 
		 * @param {string} tableName The name of the table
		 * @param {integer} entryId The id of the element to remove
		 * @param {object} [callback] The callback to invoke after the result
		 */
		remove: function(tableName, entryId, callback)
		{
			if ( this._db )
			{
				if ( !wink.isSet(callback))
				{
					callback = {context: null, method: null};
				}
				
				this._db.remove(tableName, entryId, callback);
			}
		},
		
		/**
		 * TODO: implement
		 * 
		 * @ignore
		 */
		updateDatabase: function()
		{
			wink.log('[Storage] updateDatabase not implemented !');
		},
		
		/**
		 * Get all the entries of a table
		 * 
		 * @param {string} tableName The name of the table
		 * @param {object} callback The callback to invoke after the result
		 */
		getList: function(tableName, callback)
		{
			if ( this._db )
			{
				this._db.getList(tableName, callback);
			}
		},
		
		/**
		 * Get all the entries with the specified value in the specified field
		 * 
		 * @param {string} tableName The name of the table
		 * @param {string} fieldName The search field criteria
		 * @param {string} fieldValue The search field value
		 * @param {object} callback The callback to invoke after the result
		 */
		getListByField: function(tableName, fieldName, fieldValue, callback)
		{
			if ( this._db )
			{
				this._db.getListByField(tableName, fieldName, fieldValue, callback);
			}
		},
		
		/**
		 * Get the entry with the specified id
		 * 
		 * @param {string} tableName The name of the table
		 * @param {integer} entryId The id of the element to get
		 * @param {object} callback The callback to invoke after the result
		 */
		getById: function(tableName, entryId, callback)
		{
			if ( this._db )
			{
				this._db.getById(tableName, entryId, callback);
			}
		},
		
		/**
		 * Get the list of all the tables in the database
		 * 
		 * @param {object} callback The callback to invoke after the result
		 */
		getTableList: function(callback)
		{
			if ( this._db )
			{
				this._db.getTableList(callback);
			}
		},
		
		/**
		 * Create the tables described in the descriptor (erase all the previously stored datas)
		 */
		createTables: function()
		{
			if ( this._db )
			{
				this._db.createTables();
			}
		},
		
		/**
		 * Remove all the datas and the tables from the database
		 */
		emptyDatabase: function()
		{
			if ( this._db )
			{
				this._db.emptyDatabase();
			}
		},
		
		/**
		 * Initialize the storage
		 */
		_init: function()
		{
			if(window.openDatabase)
			{
				this._db = new wink.api.storage.SafariDb();
				this.dbAvailable = true;
			} else if(window.google && google.gears)
			{
				this._db = new wink.api.storage.GearsDb();
				this.dbAvailable = true;
			} else
			{
				wink.log('[Storage] no database available');
			}
		}
	};
	
	/**
     * @borrows wink.api.storage as this
     */
	wink.api.storage = wink.api.Storage;
	
	/**
	 * @namespace Defines the different data types available for the local storage* 
	 */
	wink.api.storage.fieldtypes =
	{
		/**
		 * A field of type INTEGER
		 * 
		 * @constant
		 */
		INTEGER:0,
		
		/**
		 * A field of type TEXT
		 * 
		 * @constant
		 */
		TEXT:1,
		
		/**
		 * A field of type BLOB
		 * 
		 * @constant
		 */
		BLOB:2,
		
		/**
		 * A field of type BLOB_B64
		 * 
		 * @constant
		 */
		BLOB_B64:3,
		
		/**
		 * A field of type REAL
		 * 
		 * @constant
		 */
		REAL:4
	};
	
	/**
	 * @namespace Create various SQLite requests
	 */
	wink.api.storage.sqlite =
	{
		/**
		 * Returns a create table statement
		 * 
		 * @param {object} descriptor The database descriptor
		 * 
		 * @returns {string} The query
		 */
		getCreateTablesRequests: function(descriptor)
		{
			var result = [];
			
			for(var tableName in descriptor.tables)
			{
				var tableFields = descriptor.tables[tableName];
				
				var createRequest = 'CREATE TABLE IF NOT EXISTS ';
				createRequest += tableName;
				createRequest += ' (id INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT';
				
				for(var field in tableFields)
				{
					createRequest += ', ' + field + ' ';
					
					switch (tableFields[field])
					{
						case wink.api.storage.fieldtypes.INTEGER:
						{
							createRequest += 'INTEGER';
							break;
						}
						
						case wink.api.storage.fieldtypes.TEXT:
						{
							createRequest += 'TEXT';
							break;
						}
						
						case wink.api.storage.fieldtypes.BLOB:
						case wink.api.storage.fieldtypes.BLOB_B64:
						{
							createRequest += 'BLOB';
							break;
						}
						
						case wink.api.storage.fieldtypes.REAL:
						{
							createRequest += 'REAL';
							break;
						}
						
						default:
						{
							wink.log("[sqlite] Unknown field type '" + tableFields[field] + "' for field '" + field + "' in table '" + tableName + "'");
							return [];
							break;
						}
					}
				}
				createRequest += ');';
				result.push(createRequest);
			}
			return result;
		},
		
		/**
		 * Returns an insert statement
		 * 
		 * @param {object} descriptor The database descriptor
		 * @param {string} tableName The name of the table where to insert datas
		 * @param {object} entry The object repesenting the data
		 * 
		 * @returns {string} The query
		 */
		getInsertRequest: function(descriptor, tableName, entry)
		{
			if( !descriptor.tables[tableName] )
			{
				wink.log("[sqlite] getInsertRequest - Wrong table name : '" + tableName + "'");
				return null;
			}
			
			var insertRequest = {
					request:'',
					params:[]
			};
			
			insertRequest.request += 'INSERT INTO ';
			insertRequest.request += tableName;
			insertRequest.request += ' (';
			
			var paramString = '';
			
			var separator = '';
			
			for(var field in entry)
			{
				if(field != 'id' && !wink.isFunction(field) && !wink.isUndefined(descriptor.tables[tableName][field]))
				{
					var value = entry[field];
					
					if(descriptor.tables[tableName][field] == wink.api.storage.fieldtypes.BLOB_B64)
					{
						value = wink.api.storage.utils.encode(entry[field]);
					}
					
					insertRequest.request += separator + field;
					insertRequest.params.push(value);
					paramString += separator + '?';
					
					if(separator == '')
					{
						separator = ', ';
					}
				}
			}
			
			insertRequest.request += ') VALUES (' + paramString + ')';
			return insertRequest;
		},
		
		/**
		 * Returns an update statement
		 * 
		 * @param {object} descriptor The database descriptor
		 * @param {string} tableName The name of the table where to insert datas
		 * @param {object} entry The object repesenting the data plus the id of the data to be modified
		 * 
		 * @returns {string} The query
		 */
		getUpdateRequest: function(descriptor, tableName, entry)
		{
			if(!descriptor.tables[tableName])
			{
				wink.log("[sqlite] getUpdateRequest - Wrong table name : '" + tableName + "'");
				return null;
			}
			
			var updateRequest = {
				request:'',
				params:[]
			};
			
			updateRequest.request += 'UPDATE ';
			updateRequest.request += tableName;
			updateRequest.request += ' SET ';
			
			var paramString = '';
			var separator = '';
			
			for(var field in entry)
			{
				if(field != 'id' && !wink.isFunction(field) && !wink.isUndefined(descriptor.tables[tableName][field]))
				{
					var value = entry[field];
					
					if(descriptor.tables[tableName][field] == wink.api.storage.fieldtypes.BLOB_B64)
					{
						value = wink.api.storage.utils.encode(entry[field]);
					}
					
					updateRequest.request += separator + field + '=?';
					updateRequest.params.push(value);
					
					if(separator == '')
					{
						separator = ', ';
					}
				}
			}
			
			updateRequest.request += ' WHERE id=' + entry.id;
			return updateRequest;
		},
		
		/**
		 * Returns a delete statement
		 * 
		 * @param {object} descriptor The database descriptor
		 * @param {string} tableName The name of the table where to remove datas
		 * @param {object} entryId The id of the data to be removed
		 * 
		 * @returns {string} The query
		 */
		getRemoveRequest: function(descriptor, tableName, entryId)
		{
			if(!descriptor.tables[tableName])
			{
				wink.log("[sqlite] getRemoveRequest - Wrong table name : '" + tableName + "'");
				return null;
			}
			
			var removeRequest = {
				request:'',
				params:[]
			};
			
			removeRequest.request += 'DELETE FROM ';
			removeRequest.request += tableName;
			removeRequest.request += ' WHERE id=' + entryId;
			return removeRequest;
		},
		
		/**
		 * Returns a select statement
		 * 
		 * @param {object} descriptor The database descriptor
		 * @param {string} tableName The name of the table where to select datas
		 * @param {string} [criteriaField] The field to apply the 'WHERE' clause
		 * @param {string} [criteriaValue] The value of the field we want to look for
		 * 
		 * @returns {string} The query
		 */
		getSelectRequest: function(descriptor, tableName, criteriaField, criteriaValue)
		{
			if(!descriptor.tables[tableName])
			{
				wink.log("[sqlite] getSelectRequest - Wrong table name : '" + tableName + "'");
				return null;
			}
			
			var selectRequest = {
				request:'',
				params:[]
			};
			
			selectRequest.request += 'SELECT * FROM ';
			selectRequest.request += tableName;
			
			if(typeof(criteriaField)!='undefined' && typeof(criteriaField)!='undefined' && (typeof(descriptor.tables[tableName][criteriaField])!='undefined' || criteriaField == 'id'))
			{
				selectRequest.request += ' WHERE ' + criteriaField + '=?';
				selectRequest.params.push(criteriaValue);
			}
			
			return selectRequest;
		},
		
		/**
		 * Returns a 'show tables' statement
		 * 
		 * @returns {string} The query
		 */
		getTableListRequest: function()
		{
			var selectRequest = {
				request:'',
				params:[]
			};
			
			selectRequest.request += 'SELECT * FROM sqlite_master';
			selectRequest.request += ' WHERE name NOT LIKE "%WebKitDatabaseInfoTable%"';
			selectRequest.request += ' AND name <> "sqlite_sequence";';
			return selectRequest;
		},
		
		/**
		 * Returns an 'drop table' statement
		 * 
		 * @param {object} descriptor The database descriptor
		 * @param {string} tableName The name of the table to be removed
		 * 
		 * @returns {string} The query
		 */
		getDropTableRequest: function(descriptor, tableName)
		{
			if(!descriptor.tables[tableName])
			{
				wink.log("[sqlite] getDropTableRequest - Wrong table name : '" + tableName + "'");
				return null;
			}
			
			var dropRequest = {
				request:'',
				params:[]
			};
			
			dropRequest.request += 'DROP TABLE '+ tableName;
			
			return dropRequest;
		},
		
		/**
		 * Returns the id of the last inserted row
		 * 
		 * @param {object} descriptor The database descriptor
		 * @param {string} tableName The name of the table where to look
		 * 
		 * @returns {string} The query
		 */
		getLastInsertRowIdRequest: function(descriptor, tableName)
		{
			if(!descriptor.tables[tableName])
			{
				wink.log("[sqlite] getLastInsertRowIdRequest - Wrong table name : '" + tableName + "'");
				return null;
			}
			
			var lastInsertIdRequest = {
				request:'',
				params:[]
			};
			
			lastInsertIdRequest.request += 'SELECT DISTINCT last_insert_rowid() FROM ' + tableName;
			return lastInsertIdRequest;
		}
	};
	
	/**
	 * @namespace Base64 utility
	 */
	wink.api.storage.utils = 
	{
		_keyStr: "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=",
	 
		/**
		 * Encode a resource in base64
		 * 
		 * @param {string} input The resource to encode
		 * 
		 * @returns {string} The encoded value
		 */
		encode: function (input)
		{
			var output = "";
			var chr1, chr2, chr3, enc1, enc2, enc3, enc4;
			var i = 0;
			
			input = this._utf8_encode(input);
			
			while (i < input.length)
			{
				chr1 = input.charCodeAt(i++);
				chr2 = input.charCodeAt(i++);
				chr3 = input.charCodeAt(i++);
	 
				enc1 = chr1 >> 2;
				enc2 = ((chr1 & 3) << 4) | (chr2 >> 4);
				enc3 = ((chr2 & 15) << 2) | (chr3 >> 6);
				enc4 = chr3 & 63;
	 
				if (isNaN(chr2))
				{
					enc3 = enc4 = 64;
				} else if (isNaN(chr3))
				{
					enc4 = 64;
				}
	 
				output = output + this._keyStr.charAt(enc1) + this._keyStr.charAt(enc2) + this._keyStr.charAt(enc3) + this._keyStr.charAt(enc4);
			}
			return output;
		},
		
		/**
		 * Decode a base64 resource
		 * 
		 * @param {string} input The resource to decode
		 * 
		 * @returns {string} The decoded value
		 */
		decode: function (input)
		{
			var output = "";
			var chr1, chr2, chr3;
			var enc1, enc2, enc3, enc4;
			var i = 0;
	 
			input = input.replace(/[^A-Za-z0-9\+\/\=]/g, "");
	 
			while (i < input.length)
			{
				enc1 = this._keyStr.indexOf(input.charAt(i++));
				enc2 = this._keyStr.indexOf(input.charAt(i++));
				enc3 = this._keyStr.indexOf(input.charAt(i++));
				enc4 = this._keyStr.indexOf(input.charAt(i++));
	 
				chr1 = (enc1 << 2) | (enc2 >> 4);
				chr2 = ((enc2 & 15) << 4) | (enc3 >> 2);
				chr3 = ((enc3 & 3) << 6) | enc4;
	 
				output = output + String.fromCharCode(chr1);
	 
				if (enc3 != 64)
				{
					output = output + String.fromCharCode(chr2);
				}
				if (enc4 != 64)
				{
					output = output + String.fromCharCode(chr3);
				}
	 
			}
			output = this._utf8_decode(output);
			return output;
	 
		},
	 
		/**
		 * Encode a string in UTF-8 
		 * 
		 * @param {string} string The resource to encode
		 * 
		 * @returns {string} The encoded value
		 */
		_utf8_encode: function (string)
		{
			string = string.replace(/\r\n/g,"\n");
			var utftext = "";
	 
			for (var n = 0; n < string.length; n++)
			{
				var c = string.charCodeAt(n);
	 
				if (c < 128)
				{
					utftext += String.fromCharCode(c);
				} else if((c > 127) && (c < 2048))
				{
					utftext += String.fromCharCode((c >> 6) | 192);
					utftext += String.fromCharCode((c & 63) | 128);
				} else
				{
					utftext += String.fromCharCode((c >> 12) | 224);
					utftext += String.fromCharCode(((c >> 6) & 63) | 128);
					utftext += String.fromCharCode((c & 63) | 128);
				}
			}
	 
			return utftext;
		},
	 
		/**
		 * Decode a UTF-8 string
		 * 
		 * @param {string} utftext The resource to decode
		 * 
		 * @returns {string} The decoded value
		 */
		_utf8_decode: function (utftext)
		{
			var string = "";
			var i = 0;
			var c = c1 = c2 = 0;
	 
			while ( i < utftext.length ) {
	 
				c = utftext.charCodeAt(i);
	 
				if (c < 128) {
					string += String.fromCharCode(c);
					i++;
				}
				else if((c > 191) && (c < 224)) {
					c2 = utftext.charCodeAt(i+1);
					string += String.fromCharCode(((c & 31) << 6) | (c2 & 63));
					i += 2;
				}
				else {
					c2 = utftext.charCodeAt(i+1);
					c3 = utftext.charCodeAt(i+2);
					string += String.fromCharCode(((c & 15) << 12) | ((c2 & 63) << 6) | (c3 & 63));
					i += 3;
				}
			}
			return string;
		}
	};
	
	return wink.api.Storage;
});