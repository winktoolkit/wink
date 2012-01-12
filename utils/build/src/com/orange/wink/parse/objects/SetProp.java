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
import com.orange.wink.parse.ParserUtils;

/**
 * @author Sylvain Lalande
 * 
 */
public class SetProp extends ParseObject {
	// SETPROP:
	// [NAME|GETVAR|GETPROP|THIS|GETELEM]-[NAME|STRING|GETVAR|NUMBER]-[OBJECTLIT|FUNCTION|OBJECT]

	/**
	 * 
	 */
	private Namespace namespace;
	/**
	 * 
	 */
	private final String prop;
	/**
	 * 
	 */
	private final ParseObject value;

	/**
	 * @param n
	 * @throws WinkUnmanagedSyntaxException
	 */
	public SetProp(final AstNode n) throws WinkUnmanagedSyntaxException {
		super(n);

		final List<AstNode> childs = n.getChilds();
		final AstNode left = childs.get(0);
		final AstNode mid = childs.get(1);
		final AstNode right = childs.get(2);

		namespace = new Namespace();
		final int leftType = left.getType();
		final int midType = mid.getType();

		if (leftType == Token.NAME || leftType == Token.GETVAR) {
			namespace.addName(left.asString());
		} else if (leftType == Token.THIS) {
			namespace.addName(Ast.tokenName(Token.THIS));
		} else if (leftType == Token.GETPROP) {
			namespace = new GetProp(left).resolveNamespace();
		} else if (leftType == Token.GETELEM) {
			namespace = new GetElem(left).resolveNamespace();
		} else {
			throw new WinkUnmanagedSyntaxException("Unknow SetProp Syntax, unexpected left token : " + Ast.tokenName(leftType) + " " + Ast.getPositionInfo(n));
		}

		if (midType == Token.STRING || midType == Token.NAME || midType == Token.GETVAR || midType == Token.NUMBER) {
			prop = mid.asString();
		} else {
			throw new WinkUnmanagedSyntaxException("Unknow SetProp Syntax, unexpected middle token : " + Ast.tokenName(midType) + " " + Ast.getPositionInfo(n));
		}

		value = ParserUtils.resolveParseObject(right);
	}

	/**
	 * @param setprop
	 * @return
	 */
	public static boolean isValidSetProp(final AstNode setprop) {
		final List<AstNode> childsSp = setprop.getChilds();

		if (childsSp.size() != 3) {
			return false; // "Unknow SetProp Syntax : expected 3 tokens"
		}
		final AstNode left = childsSp.get(0);
		final AstNode mid = childsSp.get(1);
		final int leftType = left.getType();
		final int midType = mid.getType();

		if (leftType != Token.NAME && leftType != Token.GETVAR && leftType != Token.GETPROP && leftType != Token.THIS && leftType != Token.GETELEM) {
			// System.err.println("Unknow SetProp Syntax : unexpected left node : "
			// + Ast.tokenName(leftType) + " " + Ast.getPositionInfo(left));
			return false;
		}
		if (midType != Token.STRING && midType != Token.NAME && midType != Token.GETVAR && midType != Token.NUMBER) {
			// System.err.println("Unknow SetProp Syntax : unexpected middle node : "
			// + Ast.tokenName(midType) + " " + Ast.getPositionInfo(mid));
			return false;
		}
		return true;
	}

	/**
	 * @return
	 */
	public Namespace getNamespace() {
		return namespace;
	}

	/**
	 * @return
	 */
	public String getProp() {
		return prop;
	}

	/**
	 * @return
	 */
	public ParseObject getValue() {
		return value;
	}

	/**
	 * @see java.lang.Object#toString()
	 */
	@Override
	public String toString() {
		return namespace + "[" + prop + "]=" + value.toString();
	}
}
