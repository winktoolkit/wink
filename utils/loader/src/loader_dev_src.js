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
		winkPath: "",
		moduleConf: null,
		profileConf: null,
		moduleFile: null,
		profileFile: null,
		profile: "default",
		target: null,
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
			var modules = _getProfiledModules(_conf.profile, _conf.target);
			var modulesResolved = _resolveSubModules(modules);
			var files = _getTargetedFiles(modulesResolved, _conf.profile, _conf.target);
			_queueManager.load(files, _conf.callback);
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
		var mc = params.moduleConf;
		var pc = params.profileConf;
		if (!mc || !pc) {
			throw new Error("missing parameter");
		}
		
		var wp = params.winkPath;
		if (wp) {
			_conf.winkPath = wp;
		}
		var cb = params.callback;
		if (cb) {
			_conf.callback = cb;
		}
		
		var pf = params.profile;
		if (pf) {
			_conf.profile = pf;
		}
		var tg = params.target;
		if (tg) {
			_conf.target = tg;
		}
		
		_conf.moduleFile = params.moduleConf;
		_conf.profileFile = params.profileConf;
		
		_head = document.getElementsByTagName('head')[0];
	};
	/*
	 * 
	 */
	var _getRequirements = function() {
		if (_conf.target == null) {
			_conf.target = _winkloader.detectTarget();
		}
		if (_conf.moduleConf == null) {
			_conf.moduleConf = _evalJson(_conf.moduleFile);
		}
		if (_conf.profileConf == null) {
			_conf.profileConf = _evalJson(_conf.profileFile);
		}
	};
	/*
	 * @param profile
	 * @param target
	 * @return
	 */
	var _getProfiledModules = function(profile, target) {
		var pm = [];
		var pc = _conf.profileConf;
		var impls = pc.implementations;
		
		var profileObj = _getProfileByName(pc.profiles, profile);
		var modules = profileObj.modules;
		
		var i, l = modules.length;
		for (i = 0; i < l; i++) {
			var module = modules[i];
			
			var currentImpl = module;
			
			if (impls) {
				var j, jl = impls.length;
				for (j = 0; j < jl; j++) {
					var impl = impls[j];
					if (impl.module == module) {
						currentImpl = impl.defaultImpl;
						
						var subImpls = impl.subImpls;
						var k, kl = subImpls.length;
						for (k = 0; k < kl; k++) {
							var subImpl = subImpls[k];
							var tg = subImpl.target;
							if (tg == target) {
								currentImpl = subImpl.impl;
							}
						}
						break;
					}
				}
			}
			pm.push(currentImpl);
		}
		
		return pm;
	};
	/*
	 * @param allmodules
	 * @param moduleName
	 * @param result
	 * @return
	 */
	var _resolveSubModule = function(allmodules, moduleName, result) {
		var module = _getModuleByName(allmodules, moduleName);
		var submodules = module.modules;
		if (submodules) {
			var i, l = submodules.length;
			for (i = 0; i < l; i++) {
				var submodule = submodules[i];
				_resolveSubModule(allmodules, submodule, result);
			}
		} else {
			result.push(moduleName);
		}
	};
	/*
	 * @param modulesPf
	 * @return
	 */
	var _resolveSubModules = function(modulesPf) {
		var modulesResolved = [];
		var moduleList = _conf.moduleConf.modules;
		
		var i, l = modulesPf.length;
		for (i = 0; i < l; i++) {
			var moduleName = modulesPf[i];

			var sublist = [];
			_resolveSubModule(moduleList, moduleName, sublist);
			
			var j, jl = sublist.length;
			for (j = 0; j < jl; j++) {
				subj = sublist[j];
				
				var alreadyTaken = false;
				var k, kl = modulesResolved.length;
				for (k = 0; k < kl; k++) {
					if (modulesResolved[k] == subj) {
						alreadyTaken = true;
						break;
					}
				}
				if (!alreadyTaken) {
					modulesResolved.push(subj);
				}
			}
		}
		return modulesResolved;
	};
	/*
	 * @param modules
	 * @param profile
	 * @param target
	 * @return
	 */
	var _getTargetedFiles = function(modules, profile, target) {
		var tfiles = [];
		var moduleList = _conf.moduleConf.modules;
		var relPath = _conf.winkPath;
		
		var profileObj = _getProfileByName(_conf.profileConf.profiles, profile);
		var locales = _getDetectedLocales(profileObj);
		
		var i, l = modules.length;
		for (i = 0; i < l; i++) {
			var modulePf = modules[i];
			
			var module = _getModuleByName(moduleList, modulePf);
			var defaultImpl = module.defaultImpl;
			tfiles.push(relPath + defaultImpl);
			
			var i18nResources = _getMatchedLocales(module, locales);
			
			var subImpls = module.subImpls;
			
			if (subImpls) {
				var k, kl = subImpls.length;
				for (k = 0; k < kl; k++) {
					var subImpl = subImpls[k];
					var tg = subImpl.target;
					if (tg == target) {
						var subI18nResources = _getMatchedLocales(subImpl, locales);
						if (subImpl.excludeDefault == true) {
							tfiles.pop();
							i18nResources = [];
						}
						tfiles.push(relPath + subImpl.impl);
						i18nResources = i18nResources.concat(subI18nResources);
						break;
					}
				}
			}
			tfiles = tfiles.concat(i18nResources);
		}
		return tfiles;
	};
	/*
	 * @param profileObj
	 * @return
	 */
	var _getDetectedLocales = function(profileObj) {
		var detectedLocales = [];
		var defaultLocaleList = _conf.profileConf.build.defaultLocaleList;
		var localeList = profileObj.localeList;
		
		if (localeList && localeList.length > 0) {
			detectedLocales = localeList;
		} else {
			detectedLocales = defaultLocaleList;
		}
		
		return detectedLocales;
	};
	/*
	 * @param module
	 * @param locales
	 * @return
	 */
	var _getMatchedLocales = function(module, locales) {
		var matchedLocales = [];
		var relPath = _conf.winkPath;
		
		if (module.i18n && module.i18n.length > 0) {
			var j, jl = module.i18n.length;
			for (j = 0; j < jl; j++) {
				var currentI18n = module.i18n[j];
				
				var m, ml = locales.length;
				for (m = 0; m < ml; m++) {
					var currentLocale = locales[m];
					var i18nResource = currentI18n[currentLocale];
					if (i18nResource) {
						matchedLocales.push(relPath + i18nResource);
					}
				}
			}
		}
		
		return matchedLocales;
	};
	/*
	 * @param profileList
	 * @param name
	 * @return
	 */
	var _getProfileByName = function(profileList, name) {
		var i, l = profileList.length;
		for (i = 0; i < l; i++) {
			var profile = profileList[i];
			var profileName = profile.name;
			
			if (profileName == name) {
				return profile;
			}
		}
		return null;
	};
	/*
	 * @param moduleList
	 * @param name
	 * @return
	 */
	var _getModuleByName = function(moduleList, name) {
		var i, l = moduleList.length;
		for (i = 0; i < l; i++) {
			var module = moduleList[i];
			var moduleName = module.name;
			
			if (moduleName == name) {
				return module;
			}
		}
		return null;
	};
	
	/*
	 * 
	 */
	var _queueManager = (function() {
		var _qm = {
			/*
			 * 
			 */
			load: function(files, callback) {
				_files = files;
				_callback = callback;
				_index = -1;
				_errorCount = 0;
				_next();
			},
			/*
			 * 
			 */
			markAsLoaded: function() {
				_next();
			},
			/*
			 * 
			 */
			markAsError: function() {
				_errorCount++;
				markAsLoaded();
			}
		};
		
		var _files = null;
		var _index = null;
		var _callback = null;
		var _errorCount = null;
		
		var _next = function() {
			_index++;
			
			if (_index == _files.length) {
				if (_errorCount > 0) {
					throw new Error("Some files cannot be loaded (" + _errorCount + ")");
				}
				if (_callback != null) {
					_callback();
				}
			}
			
			if (_index >= _files.length) {
				return;
			}
			var url = _files[_index];
			_addScript(_head, url, _qm.markAsLoaded, _qm.markAsError);
		};
		
		return _qm;
	})();
	
	/*
	 * @param filename
	 * @return
	 */
	var _evalJson = function(filename) {
		var ct = _getUrlContent(filename);
		eval("var c = " + ct);
		return c;
	};
	/*
	 * @param url
	 * @return
	 */
	var _getUrlContent = function(url) {
		var ct = null;
		var xhr = _getXhr();
		xhr.open("GET", url, false);
		xhr.send(null);

		if (xhr.readyState == 4) {
			if (((xhr.status >= 200 && xhr.status < 400) || xhr.status == 0)) {
				ct = xhr.responseText;
			} else {
				throw new Error("unable to retrieve url '" + url + "' : " + xhr.statusText);
			}
		}
		return ct;
	};
	/*
	 * @return
	 */
	var _getXhr = function() {
		var xhr = null;
		var lastError = "";
		
		if (typeof XMLHttpRequest !== "undefined") {
			xhr = new XMLHttpRequest();
		}
		if (!xhr) {
			var axl = [ 'Msxml2.XMLHTTP', 'Microsoft.XMLHTTP', 'Msxml2.XMLHTTP.4.0' ];
			var i, l = axl.length;
			for (i = 0; i < l; i++) {
				var axi = axl[i];

				try {
					xhr = new ActiveXObject(axi);
					break;
				} catch(e) {
					lastError = e;
				}
			}
		}
		if (!xhr) {
			throw new Error("_getXhr - XMLHttpRequest not available : " + lastError);
		}
		return xhr;
	};
	return _winkloader;
})();
