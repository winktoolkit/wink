/*--------------------------------------------------------
 * Copyright (c) 2011, The Dojo Foundation
 * This software is distributed under the "Simplified BSD license",
 * the text of which is available at http://www.winktoolkit.org/licence.txt
 * or see the "license.txt" file for more details.
 *--------------------------------------------------------*/

/**
 * 
 */
package com.orange.wink.parse.objects;

import com.orange.wink.ast.AstNode;
import com.orange.wink.exception.WinkUnmanagedSyntaxException;

/**
 * @author Sylvain Lalande
 * 
 */
public class Function extends ParseObject {
	/**
	 * 
	 */
	private boolean isRootFunction = false;

	/**
	 * @param n
	 * @throws WinkUnmanagedSyntaxException
	 */
	public Function(final AstNode n) throws WinkUnmanagedSyntaxException {
		super(n);
	}

	/**
	 * @return the isRootFunction
	 */
	public boolean isRootFunction() {
		return isRootFunction;
	}

	/**
	 * @param isRootFunction
	 *            the isRootFunction to set
	 */
	public void setRootFunction(final boolean isRootFunction) {
		this.isRootFunction = isRootFunction;
	}
}
