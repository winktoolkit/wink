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

import org.mozilla.javascript.Node;
import org.mozilla.javascript.NodeTransformer;
import org.mozilla.javascript.ScriptOrFnNode;

/**
 * @author Sylvain Lalande
 * 
 */
public class WinkTransformer extends NodeTransformer {
	/**
	 * @see org.mozilla.javascript.NodeTransformer#visitCall(org.mozilla.javascript.Node,
	 *      org.mozilla.javascript.ScriptOrFnNode)
	 */
	@Override
	protected void visitCall(final Node node, final ScriptOrFnNode tree) {
		super.visitCall(node, tree);
	}

	/**
	 * @see org.mozilla.javascript.NodeTransformer#visitLet(boolean,
	 *      org.mozilla.javascript.Node, org.mozilla.javascript.Node,
	 *      org.mozilla.javascript.Node)
	 */
	@Override
	protected Node visitLet(final boolean createWith, final Node parent, final Node previous, final Node scopeNode) {
		return super.visitLet(createWith, parent, previous, scopeNode);
	}

	/**
	 * @see org.mozilla.javascript.NodeTransformer#visitNew(org.mozilla.javascript.Node,
	 *      org.mozilla.javascript.ScriptOrFnNode)
	 */
	@Override
	protected void visitNew(final Node node, final ScriptOrFnNode tree) {
		super.visitNew(node, tree);
	}
}
