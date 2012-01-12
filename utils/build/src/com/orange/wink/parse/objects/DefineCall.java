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

import java.util.ArrayList;
import java.util.List;

import org.mozilla.javascript.Token;

import com.orange.wink.ast.AstNode;
import com.orange.wink.exception.WinkUnmanagedSyntaxException;
import com.orange.wink.model.Namespace;

/**
 * @author Sylvain Lalande
 * 
 */
public class DefineCall extends Call {
	/**
	 * @param n
	 * @throws WinkUnmanagedSyntaxException
	 */
	public DefineCall(final AstNode n) throws WinkUnmanagedSyntaxException {
		super(n);

		parameters = new ArrayList<Namespace>();

		final AstNode callnode = n;
		final List<AstNode> childsCall = callnode.getChilds();

		for (int i = 0; i < childsCall.size(); i++) {
			final AstNode ci = childsCall.get(i);
			final int type = ci.getType();

			if (type == Token.FUNCTION) {
				function = new Function(ci);
				namespace = new Namespace();
				namespace.addName(function.getNode().getFunctionName());
			}
		}
	}
}
