/*--------------------------------------------------------
 * Copyright (c) 2011, The Dojo Foundation
 * This software is distributed under the "Simplified BSD license",
 * the text of which is available at http://www.winktoolkit.org/licence.txt
 * or see the "license.txt" file for more details.
 *--------------------------------------------------------*/

/**
 * 
 */
package com.orange.wink.parse;

import java.io.IOException;
import java.util.ArrayList;
import java.util.Collection;
import java.util.List;

import org.mozilla.javascript.Context;
import org.mozilla.javascript.Scriptable;
import org.mozilla.javascript.ScriptableObject;

import com.orange.wink.exception.WinkBuildException;
import com.orange.wink.model.FunctionObject;
import com.orange.wink.model.GlobalObject;
import com.orange.wink.model.LiteralObject;
import com.orange.wink.model.ScriptObject;
import com.orange.wink.util.FileManager;
import com.orange.wink.util.WinkJsFile;

/**
 * @author Sylvain Lalande
 * 
 */
public class WinkJsModel extends ScriptableObject {
	/**
	 * 
	 */
	private static final long serialVersionUID = 1L;
	/**
	 * 
	 */
	private GlobalObject scope;
	/**
	 * 
	 */
	private Context cx;
	/**
	 * 
	 */
	private List<FunctionObject> functions;
	/**
	 * 
	 */
	private List<LiteralObject> literals;

	/**
	 * 
	 */
	public WinkJsModel() {

	}

	/**
	 * 
	 */
	public void jsConstructor() {

	}

	/**
	 * @param scope
	 */
	public void setGlobalScope(final GlobalObject scope) {
		this.scope = scope;
	}

	/**
	 * @param cx
	 *            the cx to set
	 */
	public void setCx(final Context cx) {
		this.cx = cx;
	}

	/**
	 * @param list
	 * @param so
	 */
	private void getFunctions(final List<FunctionObject> list, final ScriptObject so) {
		final Collection<FunctionObject> fns = so.getFunctions().values();
		list.addAll(fns);
		for (final FunctionObject f : fns) {
			getFunctions(list, f);
		}
		final Collection<LiteralObject> lts = so.getLiterals().values();
		for (final LiteralObject l : lts) {
			getFunctions(list, l);
		}
	}

	/**
	 * @param list
	 * @param so
	 */
	private void getLiterals(final List<LiteralObject> list, final ScriptObject so) {
		final Collection<LiteralObject> lts = so.getLiterals().values();
		list.addAll(lts);
		for (final LiteralObject l : lts) {
			getLiterals(list, l);
		}
		final Collection<FunctionObject> fns = so.getFunctions().values();
		for (final FunctionObject f : fns) {
			getLiterals(list, f);
		}
	}

	/**
	 * 
	 */
	private void initFunctions() {
		if (functions == null) {
			functions = new ArrayList<FunctionObject>();
			getFunctions(functions, scope);
		}
	}

	/**
	 * 
	 */
	private void initLiterals() {
		if (literals == null) {
			literals = new ArrayList<LiteralObject>();
			getLiterals(literals, scope);
		}
	}

	/**
	 * @param name
	 * @return
	 */
	private ScriptObject getScriptObjectByName(final String name) {
		ScriptObject so = null;

		for (final FunctionObject f : functions) {
			if (f.getNamespace().toString().equals(name)) {
				if (f.getParentImpl() == null) {
					so = f;
					break;
				}
			}
		}
		for (final LiteralObject l : literals) {
			if (l.getNamespace().toString().equals(name)) {
				if (l.getParentImpl() == null) {
					so = l;
					break;
				}
			}
		}
		return so;
	}

	/**
	 * @return
	 */
	public Object jsFunction_getDuplicates() {
		initFunctions();
		initLiterals();

		final List<Object> names = new ArrayList<Object>();
		for (final FunctionObject f : functions) {
			final List<ScriptObject> exts = f.getExtensions();
			if (exts.size() > 0) {
				names.add(f.getNamespace().toString());
			}
		}
		for (final LiteralObject f : literals) {
			final List<ScriptObject> exts = f.getExtensions();
			if (exts.size() > 0) {
				names.add(f.getNamespace().toString());
			}
		}

		// System.out.println("getDuplicateFunctions:" + names.size());
		final Scriptable ar = cx.newArray(this, names.toArray());
		return ar;
	}

	/**
	 * @param name
	 * @return
	 * @throws WinkBuildException
	 */
	public Object jsFunction_getDeclarationsList(final String name) throws WinkBuildException {
		final ScriptObject so = getScriptObjectByName(name);
		final StringBuffer sb = new StringBuffer();

		if (so != null) {
			sb.append(so.toString()).append("\n");
			final List<ScriptObject> exts = so.getExtensions();
			for (final ScriptObject ext : exts) {
				sb.append("\t->").append(ext).append("\n");
			}
		} else {
			throw new WinkBuildException("getDeclarationsList failed : duplicate not found");
		}
		return sb.toString();
	}

	/**
	 * @param name
	 * @throws WinkBuildException
	 */
	public void jsFunction_deleteDuplicate(final String name) throws WinkBuildException {
		initFunctions();
		initLiterals();

		final ScriptObject so = getScriptObjectByName(name);
		final List<ScriptObject> toRemove = new ArrayList<ScriptObject>();

		toRemove.add(so);

		final List<ScriptObject> exts = so.getExtensions();
		for (int i = 0; i < exts.size(); i++) {
			if (i < exts.size() - 1) {
				toRemove.add(exts.get(i));
			}
		}

		for (final ScriptObject tr : toRemove) {
			removeFromFile(tr);
		}
	}

	/**
	 * @param so
	 * @throws WinkBuildException
	 */
	public void removeFromFile(final ScriptObject so) throws WinkBuildException {
		if (!so.isSourceActiveInFile()) {
			// System.out.println("skip already removed: " + so.getNamespace());
			return;
		}

		final List<FunctionObject> fnChilds = new ArrayList<FunctionObject>();
		getFunctions(fnChilds, so);
		final List<LiteralObject> ltChilds = new ArrayList<LiteralObject>();
		getLiterals(ltChilds, so);

		for (final FunctionObject fnchild : fnChilds) {
			removeFromFile(fnchild);
		}
		for (final LiteralObject ltchild : ltChilds) {
			removeFromFile(ltchild);
		}

		final WinkJsFile jf = new WinkJsFile(so.getSourceName());
		try {
			// System.out.println("REMOVE: " + so.getNamespace());
			FileManager.removeInFile(jf.getFilename(), so.getLineStart(), so.getLineEnd(), so.getCharStart(), so.getCharEnd());
			so.setSourceActiveInFile(false);
		} catch (final IOException e) {
			throw new WinkBuildException(e);
		}
	}

	/**
	 * @param namespace
	 */
	public void jsFunction_print() {
		System.out.println(this);
	}

	/**
	 * @see java.lang.Object#toString()
	 */
	@Override
	public String toString() {
		if (scope != null) {
			return scope.toStringRecursive(null, 0);
		}
		return "";
	}

	/**
	 * @see org.mozilla.javascript.ScriptableObject#getClassName()
	 */
	@Override
	public String getClassName() {
		return "WinkJsModel";
	}

	/**
	 * @see org.mozilla.javascript.ScriptableObject#getDefaultValue(java.lang.Class)
	 */
	@Override
	public Object getDefaultValue(final Class<?> typeHint) {
		return "[WinkJsModel Instance]";
	}
}
