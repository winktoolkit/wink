/*--------------------------------------------------------
 * Copyright (c) 2011, The Dojo Foundation
 * This software is distributed under the "Simplified BSD license",
 * the text of which is available at http://www.winktoolkit.org/licence.txt
 * or see the "license.txt" file for more details.
 *--------------------------------------------------------*/

/*
 * 
 */
var winkloader = (function() {
	var _conf = {
		buildPath: "",
		version: "",
		profile: "default",
		target: null,
		ismin: true,
		callback: null
	};
	
	var _winkloader = {
		conf: _conf,
		/*
		 * @param params { moduleConf, profileConf, profile, target }
		 */
		load: function(params) {
			_init(params);
			_getRequirements();
			
		},
		setMethods: function(addScript) {
			_addScript = addScript;
			delete this.setMethods;
		}
	};
	
	var _head, _addScript;
		
	/*
	 * @param params
	 */
	var _init = function(params) {
		var bp = params.buildPath;
		if (bp) {
			_conf.buildPath = bp;
		}
		var cb = params.callback;
		if (cb) {
			_conf.callback = cb;
		}
		
		var vs = params.version;
		if (vs) {
			_conf.version = vs;
		}
		var pf = params.profile;
		if (pf) {
			_conf.profile = pf;
		}
		var tg = params.target;
		if (tg) {
			_conf.target = tg;
		}
		var im = params.ismin;
		if (im === false) {
			_conf.ismin = im;
		}

		_head = document.getElementsByTagName('head')[0];
	};
	/*
	 * @param params
	 * @return
	 */
	var buildFileName = function(params) {
		var version = params.version,
			profile = params.profile,
			target = params.target,
			ismin = params.ismin;
		
		var fnt = [ "wink", version, profile, target ];
		var ext = (ismin ? ".min" : "") + ".js";
		var filename = fnt.join("-") + ext;
		return filename;
	};
	/*
	 * 
	 */
	var _getRequirements = function() {
		if (_conf.target == null) {
			_conf.target = _winkloader.detectTarget();
		}
		
		var filename = buildFileName(_conf);
		var url = _conf.buildPath + filename;
		
		var handler = {
			ok: function() {
				if (_conf.callback != null) {
					_conf.callback();
				}
			},
			ko: function() {
				throw new Error("Cannot load url: '" + url + "'");
			}
		};
		_addScript(_head, url, handler.ok, handler.ko);
	};
	return _winkloader;
})();