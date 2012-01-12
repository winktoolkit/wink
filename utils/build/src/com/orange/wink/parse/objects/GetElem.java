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

import java.util.List;

import org.mozilla.javascript.Token;

import com.orange.wink.ast.Ast;
import com.orange.wink.ast.AstNode;
import com.orange.wink.exception.WinkUnmanagedSyntaxException;
import com.orange.wink.model.Namespace;

/**
 * @author Sylvain Lalande
 * 
 */
public class GetElem extends ParseObject {
	// GETELEM:
	// NAME-NAME

	/**
	 * 
	 */
	private String name;
	/**
	 * 
	 */
	private String prop;

	/**
	 * @param n
	 * @throws WinkUnmanagedSyntaxException
	 */
	public GetElem(final AstNode n) throws WinkUnmanagedSyntaxException {
		super(n);

		final List<AstNode> childs = n.getChilds();
		if (childs.size() == 2) {
			final AstNode left = childs.get(0);
			final AstNode right = childs.get(1);
			final int lt = left.getType();
			final int rt = right.getType();

			if (lt == Token.NAME && rt == Token.NAME) {
				name = left.asString();
				prop = right.asString();
			} else {
				final String syntax = "" + Ast.tokenName(Token.NAME) + "-" + Ast.tokenName(Token.NAME);
				throw new WinkUnmanagedSyntaxException("Unknow GetElem Syntax, expected: " + syntax + " -> " + Ast.tokenName(lt) + "-" + Ast.tokenName(rt) + " " + Ast.getPositionInfo(n));
			}
		} else {
			throw new WinkUnmanagedSyntaxException("Unknow GetElem Syntax, expected: 2 tokens" + " " + Ast.getPositionInfo(n));
		}
	}

	/**
	 * @return
	 */
	public Namespace resolveNamespace() {
		final Namespace ns = new Namespace();
		ns.addName(name);
		ns.addName(prop);
		return ns;
	}

	/**
	 * @see java.lang.Object#toString()
	 */
	@Override
	public String toString() {
		return name + "-" + prop;
	}
}
