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
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import com.orange.wink.Constants;
import com.orange.wink.ast.Ast;
import com.orange.wink.ast.AstNode;
import com.orange.wink.exception.WinkParseException;
import com.orange.wink.parse.ParserUtils;
import com.orange.wink.parse.objects.Call;
import com.orange.wink.parse.objects.DefineCall;
import com.orange.wink.parse.objects.ExprResultCall;
import com.orange.wink.parse.objects.Function;
import com.orange.wink.parse.objects.ParseObject;
import com.orange.wink.parse.objects.SetName;
import com.orange.wink.parse.objects.SetProp;

/**
 * @author Sylvain Lalande
 * 
 */
public class GlobalObject extends LiteralObject {
	/**
	 * 
	 */
	private final Ast ast;
	/**
	 * 
	 */
	private final Map<String, ScriptObject> globalNamespaces;
	/**
	 * 
	 */
	private final String WINDOW = "window";
	/**
	 * 
	 */
	private final String WINDOW_LOCATION = "location";
	/**
	 * 
	 */
	private final String HTML_ELEMENT = "HTMLElement";
	/**
	 * 
	 */
	private final String HTML_ELEMENT_PROTOTYPE = "prototype";

	/**
	 * @param n
	 */
	public GlobalObject(final Ast ast) {
		super(ast.getHead());
		this.ast = ast;

		namespace.setGlobalScope(true);
		setLineStart(node.getLineStart());
		setLineEnd(node.getLineEnd());

		globalNamespaces = new HashMap<String, ScriptObject>();
		globalNamespaces.put(WINDOW, null);
		globalNamespaces.put(WINDOW + "." + WINDOW_LOCATION, null);
		globalNamespaces.put(HTML_ELEMENT, null);
		globalNamespaces.put(HTML_ELEMENT + "." + HTML_ELEMENT_PROTOTYPE, null);
	}

	/**
	 * @see com.orange.wink.model.LiteralObject#interpret()
	 */
	@Override
	public void interpret() throws WinkParseException {
		super.interpret();
	}

	/**
	 * @param po
	 * @throws WinkParseException
	 */
	@Override
	protected void interpretParseObject(final ParseObject po) throws WinkParseException {
		if (po instanceof Function && ((Function) po).isRootFunction()) {
			interpretRootFunction((Function) po);
		} else if (po instanceof ExprResultCall) {
			interpretExprResultCall((ExprResultCall) po);
		} else {
			super.interpretParseObject(po);
		}
	}

	/**
	 * @return
	 * @throws WinkParseException
	 */
	@Override
	protected List<ParseObject> retrieveParseObjects() throws WinkParseException {
		final List<ParseObject> result = new ArrayList<ParseObject>();
		result.addAll(super.retrieveParseObjects());
		result.addAll(getRootFunctions(node));
		result.addAll(getExprResultCall(node));
		return result;
	}

	/**
	 * @param headNode
	 * @return
	 * @throws WinkParseException
	 */
	private List<Function> getRootFunctions(final AstNode headNode) throws WinkParseException {
		final List<Function> functions = new ArrayList<Function>();
		ParserUtils.getFunctions(headNode, functions);
		for (final Function f : functions) {
			f.setRootFunction(true);
		}
		return functions;
	}

	/**
	 * @param func
	 * @throws WinkParseException
	 */
	private void interpretRootFunction(final Function func) throws WinkParseException {
		final FunctionObject soChild = (FunctionObject) ParserUtils.buildScriptObject(func, this);
		final String name = func.getNode().getFunctionName();
		final Namespace ns = Namespace.build(namespace, name);
		addComponent(name, soChild, this, ns);
		soChild.interpret();
	}

	/**
	 * @param headNode
	 * @throws WinkParseException
	 */
	private List<ExprResultCall> getExprResultCall(final AstNode headNode) throws WinkParseException {
		final List<ExprResultCall> calls = new ArrayList<ExprResultCall>();
		ParserUtils.getExprResultCall(headNode, calls);
		return calls;
	}

	/**
	 * @param call
	 * @throws WinkParseException
	 */
	private void interpretExprResultCall(final ExprResultCall expr) throws WinkParseException {
		final Call call = expr.getCall();

		Namespace ns;
		ns = new Namespace();
		ns.appendNamespace(namespace);
		ns.appendNamespace(call.getNamespace());

		FunctionObject globalFunc;
		try {
			final ScriptObject so = resolveByNamespace(ns);
			if (!(so instanceof FunctionObject)) {
				return;
			}
			globalFunc = (FunctionObject) so;
		} catch (final WinkParseException e) {
			if (Constants.failOnUnresolvedNamespace) {
				throw new WinkParseException(ns + " not accessible in " + namespace + " - " + Ast.getPositionInfo(expr.getNode()), e);
			} else {
				System.err.println("WARN - " + ns + " not accessible in " + namespace + " - " + Ast.getPositionInfo(expr.getNode()) + " - " + e.getMessage());
				return;
			}
		}

		if (call instanceof DefineCall) {
			final Map<String, Namespace> argumentsMap = new HashMap<String, Namespace>();
			for (int i = 0; i < globalFunc.getParameters().size(); i++) {
				final String funcParam = globalFunc.getParameters().get(i);

				final Namespace nsc = new Namespace();
				nsc.addName(Constants.WINK_NAMESPACE);
				argumentsMap.put(funcParam, nsc);
			}

			final List<AstNode> childsGlobalFunc = globalFunc.getNode().getChilds();
			for (final AstNode cgf : childsGlobalFunc) {
				interpretCallSetProp(cgf, globalFunc, argumentsMap, true);
			}
		} else {
			if (globalFunc.getParameters().size() != call.getParameters().size()) {
				throw new WinkParseException("call arguments count does not match function parameter count [" + globalFunc + "]");
			}

			final Map<String, Namespace> argumentsMap = new HashMap<String, Namespace>();
			for (int i = 0; i < globalFunc.getParameters().size(); i++) {
				final String funcParam = globalFunc.getParameters().get(i);
				argumentsMap.put(funcParam, call.getParameters().get(i));
			}

			final List<AstNode> childsGlobalFunc = globalFunc.getNode().getChilds();
			for (final AstNode cgf : childsGlobalFunc) {
				interpretCallSetProp(cgf, globalFunc, argumentsMap, false);
			}
		}
	}

	/**
	 * @param headNode
	 * @param globalFunc
	 * @param argumentsMap
	 * @throws WinkParseException
	 */
	private void interpretCallSetProp(final AstNode headNode, final FunctionObject globalFunc, final Map<String, Namespace> argumentsMap, final boolean includeSetName) throws WinkParseException {
		final List<String> localVars = globalFunc.getLocalVarNames();

		if (includeSetName) {
			final List<SetName> setnames = getSetName(headNode);
			for (final SetName stn : setnames) {
				if (!localVars.contains(stn.getBindName())) {
					interpretSetName(stn);
				}
			}
		}

		final List<SetProp> setprops = retrieveSetProp(headNode);

		for (final SetProp sp : setprops) {
			final Namespace spnsArg = sp.getNamespace();
			final String firstName = spnsArg.getNames().get(0);

			if (localVars.contains(firstName)) {
				// skip setprop on a local var
				continue;
			}

			// System.out.println("try to resolve = " + firstName + " in " +
			// spnsArg + " with " + argumentsMap);

			Namespace spns;
			if (argumentsMap.containsKey(firstName)) {
				spns = new Namespace();
				spns.appendNamespace(argumentsMap.get(firstName));
				for (int i = 1; i < spnsArg.getNames().size(); i++) {
					spns.addName(spnsArg.getNames().get(i));
				}
			} else {
				spns = spnsArg;
			}
			spns.resolveThisBy(globalFunc.getParent().getNamespace());

			final ScriptObject soChild = ParserUtils.buildScriptObject(sp.getValue(), globalFunc);
			ScriptObject so = null;
			try {
				so = resolveByNamespace(spns);

				final String name = sp.getProp();
				final Namespace ns = Namespace.build(spns, name);
				so.addComponent(name, soChild, this, ns);

				soChild.interpret();
			} catch (final WinkParseException e) {
				if (Constants.failOnUnresolvedNamespace) {
					throw new WinkParseException(spns + " not accessible in " + namespace + " - " + Ast.getPositionInfo(sp.getNode()), e);
				} else {
					System.err.println("WARN - " + spns + " not accessible in " + namespace + " - " + Ast.getPositionInfo(sp.getNode()) + " - " + e.getMessage());
				}
			}
		}
	}

	/**
	 * @param gns
	 * @return
	 * @throws WinkParseException
	 */
	public boolean resolveGlobalNamespace(final String gns) throws WinkParseException {
		if (globalNamespaces.containsKey(gns)) {
			if (globalNamespaces.get(gns) == null) {
				if (gns.equals(HTML_ELEMENT)) {
					addHtmlElement();
				} else if (gns.equals(HTML_ELEMENT + "." + HTML_ELEMENT_PROTOTYPE)) {
					addHtmlElementPrototype();
				} else if (gns.equals(WINDOW)) {
					addWindow();
				} else if (gns.equals(WINDOW + "." + WINDOW_LOCATION)) {
					addWindowLocation();
				}
				return true;
			} else {
				return false;
			}
		}
		return false;
	}

	/**
	 * @throws WinkParseException
	 */
	private void addWindow() throws WinkParseException {
		final Namespace ns = new Namespace();
		ns.addName(WINDOW);
		final LiteralObject window = new LiteralObject();
		window.setVirtual(true);
		window.setLineEnd(1);
		addComponent(ns.getLastName(), window, this, ns);
		globalNamespaces.put(ns.toString(), window);
	}

	/**
	 * @throws WinkParseException
	 */
	private void addWindowLocation() throws WinkParseException {
		if (globalNamespaces.get(WINDOW) == null) {
			addWindow();
		}

		final Namespace ns = new Namespace();
		ns.addName(WINDOW);
		ns.addName(WINDOW_LOCATION);
		final LiteralObject windowLocation = new LiteralObject();
		windowLocation.setVirtual(true);
		windowLocation.setLineEnd(1);
		globalNamespaces.get(WINDOW).addComponent(ns.getLastName(), windowLocation, this, ns);
		globalNamespaces.put(ns.toString(), windowLocation);
	}

	/**
	 * @throws WinkParseException
	 */
	private void addHtmlElement() throws WinkParseException {
		final Namespace ns = new Namespace();
		ns.addName(HTML_ELEMENT);
		final LiteralObject htmlElement = new LiteralObject();
		htmlElement.setVirtual(true);
		htmlElement.setLineEnd(1);
		addComponent(ns.getLastName(), htmlElement, this, ns);
		globalNamespaces.put(ns.toString(), htmlElement);
	}

	/**
	 * @throws WinkParseException
	 */
	private void addHtmlElementPrototype() throws WinkParseException {
		if (globalNamespaces.get(HTML_ELEMENT) == null) {
			addHtmlElement();
		}

		final Namespace ns = new Namespace();
		ns.addName(HTML_ELEMENT);
		ns.addName(HTML_ELEMENT_PROTOTYPE);
		final LiteralObject htmlElementPrototype = new LiteralObject();
		htmlElementPrototype.setVirtual(true);
		htmlElementPrototype.setLineEnd(1);
		globalNamespaces.get(HTML_ELEMENT).addComponent(ns.getLastName(), htmlElementPrototype, this, ns);
		globalNamespaces.put(ns.toString(), htmlElementPrototype);
	}

	/**
	 * @see com.orange.wink.model.LiteralObject#getNamedType()
	 */
	@Override
	public String getNamedType() {
		return "GlobalObject";
	}

	/**
	 * @see com.orange.wink.model.LiteralObject#getDescription()
	 */
	@Override
	public String getDescription() {
		final StringBuffer sb = new StringBuffer();
		sb.append(sourceName);
		return sb.toString();
	}

	/**
	 * @see com.orange.wink.model.ScriptObject#getFunctions()
	 */
	@Override
	public Map<String, FunctionObject> getFunctions() {
		if (parent == null) {
			return super.getFunctions();
		} else {
			return parent.getFunctions();
		}
	}

	/**
	 * @see com.orange.wink.model.ScriptObject#getLiterals()
	 */
	@Override
	public Map<String, LiteralObject> getLiterals() {
		if (parent == null) {
			return super.getLiterals();
		} else {
			return parent.getLiterals();
		}
	}

	/**
	 * @see com.orange.wink.model.ScriptObject#getProperties()
	 */
	@Override
	public Map<String, DefaultObject> getProperties() {
		if (parent == null) {
			return super.getProperties();
		} else {
			return parent.getProperties();
		}
	}

	/**
	 * @return the ast
	 */
	public Ast getAst() {
		return ast;
	}
}
