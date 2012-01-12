/*--------------------------------------------------------
 * Copyright (c) 2011, The Dojo Foundation
 * This software is distributed under the "Simplified BSD license",
 * the text of which is available at http://www.winktoolkit.org/licence.txt
 * or see the "license.txt" file for more details.
 *--------------------------------------------------------*/

/**
 * 
 */
package com.orange.wink.ast;

import org.mozilla.javascript.ScriptOrFnNode;

import com.orange.wink.exception.WinkAstException;

/**
 * @author Sylvain Lalande
 * 
 */
public class AstBuilder {
	/**
	 * 
	 */
	public AstBuilder() {

	}

	/**
	 * @param head
	 * @return
	 * @throws WinkAstException
	 */
	public Ast build(final ScriptOrFnNode head) throws WinkAstException {
		final Ast result = new Ast();
		final WinkTransformer wt = new WinkTransformer();
		wt.transform(head);
		final AstNode astHead = new AstNode(head, null);
		result.setHead(astHead);
		result.expand();
		return result;
	}
}
