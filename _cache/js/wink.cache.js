/*--------------------------------------------------------
 * Copyright (c) 2011, The Dojo Foundation
 * This software is distributed under the "Simplified BSD license",
 * the text of which is available at http://www.winktoolkit.org/licence.txt
 * or see the "license.txt" file for more details.
 *--------------------------------------------------------*/

/**
 * @fileOverview This is the 'easy caching' mechanism of wink. It gives you the possibility to load and store your CSS and JS resources into the device's local database. It can be used at the page startup or afterwards
 * 
 * @compatibility Iphone OS2, Iphone OS3, Iphone OS4, Android 2.1, Android 2.2, Android 2.3, Android 3.0, Android 3.1, BlackBerry 6, BlackBerry 7
 * 
 * @author Julien VAN DEN BOSSCHE, Jerome GIRAUD, Sylvain LALANDE
 */

if (typeof wink == 'undefined')
{
	wink = {};
}

/**
 * @namespace The 'easy caching' component
 * 
 * @example
 * 
 * var resources =
 * [
 * 	{ url: '../../_base/_base/js/base.js', type: 'js', group: 0 },
 * 	{ url: '../../_base/_dom/js/dom.js', type: 'js', group: 1 },
 * 	{ url: '../../_base/error/js/error.js', type: 'js', group: 1 },
 * 	{ url: '../../_base/json/js/json.js', type: 'js', group: 1 },
 * 	{ url: '../../_base/topics/js/topics.js', type: 'js', group: 1 },
 * 	{ url: '../../_base/ua/js/ua.js', type: 'js', group: 1 },
 * 
 * 	{ url: './test.js', type: 'js', group: 2, expires: 60, version: 1.0 }, // Valid for 1 minute
 * 	{ url: './test.css', type: 'css', group: 2, expires: 60, version: 1.0 } // Valid for 1 minute
 * ];
 * 
 * var resourcesLoaded = function(result)
 * {
 * 	console.log("loadTime: " + result.loadTime + ", with " + (result.errors.length + result.loadErrors.length) + " errors");
 * };
 * wink.load(resources, resourcesLoaded);
 * 
 * @see <a href="WINK_ROOT_URL/_cache/test/test_cache.html" target="_blank">Test page (coverflow)</a>
 * @see <a href="WINK_ROOT_URL/_cache/test/test_cache_2.html" target="_blank">Test page (tagcloud)</a>
 * @see <a href="WINK_ROOT_URL/_cache/test/test_cache_3.html" target="_blank">Test page (indexedDatabase)</a>
 * 
 */
wink.cache = (function()
{

	var _enable = true, 
		_storage = null, 
		_synchronize = false, 
		_expires = 1814400, // default value: 3 * 7 * 24 * 60 * 60
		
		_headNode, 
		_now, 
		_cacheErrors, 
		_errors, 
		_loadErrors, 
		_resourcesCleaned, 
		_resourcesOldVersion, 
		_cleaned;

	var cache = {};

	/**
	 * Loads the resources
	 * 
	 * @function
	 * @name wink.cache.load
	 * 
	 * @param {array} resources The resources to load
	 * @param {string} resources.url The url of the resource
	 * @param {string} resources.type The type can be 'js' or 'css'
	 * @param {integer} [resources.group=0] Allows to specify an order of loading: a resource in a group will be loaded before groups with higher indexes
	 * @param {integer} [resources.expires=options.expires] The expiration duration in seconds: if not specified, takes the global value (see options), if -1 specified, the existing resource will be deleted
	 * @param {string} [resources.version=1.0] The version of the resource: very useful for versioning of code, an outdated resource is seen as an expired resource
	 * 
	 * @param {function} [onload] A function called once all the resources have been loaded. 
	 * @returns {object} p The result parameter passed to the callback function
	 * @returns {integer} p.loadTime The loading duration in ms
	 * @returns {boolean} p.useOfLocalDatabase Specify whether the local database is used (false when an error occurs)
	 * @returns {array} p.errors An array of cache system errors
	 * @returns {array} p.loadErrors An array of network loading errors
	 * @returns {array} p.resourcesCleaned An array of resources cleaned
	 * @returns {array} p.resourcesOldVersion An array of outdated resources deleted
	 * 
	 * @param {object} [options] Options
	 * @param {object} [options.enable=true] Specify to use the local storage or not
	 * @param {object} [options.storage] The storage type: 'localStorage' / 'sqlDatabase' / 'indexedDatabase'
	 * @param {object} [options.synchronize=false] Synchronize resources with local storage or not
	 * @param {object} [options.expires=1814400 (3 weeks)] The global value for expiration duration
	 * @param {object} [options.dbName=wink] The name of the database (available for sqlDatabase and indexedDatabase)
	 * @param {object} [options.dbTable=resources] The name of the resource table (available for sqlDatabase and indexedDatabase)
	 * @param {object} [options.dbSize=5242880 (5 Mo)] The size of the database in bytes (available for sqlDatabase)
	 * @param {object} [options.key=wink.ressources] The key of the data in localStorage (available for localStorage)
	 */
	cache.load = function(resources, onload, options)
	{
		_initialize();

		var opts = options || {};
		if (opts.expires)
		{
			_expires = opts.expires;
		}
		if (opts.enable !== undefined)
		{
			_enable = opts.enable;
		}
		if (opts.synchronize !== undefined)
		{
			_synchronize = opts.synchronize;
		}
		try
		{
			_storage = new wink.cache[opts.storage](opts);
		} catch (e)
		{
			if (window.openDatabase && window.XMLHttpRequest)
			{
				_storage = new wink.cache.sqlDatabase(opts);
			} else
			{
				_storage = new wink.cache.localStorage(opts);
			}
		}

		var groups = _getResourceGroups(resources);

		var loadCb = function()
		{
			if (_cacheErrors.length > 0)
			{
				_errors = _errors.concat(_cacheErrors);
				_enable = false;
				_cacheErrors = [];
				_chainResourceLoad(groups, 0, loadCb);
			} else
			{
				_cacheProcessEnd(onload);
			}
		};

		_chainResourceLoad(groups, 0, loadCb);
	};

	/**
	 * Deletes the database content
	 * 
	 * @function
	 * @name wink.cache.resetDatabase
	 * 
	 * @param {function} [onreset] A function called once the database is reseted.
	 * @returns {object} p The result parameter passed to the callback function
	 * @returns {integer} p.errors An array of cache system errors
	 */
	cache.resetDatabase = function(onreset)
	{
		_initialize();

		var _onEnd = function()
		{
			_resetProcessEnd(onreset);
		};

		var _dropError = function(message)
		{
			_sqlError(message);
			_onEnd();
		};

		var dropProcess = function()
		{
			_storage.drop(_onEnd, _dropError);
		};
		try
		{
			_connect(dropProcess);
		} catch (e)
		{
			_errors.push("[cache.resetDatabase] Error : " + e.toString());
			_onEnd();
		}
	};

	/**
	 * @param {function} onload Callback
	 */
	var _cacheProcessEnd = function(onload)
	{
		if (onload)
		{
			onload({
				errors : _errors,
				loadErrors : _loadErrors,
				resourcesCleaned : _resourcesCleaned,
				resourcesOldVersion : _resourcesOldVersion,
				useOfLocalDatabase : _enable,
				loadTime : ((new Date().getTime()) - _now)
			});
		}

		_storage.endTransaction();
	};

	/**
	 * @param {function} onreset Callback
	 */
	var _resetProcessEnd = function(onreset)
	{
		if (onreset)
		{
			if (_cacheErrors.length > 0)
			{
				_errors = _errors.concat(_cacheErrors);
			}
			onreset({
				errors : _errors
			});
		}

		_storage.endTransaction();
	};

	/**
	 * 
	 */
	var _initialize = function()
	{
		_now = new Date().getTime();
		_headNode = document.getElementsByTagName('head')[0];
		_cacheErrors = [];
		_errors = [];
		_loadErrors = [];
		_resourcesCleaned = [], _resourcesOldVersion = [], _cleaned = false;
	};

	/**
	 * Iterates on each group
	 * 
	 * 
	 * @param {array} groups The groups
	 * @param {integer} index The current group index
	 * @param {function} callback The Callback
	 */
	var _chainResourceLoad = function(groups, index, callback)
	{
		var l = groups.length;
		while (!groups[index] && index < l)
		{
			index++;
		}
		if (index >= l || _cacheErrors.length > 0)
		{
			callback();
			return;
		}
		var resources = groups[index];
		var cb = function()
		{
			_chainResourceLoad(groups, (++index), callback);
		};
		_loadResources(resources, cb);
	};

	/**
	 * Returns an array of groups of resources
	 * 
	 * @param {array} resources The resources to get
	 */
	var _getResourceGroups = function(resources)
	{
		var groups = [];

		var i, l = resources.length;
		for (i = 0; i < l; i++)
		{
			var r = resources[i];
			var g = r.group;

			if (!g)
			{
				g = 0;
			}

			var group;
			if (groups[g])
			{
				group = groups[g];
			} else
			{
				group = groups[g] = [];
			}
			group.push(r);
		}
		return groups;
	};

	/**
	 * it connects, cleans and loads the given resources
	 * 
	 * @param {array} resources The resources to load
	 * @param {function} callback The callback
	 */
	var _loadResources = function(resources, callback)
	{
		if (_storage.isSupported() && _enable)
		{
			var loadProcessCache = function()
			{
				if (_cacheErrors.length > 0)
				{
					callback();
					return;
				}
				var _loadJob = function()
				{
					_load(resources, callback, true);
				};
				if (!_cleaned)
				{
					_cleaned = true;
					_cleanupCache(_loadJob);
				} else
				{
					_loadJob();
				}
			};

			try {
				_connect(loadProcessCache);
			} catch(e) {
				_notifyCacheError("Connect error: " + e.toString());
				callback();
			}
		} else
		{
			// loadProcessBasic
			_load(resources, callback, false);
		}
	};

	/**
	 * loads the given resources
	 * 
	 * @param {array} resources The resources to load
	 * @param {function} callback The callback
	 * @param {boolean} fromCache Whether to use storage or not
	 */
	var _load = function(resources, callback, fromCache)
	{
		var i, l = resources.length;

		_queueManager.load(l, callback);

		for (i = 0; i < l; i++)
		{
			var r = resources[i];
			var type = r.type;
			var url = r.url;

			if (fromCache)
			{
				var expires = r.expires ? r.expires : _expires;
				var version = r.version ? r.version : 1.0;

				var urlp = _extractURL(url);
				var urlm = urlp.protocol + '//' + urlp.host
						+ (urlp.port != 0 ? ':' + urlp.port : '') + urlp.path
						+ urlp.query + urlp.hash;

				_getCacheResource(urlm, type, version, expires);
			} else
			{
				_loadFile(url, null, type);
			}
		}
	};

	/**
	 * Manages the loading queue and invokes the callback when process is finished
	 */
	var _queueManager = (function()
	{
		var _size = null, _loaded = null, _callback = null;

		var queueManager = {
			load : function(size, callback)
			{
				_callback = callback;
				_size = size;
				_loaded = 0;
			},
			markAsLoaded : function()
			{
				_loaded++;
				if (_loaded == _size)
				{
					_callback();
				}
			}
		};
		return queueManager;
	})();

	/**
	 * Loads the given resource with the url OR the content
	 * 
	 * @param {string} [url] The URL of the resource
	 * @param {string} [content] The content of the resource
	 * @param {string} type The resource type (js, css)
	 */
	var _loadFile = function(url, content, type)
	{
		var cb = function()
		{
			_queueManager.markAsLoaded();
		};
		if (type == 'js')
		{
			_loadJs(url, content, cb);
		} else if (type == 'css')
		{
			_loadCss(url, content, cb);
		}
	};

	/**
	 * Adds a JS resource to the document
	 * 
	 * @param {string} [url] The URL of the resource
	 * @param {string} [content] The content of the resource
	 * @param {function} callback The callback
	 */
	var _loadJs = function(url, content, callback)
	{
		var s = document.createElement('script');
		s.type = 'text/javascript';

		if (url != null)
		{
			s.onload = function()
			{
				s.onload = s.onerror = null;
				callback();
			};
			s.onerror = function()
			{
				s.onload = s.onerror = null;
				_notifyLoadFailure(url);
				callback();
			};
			s.src = url;
			_headNode.appendChild(s);
		} else
		{
			s.textContent = content;
			_headNode.appendChild(s);
			callback();
		}
	};

	/**
	 * Adds a CSS resource to the document
	 * 
	 * @param {string} [url] The URL of the resource
	 * @param {string} [content] The content of the resource
	 * @param {function} callback The callback
	 */
	var _loadCss = function(url, content, callback)
	{
		var l;
		if (url != null)
		{
			l = document.createElement('link');
			l.rel = 'stylesheet';
			l.type = 'text/css';
			l.href = url;
		} else
		{
			l = document.createElement('style');
			l.setAttribute('type', 'text/css');
			var tn = document.createTextNode(content);
			l.appendChild(tn);
		}
		_headNode.appendChild(l);
		callback();
	};

	/**
	 * Initialize the database connection
	 * 
	 * @param {function} callback The callback
	 */
	var _connect = function(callback)
	{
		var _connectError = function(message)
		{
			_sqlError(message);
			callback();
		};
		_storage.open(callback, _connectError);
	};

	/**
	 * This method tries to get the resource from the database. It gets the
	 * resource with an xhr if this is not available and inserts the retrieved
	 * resource in the database. It deletes an expired or obsolete existing
	 * version of the resource.
	 * 
	 * @param {string} url The URL of the resource
	 * @param {string} type The type of the resource
	 * @param {function} version Resource version
	 * @param {function} expires Expires value
	 */
	var _getCacheResource = function(url, type, version, expires)
	{
		var getResource = function()
		{
			var req = new XMLHttpRequest();
			var content;

			req.open('GET', url, false);
			req.send(null);

			if (req.readyState == 4
					&& ((req.status >= 200 && req.status < 400) || req.status == 0))
			{
				content = req.responseText;

				if (type == 'css')
				{
					var urlp = _extractURL(url);
					if (urlp.file != '')
					{
						urlp.path = urlp.path.replace(urlp.file, '');
					}
					content = _adaptCSS(content, urlp);
				}

				var _storeSuccess = function()
				{
					_loadFile(null, content, type);
				};
				var _storeError = function(message)
				{
					_sqlError(message);
					_loadFile(null, '', type);
				};
				_storage.storeResource(url, type, version, expires, content,
						_storeSuccess, _storeError);
			} else
			{
				_notifyLoadFailure(url);
				_queueManager.markAsLoaded();
			}
		};

		var _getItemSuccess = function(item)
		{
			var content;
			var todelete = true;

			if (item == null)
			{
				todelete = false;
			} else
			{
				if (item.version != version)
				{
					_resourcesOldVersion.push(url);
				} else if (expires == -1)
				{
					_resourcesCleaned.push(url);
				} else if (item.expires > _now)
				{
					content = item.data;
				}
			}

			if (content)
			{
				_loadFile(null, content, type);
			} else
			{
				if (todelete)
				{
					_storage.deleteResource(url, getResource, _sqlError);
				} else
				{
					getResource();
				}
			}
		};

		_storage.getItem(url, _getItemSuccess, _sqlError);
	};

	/**
	 * Cleans all expired resources
	 * 
	 * @param {function} callback The callback
	 */
	var _cleanupCache = function(callback)
	{
		var _getExpiredItemsSuccess = function(items)
		{
			var index = -1, l = items.length;
			var _iterable = function()
			{
				index++;
				if (index >= l)
				{
					callback();
					return;
				}
				var item = items[index];
				if (item && item.url)
				{
					_resourcesCleaned.push(item.url);
					_storage.deleteResource(item.url, _iterable, _sqlError);
				}
			};

			_iterable();
		};

		_storage.getExpiredItems(_getExpiredItemsSuccess, _sqlError,
				(_synchronize ? _getUrls() : null));
	};

	/**
	 * Network load failure
	 * 
	 * @param {string} url The url
	 */
	var _notifyLoadFailure = function(url)
	{
		_loadErrors.push(url);
	};

	/**
	 * Cache system error
	 * 
	 * @param {string} error The error
	 */
	var _notifyCacheError = function(error)
	{
		_cacheErrors.push("Cache System Error: " + error);
	};

	/**
	 * @param {string} message The error message
	 */
	var _sqlError = function(message)
	{
		_notifyCacheError(message);
		return true;
	};

	/**
	 * 
	 */
	var _getUrls = function()
	{
		var urls = {};
		
		var i, l = resources.length;
		for (i = 0; i < l; i++)
		{
			var url = resources[i].url;
			var urlp = _extractURL(url);
			var urlm = urlp.protocol + '//' + urlp.host + (urlp.port != 0 ? ':' + urlp.port: '') + urlp.path + urlp.query + urlp.hash;
			urls[urlm] = true;
		}
		
		return urls;
	};
	
	/**
	 * Extracts URL infos
	 * 
	 * @param {string} url The url to extract
	 */
	var _extractURL = function(url)
	{
		var a = document.createElement('a');
		a.href = url;

		return ({
			source : url,
			protocol : a.protocol,
			host : a.hostname,
			port : a.port,
			query : a.search,
			file : (a.pathname.match(/\/([^\/?#]+)$/i) || [ , '' ])[1],
			hash : a.hash,
			path : a.pathname.replace(/^([^\/])/, '/$1')
		});
	};

	/**
	 * Adapts CSS urls
	 * 
	 * @param {string} content The content to adapt
	 * @param {object} url_parts The url parts
	 */
	var _adaptCSS = function(content, url_parts)
	{
		var result = null, sBegin = "url", sBeginL = sBegin.length, sEnd = ")", sEndL = sEnd.length, searched = "../", searchedL = searched.length, urlreg = /(url)( *)(\()( *)('|")?(.*)('|")?( *)(\))/i, urlreplace = url_parts.protocol
				+ "//" + url_parts.host + url_parts.path, p1 = -1, p2 = -1, p3 = -1, offset = -1, url = null, tmp = null, part = null, buffer = [], cursor = 0;

		p1 = content.indexOf(sBegin);

		while (p1 != -1)
		{
			p2 = content.indexOf(sEnd, p1 + sBeginL);
			url = content.substring(p1, p2 + sEndL);
			offset = p1 + sBeginL;

			p3 = url.indexOf(searched);
			if (p3 != -1)
			{
				tmp = url.replace(urlreg, "$1$3" + urlreplace + "$6$9");

				part = content.substring(cursor, p1);
				part += tmp;

				buffer.push(part);
				cursor = (p1 + url.length);
			}
			p1 = content.indexOf(sBegin, offset);
		}

		buffer.push(content.substring(cursor));
		result = buffer.join('');

		return result;
	};

	return cache;

})();

// Bindings
/**
 * @function
 * @see wink.cache.load
 */
wink.load = wink.cache.load;
