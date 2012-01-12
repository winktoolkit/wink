/*--------------------------------------------------------
 * Copyright (c) 2011, The Dojo Foundation
 * This software is distributed under the "Simplified BSD license",
 * the text of which is available at http://www.winktoolkit.org/licence.txt
 * or see the "license.txt" file for more details.
 *--------------------------------------------------------*/

/**
 * 
 */
package com.orange.wink.model;

import com.orange.wink.ast.AstNode;
import com.orange.wink.exception.WinkParseException;

/**
 * @author Sylvain Lalande
 * 
 */
public interface ScriptElement {
	/**
	 * @return
	 */
	public AstNode getNode();

	/**
	 * @return
	 */
	public String getNamedType();

	/**
	 * @return
	 * @throws WinkParseException
	 */
	public String getDescription() throws WinkParseException;
}
