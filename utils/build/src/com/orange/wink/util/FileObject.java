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
import java.io.IOException;
import java.io.StringReader;
import java.util.ArrayList;
import java.util.List;

/**
 * @author Sylvain Lalande
 * 
 */
public class FileObject {
	private final String filename;
	private String encoding;
	private StringBuffer content;
	private List<String> lines;

	/**
	 * @param filename
	 */
	public FileObject(final String filename) {
		this.filename = filename;
	}

	/**
	 * @see java.lang.Object#toString()
	 */
	@Override
	public String toString() {
		final StringBuffer sb = new StringBuffer();
		sb.append("[FileObject ").append(filename).append("]");
		if (encoding != null) {
			sb.append(" ").append(encoding).append(" encoding");
		}
		if (content != null) {
			sb.append(" ").append(content.length()).append(" octets");
		}
		return sb.toString();
	}

	/**
	 * @return the lines
	 */
	public List<String> getLines() {
		if (lines == null) {
			throw new IllegalStateException("lines of " + filename + " not initialized");
		}
		return lines;
	}

	/**
	 * @param begin
	 * @param end
	 * @return
	 * @throws IOException
	 */
	public List<String> getLines(final int begin, final int end) throws IOException {
		return getLines().subList(begin - 1, end);
	}

	/**
	 * @param begin
	 * @return
	 * @throws IOException
	 */
	public List<String> getLines(final int begin) throws IOException {
		return getLines(begin, getLines().size());
	}

	/**
	 * @param begin
	 * @param end
	 * @return
	 * @throws IOException
	 */
	public String getLinesAsString(final int begin, final int end) throws IOException {
		return getStringWithLines(getLines(begin, end));
	}

	/**
	 * @param begin
	 * @return
	 * @throws IOException
	 */
	public String getLinesAsString(final int begin) throws IOException {
		return getStringWithLines(getLines(begin));
	}

	/**
	 * @param lines
	 * @return
	 */
	private String getStringWithLines(final List<String> lines) {
		final StringBuffer sw = new StringBuffer();

		for (final String sl : lines) {
			sw.append(sl);
			sw.append(FileManager.DEFAULT_LF);
		}

		return sw.toString();
	}

	/**
	 * @return the filename
	 */
	public String getFilename() {
		return filename;
	}

	/**
	 * @return the content
	 */
	public StringBuffer getContent() {
		return content;
	}

	/**
	 * @param content
	 *            the content to set
	 */
	public void setContent(final StringBuffer content) throws IOException {
		this.content = content;

		lines = new ArrayList<String>();
		final BufferedReader br = new BufferedReader(new StringReader(content.toString()));
		int ln = 0;
		String line = null;
		while ((line = br.readLine()) != null) {
			lines.add(ln, line);
			ln++;
		}
		br.close();
	}

	/**
	 * @return the encoding
	 */
	public String getEncoding() {
		return encoding;
	}

	/**
	 * @param encoding
	 *            the encoding to set
	 */
	public void setEncoding(final String encoding) {
		this.encoding = encoding;
	}
}
