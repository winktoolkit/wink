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

import java.io.BufferedReader;
import java.io.File;
import java.io.FileInputStream;
import java.io.FileNotFoundException;
import java.io.FileOutputStream;
import java.io.IOException;
import java.io.InputStreamReader;
import java.io.OutputStreamWriter;
import java.io.Reader;
import java.io.StringReader;
import java.nio.charset.Charset;
import java.util.ArrayList;
import java.util.List;

/**
 * @author Sylvain Lalande
 * 
 */
public class FileManager {
	/**
	 * 
	 */
	private static final String OUTPUT_ENCODING = "UTF-8";
	/**
	 * 
	 */
	public static final String DEFAULT_LF = "\n";
	/**
	 * 
	 */
	private static List<FileObject> files = new ArrayList<FileObject>();

	/**
	 * @param filename
	 * @return
	 * @throws IOException
	 */
	public static FileObject getFileObject(final String filename) throws IOException {
		final String filenamec = new File(filename).getCanonicalPath();
		for (final FileObject fo : files) {
			if (fo.getFilename().equals(filenamec)) {
				return fo;
			}
		}
		return null;
	}

	/**
	 * @param filename
	 */
	private static void removeFileObject(final String filename) {
		for (final FileObject fo : files) {
			if (fo.getFilename().equals(filename)) {
				files.remove(fo);
				break;
			}
		}
	}

	/**
	 * @param filename
	 * @return
	 */
	public static String getFileContent(final String filename) throws IOException {
		return getBufferedFileContent(filename).toString();
	}

	/**
	 * @param filename
	 * @return
	 */
	private static StringBuffer getBufferedFileContent(final String filename) throws IOException {
		FileObject fo = getFileObject(filename);
		if (fo == null) {
			fo = new FileObject(new File(filename).getCanonicalPath());
			files.add(fo);
		}
		if (fo.getContent() == null) {
			fo.setEncoding(FileUtil.getEncoding(fo.getFilename()));
			fo.setContent(getBufferedFileContent(fo.getFilename(), fo.getEncoding()));
		}
		return fo.getContent();
	}

	/**
	 * @param fin
	 * @param fout
	 * @throws FileNotFoundException
	 * @throws IOException
	 */
	public static void copyFile(final File fin, final File fout) throws IOException {
		// System.out.println("copyFile : " + fin.getCanonicalPath() + " to " +
		// fout.getCanonicalPath());
		final String finName = fin.getCanonicalPath();
		final String foutName = fout.getCanonicalPath();
		final String content = getFileContent(finName);
		writeIntoFile(content, foutName);
	}

	/**
	 * @param files
	 * @param destFile
	 */
	public static void concatenateFiles(final List<String> files, final String destFile) throws IOException {
		// System.out.println("concatenateFiles: " + destFile);
		final StringBuffer sb = new StringBuffer();
		for (final String filename : files) {
			sb.append(getFileContent(filename));
			sb.append(DEFAULT_LF);
		}
		writeIntoFile(sb.toString(), destFile);
	}

	/**
	 * @param filename
	 * @return
	 */
	private static StringBuffer getBufferedFileContent(final String filename, final String encoding) throws IOException {
		// System.out.println("READ ACCESS TO: " + filename + ", " + encoding);
		final File fin = new File(filename);
		final InputStreamReader in = new InputStreamReader(new FileInputStream(fin), Charset.forName(encoding));
		final BufferedReader br = new BufferedReader(in);

		final StringBuffer fileContent = new StringBuffer();
		String line;
		while ((line = br.readLine()) != null) {
			fileContent.append(line);
			fileContent.append(DEFAULT_LF);
		}
		br.close();
		in.close();
		return fileContent;
	}

	/**
	 * @param content
	 * @param filename
	 * @throws IOException
	 */
	public static void writeIntoFile(final String content, final String filename) throws IOException {
		final File f = new File(filename);
		final String filenamec = f.getCanonicalPath();
		removeFileObject(filenamec);

		final Reader in = new StringReader(content);

		// System.out.println("WRITE ACCESS TO: " + filenamec + ", " +
		// OUTPUT_ENCODING);
		final OutputStreamWriter out = new OutputStreamWriter(new FileOutputStream(filenamec, false), Charset.forName(OUTPUT_ENCODING));
		final char[] buf = new char[8192];
		int c;

		while ((c = in.read(buf)) != -1) {
			out.write(buf, 0, c);
		}
		in.close();
		out.close();

		final FileObject foOut = new FileObject(filenamec);
		files.add(foOut);
		foOut.setEncoding(OUTPUT_ENCODING);
		foOut.setContent(new StringBuffer().append(content));
	}

	/**
	 * @param filename
	 * @param lineStart
	 * @param lineEnd
	 * @param charStart
	 * @param charEnd
	 * @throws IOException
	 */
	public static void removeInFile(final String filename, final int lineStart, final int lineEnd, final int charStart, final int charEnd) throws IOException {
		// System.out.println("removeInFile(" + filename + ") line=(" +
		// lineStart + ", " + lineEnd + "), chars=(" + charStart + ", " +
		// charEnd + ")");

		final FileObject fobj = getFileObject(filename);
		final StringBuffer output = new StringBuffer();
		output.append(fobj.getLinesAsString(1, (lineStart - 1)));

		final String middle = fobj.getLinesAsString(lineStart, lineEnd);
		for (int i = 0; i < middle.length(); i++) {
			final char c = middle.charAt(i);
			final int ci = c;
			if (ci < 33) {
				output.append(c);
			} else {
				output.append(" ");
			}
		}
		output.append(fobj.getLinesAsString(lineEnd + 1));

		writeIntoFile(output.toString(), filename);
	}
}
