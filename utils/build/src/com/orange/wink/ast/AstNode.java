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

import java.io.File;
import java.util.ArrayList;
import java.util.List;

import org.mozilla.javascript.FunctionNode;
import org.mozilla.javascript.Node;
import org.mozilla.javascript.ScriptOrFnNode;
import org.mozilla.javascript.Token;

import com.orange.wink.Constants;
import com.orange.wink.exception.WinkAstException;

/**
 * @author Sylvain Lalande
 * 
 */
public class AstNode {
	/**
	 * 
	 */
	private final Node node;
	/**
	 * 
	 */
	private final List<AstNode> childs;
	/**
	 * 
	 */
	private final AstNode parent;
	/**
	 * 
	 */
	private AstNode scope;
	/**
	 * 
	 */
	private AstNode parentScope;
	/**
	 * 
	 */
	private boolean isScriptOrFn = false;
	/**
	 * 
	 */
	private boolean isScript = false;
	/**
	 * 
	 */
	private boolean isFunction = false;
	/**
	 * 
	 */
	private final boolean isLiteral = false;
	/**
	 * 
	 */
	private boolean isRoot = false;
	/**
	 * 
	 */
	private int depth;
	/**
	 * 
	 */
	private List<String> parameters;
	/**
	 * 
	 */
	private List<String> localVars;
	/**
	 * 
	 */
	private List<String> objectIds;
	/**
	 * 
	 */
	private int lineStart = -1;
	/**
	 * 
	 */
	private int lineEnd = -1;
	/**
	 * 
	 */
	private final int type;

	/**
	 * @param node
	 */
	public AstNode(final Node node, final AstNode parent) {
		this.node = node;
		this.parent = parent;
		type = node.getType();

		if (parent == null) {
			isRoot = true;
			depth = 0;
		} else {
			depth = parent.getDepth() + 1;
		}

		if (!isRoot) {
			lineStart = parent.getLineStart();
		}
		if (node.getLineno() > lineStart) {
			lineStart = node.getLineno();
		}

		if (node instanceof ScriptOrFnNode) {
			final ScriptOrFnNode sfn = (ScriptOrFnNode) node;
			isScriptOrFn = true;
			scope = this;
			if (!isRoot) {
				parentScope = parent.getScope();
			}
			parameters = getParams(sfn);
			localVars = getLocalVars(sfn);
			lineStart = sfn.getBaseLineno();
			lineEnd = sfn.getEndLineno();
		} else {
			scope = parent.getScope();
			parentScope = scope.getScope();
		}
		if (type == Token.SCRIPT) {
			isScript = true;
		}
		if (type == Token.FUNCTION) {
			isFunction = true;
		}
		if (type == Token.OBJECTLIT) {
			objectIds = new ArrayList<String>();
			final Object[] props = (Object[]) node.getProp(Node.OBJECT_IDS_PROP);
			for (final Object p : props) {
				final String pName = (String) p;
				objectIds.add(pName);
			}
		}
		childs = new ArrayList<AstNode>();

		if (lineStart == -1) {
			System.err.println("WARN - Ast Node without line number : " + this);
		}
	}

	/**
	 * 
	 */
	public void expand() throws WinkAstException {
		final List<Node> nodeChilds = getChilds(node);

		if (type == Token.OBJECTLIT) {
			if (objectIds.size() != nodeChilds.size()) {
				throw new WinkAstException("OBJECTLIT Node: props and childs count are not equal");
			}
		}

		for (final Node c : nodeChilds) {
			Node cidentified = c;
			if (c.getType() == Token.FUNCTION) {
				final int fnIndex = c.getExistingIntProp(Node.FUNCTION_PROP);
				cidentified = scope.getAsScriptOrFn().getFunctionNode(fnIndex);
			}

			final AstNode child = new AstNode(cidentified, this);
			childs.add(child);
			child.expand();
		}
	}

	/**
	 * @return
	 */
	public String getFunctionName() {
		String identifier = null;
		if (isFunction) {
			FunctionNode n = null;
			try {
				n = getAsFunctionNode();
			} catch (final WinkAstException e) {
				e.printStackTrace();
				return null;
			}
			if (n.getFunctionName() != null && n.getFunctionName() != "") {
				identifier = n.getFunctionName();
			}
			if (identifier == null) {
				final StringBuffer sb = new StringBuffer();
				sb.append(Constants.ANONYMOUS_FUNCTION_PREFIX);
				sb.append("-");
				sb.append(new File(n.getSourceName()).getName());
				sb.append("[");
				sb.append(lineStart);
				sb.append(",");
				sb.append(lineEnd);
				sb.append("]");
				identifier = sb.toString();
			}
		}
		return identifier;
	}

	/**
	 * @return
	 * @throws WinkAstException
	 */
	public ScriptOrFnNode getAsScriptOrFn() throws WinkAstException {
		if (isScriptOrFn) {
			return (ScriptOrFnNode) node;
		} else {
			throw new WinkAstException("Cannot invoke getAsScriptOrFn : not a ScriptOrFnNode");
		}
	}

	/**
	 * @return
	 * @throws WinkAstException
	 */
	public FunctionNode getAsFunctionNode() throws WinkAstException {
		if (isFunction) {
			return (FunctionNode) node;
		} else {
			throw new WinkAstException("Cannot invoke getAsFunctionNode : not a FunctionNode");
		}
	}

	/**
	 * @see java.lang.Object#equals(java.lang.Object)
	 */
	@Override
	public boolean equals(final Object obj) {
		if (!(obj instanceof AstNode)) {
			return false;
		}
		return ((AstNode) obj).getNode() == node;
	}

	/**
	 * @return
	 */
	public String asString() {
		if (type == Token.NUMBER) {
			return String.valueOf(node.getDouble());
		}
		return node.getString();
	}

	/**
	 * @see java.lang.Object#toString()
	 */
	@Override
	public String toString() {
		final StringBuffer sb = new StringBuffer();

		if (isRoot) {
			sb.append("ROOT - ");
		}
		sb.append(Ast.tokenName(type));

		if (type == Token.NAME || type == Token.STRING || type == Token.GETVAR || type == Token.NUMBER || type == Token.BINDNAME) {
			sb.append(" ").append(asString());
		}

		if (parameters != null && parameters.size() > 0) {
			sb.append(" (");
			for (int i = 0; i < parameters.size(); i++) {
				sb.append(parameters.get(i));
				if (i < parameters.size() - 1) {
					sb.append(", ");
				}
			}
			sb.append(")");
		}
		if (localVars != null && localVars.size() > 0) {
			sb.append(" [");
			for (int i = 0; i < localVars.size(); i++) {
				sb.append(localVars.get(i));
				if (i < localVars.size() - 1) {
					sb.append(", ");
				}
			}
			sb.append("]");
		}
		if (objectIds != null && objectIds.size() > 0) {
			sb.append(" [");
			for (int i = 0; i < objectIds.size(); i++) {
				sb.append(objectIds.get(i));
				if (i < objectIds.size() - 1) {
					sb.append(", ");
				}
			}
			sb.append("]");
		}

		if (isScript) {
			final ScriptOrFnNode sfn = (ScriptOrFnNode) node;
			final String sourceName = sfn.getSourceName();
			if (sourceName != null) {
				final String[] sp = sourceName.split("/");
				sb.append(" |").append(sp[sp.length - 1]).append("| ");
			}
		}

		if (isScriptOrFn || isLiteral) {
			final String ls = (lineStart == -1) ? "?" : new Integer(lineStart).toString();
			final String le = (lineEnd == -1) ? "?" : new Integer(lineEnd).toString();
			sb.append(" [L:").append(ls).append(" - ").append(le).append("]");
		}

		if (isFunction) {
			FunctionNode n = null;
			try {
				n = getAsFunctionNode();
			} catch (final WinkAstException e) {
				e.printStackTrace();
			}
			sb.append(" [").append(Ast.functionTypeName(n.getFunctionType())).append("]");
		}

		return sb.toString();
	}

	/**
	 * @param n
	 * @return
	 */
	private List<Node> getChilds(final Node n) {
		final List<Node> nodes = new ArrayList<Node>();
		for (Node child = n.getFirstChild(); child != null; child = child.getNext()) {
			nodes.add(child);
		}
		return nodes;
	}

	/**
	 * @param n
	 * @return
	 */
	private List<String> getParams(final ScriptOrFnNode n) {
		final List<String> params = new ArrayList<String>();
		final int pvc = n.getParamAndVarCount();
		if (pvc > 0) {
			final int pc = n.getParamCount();
			final String[] pvn = n.getParamAndVarNames();
			for (int i = 0; i < pvn.length; i++) {
				if (i < pc) {
					params.add(pvn[i]);
				}
			}
		}
		return params;
	}

	/**
	 * @param n
	 * @return
	 */
	private List<String> getLocalVars(final ScriptOrFnNode n) {
		final List<String> vars = new ArrayList<String>();
		final int pvc = n.getParamAndVarCount();
		if (pvc > 0) {
			final int pc = n.getParamCount();
			final String[] pvn = n.getParamAndVarNames();
			for (int i = 0; i < pvn.length; i++) {
				if (i >= pc) {
					vars.add(pvn[i]);
				}
			}
		}
		return vars;
	}

	/**
	 * @return the node
	 */
	public Node getNode() {
		return node;
	}

	/**
	 * @return the childs
	 */
	public List<AstNode> getChilds() {
		return childs;
	}

	/**
	 * @return the parent
	 */
	public AstNode getParent() {
		return parent;
	}

	/**
	 * @return the isScriptOrFn
	 */
	public boolean isScriptOrFn() {
		return isScriptOrFn;
	}

	/**
	 * @return the isScript
	 */
	public boolean isScript() {
		return isScript;
	}

	/**
	 * @return the isFunction
	 */
	public boolean isFunction() {
		return isFunction;
	}

	/**
	 * @return the isLiteral
	 */
	public boolean isLiteral() {
		return isLiteral;
	}

	/**
	 * @return the isRoot
	 */
	public boolean isRoot() {
		return isRoot;
	}

	/**
	 * @return the scope
	 */
	public AstNode getScope() {
		return scope;
	}

	/**
	 * @return the parentScope
	 */
	public AstNode getParentScope() {
		return parentScope;
	}

	/**
	 * @return the depth
	 */
	public int getDepth() {
		return depth;
	}

	/**
	 * @return the parameters
	 */
	public List<String> getParameters() {
		return parameters;
	}

	/**
	 * @return the localVars
	 */
	public List<String> getLocalVars() {
		return localVars;
	}

	/**
	 * @return the lineStart
	 */
	public int getLineStart() {
		return lineStart;
	}

	/**
	 * @param lineStart
	 *            the lineStart to set
	 */
	public void setLineStart(final int lineStart) {
		this.lineStart = lineStart;
	}

	/**
	 * @return the lineEnd
	 */
	public int getLineEnd() {
		return lineEnd;
	}

	/**
	 * @param lineEnd
	 *            the lineEnd to set
	 */
	public void setLineEnd(final int lineEnd) {
		this.lineEnd = lineEnd;
	}

	/**
	 * @return the objectIds
	 */
	public List<String> getObjectIds() {
		return objectIds;
	}

	/**
	 * @return the type
	 */
	public int getType() {
		return type;
	}
}
