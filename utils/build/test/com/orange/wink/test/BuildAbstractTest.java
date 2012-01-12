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

/**
 * @author Sylvain Lalande
 * 
 */
public abstract class BuildAbstractTest {
	/**
	 * 
	 */
	private static int errorCount = 0;
	/**
	 * 
	 */
	private static int successCount = 0;

	/**
	 * @param condition
	 * @param message
	 */
	protected static void assertTrue(final boolean condition, final String message) {
		if (!condition) {
			err(message);
			errorCount++;
		} else {
			successCount++;
		}
	}

	/**
	 * @param condition
	 * @param message
	 */
	protected static void assertFalse(final boolean condition, final String message) {
		assertTrue(!condition, message);
	}

	/**
	 * 
	 */
	protected static void printTestResults() {
		final StringBuffer result = new StringBuffer();
		result.append("Test Results : ");
		result.append((successCount + errorCount)).append(" Tests");
		result.append(", ");
		result.append(successCount).append(" OK");
		result.append(", ");
		result.append(errorCount).append(" KO");

		if (errorCount == 0) {
			out(result);
		} else {
			err(result);
		}
	}

	/**
	 * @param o
	 */
	protected static void err(final Object o) {
		System.out.flush();
		System.err.flush();
		System.err.println(o);
	}

	/**
	 * @param o
	 */
	protected static void out(final Object o) {
		System.out.flush();
		System.err.flush();
		System.out.println(o);
	}

	/**
	 * @param directory
	 * @return
	 */
	protected static File[] getFiles(final String directory) {
		File[] result = null;
		final File path = new File(directory);
		if (path.exists()) {
			result = path.listFiles();
		}
		return result;
	}

	/**
	 * @param directory
	 */
	protected static void createDirectory(final String directory) {
		final File dir = new File(directory);
		if (dir.exists()) {
			return;
		}
		dir.mkdir();
	}
}
