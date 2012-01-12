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

import com.orange.wink.ast.AstNode;
import com.orange.wink.exception.WinkUnmanagedSyntaxException;

/**
 * @author Sylvain Lalande
 * 
 */
public class ExprResultCall extends ParseObject {
	// EXPR_RESULT:
	// CALL

	/**
	 * 
	 */
	private final Call call;

	/**
	 * @param n
	 * @throws WinkUnmanagedSyntaxException
	 */
	public ExprResultCall(final AstNode n) throws WinkUnmanagedSyntaxException {
		super(n);

		final List<AstNode> childsExpr = n.getChilds();
		final AstNode callnode = childsExpr.get(0);

		call = Call.getAppropriateCall(callnode);
	}

	/**
	 * @param expr
	 * @return
	 */
	public static boolean isValidCall(final AstNode expr) {
		final List<AstNode> childsExpr = expr.getChilds();

		if (childsExpr.size() == 1 && Call.isValidCall(childsExpr.get(0))) {
			return true;
		}
		return false;
	}

	/**
	 * @see java.lang.Object#toString()
	 */
	@Override
	public String toString() {
		return "RESULT " + call.toString();
	}

	/**
	 * @return the call
	 */
	public Call getCall() {
		return call;
	}
}
