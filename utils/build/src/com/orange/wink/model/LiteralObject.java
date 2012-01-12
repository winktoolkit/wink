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

import java.util.List;

import com.orange.wink.ast.AstNode;
import com.orange.wink.exception.WinkParseException;
import com.orange.wink.parse.ParserUtils;
import com.orange.wink.parse.objects.ParseObject;

/**
 * @author Sylvain Lalande
 * 
 */
public class LiteralObject extends ScriptObject {
	/**
	 * @param n
	 */
	public LiteralObject() {
		super();
	}

	/**
	 * @param n
	 */
	public LiteralObject(final AstNode n) {
		super(n);
	}

	/**
	 * @see com.orange.wink.model.ScriptObject#getNamedType()
	 */
	@Override
	public String getNamedType() {
		return "LiteralObject";
	}

	/**
	 * @see com.orange.wink.model.ScriptObject#getDescription()
	 */
	@Override
	public String getDescription() throws WinkParseException {
		final StringBuffer sb = new StringBuffer();
		if (parentImpl != null) {
			sb.append(parentImpl.getExtendKey(this));
		}
		return sb.toString();
	}

	/**
	 * @see com.orange.wink.model.ScriptObject#interpret()
	 */
	@Override
	public void interpret() throws WinkParseException {
		super.interpret();
		interpretProps();
	}

	/**
	 * @throws WinkParseException
	 */
	private void interpretProps() throws WinkParseException {
		final List<String> objectIds = node.getObjectIds();
		if (objectIds == null) {
			return; // for global object
		}

		final List<AstNode> childs = node.getChilds();

		int index = 0;
		for (final String pName : objectIds) {
			final AstNode c = childs.get(index++);
			final ParseObject po = ParserUtils.resolveParseObject(c);
			final ScriptObject soc = ParserUtils.buildScriptObject(po, this);
			final Namespace nsc = Namespace.build(getNamespace(), pName);
			addComponent(pName, soc, this, nsc);
		}
	}

	/**
	 * @return the isPrototype
	 */
	public boolean isPrototype() {
		final String prototypeKey = "prototype";
		if (parent instanceof FunctionObject) {
			final boolean isprotoname = namespace.getLastName().equals(prototypeKey);
			final boolean isparentproto = ((FunctionObject) parent).getPrototype() == this;
			if (isprotoname && isparentproto) {
				return true;
			}
		}
		return false;
	}
}
