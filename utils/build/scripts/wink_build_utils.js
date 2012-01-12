/*--------------------------------------------------------
 * Copyright (c) 2011, The Dojo Foundation
 * This software is distributed under the "Simplified BSD license",
 * the text of which is available at http://www.winktoolkit.org/licence.txt
 * or see the "license.txt" file for more details.
 *--------------------------------------------------------*/

/**
 * CONFIG MANAGER
 */
var config = {
	/**
	 * 
	 */
	defaultKey: "default",
	/**
	 * 
	 */
	moduleConf: null,
	/**
	 * 
	 */
	profileConf: null,
	/**
	 * 
	 */
	fileIdSequence: 0,
	/**
	 * 
	 */
	checkValidity: function() {
		if (_u.isUndefined(conf.MODULE_CONF_FILE)
		 || _u.isUndefined(conf.PROFILES_CONF_FILE)
		 || _u.isUndefined(conf.CONF_PATH)) {
			error("bad conf");
		}
	},
	/**
	 * @return
	 */
	hasOption: function(name) {
		var confoption = conf[name];
		var booleanValue = (!_u.isUndefined(confoption) && confoption == true);
		return booleanValue;
	},
	/**
	 * @return
	 */
	getModuleConf: function() {
		if (config.moduleConf == null) {
			config.moduleConf = _u.evalJson(conf.CONF_PATH + FILE_SEPARATOR + conf.MODULE_CONF_FILE);
		}
		return config.moduleConf;
	},
	/**
	 * @return
	 */
	getProfileConf: function() {
		if (config.profileConf == null) {
			config.profileConf = _u.evalJson(conf.CONF_PATH + FILE_SEPARATOR + conf.PROFILES_CONF_FILE);
		}
		return config.profileConf;
	},
	/**
	 * @param profile
	 * @param target
	 */
	getJsSourcesFiles: function(profile, target) {
		return config._getJsFiles(profile, target, "modules");
	},
	/**
	 * @param profile
	 * @param target
	 */
	getJsDependenciesFiles: function(profile, target) {
		return config._getJsFiles(profile, target, "dependencies");
	},
	/**
	 * @param profile
	 * @param target
	 */
	getCssSourcesFiles: function(profile, target) {
		var sourceFiles = [];
		
		var profiles = config.getProfileConf().profiles;
		var i, l = profiles.length;
		for (i = 0; i < l; i++) {
			var prf = profiles[i];
			if (prf.name == profile) {
				var cssFiles = prf.css;
				if (!_u.isUndefined(cssFiles) && cssFiles.length > 0) {
					sourceFiles = sourceFiles.concat(cssFiles);
				}
				break;
			}
		}
		
		var profileConf = config.getProfileConf();
		var theprofile = config._getProfileByName(profileConf.profiles, profile);
		var currentModules = theprofile.modules;
		
		var modulesPf = config._getProfiledModules(currentModules, target);
		var i, l = modulesPf.length;
		for (i = 0; i < l; i++) {
			var modPf = modulesPf[i];
			
			var moduleList = config.getModuleConf().modules;
			var modulePf = config._getModuleByName(moduleList, modPf);
			
			var cssFiles = modulePf.css;
			if (!_u.isUndefined(modulePf.modules) && !_u.isUndefined(cssFiles) && cssFiles.length > 0) {
				sourceFiles = sourceFiles.concat(cssFiles);
			}
		}
		
		var modulesResolved = config._resolveSubModules(modulesPf);
		if (modulesResolved.length == 0) {
			return [];
		}
		
		sourceFiles = sourceFiles.concat(config._getTargetedCssFiles(modulesResolved, target));
		
		// duplicates management
		var result = [];
		var i, l = sourceFiles.length;
		for (i = 0; i < l; i++) {
			var sourceFilesI = sourceFiles[i];
			if (!_u.contains(result, sourceFilesI)) {
				result.push(sourceFilesI);
			}
		}
		
		return result;
	},
	/**
	 * @return
	 */
	getFinalTargets: function() {
		var targetsExpected = conf.TARGETS;
		var targetsDetected = [ config.defaultKey ];
		var finalTargets = [];
		
		var modules = config.getModuleConf().modules;

		var i, l = modules.length;
		for (i = 0; i < l; i++) {
			var module = modules[i];
			var subImpls = module.subImpls;
			if (!_u.isUndefined(subImpls)) {
				var j, jl = subImpls.length;
				for (j = 0; j < jl; j++) {
					var subImpl = subImpls[j];
					var target = subImpl.target;
					if (_u.isUndefined(target)) {
						error("bad modules conf : expected target for subImpls item");
					}
					if (!_u.contains(targetsDetected, target)) {
						targetsDetected.push(target);
					}
				}
			}
		}
		
		var implementations = config.getProfileConf().implementations;
		if (!_u.isUndefined(implementations)) {
			var i, l = implementations.length;
			for (i = 0; i < l; i++) {
				var impli = implementations[i];
				var subImpls = impli.subImpls;
				if (!_u.isUndefined(subImpls)) {
					var j, jl = subImpls.length;
					for (j = 0; j < jl; j++) {
						var subImpl = subImpls[j];
						var target = subImpl.target;
						if (_u.isUndefined(target)) {
							error("bad profiles conf : expected target for implementations.subImpls item");
						}
						if (!_u.contains(targetsDetected, target)) {
							targetsDetected.push(target);
						}
					}
				}
			}
		}
		
		if (targetsExpected.length == 0) {
			// if no targets list specified, build for all availables targets
			finalTargets = targetsDetected;
		} else {
			var i, l = targetsExpected.length;
			for (i = 0; i < l; i++) {
				var te = targetsExpected[i];
				var j, jl = targetsDetected.length;
				for (j = 0; j < jl; j++) {
					var td = targetsDetected[j];
					if (td == te) {
						finalTargets.push(te);
						break;
					}
				}
			}
		}
		//print("targetsExpected: ", targetsExpected);
		//print("targetsDetected: ", targetsDetected);
		print("working targets: ", finalTargets);
		
		return finalTargets;
	},
	/**
	 * @return
	 */
	getFinalProfiles: function() {
		var profilesExpected = conf.PROFILES;
		var profilesDetected = [];
		var finalProfiles = [];
		
		var confProfiles = config.getProfileConf().profiles;
		if (_u.isUndefined(confProfiles) || confProfiles.length == 0) {
			error("bad profiles conf : must specify at least one profile");
		}
		
		var i, l = confProfiles.length;
		for (i = 0; i < l; i++) {
			var profile = confProfiles[i];
			
			if (_u.isUndefined(profile.name)) {
				error("bad profiles conf : expected name for profiles item");
			}
			
			profilesDetected.push(profile.name);
		}
		
		if (profilesExpected.length == 0) {
			// if no profiles list specified, build for all availables profiles
			finalProfiles = profilesDetected;
		} else {
			var i, l = profilesExpected.length;
			for (i = 0; i < l; i++) {
				var pe = profilesExpected[i];
				var j, jl = profilesDetected.length;
				for (j = 0; j < jl; j++) {
					var pd = profilesDetected[j];
					if (pd == pe) {
						finalProfiles.push(pe);
						break;
					}
				}
			}
		}
		
		//print("profilesExpected: ", profilesExpected);
		//print("profilesDetected: ", profilesDetected);
		print("working profiles: ", finalProfiles);
		
		return finalProfiles;
	},
	/**
	 * @param profile
	 * @param target
	 * @param category
	 */
	_getJsFiles: function(profile, target, category) {
		var profileConf = config.getProfileConf();
		var profileObj = config._getProfileByName(profileConf.profiles, profile);
		var currentModules = profileObj[category];
		if (_u.isUndefined(currentModules) || currentModules.length == 0) {
			return [];
		}
		
		var modulesPf = config._getProfiledModules(currentModules, target);
		var modulesResolved = config._resolveSubModules(modulesPf);
		if (modulesResolved.length == 0) {
			return [];
		}
		var sourceFiles = config._getTargetedJsFiles(modulesResolved, profileObj, target);
		
		// duplicates management
		var result = [];
		var i, l = sourceFiles.length;
		for (i = 0; i < l; i++) {
			var sourceFilesI = sourceFiles[i];
			if (!_u.contains(result, sourceFilesI)) {
				result.push(sourceFilesI);
			}
		}
		
		return result;
	},
	/**
	 * @param modules
	 * @param target
	 * @return
	 */
	_getProfiledModules: function(modules, target) {
		var profiledModules = [];
		var profileConf = config.getProfileConf();
		var impls = profileConf.implementations;
		
		var i, l = modules.length;
		for (i = 0; i < l; i++) {
			var module = modules[i];
			
			var currentImpl = module;
			
			if (!_u.isUndefined(impls)) {
				var j, jl = impls.length;
				for (j = 0; j < jl; j++) {
					var impl = impls[j];
					if (impl.module == module) {
						currentImpl = impl.defaultImpl;
						
						if (_u.isUndefined(currentImpl)) {
							error("bad profiles conf : expected defaultImpl for implementations.subImpls item");
						}
						
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
			
			profiledModules.push(currentImpl);
		}
		return profiledModules;
	},
	/**
	 * @param allmodules
	 * @param moduleName
	 * @param result
	 * @return
	 */
	_resolveSubModule: function(allmodules, moduleName, result) {
		var module = config._getModuleByName(allmodules, moduleName);
		if (module == null) {
			error("bad modules conf : cannot find module named: " + moduleName);
		}
		
		var submodules = module.modules;
		if (!_u.isUndefined(submodules)) {
			var i, l = submodules.length;
			for (i = 0; i < l; i++) {
				var submodule = submodules[i];
				this._resolveSubModule(allmodules, submodule, result);
			}
		} else {
			result.push(moduleName);
		}
	},
	/**
	 * @param modulesPf
	 * @return
	 */
	_resolveSubModules: function(modulesPf) {
		var modulesResolved = [];
		var moduleList = config.getModuleConf().modules;
		
		var i, l = modulesPf.length;
		for (i = 0; i < l; i++) {
			var moduleName = modulesPf[i];

			var sublist = [];
			this._resolveSubModule(moduleList, moduleName, sublist);
			
			var j, jl = sublist.length;
			for (j = 0; j < jl; j++) {
				subj = sublist[j];
				
				// duplicates management
				if (!_u.contains(modulesResolved, subj)) {
					modulesResolved.push(subj);
				}
			}
		}
		return modulesResolved;
	},
	/**
	 * @param moduleList
	 * @param name
	 * @return
	 */
	_getModuleByName: function(moduleList, name) {
		var i, l = moduleList.length;
		for (i = 0; i < l; i++) {
			var module = moduleList[i];
			var moduleName = module.name;
			
			if (moduleName == name) {
				return module;
			}
		}
		return null;
	},
	/**
	 * @param profileList
	 * @param name
	 * @return
	 */
	_getProfileByName: function(profileList, name) {
		var i, l = profileList.length;
		for (i = 0; i < l; i++) {
			var profile = profileList[i];
			var profileName = profile.name;
			
			if (profileName == name) {
				return profile;
			}
		}
		return null;
	},
	/**
	 * @param modulesResolved
	 * @param profileObj
	 * @param target
	 * @return
	 */
	_getTargetedJsFiles: function(modulesResolved, profileObj, target) {
		var targetedFiles = [];
		var moduleList = config.getModuleConf().modules;
		var locales = config._getDetectedLocales(profileObj);
		
		var i, l = modulesResolved.length;
		for (i = 0; i < l; i++) {
			var moduleResolved = modulesResolved[i];
			
			var module = config._getModuleByName(moduleList, moduleResolved);
			if (module == null) {
				error("bad modules conf : cannot find module named: " + moduleResolved);
			}
			
			var defaultImpl = module.defaultImpl;
			if (_u.isUndefined(defaultImpl)) {
				error("bad modules conf : expected defaultImpl for modules item");
			}
			targetedFiles.push(defaultImpl);
			
			var i18nResources = config._getMatchedLocales(module, locales);
			
			var subImpls = module.subImpls;
			
			if (!_u.isUndefined(subImpls)) {
				var k, kl = subImpls.length;
				for (k = 0; k < kl; k++) {
					var subImpl = subImpls[k];
					var tg = subImpl.target;
					if (tg == target) {
						var subI18nResources = config._getMatchedLocales(subImpl, locales);
						if (subImpl.excludeDefault == true) {
							var poped = targetedFiles.pop();
							if (poped != defaultImpl) {
								error("getTargetedFiles : expected pop of defaultImpl " + defaultImpl + ", got : " + poped);
							}
							i18nResources = [];
						}
						targetedFiles.push(subImpl.impl);
						i18nResources = i18nResources.concat(subI18nResources);
						break;
					}
				}
			}
			targetedFiles = targetedFiles.concat(i18nResources);
		}
		return targetedFiles;
	},
	/**
	 * @param profileObj
	 * @return
	 */
	_getDetectedLocales: function(profileObj) {
		var detectedLocales = [];
		var defaultLocaleList = config.getProfileConf().build.defaultLocaleList;
		var localeList = profileObj.localeList;
		
		if (_u.isUndefined(defaultLocaleList) || defaultLocaleList.length == 0) {
			error("bad profiles conf : expected defaultLocaleList in build configuration");
		}
		
		if (!_u.isUndefined(localeList)) {
			if (localeList.length == 0) {
				error("bad profiles conf : profile localeList size must be > 0");
			}
			detectedLocales = localeList;
		} else {
			detectedLocales = defaultLocaleList;
		}
		return detectedLocales;
	},
	/**
	 * @param module
	 * @param locales
	 * @return
	 */
	_getMatchedLocales: function(module, locales) {
		var matchedLocales = [];
		
		if (!_u.isUndefined(module.i18n) && module.i18n.length > 0) {
			var j, jl = module.i18n.length;
			for (j = 0; j < jl; j++) {
				var currentI18n = module.i18n[j];
				
				var m, ml = locales.length;
				for (m = 0; m < ml; m++) {
					var currentLocale = locales[m];
					var i18nResource = currentI18n[currentLocale];
					if (!_u.isUndefined(i18nResource)) {
						matchedLocales.push(i18nResource);
					}
				}
			}
		}
		
		return matchedLocales;
	},
	/**
	 * @param modulesResolved
	 * @param target
	 * @return
	 */
	_getTargetedCssFiles: function(modulesResolved, target) {
		var targetedFiles = [];
		var moduleList = config.getModuleConf().modules;
		
		var i, l = modulesResolved.length;
		for (i = 0; i < l; i++) {
			var moduleResolved = modulesResolved[i];
			
			var module = config._getModuleByName(moduleList, moduleResolved);
			if (module == null) {
				error("bad modules conf : cannot find module named: " + moduleResolved);
			}
			
			var cssFiles = [];
			var subCss = [];
			var includeDefault = true;
			
			var subImpls = module.subImpls;
			if (!_u.isUndefined(subImpls)) {
				var k, kl = subImpls.length;
				for (k = 0; k < kl; k++) {
					var subImpl = subImpls[k];
					var tg = subImpl.target;
					if (tg == target) {
						if (subImpl.excludeDefault == true) {
							includeDefault = false;
						}
						
						var subImplCss = subImpl.css;
						if (!_u.isUndefined(subImplCss)) {
							subCss = subCss.concat(subImplCss);
						}
						break;
					}
				}
			}
			
			if (includeDefault) {
				var defaultCss = module.css;
				if (!_u.isUndefined(defaultCss)) {
					cssFiles = cssFiles.concat(defaultCss);
				}
			}
			cssFiles = cssFiles.concat(subCss);
			
			if (!_u.isUndefined(cssFiles) && cssFiles.length > 0) {
				targetedFiles = targetedFiles.concat(cssFiles);
			}
		}
		return targetedFiles;
	}
};

/**
 * UTILS
 */
var _u = {
	/**
	 * @param o
	 * @return
	 */
	isUndefined: function(o) {
		return (o == undefined);
	},
	/**
	 * @param tab
	 * @param elem
	 * @return
	 */
	contains: function(tab, elem){
		var i, l = tab.length;
		for (i = 0; i < l; i++) {
			if (tab[i] === elem){
				return true;
			}
		}
		return false;
	},
	/**
	 * @param f
	 * @return
	 */
	isReadableFile: function(f) {
		return isReadableFile(f);
	},
	/**
	 * @param filename
	 * @return
	 */
	evalJson: function(filename) {
		//print("evalJson: ", filename);
		
		if (isReadableFile(filename) == false) {
			error("cannot eval invalid json filename '" + filename + "'");
		}
		
		var content = readFile(filename);
		var c;
		eval("c = " + content);
		return c;
	},
	/**
	 * @param profile
	 * @param target
	 * @return
	 */
	getTemporaryDirectory: function(profile, target) {
		var temporaryPath = conf.TEMPORARY_PATH;
		if (_u.isUndefined(temporaryPath)) {
			error("Temporary path parameter expected in conf");
		}
		var temporaryTarget = profile + "-" + target;
		
		var isDir = isDirectory(temporaryPath);
		if (isDir == false) {
			if (!createDirectory(temporaryPath)) {
				error("cannot create temporary directory: " + temporaryPath);
			}
		}
		var tmpDir = temporaryPath + FILE_SEPARATOR + temporaryTarget;
		isDir = isDirectory(tmpDir);
		if (isDir == true) {
			if (!deleteFile(tmpDir)) {
				error("cannot delete temporary directory: " + tmpDir);
			}
		}
		if (!createDirectory(tmpDir)) {
			error("cannot create temporary directory: " + tmpDir);
		}
		return tmpDir;
	},
	/**
	 * @return
	 */
	deleteTemporaryDirectory: function() {
		var temporaryPath = conf.TEMPORARY_PATH;
		if (_u.isUndefined(temporaryPath)) {
			error("Temporary path parameter expected in conf");
		}
		var isDir = isDirectory(temporaryPath);
		if (isDir == true) {
			if (!deleteFile(temporaryPath)) {
				error("cannot delete temporary directory: " + temporaryPath);
			}
		}
	},
	/**
	 * @return
	 */
	getBuildedDirectory: function() {
		var buildedPath = conf.BUILD_DEST_PATH;
		if (_u.isUndefined(buildedPath)) {
			error("Builded path parameter expected in conf");
		}
		
		var isDir = isDirectory(buildedPath);
		if (isDir == false) {
			if (!createDirectory(buildedPath)) {
				error("cannot create builded directory: " + buildedPath);
			}
		}
		
		return buildedPath + FILE_SEPARATOR;
	},
	/**
	 * @param files
	 * @param temporaryDirectory
	 * @return
	 */
	copyFilesInTemporary: function(files, temporaryDirectory) {
		//print("copyFileInTemporary: ", files);
		var destFiles = [];

		var i, l = files.length;
		for (i = 0; i < l; i++) {
			var f = files[i];
			var destFile = copyFile(f, ("" + config.fileIdSequence++), temporaryDirectory);
			destFiles.push(destFile);
		}
		return destFiles;
	},
	/**
	 * @param files
	 * @param dependencies
	 * @return
	 */
	parseSourceFiles: function(files, dependencies) {
		return parseFiles(files, dependencies);
	},
	/**
	 * @param files
	 * @param destFile
	 * @return
	 */
	concatenateFiles: function(files, destFile) {
		concatenateFiles(files, destFile);
	},
	/**
	 * @param destFiles
	 * @return
	 */
	deleteValidateProperties: function(destFiles) {
		deleteValidateProperties(destFiles);
	},
	/**
	 * @param destFiles
	 * @return
	 */
	deleteLogs: function(destFiles) {
		deleteLogs(destFiles);
	},
	/**
	 * @param destFiles
	 * @return
	 */
	applyBadSyntaxFilter: function(destFiles) {
		applyBadSyntaxFilter(destFiles);
	},
	/**
	 * @param sourceFiles
	 * @param destFiles
	 * @param winkPath
	 * @return
	 */
	rewriteImageURL: function(sourceFiles, destFiles, winkPath) {
		rewriteImageURL(sourceFiles, destFiles, winkPath);
	},
	/**
	 * @param profile
	 * @param target
	 * @return
	 */
	buildJsFileName: function(profile, target) {
		var build = config.getProfileConf().build;
		return _u._buildFileName(profile, target, build.jsFile);
	},
	/**
	 * @param profile
	 * @param target
	 * @return
	 */
	buildCssFileName: function(profile, target) {
		var build = config.getProfileConf().build;
		return _u._buildFileName(profile, target, build.cssFile);
	},
	/**
	 * @param profile
	 * @param target
	 * @param filename
	 * @return
	 */
	_buildFileName: function(profile, target, filename) {
		var result = "";
		
		var build = config.getProfileConf().build;
		if (this.isUndefined(build)) {
			error("bad profiles conf : expected build property");
		}
		var version = build.version;
		
		if (this.isUndefined(filename) || this.isUndefined(version)) {
			error("bad profiles conf : expected build.filename and build.version property");
		}
		var filenameR = filename.replace(/VERSION/g, version);
		filenameR = filenameR.replace(/PROFILE/g, profile);
		filenameR = filenameR.replace(/TARGET/g, target);
		
		result = filenameR;

		return result;
	}
};
