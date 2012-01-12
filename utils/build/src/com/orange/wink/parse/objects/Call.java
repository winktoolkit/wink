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

import com.orange.wink.Constants;
import com.orange.wink.ast.Ast;
import com.orange.wink.ast.AstNode;
import com.orange.wink.exception.WinkUnmanagedSyntaxException;
import com.orange.wink.model.Namespace;

/**
 * @author Sylvain Lalande
 * 
 */
public class Call extends ParseObject {
	// CALL:
	// FUNCTION - [ NAME / GETPROP ]*
	// NAME - [ NAME / GETPROP ]*

	/**
	 * 
	 */
	protected Namespace namespace;
	/**
	 * 
	 */
	protected Function function;
	/**
	 * 
	 */
	protected List<Namespace> parameters;

	/**
	 * @param n
	 * @throws WinkUnmanagedSyntaxException
	 */
	public Call(final AstNode n) throws WinkUnmanagedSyntaxException {
		super(n);

		parameters = new ArrayList<Namespace>();

		final AstNode callnode = n;

		final List<AstNode> childsCall = callnode.getChilds();
		final AstNode c0 = childsCall.get(0);
		int type = c0.getType();

		if (type == Token.NAME) {
			namespace = new Namespace();
			namespace.addName(c0.asString());
		} else if (type == Token.GETPROP) {
			final Namespace ns = new GetProp(c0).resolveNamespace();
			namespace = new Namespace();
			namespace.appendNamespace(ns);
		} else if (type == Token.FUNCTION) {
			function = new Function(c0);
			namespace = new Namespace();
			namespace.addName(function.getNode().getFunctionName());
		} else {
			throw new WinkUnmanagedSyntaxException("Unknow Call Syntax, unexpected(0): " + Ast.tokenName(type) + " " + Ast.getPositionInfo(n));
		}

		for (int i = 1; i < childsCall.size(); i++) {
			final AstNode ci = childsCall.get(i);
			type = ci.getType();

			if (type == Token.NAME || type == Token.STRING || type == Token.GETVAR || type == Token.NUMBER) {
				final Namespace ns = new Namespace();
				ns.addName(ci.asString());
				parameters.add(ns);
			} else if (type == Token.GETPROP) {
				final Namespace ns = new GetProp(ci).resolveNamespace();
				parameters.add(ns);
			} else {
				final Namespace ns = new Namespace();
				ns.addName(Ast.tokenName(type));
				parameters.add(ns);
			}
		}
	}

	/**
	 * @param call
	 * @return
	 */
	public static boolean isValidCall(final AstNode call) {
		if (call.getType() == Token.CALL) {
			final List<AstNode> childsCall = call.getChilds();
			if (childsCall.size() < 1) {
				return false;
			}
			final AstNode c0 = childsCall.get(0);
			int type = c0.getType();
			if (type == Token.NAME || type == Token.FUNCTION) {
				return true;
			}

			boolean valid = true;
			for (int i = 0; i < childsCall.size(); i++) {
				final AstNode ci = childsCall.get(i);
				type = ci.getType();

				if (type == Token.GETPROP) {
					try {
						new GetProp(ci);
					} catch (final WinkUnmanagedSyntaxException e) {
						valid = false;
						break;
						// System.err.println("not valid getprop in call : " +
						// c0.getChilds());
					}
				}
			}
			return valid;
		}
		return false;
	}

	/**
	 * @param n
	 * @return
	 * @throws WinkUnmanagedSyntaxException
	 */
	public static Call getAppropriateCall(final AstNode n) throws WinkUnmanagedSyntaxException {
		final AstNode callnode = n;

		final List<AstNode> childsCall = callnode.getChilds();
		final AstNode c0 = childsCall.get(0);
		final int type = c0.getType();

		if (type == Token.NAME && Constants.DEFINE_CALL.equals(c0.asString())) {
			return new DefineCall(n);
		} else {
			return new Call(n);
		}
	}

	/**
	 * @see java.lang.Object#toString()
	 */
	@Override
	public String toString() {
		String identifier = "UNNAMED-CALL";
		if (namespace != null) {
			identifier = namespace.toString();
		} else {
			identifier = function.toString();
		}
		return "CALL " + identifier + "(" + parameters + ")";
	}

	/**
	 * @return the namespace
	 */
	public Namespace getNamespace() {
		return namespace;
	}

	/**
	 * @return the parameters
	 */
	public List<Namespace> getParameters() {
		return parameters;
	}

	/**
	 * @param namespace
	 *            the namespace to set
	 */
	public void setNamespace(final Namespace namespace) {
		this.namespace = namespace;
	}
}
