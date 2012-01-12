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

/**
 * @author Sylvain Lalande
 * 
 */
public class DefaultObject extends ScriptObject {
	/**
	 * 
	 * @param n
	 */
	public DefaultObject(final AstNode n) {
		super(n);
	}

	/**
	 * @see com.orange.wink.model.ScriptObject#getNamedType()
	 */
	@Override
	public String getNamedType() {
		return "DefaultObject";
	}

	/**
	 * @see com.orange.wink.model.ScriptObject#getDescription()
	 */
	@Override
	public String getDescription() {
		return "";
	}
}
