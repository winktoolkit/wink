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

import com.orange.wink.exception.WinkBuildException;

/**
 * @author Sylvain Lalande
 * 
 */
public class Main {
	/**
	 * @param args
	 */
	public static void main(final String[] args) throws WinkBuildException {
		final WinkBuilder wb = new WinkBuilder();
		wb.initialize(args);
		wb.execute();
	}
}
