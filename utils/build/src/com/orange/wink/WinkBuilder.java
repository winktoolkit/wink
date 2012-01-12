/*--------------------------------------------------------
 * Copyright (c) 2011, The Dojo Foundation
 * This software is distributed under the "Simplified BSD license",
 * the text of which is available at http://www.winktoolkit.org/licence.txt
 * or see the "license.txt" file for more details.
 *--------------------------------------------------------*/

/**
 * 
 */
package com.orange.wink;

import java.io.File;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.StringTokenizer;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

import org.mozilla.javascript.Context;
import org.mozilla.javascript.Scriptable;
import org.mozilla.javascript.ScriptableObject;

import com.orange.wink.exception.WinkBuildException;

/**
 * @author Sylvain LALANDE
 * 
 */
public class WinkBuilder {
	/**
	 * 
	 */
	private Map<String, String> properties;

	/**
	 * @throws WinkBuildException
	 */
	public void execute() throws WinkBuildException {
		if (properties == null) {
			throw new WinkBuildException("WinkBuilder must be initialized first");
		}

		Constants.failOnUnmanagedSyntax = Boolean.valueOf(getProperty(Constants.OPTION_FAIL_ON_UNMANAGED_SYNTAX));
		Constants.warnOnUnmanagedSyntax = Boolean.valueOf(getProperty(Constants.OPTION_WARN_ON_UNMANAGED_SYNTAX));
		Constants.failOnUnresolvedNamespace = Boolean.valueOf(getProperty(Constants.OPTION_FAIL_ON_UNRESOLVED_NAMESPACE));
		Constants.fromWinkPath = Boolean.valueOf(getProperty(Constants.OPTION_FROM_WINK_PATH));
		Constants.relativePath = getProperty(Constants.OPTION_RELATIVE_PATH);

		final Context cx = Context.enter();
		cx.setOptimizationLevel(-1);
		final ScriptableObject scope = cx.initStandardObjects();

		putFunctions(cx, scope);
		putConf(cx, scope);

		final String mainFile = getProperty(Constants.JS_PATH) + File.separator + getProperty(Constants.JS_MAIN_FILE);
		WinkBuilderHelper.executeJsFile(cx, scope, mainFile);
	}

	/**
	 * @param propValues
	 */
	public void initialize(final String[] args) throws WinkBuildException {
		final Map<String, String> propValues = getArguments(args);
		properties = new HashMap<String, String>();
		for (final String key : Constants.NAMED_PROPERTIES) {
			String value = "";
			if (propValues.containsKey(key)) {
				value = propValues.get(key);
			}
			properties.put(key, value);
		}
	}

	/**
	 * @param args
	 * @return
	 * @throws WinkBuildException
	 */
	private Map<String, String> getArguments(final String[] args) throws WinkBuildException {
		final String optionExpr = "(-)(.*)(=)(.*)";
		final Pattern optionPattern = Pattern.compile(optionExpr);

		final Map<String, String> propValues = new HashMap<String, String>();
		for (final String arg : args) {
			final Matcher m = optionPattern.matcher(arg);
			if (!m.matches() || m.groupCount() != 4) {
				throw new WinkBuildException("Bad Option [" + arg + "], must match:" + optionExpr);
			}
			propValues.put(m.group(2), m.group(4));
		}
		return propValues;
	}

	/**
	 * @param name
	 * @return
	 */
	private String getProperty(final String name) {
		return properties.get(name);
	}

	/**
	 * @param cx
	 * @param scope
	 */
	private void putFunctions(final Context cx, final ScriptableObject scope) {
		final String[] functions = { "print", "error", "load", "isReadableFile", "isDirectory", "createDirectory", "deleteFile", "readFile", "copyFile", "concatenateFiles", "parseFiles", "applyFilterFeature", "deleteValidateProperties", "deleteLogs", "applyBadSyntaxFilter", "rewriteImageURL" };
		scope.defineFunctionProperties(functions, WinkBuilderHelper.class, ScriptableObject.DONTENUM);
	}

	/**
	 * @param cx
	 * @param scope
	 */
	private void putConf(final Context cx, final ScriptableObject scope) {
		final Scriptable sctConf = cx.newObject(scope);
		ScriptableObject.putProperty(scope, "FILE_SEPARATOR", File.separator);
		ScriptableObject.putProperty(scope, "conf", sctConf);

		final Set<String> keys = properties.keySet();
		for (final String key : keys) {
			if (key.equals(Constants.TARGETS) || key.equals(Constants.PROFILES)) {
				final String value = getProperty(key);
				final List<String> tokens = new ArrayList<String>();
				if (value != null) {
					final StringTokenizer st = new StringTokenizer(value, ",");
					while (st.hasMoreTokens()) {
						final String token = st.nextToken();
						tokens.add(token.trim());
					}
				}
				final Scriptable sctArray = cx.newArray(scope, tokens.toArray());
				ScriptableObject.putProperty(sctConf, key, sctArray);
			} else {
				final String value = getProperty(key);
				if (key.startsWith(Constants.OPTION_PREFIX)) {
					final Boolean b = new Boolean(value);
					ScriptableObject.putProperty(sctConf, key, b);
				} else {
					ScriptableObject.putProperty(sctConf, key, value);
				}
			}
		}
	}
}
