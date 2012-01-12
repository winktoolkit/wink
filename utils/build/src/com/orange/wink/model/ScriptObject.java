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
import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;

import com.orange.wink.Constants;
import com.orange.wink.ast.Ast;
import com.orange.wink.ast.AstNode;
import com.orange.wink.exception.WinkParseException;
import com.orange.wink.parse.ParserUtils;
import com.orange.wink.parse.objects.ParseObject;
import com.orange.wink.parse.objects.SetName;
import com.orange.wink.parse.objects.SetProp;

/**
 * @author Sylvain Lalande
 * 
 */
public abstract class ScriptObject implements ScriptElement {
	/**
	 * 
	 */
	protected int lineStart = -1;
	/**
	 * 
	 */
	protected int lineEnd = -1;
	/**
	 * 
	 */
	protected int charStart = -1;
	/**
	 * 
	 */
	protected int charEnd = -1;
	/**
	 * 
	 */
	protected Namespace namespace;
	/**
	 * 
	 */
	protected String sourceName;
	/**
	 * 
	 */
	private boolean sourceActiveInFile = true;
	/**
	 * 
	 */
	protected ScriptObject parent;
	/**
	 * 
	 */
	protected ScriptObject linkedParent;

	/**
	 * 
	 */
	private final Map<String, LiteralObject> literals;
	/**
	 * 
	 */
	private final Map<String, FunctionObject> functions;
	/**
	 * 
	 */
	private final Map<String, DefaultObject> properties;
	/**
	 * 
	 */
	protected ScriptObject parentImpl;
	/**
	 * 
	 */
	protected final List<ScriptObject> extensions;
	/**
	 * 
	 */
	protected boolean isVirtual;
	/**
	 * 
	 */
	protected AstNode node;

	public ScriptObject() {
		literals = new HashMap<String, LiteralObject>();
		functions = new HashMap<String, FunctionObject>();
		properties = new HashMap<String, DefaultObject>();
		extensions = new ArrayList<ScriptObject>();
		namespace = new Namespace();
		parent = null;
		isVirtual = false;
	}

	/**
	 * @param n
	 */
	public ScriptObject(final AstNode n) {
		this();
		node = n;
		lineStart = n.getLineStart();
		lineEnd = n.getLineEnd();
	}

	/**
	 * @return
	 * @throws WinkParseException
	 */
	protected List<ParseObject> retrieveParseObjects() throws WinkParseException {
		final List<ParseObject> result = new ArrayList<ParseObject>();
		result.addAll(getSetName(getNode()));
		result.addAll(retrieveSetProp(getNode()));
		return result;
	}

	/**
	 * @throws WinkParseException
	 */
	public void interpret() throws WinkParseException {
		final List<ParseObject> objects = retrieveParseObjects();

		Collections.sort(objects, ParseObject.getLineComparator());
		Collections.sort(objects, ParseObject.getTypeComparator());

		for (final ParseObject po : objects) {
			interpretParseObject(po);
		}
	}

	/**
	 * @param po
	 * @throws WinkParseException
	 */
	protected void interpretParseObject(final ParseObject po) throws WinkParseException {
		if (po instanceof SetName) {
			interpretSetName((SetName) po);
		} else if (po instanceof SetProp) {
			interpretSetProp((SetProp) po);
		} else {
			throw new WinkParseException("ERROR - cannot interpret ParseObject : type not managed : " + po.getClass().getName());
		}
	}

	/**
	 * @return
	 */
	protected ScriptObject getCallThisReference() {
		return this;
	}

	/**
	 * @param headNode
	 * @throws WinkParseException
	 */
	protected List<SetName> getSetName(final AstNode headNode) throws WinkParseException {
		final List<SetName> setnames = new ArrayList<SetName>();
		ParserUtils.getSetName(headNode, setnames);
		return setnames;
	}

	/**
	 * @param sn
	 * @throws WinkParseException
	 */
	protected void interpretSetName(final SetName sn) throws WinkParseException {
		final String name = sn.getBindName();
		final ParseObject value = sn.getValue();
		final ScriptObject so = ParserUtils.buildScriptObject(value, this);
		final Namespace ns = Namespace.build(namespace, name);
		addComponent(name, so, this, ns);

		so.interpret();
	}

	/**
	 * @param headNode
	 * @return
	 * @throws WinkParseException
	 */
	protected List<SetProp> retrieveSetProp(final AstNode headNode) throws WinkParseException {
		final List<SetProp> setprops = new ArrayList<SetProp>();
		ParserUtils.getSetProp(headNode, setprops);
		return setprops;
	}

	/**
	 * @param sp
	 * @throws WinkParseException
	 */
	protected void interpretSetProp(final SetProp sp) throws WinkParseException {
		final Namespace spns = sp.getNamespace();
		spns.resolveThisBy(namespace);
		final ScriptObject soChild = ParserUtils.buildScriptObject(sp.getValue(), this);
		ScriptObject so;
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

	/**
	 * @param name
	 * @param so
	 * @param linkedParent
	 * @param ns
	 * @throws WinkParseException
	 */
	public void addComponent(final String name, final ScriptObject so, final ScriptObject linkedParent, final Namespace ns) throws WinkParseException {
		so.setParent(this);
		so.setLinkedParent(linkedParent);
		so.setNamespace(ns);

		if (so instanceof FunctionObject) {
			addFunction(name, so);
			((FunctionObject) so).populateParams();
		} else if (so instanceof LiteralObject) {
			addLiteral(name, so);
		} else if (so instanceof DefaultObject) {
			addProperty(name, so);
		}
	}

	/**
	 * @param name
	 * @param so
	 * @throws WinkParseException
	 */
	public void addLiteral(final String name, final ScriptObject so) throws WinkParseException {
		String key = name;
		final LiteralObject lo = (LiteralObject) so;
		if (getLiterals().containsKey(name)) {
			final LiteralObject pImpl = getLiterals().get(name);
			pImpl.addExtension(lo);
			key = name + pImpl.getExtendKey(lo);
		}
		getLiterals().put(key, lo);
	}

	/**
	 * @param name
	 * @param so
	 * @throws WinkParseException
	 */
	public void addFunction(final String name, final ScriptObject so) throws WinkParseException {
		String key = name;
		final FunctionObject fo = (FunctionObject) so;
		if (getFunctions().containsKey(name)) {
			final FunctionObject pImpl = getFunctions().get(name);
			pImpl.addExtension(fo);
			key = name + pImpl.getExtendKey(fo);
		}
		getFunctions().put(key, fo);
	}

	/**
	 * @param name
	 * @param so
	 */
	public void addProperty(final String name, final ScriptObject so) {
		getProperties().put(name, (DefaultObject) so);
	}

	/**
	 * @param ext
	 * @return
	 * @throws WinkParseException
	 */
	public String getExtendKey(final ScriptObject ext) throws WinkParseException {
		int idx = -1;
		for (int i = 0; i < extensions.size(); i++) {
			if (extensions.get(i) == ext) {
				idx = i;
				break;
			}
		}
		if (idx == -1) {
			throw new WinkParseException("extended function not found in extensions");
		}
		return ".extend." + (idx + 1);
	}

	/**
	 * @param fo
	 */
	public void addExtension(final ScriptObject fo) {
		extensions.add(fo);
		fo.setParentImpl(this);
	}

	/**
	 * @param ns
	 * @return
	 * @throws WinkParseException
	 */
	public ScriptObject resolveByNamespace(final Namespace ns) throws WinkParseException {
		ScriptObject cursor = getGlobalScope();
		if (!ns.equals(cursor.getNamespace())) {
			for (final String name : ns.getNames()) {
				final Map<String, ScriptObject> sos = new HashMap<String, ScriptObject>();
				sos.putAll(cursor.getLiterals());
				sos.putAll(cursor.getFunctions());
				sos.putAll(cursor.getProperties());

				if (!sos.containsKey(name)) {
					final GlobalObject go = getGlobalScope();
					if (go.resolveGlobalNamespace(ns.toString())) {
						return resolveByNamespace(ns); // retry
					} else {
						throw new WinkParseException("resolveByNamespace failed: " + ns.toString() + " is not accessible");
					}
				}
				cursor = sos.get(name);
				final List<ScriptObject> exts = cursor.getExtensions();
				if (exts.size() > 0) {
					cursor = exts.get(exts.size() - 1);
				}
			}
		}
		return cursor;
	}

	/**
	 * @return
	 */
	public GlobalObject getGlobalScope() {
		final ScriptObject p = getLinkedParent();
		if (p == null) {
			if (this instanceof GlobalObject) {
				return (GlobalObject) this;
			}
			return null;
		} else if (p instanceof GlobalObject) {
			return (GlobalObject) p;
		} else {
			return p.getGlobalScope();
		}
	}

	/**
	 * @see java.lang.Object#toString()
	 */
	@Override
	public String toString() {
		final StringBuffer sb = new StringBuffer();
		sb.append(namespace);
		sb.append(" [").append(getNamedType());
		if (parent != null) {
			sb.append(" extends ").append(parent.namespace.toString());
		}
		sb.append("] ");

		String desc = "";
		try {
			desc = getDescription();
		} catch (final WinkParseException e) {

		}
		sb.append(desc);

		sb.append(" (");
		if (sourceName != null) {
			final String[] sp = sourceName.split("/");
			sb.append(sp[sp.length - 1]).append("; ");
		}
		if (lineStart != -1 || lineEnd != -1) {
			final String ls = (lineStart == -1) ? "?" : new Integer(lineStart).toString();
			final String le = (lineEnd == -1) ? "?" : new Integer(lineEnd).toString();
			sb.append("L:").append(ls).append("-").append(le).append(";");
		}
		if (charStart != -1 || charEnd != -1) {
			final String cs = (charStart == -1) ? "?" : new Integer(charStart).toString();
			final String ce = (charEnd == -1) ? "?" : new Integer(charEnd).toString();
			sb.append("C:").append(cs).append("-").append(ce).append(";");
		}
		sb.append(")");
		return sb.toString();
	}

	/**
	 * @param sb
	 * @param level
	 * @return
	 */
	public String toStringRecursive(StringBuffer sb, final int level) {
		if (sb == null) {
			sb = new StringBuffer();
		}

		final String tab = "  ";
		final StringBuffer buf = new StringBuffer();
		for (int i = 0; i < level; i++) {
			buf.append(tab);
		}
		buf.append("[").append(level).append("] ");
		final String tabs = buf.toString();
		sb.append(tabs).append(toString());
		sb.append("\n");

		Set<String> keys = getLiterals().keySet();
		for (final String key : keys) {
			final ScriptObject so = getLiterals().get(key);
			so.toStringRecursive(sb, level + 1);
		}
		keys = getFunctions().keySet();
		for (final String key : keys) {
			final ScriptObject so = getFunctions().get(key);
			so.toStringRecursive(sb, level + 1);
		}

		keys = getProperties().keySet();
		for (final String key : keys) {
			final ScriptObject so = getProperties().get(key);
			so.toStringRecursive(sb, level + 1);
		}

		return sb.toString();
	}

	/**
	 * @return
	 */
	public ScriptObject getParent() {
		return parent;
	}

	/**
	 * @param parent
	 */
	public void setParent(final ScriptObject parent) {
		this.parent = parent;
	}

	/**
	 * @return
	 */
	public ScriptObject getLinkedParent() {
		return linkedParent;
	}

	/**
	 * @param linkedParent
	 */
	public void setLinkedParent(final ScriptObject linkedParent) {
		this.linkedParent = linkedParent;
	}

	/**
	 * @return
	 */
	public int getLineStart() {
		return lineStart;
	}

	/**
	 * @param lineStart
	 */
	public void setLineStart(final int lineStart) {
		this.lineStart = lineStart;
	}

	/**
	 * @return
	 */
	public int getLineEnd() {
		return lineEnd;
	}

	/**
	 * @param lineEnd
	 */
	public void setLineEnd(final int lineEnd) {
		this.lineEnd = lineEnd;
	}

	/**
	 * @return
	 */
	public int getCharStart() {
		return charStart;
	}

	/**
	 * @param charStart
	 */
	public void setCharStart(final int charStart) {
		this.charStart = charStart;
	}

	/**
	 * @return
	 */
	public int getCharEnd() {
		return charEnd;
	}

	/**
	 * @param charEnd
	 */
	public void setCharEnd(final int charEnd) {
		this.charEnd = charEnd;
	}

	/**
	 * @return
	 */
	public Namespace getNamespace() {
		return namespace;
	}

	/**
	 * @param namespace
	 */
	public void setNamespace(final Namespace namespace) {
		this.namespace = namespace;
	}

	/**
	 * @return
	 */
	public String getSourceName() {
		return sourceName;
	}

	/**
	 * @param sourceName
	 */
	public void setSourceName(final String sourceName) {
		this.sourceName = sourceName;
	}

	/**
	 * @return
	 */
	public Map<String, LiteralObject> getLiterals() {
		return literals;
	}

	/**
	 * @return
	 */
	public Map<String, FunctionObject> getFunctions() {
		return functions;
	}

	/**
	 * @return
	 */
	public Map<String, DefaultObject> getProperties() {
		return properties;
	}

	/**
	 * @param parentImpl
	 *            the parentImpl to set
	 */
	public void setParentImpl(final ScriptObject parentImpl) {
		this.parentImpl = parentImpl;
	}

	/**
	 * @return the isVirtual
	 */
	public boolean isVirtual() {
		return isVirtual;
	}

	/**
	 * @param isVirtual
	 *            the isVirtual to set
	 */
	public void setVirtual(final boolean isVirtual) {
		this.isVirtual = isVirtual;
	}

	/**
	 * @return the extensions
	 */
	public List<ScriptObject> getExtensions() {
		return extensions;
	}

	/**
	 * @return the parentImpl
	 */
	public ScriptObject getParentImpl() {
		return parentImpl;
	}

	/**
	 * @return the sourceActiveInFile
	 */
	public boolean isSourceActiveInFile() {
		return sourceActiveInFile;
	}

	/**
	 * @param sourceActiveInFile
	 *            the sourceActiveInFile to set
	 */
	public void setSourceActiveInFile(final boolean sourceActiveInFile) {
		this.sourceActiveInFile = sourceActiveInFile;
	}

	/**
	 * @return the node
	 */
	public AstNode getNode() {
		return node;
	}
}
