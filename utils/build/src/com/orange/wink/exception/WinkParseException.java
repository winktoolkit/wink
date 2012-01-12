/*--------------------------------------------------------
 * Copyright (c) 2011, The Dojo Foundation
 * This software is distributed under the "Simplified BSD license",
 * the text of which is available at http://www.winktoolkit.org/licence.txt
 * or see the "license.txt" file for more details.
 *--------------------------------------------------------*/

/**
 * 
 */
package com.orange.wink.exception;

/**
 * @author Sylvain Lalande
 * 
 */
public class WinkParseException extends WinkBuildException {
	/**
	 * 
	 */
	private static final long serialVersionUID = 1L;

	/**
	 * 
	 */
	public WinkParseException() {
		super();
	}

	/**
	 * 
	 * @param arg0
	 * @param arg1
	 */
	public WinkParseException(final String arg0, final Throwable arg1) {
		super(arg0, arg1);
	}

	/**
	 * 
	 * @param arg0
	 */
	public WinkParseException(final String arg0) {
		super(arg0);
	}

	/**
	 * 
	 * @param arg0
	 */
	public WinkParseException(final Throwable arg0) {
		super(arg0);
	}
}
