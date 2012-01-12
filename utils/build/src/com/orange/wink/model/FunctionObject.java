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

import java.util.ArrayList;
import java.util.List;

import com.orange.wink.ast.AstNode;
import com.orange.wink.exception.WinkParseException;
import com.orange.wink.parse.ParserUtils;
import com.orange.wink.parse.objects.ParseObject;
import com.orange.wink.parse.objects.SetProp;

/**
 * @author Sylvain Lalande
 * 
 */
public class FunctionObject extends ScriptObject {
	/**
	 * 
	 */
	private String name;
	/**
	 * 
	 */
	private final List<String> parameters;
	/**
	 * 
	 */
	private final List<String> localVarNames;

	/**
	 * 
	 * @param n
	 */
	public FunctionObject(final AstNode n) {
		super(n);
		parameters = new ArrayList<String>();
		localVarNames = new ArrayList<String>();
	}

	/**
	 * @see com.orange.wink.model.ScriptObject#getNamedType()
	 */
	@Override
	public String getNamedType() {
		return "FunctionObject";
	}

	/**
	 * @throws WinkParseException
	 */
	public void populateParams() throws WinkParseException {
		parameters.addAll(node.getParameters());
		localVarNames.addAll(node.getLocalVars());
	}

	/**
	 * @see com.orange.wink.model.ScriptObject#getDescription()
	 */
	@Override
	public String getDescription() throws WinkParseException {
		final StringBuffer sb = new StringBuffer();
		sb.append(name);

		if (parentImpl != null) {
			sb.append(parentImpl.getExtendKey(this));
		}

		sb.append("(");
		for (int i = 0; i < parameters.size(); i++) {
			sb.append(parameters.get(i));
			if (i < parameters.size() - 1) {
				sb.append(", ");
			}
		}
		sb.append(")");
		return sb.toString();
	}

	/**
	 * @see com.orange.wink.model.ScriptObject#setNamespace(com.orange.wink.model.Namespace)
	 */
	@Override
	public void setNamespace(final Namespace namespace) {
		super.setNamespace(namespace);
		final String lastName = namespace.getLastName();
		if (lastName == null) {
			name = "unknow";
		} else {
			name = new String(lastName);
		}
	}

	/**
	 * @see java.lang.Object#equals(java.lang.Object)
	 */
	@Override
	public boolean equals(final Object other) {
		if (!(other instanceof FunctionObject)) {
			return false;
		}
		final FunctionObject fo = (FunctionObject) other;
		if (name == null || fo.getName() == null) {
			return false;
		}
		if (!(fo.getName().equals(name))) {
			return false;
		}
		if (parameters.size() != fo.getParameters().size()) {
			return false;
		}
		for (int i = 0; i < parameters.size(); i++) {
			if (!(parameters.get(i).equals(fo.getParameters().get(i)))) {
				return false;
			}
		}
		return true;
	}

	/**
	 * @see com.orange.wink.model.ScriptObject#getCallThisReference()
	 */
	@Override
	protected ScriptObject getCallThisReference() {
		if (parent instanceof LiteralObject) {
			if (((LiteralObject) parent).isPrototype()) {
				return parent.getCallThisReference();
			}
		}
		return super.getCallThisReference();
	}

	/**
	 * @return
	 * @throws WinkParseException
	 */
	@Override
	protected List<ParseObject> retrieveParseObjects() throws WinkParseException {
		final List<ParseObject> result = new ArrayList<ParseObject>();
		result.addAll(super.retrieveParseObjects());
		result.addAll(getChildSetProp());
		return result;
	}

	/**
	 * @param headNode
	 * @return
	 * @throws WinkParseException
	 */
	@Override
	protected List<SetProp> retrieveSetProp(final AstNode headNode) throws WinkParseException {
		final List<SetProp> setprops = new ArrayList<SetProp>();
		ParserUtils.getSetProp(headNode, setprops);
		final List<SetProp> result = new ArrayList<SetProp>();

		for (final SetProp sp : setprops) {
			final Namespace spns = sp.getNamespace();
			if (Namespace.isThisReferenced(spns)) {
				result.add(sp);
			}
		}
		return result;
	}

	/**
	 * @return
	 * @throws WinkParseException
	 */
	private List<SetProp> getChildSetProp() throws WinkParseException {
		final List<SetProp> setprops = new ArrayList<SetProp>();
		final List<AstNode> childs = node.getChilds();
		for (final AstNode n : childs) {
			setprops.addAll(retrieveSetProp(n));
		}
		return setprops;
	}

	/**
	 * @return
	 */
	public LiteralObject getPrototype() {
		final String prototypeKey = "prototype";
		if (getLiterals().size() > 0 && getLiterals().containsKey(prototypeKey)) {
			return getLiterals().get(prototypeKey);
		}
		return null;
	}

	/**
	 * @return
	 */
	public String getName() {
		return name;
	}

	/**
	 * @return
	 */
	public List<String> getParameters() {
		return parameters;
	}

	/**
	 * @return the localVarNames
	 */
	public List<String> getLocalVarNames() {
		return localVarNames;
	}
}
