/*--------------------------------------------------------
 * Copyright (c) 2011, The Dojo Foundation
 * This software is distributed under the "Simplified BSD license",
 * the text of which is available at http://www.winktoolkit.org/licence.txt
 * or see the "license.txt" file for more details.
 *--------------------------------------------------------*/

/**
 * 
 */
package com.orange.wink.util;

import java.io.BufferedInputStream;
import java.io.File;
import java.io.FileInputStream;
import java.io.IOException;

import org.mozilla.intl.chardet.nsDetector;

/**
 * @author Sylvain Lalande
 * 
 */
public class FileUtil {
	/**
	 * @param filename
	 * @return
	 */
	public static boolean isReadableFile(final String filename) {
		// System.out.println("isReadableFile: " + filename);
		final File f = new File(filename);
		if (f.exists() && f.isFile() && f.canRead()) {
			return true;
		}
		return false;
	}

	/**
	 * @param dirname
	 * @return
	 */
	public static boolean isDirectory(final String dirname) {
		// System.out.println("isDirectory: " + dirname);
		final File f = new File(dirname);
		if (f.exists() && f.isDirectory() && f.canWrite()) {
			return true;
		}
		return false;
	}

	/**
	 * @param dirname
	 * @param parent
	 * @return
	 * @throws IOException
	 */
	public static boolean createDirectory(final String dirname, final String parent) throws IOException {
		// System.out.println("createDirectory: " + dirname + " in " + parent);
		final File f = new File(parent, dirname);
		final boolean result = f.mkdir();
		return result;
	}

	/**
	 * @param dirname
	 * @return
	 */
	public static boolean deleteFile(final String dirname) {
		// System.out.println("deleteFile: " + dirname);
		final File f = new File(dirname);
		if (f.exists()) {
			return deleteR(f);
		}
		return false;
	}

	/**
	 * @param path
	 * @return
	 */
	private static boolean deleteR(final File path) {
		if (path.exists()) {
			final File[] files = path.listFiles();
			for (int i = 0; i < files.length; i++) {
				if (files[i].isDirectory()) {
					deleteR(files[i]);
				} else {
					final boolean isFileDeleted = files[i].delete();
					if (!isFileDeleted) {
						return false;
					}
				}
			}
		}
		final boolean isDeleted = path.delete();
		return isDeleted;
	}

	/**
	 * @param filename
	 * @return
	 * @throws IOException
	 */
	public static String getEncoding(final String filename) throws IOException {
		// System.out.println("getEncoding: " + filename);
		final nsDetector det = new nsDetector();

		final BufferedInputStream imp = new BufferedInputStream(new FileInputStream(filename));

		final byte[] buf = new byte[1024];
		int len;
		boolean done = false;
		boolean isAscii = true;

		while ((len = imp.read(buf, 0, buf.length)) != -1) {
			// Check if the stream is only ascii.
			if (isAscii) {
				isAscii = det.isAscii(buf, len);
			}

			// DoIt if non-ascii and not done yet.
			if (!isAscii && !done) {
				done = det.DoIt(buf, len, false);
			}
		}
		det.DataEnd();

		if (isAscii) {
			return "ASCII";
		} else {
			final String prob[] = det.getProbableCharsets();
			if (prob.length == 0) {
				throw new IllegalStateException("cannot determine file encoding for : " + filename);
			}

			for (int i = 0; i < prob.length; i++) {
				// System.out.println("Probable Charset = " + prob[i]);
				if (prob[i].equals("windows-1252") || prob[i].equals("UTF-8")) {
					return prob[i];
				}
			}
			return prob[0];
		}
	}
}
