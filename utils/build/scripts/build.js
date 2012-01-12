/*--------------------------------------------------------
 * Copyright (c) 2011, The Dojo Foundation
 * This software is distributed under the "Simplified BSD license",
 * the text of which is available at http://www.winktoolkit.org/licence.txt
 * or see the "license.txt" file for more details.
 *--------------------------------------------------------*/

/**
 * 
 */
var conf = conf || {};
var winkPath = conf.WINK_PATH + FILE_SEPARATOR;
var jsPath = conf.JS_PATH + FILE_SEPARATOR;
load(jsPath + "wink_build_utils.js");
config.checkValidity();

/**
 * 
 */
var buildProcess = function() {
	print("build JS Process ...");

	// Identify targets
	var targets = config.getFinalTargets();
	
	// Identify profiles
	var profiles = config.getFinalProfiles();
	
	var i, l = profiles.length;
	for (i = 0; i < l; i++) {
		var profile = profiles[i];
		
		var j, jl = targets.length;
		for (j = 0; j < jl; j++) {
			var target = targets[j];
			
			// Identify Files
			var sourceFiles = config.getJsSourcesFiles(profile, target);
			if (sourceFiles.length == 0) {
				print("WARN - no JS sources files included in this build context [" + profile + ", " + target + "]");
				continue;
			}
			
			var dependenciesFiles = config.getJsDependenciesFiles(profile, target);
			
			// Build File
			jsbuilder.buildFile(profile, target, sourceFiles, dependenciesFiles);
		}
	}
	
	if (config.hasOption("OPTION_CLEAN_TEMPORARY")) {
		_u.deleteTemporaryDirectory();
	}
	
	print("build JS Process finished");
};

/**
 * JS BUILD MANAGER
 */
var jsbuilder = {
	/** 
	 * @param profile
	 * @param target
	 * @param sourceFiles
	 * @param dependenciesFiles
	 * @return
	 */
	buildFile: function(profile, target, sourceFiles, dependenciesFiles) {
		print("buildFile[profile="+ profile +", target="+ target +"]");
		// print("files for("+ profile +", "+ target +"): ", sourceFiles);
		
		var sfiles = [];
		var i, l = sourceFiles.length;
		for (i = 0; i < l; i++) {
			var sf = sourceFiles[i];
			sfiles.push(winkPath + sf);
		}
		
		var efiles = [];
		var i, l = dependenciesFiles.length;
		for (i = 0; i < l; i++) {
			var ef = dependenciesFiles[i];
			efiles.push(winkPath + ef);
		}
		
		var tmpDir = _u.getTemporaryDirectory(profile, target);
		var destFiles = _u.copyFilesInTemporary(sfiles, tmpDir);
		var destDependenciesFiles = _u.copyFilesInTemporary(efiles, tmpDir);
		
		if (config.hasOption("OPTION_FILTER_FEATURE")) {
			jsbuilder._filterFeature(profile, target, destFiles);
		}
		
		if (config.hasOption("OPTION_DELETE_VALIDATE_PROPERTIES")) {
			_u.deleteValidateProperties(destFiles);
		}
		
		if (config.hasOption("OPTION_DELETE_LOGS")) {
			_u.deleteLogs(destFiles);
		}
		
		jsbuilder._cleanDuplicates(destFiles, destDependenciesFiles);
		
		_u.applyBadSyntaxFilter(destFiles);
		
		var destfilename = _u.buildJsFileName(profile, target);
		var destdir = _u.getBuildedDirectory();
		_u.concatenateFiles(destFiles, (destdir + destfilename));
	},
	/**
	 * @param files
	 * @param dependencies
	 * @return
	 */
	_cleanDuplicates: function(files, dependencies) {
		var jsModel = _u.parseSourceFiles(files, dependencies);
		
		if (config.hasOption("OPTION_PRINT_MODEL")) {
			print(" ");
			print("--- ABSTRACT MODEL ---");
			jsModel.print();
		}
		
		if (_u.isUndefined(jsModel)) {
			error("jsModel is undefined");
		}
		
		var duplicates = jsModel.getDuplicates();
		
		var debugExtension = config.hasOption("OPTION_PRINT_EXTENSIONS");
		
		var i, l = duplicates.length;
		if (debugExtension && l > 0) {
			print(" ");
			print("--- Code Extensions ---");
		}
		
		for (i = 0; i < l; i++) {
			var dup = duplicates[i];
			
			if (debugExtension) {
				print(jsModel.getDeclarationsList(dup));
			}
			if (config.hasOption("OPTION_DELETE_DUPLICATES")) {
				jsModel.deleteDuplicate(dup);
			}
		}
		
		if (debugExtension && l > 0) {
			print("-----------------------");
			print(" ");
		}
	},
	/**
	 * @param profile
	 * @param target
	 * @param files
	 * @return
	 */
	_filterFeature: function(profile, target, files) {
		// print("filterFeature[profile="+ profile +", target="+ target +"]");
		
		var features = config.getProfileConf().features;
		if (_u.isUndefined(features)) {
			return;
		}
		
		var toResolve = {};
		
		var i, l = features.length;
		for (i = 0; i < l; i++) {
			var feature = features[i];
			var featProfiles = feature.profiles;
			var featTargets = feature.targets;
			
			var matchContext = false;
			var matchProfile = false;
			var matchTarget = false;
			
			if (_u.isUndefined(featProfiles)) {
				matchProfile = true;
			} else {
				var j, jl = featProfiles.length;
				for (j = 0; j < jl; j++) {
					if (featProfiles[j] == profile) {
						matchProfile = true;
						break;
					}
				}
			}
			
			if (_u.isUndefined(featTargets)) {
				matchTarget = true;
			} else {
				var j, jl = featTargets.length;
				for (j = 0; j < jl; j++) {
					if (featTargets[j] == target) {
						matchTarget = true;
						break;
					}
				}
			}
			
			matchContext = matchProfile && matchTarget;
			// print("feature["+ feature.name +"] match : ", matchContext);
			if (matchContext) {
				toResolve[feature.name] = feature.value;
			}
		}
		
		applyFilterFeature(toResolve, files);
	}
};

buildProcess();