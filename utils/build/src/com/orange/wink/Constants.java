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

import org.mozilla.javascript.Token;

import com.orange.wink.ast.Ast;

/**
 * @author Sylvain Lalande
 * 
 */
public final class Constants {
	/**
	 * 
	 */
	public static final String JS_PATH = "JS_PATH";
	public static final String JS_MAIN_FILE = "JS_MAIN_FILE";
	/**
	 * 
	 */
	public static final String CONF_PATH = "CONF_PATH";
	public static final String MODULE_CONF_FILE = "MODULE_CONF_FILE";
	public static final String PROFILES_CONF_FILE = "PROFILES_CONF_FILE";
	/**
	 * 
	 */
	public static final String WINK_PATH = "WINK_PATH";
	public static final String TEMPORARY_PATH = "TEMPORARY_PATH";
	public static final String BUILD_DEST_PATH = "BUILD_DEST_PATH";
	/**
	 * 
	 */
	public static final String TARGETS = "TARGETS";
	public static final String PROFILES = "PROFILES";
	/**
	 * 
	 */
	public static final String OPTION_PREFIX = "OPTION_";
	public static final String OPTION_CLEAN_TEMPORARY = OPTION_PREFIX + "CLEAN_TEMPORARY";
	public static final String OPTION_DELETE_DUPLICATES = OPTION_PREFIX + "DELETE_DUPLICATES";
	public static final String OPTION_FILTER_FEATURE = OPTION_PREFIX + "FILTER_FEATURE";
	public static final String OPTION_PRINT_EXTENSIONS = OPTION_PREFIX + "PRINT_EXTENSIONS";
	public static final String OPTION_PRINT_MODEL = OPTION_PREFIX + "PRINT_MODEL";
	public static final String OPTION_FAIL_ON_UNMANAGED_SYNTAX = OPTION_PREFIX + "FAIL_ON_UNMANAGED_SYNTAX";
	public static final String OPTION_WARN_ON_UNMANAGED_SYNTAX = OPTION_PREFIX + "WARN_ON_UNMANAGED_SYNTAX";
	public static final String OPTION_FAIL_ON_UNRESOLVED_NAMESPACE = OPTION_PREFIX + "FAIL_ON_UNRESOLVED_NAMESPACE";
	public static final String OPTION_DELETE_VALIDATE_PROPERTIES = OPTION_PREFIX + "DELETE_VALIDATE_PROPERTIES";
	public static final String OPTION_DELETE_LOGS = OPTION_PREFIX + "DELETE_LOGS";
	public static final String OPTION_REWRITE_IMAGE_URL = OPTION_PREFIX + "REWRITE_IMAGE_URL";
	public static final String OPTION_FROM_WINK_PATH = OPTION_PREFIX + "FROM_WINK_PATH";
	public static final String OPTION_RELATIVE_PATH = OPTION_PREFIX + "RELATIVE_PATH";

	/**
	 * 
	 */
	public static final String[] NAMED_PROPERTIES = new String[] { JS_PATH, JS_MAIN_FILE, CONF_PATH, MODULE_CONF_FILE, PROFILES_CONF_FILE, WINK_PATH, TEMPORARY_PATH, BUILD_DEST_PATH, TARGETS, PROFILES, OPTION_CLEAN_TEMPORARY, OPTION_DELETE_DUPLICATES, OPTION_FILTER_FEATURE, OPTION_PRINT_EXTENSIONS,
			OPTION_PRINT_MODEL, OPTION_FAIL_ON_UNMANAGED_SYNTAX, OPTION_WARN_ON_UNMANAGED_SYNTAX, OPTION_FAIL_ON_UNRESOLVED_NAMESPACE, OPTION_DELETE_VALIDATE_PROPERTIES, OPTION_DELETE_LOGS, OPTION_REWRITE_IMAGE_URL, OPTION_FROM_WINK_PATH, OPTION_RELATIVE_PATH };

	/**
	 * 
	 */
	public static boolean failOnUnmanagedSyntax = true;
	/**
	 * 
	 */
	public static boolean warnOnUnmanagedSyntax = false;
	/**
	 * 
	 */
	public static boolean failOnUnresolvedNamespace = true;
	/**
	 * 
	 */
	public static boolean fromWinkPath = false;
	/**
	 * 
	 */
	public static String relativePath = "";
	/**
	 * 
	 */
	public static final String THIS_TOKEN = Ast.tokenName(Token.THIS);
	/**
	 * 
	 */
	public static final String ANONYMOUS_FUNCTION_PREFIX = "anonymous-function";
	/**
	 * 
	 */
	public static final String DEFINE_CALL = "define";
	/**
	 * 
	 */
	public static final String WINK_NAMESPACE = "wink";
}
