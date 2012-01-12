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
import com.orange.wink.parse.ParserUtils;

/**
 * @author Sylvain Lalande
 * 
 */
public class SetName extends ParseObject {
	// SETNAME:
	// BINDNAME-[OBJECTLIT|FUNCTION|OBJECT]

	/**
	 * 
	 */
	private final String bindName;
	/**
	 * 
	 */
	private final ParseObject value;

	/**
	 * @param n
	 * @throws WinkUnmanagedSyntaxException
	 */
	public SetName(final AstNode n) throws WinkUnmanagedSyntaxException {
		super(n);

		final List<AstNode> childs = n.getChilds();
		if (childs.size() != 2) {
			throw new WinkUnmanagedSyntaxException("Unknow SetName Syntax : expected 2 tokens" + " " + Ast.getPositionInfo(n));
		}

		if (childs.get(0).getType() != Token.BINDNAME) {
			throw new WinkUnmanagedSyntaxException("Unknow SetName Syntax : expected Token." + Ast.tokenName(Token.BINDNAME) + " " + Ast.getPositionInfo(n));
		}
		bindName = childs.get(0).asString();
		value = ParserUtils.resolveParseObject(childs.get(1));
	}

	/**
	 * @return
	 */
	public ParseObject getValue() {
		return value;
	}

	/**
	 * @return
	 */
	public String getBindName() {
		return bindName;
	}

	/**
	 * @see java.lang.Object#toString()
	 */
	@Override
	public String toString() {
		return bindName + "=" + value.toString();
	}
}
