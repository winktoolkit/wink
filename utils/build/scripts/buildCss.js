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
	print("build CSS Process ...");
	
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
			var sourceFiles = config.getCssSourcesFiles(profile, target);
			if (sourceFiles.length == 0) {
				print("WARN - no CSS sources files included in this build context [" + profile + ", " + target + "]");
				continue;
			}
			
			// Build File
			cssbuilder.buildFile(profile, target, sourceFiles);
		}
	}
	
	if (config.hasOption("OPTION_CLEAN_TEMPORARY")) {
		_u.deleteTemporaryDirectory();
	}
	
	print("build CSS Process finished");
};

/**
 * CSS BUILD MANAGER
 */
var cssbuilder = {
	/** 
	 * @param profile
	 * @param target
	 * @param sourceFiles
	 * @return
	 */
	buildFile: function(profile, target, sourceFiles) {
		print("buildFile[profile="+ profile +", target="+ target +"]");
		// print("files for("+ profile +", "+ target +"): ", sourceFiles);
		
		var files = [];
		var i, l = sourceFiles.length;
		for (i = 0; i < l; i++) {
			var sf = sourceFiles[i];
			files.push(winkPath + sf);
		}
		
		var tmpDir = _u.getTemporaryDirectory(profile, target);
		var destFiles = _u.copyFilesInTemporary(files, tmpDir);
		
		if (config.hasOption("OPTION_REWRITE_IMAGE_URL")) {
			_u.rewriteImageURL(files, destFiles, winkPath);
		}
		
		var destfilename = _u.buildCssFileName(profile, target);
		var destdir = _u.getBuildedDirectory();
		_u.concatenateFiles(destFiles, (destdir + destfilename));
	}
};

buildProcess();