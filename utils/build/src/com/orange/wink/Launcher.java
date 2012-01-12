/*--------------------------------------------------------
 * Copyright (c) 2011, The Dojo Foundation
 * This software is distributed under the "Simplified BSD license",
 * the text of which is available at http://www.winktoolkit.org/licence.txt
 * or see the "license.txt" file for more details.
 *--------------------------------------------------------*/

/**
 * 
 */
package com.orange.wink;

import java.io.File;

/**
 * @author Sylvain Lalande
 * 
 */
public class Launcher {
	/**
	 * @param args
	 */
	public static void main(final String[] args) throws Exception {
		final String rootBuildPath = "../wink/utils/build/wink/";
		final String tmpPath = rootBuildPath + "tmpjs";
		final String buildPath = rootBuildPath + "js";

		final String[] arguments = new String[] {
		//
				"-JS_PATH=../wink/utils/build/scripts",
				//
				"-JS_MAIN_FILE=build.js",
				//
				"-CONF_PATH=../wink/utils/build/conf",
				//
				"-MODULE_CONF_FILE=modules.json",
				//
				"-PROFILES_CONF_FILE=profiles.json",
				//
				"-WINK_PATH=../wink",
				//
				"-TEMPORARY_PATH=" + tmpPath,
				//
				"-BUILD_DEST_PATH=" + buildPath,
				//
				"-TARGETS=",
				//
				"-PROFILES=",
				//
				"-OPTION_CLEAN_TEMPORARY=true",
				//
				"-OPTION_DELETE_DUPLICATES=true",
				//
				"-OPTION_FILTER_FEATURE=true",
				//
				"-OPTION_PRINT_EXTENSIONS=true",
				//
				"-OPTION_PRINT_MODEL=false",
				// 
				"-OPTION_FAIL_ON_UNMANAGED_SYNTAX=true",
				// 
				"-OPTION_WARN_ON_UNMANAGED_SYNTAX=false",
				// 
				"-OPTION_FAIL_ON_UNRESOLVED_NAMESPACE=false",
				// 
				"-OPTION_DELETE_VALIDATE_PROPERTIES=true" };

		new File(rootBuildPath).mkdir();
		new File(tmpPath).mkdir();

		Main.main(arguments);
	}
}
