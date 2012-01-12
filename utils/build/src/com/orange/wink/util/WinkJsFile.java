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

import java.io.IOException;
import java.util.List;

import com.orange.wink.model.GlobalObject;

/**
 * 
 * @author Sylvain Lalande
 * 
 */
public class WinkJsFile {
	/**
	 * 
	 */
	private final String filename;
	/**
	 * 
	 */
	private final GlobalObject scope;

	/**
	 * @param filename
	 */
	public WinkJsFile(final String filename) {
		this.filename = filename;
		scope = null;
	}

	/**
	 * @param filename
	 * @param scope
	 */
	public WinkJsFile(final String filename, final GlobalObject scope) {
		this.filename = filename;
		this.scope = scope;
	}

	/**
	 * @param begin
	 * @param end
	 * @return
	 * @throws IOException
	 */
	public String getLinesAsString(final int begin, final int end) throws IOException {
		final FileObject fo = FileManager.getFileObject(filename);
		if (fo == null) {
			throw new IllegalStateException("FileObject " + filename + " not initialized");
		}
		return fo.getLinesAsString(begin, end);
	}

	/**
	 * @return the lines
	 */
	public List<String> getLines() throws IOException {
		final FileObject fo = FileManager.getFileObject(filename);
		if (fo == null) {
			throw new IllegalStateException("FileObject " + filename + " not initialized");
		}
		return fo.getLines();
	}

	/**
	 * @see java.lang.Object#equals(java.lang.Object)
	 */
	@Override
	public boolean equals(final Object other) {
		if (!(other instanceof WinkJsFile)) {
			return false;
		}
		return filename.equals(((WinkJsFile) other).getFilename());
	}

	/**
	 * @return
	 */
	public String getFilename() {
		return filename;
	}

	/**
	 * @return
	 */
	public GlobalObject getScope() {
		return scope;
	}
}