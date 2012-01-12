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
public class GetProp extends ParseObject {
	// GETPROP:
	// NAME-STRING
	// THIS-STRING
	// GETPROP-STRING
	// GETELEM-STRING
	// GETVAR-STRING

	/**
	 * 
	 */
	private String name;
	/**
	 * 
	 */
	private String prop;
	/**
	 * 
	 */
	private GetProp child;

	/**
	 * @param n
	 * @throws WinkUnmanagedSyntaxException
	 */
	public GetProp(final AstNode n) throws WinkUnmanagedSyntaxException {
		super(n);

		final List<AstNode> childs = n.getChilds();
		if (childs.size() == 2) {
			final AstNode left = childs.get(0);
			final AstNode right = childs.get(1);
			final int lt = left.getType();
			final int rt = right.getType();

			if (lt == Token.NAME || lt == Token.GETVAR) {
				name = left.asString();
			} else if (lt == Token.THIS) {
				name = Ast.tokenName(Token.THIS);
			} else if (lt == Token.GETPROP || lt == Token.GETELEM) {
				child = new GetProp(left);
			} else {
				throw new WinkUnmanagedSyntaxException("Unknow GetProp Syntax, unexpected: " + Ast.tokenName(lt) + "-" + Ast.tokenName(rt) + " " + Ast.getPositionInfo(n));
			}
			if (rt == Token.STRING || rt == Token.NAME || rt == Token.GETVAR || rt == Token.NUMBER) {
				prop = right.asString();
			} else if (rt == Token.SUB || rt == Token.ADD) {
				final List<AstNode> rightChilds = right.getChilds();
				final String sign = (rt == Token.SUB) ? "-" : "+";
				try {
					prop = rightChilds.get(0).asString() + sign + rightChilds.get(1).asString();
				} catch (final Exception e) {
					prop = Ast.tokenName(rt);
				}
			} else if (rt == Token.GETPROP || rt == Token.GETELEM) {
				prop = new GetProp(right).resolveNamespace().toString();
			} else {
				throw new WinkUnmanagedSyntaxException("Unknow GetProp Syntax, unexpected: " + Ast.tokenName(lt) + "-" + Ast.tokenName(rt) + " " + Ast.getPositionInfo(n));
			}
		} else {
			throw new WinkUnmanagedSyntaxException("Unknow GetProp Syntax, expected: 2 tokens" + " " + Ast.getPositionInfo(n));
		}
	}

	/**
	 * @return
	 */
	public Namespace resolveNamespace() {
		if (child != null) {
			final Namespace partial = new Namespace();
			partial.appendNamespace(child.resolveNamespace());
			partial.addName(prop);
			return partial;
		}
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
