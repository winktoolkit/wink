/*--------------------------------------------------------
 * Copyright (c) 2011, The Dojo Foundation
 * This software is distributed under the "Simplified BSD license",
 * the text of which is available at http://www.winktoolkit.org/licence.txt
 * or see the "license.txt" file for more details.
 *--------------------------------------------------------*/

/**
 * 
 */
package com.orange.wink.test;

import java.io.File;
import java.io.IOException;

import com.orange.wink.Main;
import com.orange.wink.exception.WinkParseException;
import com.orange.wink.util.FileManager;

/**
 * @author Sylvain Lalande
 * 
 */
public class BuildCssTest extends BuildAbstractTest {
	/**
	 * @param args
	 */
	public static void main(final String[] args) throws Exception {
		final String rootTmpPath = "../wink/utils/build/test/tmp/";
		final String tmpPath = rootTmpPath + "css";
		final String rootBuildPath = "../wink/utils/build/test/builded/";
		final String buildPath = rootBuildPath + "css";

		final String[] arguments = new String[] {
		// 
				"-JS_PATH=../wink/utils/build/scripts",
				// 
				"-JS_MAIN_FILE=buildCss.js",
				// 
				"-CONF_PATH=../wink/utils/build/test/conf",
				// 
				"-MODULE_CONF_FILE=modules.json",
				// 
				"-PROFILES_CONF_FILE=profiles.json",
				// 
				"-WINK_PATH=../wink/utils/build/test/modules",
				// 
				"-TEMPORARY_PATH=" + tmpPath,
				// 
				"-BUILD_DEST_PATH=" + buildPath,
				// default, ie, android-1.5
				"-TARGETS=",
				// default, light
				"-PROFILES=",
				// 
				"-OPTION_CLEAN_TEMPORARY=false",
				//
				"-OPTION_REWRITE_IMAGE_URL=true",
				//
				"-OPTION_FROM_WINK_PATH=true",
				//
				"-OPTION_RELATIVE_PATH=../../wink" };

		createDirectory(rootTmpPath);
		createDirectory(rootBuildPath);

		Main.main(arguments);

		checkBuildFiles(buildPath);
		checkRewriteImageUrl(buildPath);

		printTestResults();
	}

	/**
	 * @param buildPath
	 * @throws WinkParseException
	 * @throws IOException
	 */
	private static void checkBuildFiles(final String buildPath) throws WinkParseException, IOException {
		final File[] files = getFiles(buildPath);
		for (final File f : files) {
			final String filePath = f.getCanonicalPath();
			out("------- CHECK ------- " + filePath);

			final String source = FileManager.getFileContent(filePath);

			if (filePath.contains("light")) {
				assertTrue(source.indexOf("global") == -1, "Unexpected global in " + filePath);
				assertTrue(source.indexOf("module4") == -1, "Unexpected module4 in " + filePath);
				assertFalse(source.indexOf("module1") == -1, "Expected module1 in " + filePath);
			} else {
				assertFalse(source.indexOf("global") == -1, "Expected global in " + filePath);
				assertFalse(source.indexOf("module4") == -1, "Expected module4 in " + filePath);
				assertFalse(source.indexOf("module1") == -1, "Expected module1 in " + filePath);

				if (filePath.contains("ie")) {
					assertTrue(source.indexOf("color: blue") == -1, "Unexpected color: blue in " + filePath);
					assertFalse(source.indexOf("color: yellow") == -1, "Expected color: yellow in " + filePath);
				} else {
					assertTrue(source.indexOf("color: yellow") == -1, "Unexpected color: yellow in " + filePath);
					assertFalse(source.indexOf("color: blue") == -1, "Expected color: blue in " + filePath);
				}
			}
		}
	}

	/**
	 * @param buildPath
	 * @throws WinkParseException
	 * @throws IOException
	 */
	private static void checkRewriteImageUrl(final String buildPath) throws WinkParseException, IOException {
		final File[] files = getFiles(buildPath);
		for (final File f : files) {
			final String filePath = f.getCanonicalPath();
			out("------- CHECK REWRITE IMAGE URL ------- " + filePath);

			final String source = FileManager.getFileContent(filePath);

			assertFalse(source.indexOf("background:transparent url(data:image/png;base64,iV") == -1, "Expected no rewrite for image data in " + filePath);
			assertFalse(source.indexOf("background-image: url(../../wink/img/image.png)") == -1, "Expected good rewrite in " + filePath);
			assertFalse(source.indexOf("background-image: url(http://www.google.fr)") == -1, "Expected no rewrite for absolute image link in " + filePath);
		}
	}
}
