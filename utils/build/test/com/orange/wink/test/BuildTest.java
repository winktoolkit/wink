/*--------------------------------------------------------
 * Copyright (c) 2011, The Dojo Foundation
 * This software is distributed under the "Simplified BSD license",
 * the text of which is available at http://www.winktoolkit.org/licence.txt
 * or see the "license.txt" file for more details.
 *--------------------------------------------------------*/

/**
 * 
 */
package com.orange.wink.test;

import java.io.File;
import java.io.FileNotFoundException;
import java.io.FileReader;
import java.io.IOException;
import java.io.Reader;
import java.util.ArrayList;
import java.util.Collection;
import java.util.Collections;
import java.util.List;

import org.mozilla.javascript.Context;
import org.mozilla.javascript.NativeObject;
import org.mozilla.javascript.Script;
import org.mozilla.javascript.ScriptableObject;

import com.orange.wink.Main;
import com.orange.wink.exception.WinkAstException;
import com.orange.wink.exception.WinkBuildException;
import com.orange.wink.exception.WinkParseException;
import com.orange.wink.model.FunctionObject;
import com.orange.wink.model.GlobalObject;
import com.orange.wink.model.LiteralObject;
import com.orange.wink.model.Namespace;
import com.orange.wink.model.ScriptObject;
import com.orange.wink.parse.WinkParser;
import com.orange.wink.util.FileUtil;
import com.orange.wink.util.WinkJsFile;

/**
 * @author Sylvain Lalande
 * 
 */
public class BuildTest extends BuildAbstractTest {
	/**
	 * @param args
	 */
	public static void main(final String[] args) throws Exception {
		final String testPath = "../wink/utils/build/test/";
		final String rootTmpPath = testPath + "tmp/";
		final String tmpPath = rootTmpPath + "js";
		final String rootBuildPath = testPath + "builded/";
		final String buildPath = rootBuildPath + "js";
		final String modulePath = testPath + "modules/";
		externalFile = modulePath + "module2_external.js";

		final String[] arguments = new String[] {
		// 
				"-JS_PATH=../wink/utils/build/scripts",
				// 
				"-JS_MAIN_FILE=build.js",
				// 
				"-CONF_PATH=../wink/utils/build/test/conf",
				// 
				"-MODULE_CONF_FILE=modules.json",
				// 
				"-PROFILES_CONF_FILE=profiles.json",
				// 
				"-WINK_PATH=" + modulePath,
				// 
				"-TEMPORARY_PATH=" + tmpPath,
				// 
				"-BUILD_DEST_PATH=" + buildPath,
				// default, ie, android-1.5
				"-TARGETS=",
				// default, light
				"-PROFILES=",
				// 
				"-OPTION_CLEAN_TEMPORARY=false",
				// 
				"-OPTION_DELETE_DUPLICATES=true",
				// 
				"-OPTION_FILTER_FEATURE=true",
				// 
				"-OPTION_PRINT_EXTENSIONS=false",
				// 
				"-OPTION_PRINT_MODEL=false",
				// 
				"-OPTION_FAIL_ON_UNMANAGED_SYNTAX=true",
				// 
				"-OPTION_WARN_ON_UNMANAGED_SYNTAX=false",
				// 
				"-OPTION_FAIL_ON_UNRESOLVED_NAMESPACE=true",
				// 
				"-OPTION_DELETE_VALIDATE_PROPERTIES=true",
				//
				"-OPTION_DELETE_LOGS=true" };

		createDirectory(rootTmpPath);
		createDirectory(rootBuildPath);

		checkEncoding(modulePath);

		Main.main(arguments);

		checkBuildFiles(buildPath);
		checkDetails(buildPath);
		checkHas(buildPath);
		executeAll(buildPath);

		printTestResults();
	}

	/**
	 * 
	 */
	private static String externalFile = null;

	/**
	 * @param modulePath
	 * @throws IOException
	 */
	private static void checkEncoding(final String modulePath) throws IOException {
		String modfile = "module1.js";
		String encexpected = "UTF-8";
		String enc = FileUtil.getEncoding(modulePath + modfile);
		assertTrue(enc.equals(encexpected), "expected encoding '" + encexpected + "' for " + modfile + ", got: '" + enc + "'");

		modfile = "module1_ie.js";
		encexpected = "windows-1252";
		enc = FileUtil.getEncoding(modulePath + modfile);
		assertTrue(enc.equals(encexpected), "expected encoding '" + encexpected + "' for " + modfile + ", got: '" + enc + "'");

		modfile = "module2.js";
		encexpected = "ASCII";
		enc = FileUtil.getEncoding(modulePath + modfile);
		assertTrue(enc.equals(encexpected), "expected encoding '" + encexpected + "' for " + modfile + ", got: '" + enc + "'");

		modfile = "module2_ie.js";
		encexpected = "UTF-8";
		enc = FileUtil.getEncoding(modulePath + modfile);
		assertTrue(enc.equals(encexpected), "expected encoding '" + encexpected + "' for " + modfile + ", got: '" + enc + "'");
	}

	/**
	 * @param buildPath
	 * @throws WinkBuildException
	 * @throws IOException
	 */
	private static void checkBuildFiles(final String buildPath) throws WinkBuildException, IOException {
		final File[] files = getFiles(buildPath);
		for (final File f : files) {
			out("------- CHECK ------- " + f.getPath());
			final List<FunctionObject> functions = new ArrayList<FunctionObject>();
			final List<LiteralObject> literals = new ArrayList<LiteralObject>();
			parseFile(f.getPath(), new String[] { externalFile }, functions, literals);

			final List<Namespace> names = new ArrayList<Namespace>();
			for (final FunctionObject fo : functions) {
				final List<ScriptObject> exts = fo.getExtensions();
				if (exts.size() > 0) {
					names.add(fo.getNamespace());
				}
			}

			final boolean isIE = f.getPath().contains("ie");
			final boolean isLight = f.getPath().contains("light");
			final String i18nNs = "wink.ui.other.i18n";

			boolean hasHtmlElement = false;
			boolean hasWindow = false;
			boolean hasI18nEn = false;
			boolean hasI18nFr = false;
			boolean hasI18nEs = false;
			boolean hasUa = isIE;
			if (isIE || isLight) {
				hasHtmlElement = true;
				hasWindow = true;
			}
			for (final LiteralObject lo : literals) {
				final List<ScriptObject> exts = lo.getExtensions();
				if (exts.size() > 0) {
					names.add(lo.getNamespace());
				}
				final String ns = lo.getNamespace().toString();

				if (!isIE) {
					if (ns.equals("wink.ua")) {
						assertTrue(lo.getProperties().size() == 2, "Expected 2 properties in " + ns);
						assertTrue(!(lo.getProperties().containsKey("isIE")), "Unexpected 'isIE' property in " + ns);
						hasUa = true;
					} else if (ns.equals("wink.ui.other")) {
						assertTrue(lo.getFunctions().size() == 8, "Expected 7 functions in " + ns);
						for (final FunctionObject fo : lo.getFunctions().values()) {
							assertTrue(fo.getParameters().size() == 0, "Expected 0 parameters in " + ns + " functions");
							if (fo.getName().equals("_validateProperties")) {
								final String source = getSource(fo);
								assertTrue(source.indexOf("{\nreturn true;\n}") != -1, "expected filtered validateProperties");
							}
						}
					} else if (ns.equals("HTMLElement.prototype")) {
						hasHtmlElement = true;
					} else if (ns.equals("window")) {
						hasWindow = true;
						assertTrue(lo.getLiterals().size() == 2, "Expected 2 literals in " + ns);
					}
				}

				if (ns.startsWith(i18nNs)) {
					if (ns.startsWith(i18nNs + ".en")) {
						hasI18nEn = true;
					} else if (ns.startsWith(i18nNs + ".fr")) {
						hasI18nFr = true;
					} else if (ns.startsWith(i18nNs + ".es")) {
						hasI18nEs = true;
					}
				}
			}
			assertTrue(hasUa, "Expected wink.ua in global");
			assertTrue(hasHtmlElement, "Expected HTMLElement.prototype in global");
			assertTrue(hasWindow, "Expected window in global");
			if (isLight) {
				if (isIE) {
					assertFalse(hasI18nEn, "i18n en must not be declared for " + f.getName());
					assertTrue(hasI18nFr, "i18n en must be declared for " + f.getName());
					assertTrue(hasI18nEs, "i18n en must be declared for " + f.getName());
				} else {
					assertFalse(hasI18nEn, "i18n en must not be declared for " + f.getName());
					assertTrue(hasI18nFr, "i18n en must be declared for " + f.getName());
					assertFalse(hasI18nEs, "i18n en must not be declared for " + f.getName());
				}
			} else {
				assertTrue(hasI18nEn, "i18n en must be declared for " + f.getName());
				assertFalse(hasI18nFr, "i18n en must not be declared for " + f.getName());
				assertFalse(hasI18nEs, "i18n en must not be declared for " + f.getName());
			}

			// out(functions.size() + " Functions, " + literals.size() +
			// " Literals, " + names.size() + " extensions");
			assertTrue(names.size() == 0, "Unexpected extension for : " + names);
		}
	}

	/**
	 * @param buildPath
	 * @throws WinkBuildException
	 * @throws IOException
	 */
	private static void checkDetails(final String buildPath) throws WinkBuildException, IOException {
		File fileToInspect = null;

		final File[] files = getFiles(buildPath);
		for (final File f : files) {
			if (f.getPath().contains("default-ie")) {
				fileToInspect = f;
				break;
			}
		}

		assertTrue(fileToInspect != null, "Expected file 'default-ie'");
		if (fileToInspect == null) {
			return;
		}

		out("------- CHECK DETAILS ------- " + fileToInspect.getPath());
		final List<FunctionObject> functions = new ArrayList<FunctionObject>();
		final List<LiteralObject> literals = new ArrayList<LiteralObject>();
		parseFile(fileToInspect.getPath(), new String[] { externalFile }, functions, literals);

		assertTrue(literals.size() == 22, "Expected 22 literals : " + literals.size());
		assertTrue(functions.size() == 35, "Expected 35 functions : " + functions.size());

		boolean hasRound = false;

		for (final FunctionObject so : functions) {
			final String source = getSource(so);
			final String ns = so.getNamespace().toString();

			assertTrue(source.indexOf("function") != -1, "Expected 'function' keyword in function source - " + ns);
			for (final String param : so.getParameters()) {
				assertTrue(source.indexOf(param) != -1, "Expected parameter '" + param + "' in function source - " + ns);
			}

			if (ns.equals("wink.byId")) {
				assertTrue(source.charAt(source.length() - 1) == ';', "Expected ';' as last char - " + ns);
				assertTrue(source.indexOf("IE byId Impl é") != -1, "Expected 'IE byId Impl é' in function source - " + ns);
				assertTrue(source.startsWith(ns), "Expected function start with '" + ns + "' - " + ns);
				assertTrue(source.indexOf("wink.log") == -1, "Expected 'wink.log' removed from '" + ns);
				assertTrue(source.indexOf("console.log") == -1, "Expected 'console.log' removed from '" + ns);
			} else if (ns.equals("wink.isUndefined")) {
				assertTrue(source.charAt(source.length() - 1) == ';', "Expected ';' as last char - " + ns);
				assertTrue(source.indexOf("IE") != -1, "Expected 'IE' in function source - " + ns);
				assertTrue(source.startsWith(ns), "Expected function start with '" + ns + "' - " + ns);
			} else if (ns.equals("wink.math.round")) {
				hasRound = true;
				assertTrue(source.charAt(source.length() - 1) == '}', "Expected '}' as last char - " + ns);
				assertTrue(source.startsWith("round"), "Expected function start with 'round' - " + ns);
			} else if (ns.equals("wink.ui.xy.Carousel")) {
				assertTrue(source.indexOf("carousel_ie") != -1, "Expected 'carousel_ie' in function source - " + ns);
				assertTrue(source.startsWith(ns), "Expected function start with '" + ns + "' - " + ns);
				assertTrue(source.charAt(source.length() - 1) == ';', "Expected ';' as last char - " + ns);
			} else if (ns.equals("wink.ui.xy.Carousel.prototype.goToItem")) {
				assertTrue(source.charAt(source.length() - 1) == '}', "Expected '}' as last char - " + ns);
				assertTrue(source.startsWith("goToItem"), "Expected function start with 'goToItem' - " + ns);
				assertTrue(source.indexOf("style_ie") != -1, "Expected 'style_ie' in function source - " + ns);
			} else if (ns.equals("wink.ui.xy.Carousel.prototype.getDomNode")) {
				assertTrue(source.charAt(source.length() - 1) == ',', "Expected ',' as last char - " + ns);
				assertTrue(source.startsWith("getDomNode"), "Expected function start with 'getDomNode' - " + ns);
				assertTrue(source.indexOf("domNode_ie") != -1, "Expected 'domNode_ie' in function source - " + ns);
			} else if (ns.equals("wink.fx.addClass")) {
				assertTrue(source.charAt(source.length() - 1) == ';', "Expected ';' as last char - " + ns);
				assertTrue(source.indexOf("IE Impl é") != -1, "Expected 'IE Impl é' in function source - " + ns);
				assertTrue(source.startsWith(ns), "Expected function start with '" + ns + "' - " + ns);
			} else if (ns.equals("wink.fx.removeClass")) {
				assertTrue(source.charAt(source.length() - 1) == '}', "Expected '}' as last char - " + ns);
				assertTrue(source.startsWith("removeClass"), "Expected function start with 'removeClass' - " + ns);
				assertTrue(source.indexOf("wink.trim") != -1, "Expected 'wink.trim' in function source - " + ns);
			}
		}
		assertTrue(hasRound, "Expected math.round function");

		boolean hasHtmlElement = false;
		boolean hasWindow = false;

		for (final LiteralObject so : literals) {
			final String ns = so.getNamespace().toString();
			if (so.isVirtual()) {
				if (ns.equals("HTMLElement.prototype")) {
					hasHtmlElement = true;
				} else if (ns.equals("window")) {
					hasWindow = true;
					assertTrue(so.getLiterals().size() == 2, "Expected 2 literals in " + ns);
				}
				continue;
			}
			final String source = getSource(so);

			if (!(so.getParent() instanceof LiteralObject)) {
				assertTrue(source.charAt(source.length() - 1) == ';', "Expected ';' as last char - " + ns);
				assertTrue(source.indexOf("=") != -1, "Expected '=' in literal source - " + ns);
			}

			// out("source of " + ns + "\n" + source);

			if (ns.equals("wink.ui.form") || ns.equals("wink.ui.xy") || ns.equals("wink.ui.layout")) {
				assertTrue(source.charAt(source.length() - 1) == ',', "Expected ',' as last char - " + ns);
				assertTrue(source.startsWith(so.getNamespace().getLastName()), "Expected literal start with  '" + so.getNamespace().getLastName() + "' - " + ns);
				assertTrue(source.indexOf(":") != -1, "Expected ':' in literal source - " + ns);
			} else if (ns.equals("wink.ui.xyz")) {
				assertTrue(source.charAt(source.length() - 1) == '}', "Expected '}' as last char - " + ns);
				assertTrue(source.startsWith(so.getNamespace().getLastName()), "Expected literal start with  '" + so.getNamespace().getLastName() + "' - " + ns);
				assertTrue(source.indexOf(":") != -1, "Expected ':' in literal source - " + ns);
			} else if (ns.equals("wink.api")) {
				assertTrue(source.indexOf("IE") != -1, "Expected 'IE' in literal source - " + ns);
			} else if (ns.equals("wink.ui.xy.Carousel.prototype")) {
				assertTrue(source.indexOf("left_ie") != -1, "Expected 'left_ie' in literal source - " + ns);
			} else if (ns.equals("wink.ua")) {
				assertTrue(so.getProperties().size() == 4, "Expected 4 properties in " + ns);
				assertTrue(so.getProperties().containsKey("isIE"), "Expected 'isIE' property in " + ns);
			}
		}

		assertFalse(hasHtmlElement, "Unexpected HTMLElement.prototype in global");
		assertTrue(hasWindow, "Expected window in global");
	}

	/**
	 * @param buildPath
	 * @throws WinkBuildException
	 * @throws IOException
	 */
	private static void checkHas(final String buildPath) throws WinkBuildException, IOException {
		final File[] files = getFiles(buildPath);
		for (final File f : files) {
			final String path = f.getPath();
			out("------- CHECK HAS ------- " + path);

			final List<FunctionObject> functions = new ArrayList<FunctionObject>();
			final List<LiteralObject> literals = new ArrayList<LiteralObject>();
			parseFile(path, new String[] { externalFile }, functions, literals);

			boolean connectExists = false;
			for (final FunctionObject fo : functions) {
				if (fo.getName().equals("connect")) {
					connectExists = true;
					final String source = getSource(fo);

					if (path.contains("default-ie")) {
						assertTrue(source.indexOf("if (true) {") != -1, "Expected 'if (true) {' in function source - " + fo.getNamespace());
						assertTrue(source.indexOf("if (false) {") != -1, "Expected 'if (false) {' in function source - " + fo.getNamespace());
						assertTrue(source.indexOf("if (wink.has(\"unknown\")) {") != -1, "Expected 'if (wink.has(\"unknown\")) {' in function source - " + fo.getNamespace());
					} else if (path.contains("default-default")) {
						assertTrue(source.indexOf("if (wink.has(\"touch\")) {") != -1, "Expected 'if (wink.has(\"touch\")) {' in function source - " + fo.getNamespace());
						assertTrue(source.indexOf("if (false) {") != -1, "Expected 'if (false) {' in function source - " + fo.getNamespace());
						assertTrue(source.indexOf("if (wink.has(\"unknown\")) {") != -1, "Expected 'if (wink.has(\"unknown\")) {' in function source - " + fo.getNamespace());
					} else {
						assertTrue(source.indexOf("if (wink.has(\"touch\")) {") != -1, "Expected 'if (wink.has(\"touch\")) {' in function source - " + fo.getNamespace());
						assertTrue(source.indexOf("if (wink.has(\"gesture\")) {") != -1, "Expected 'if (wink.has(\"gesture\")) {' in function source - " + fo.getNamespace());
						assertTrue(source.indexOf("if (wink.has(\"unknown\")) {") != -1, "Expected 'if (wink.has(\"unknown\")) {' in function source - " + fo.getNamespace());
					}

					break;
				}
			}
			assertTrue(connectExists, "Expected 'connect' function in " + path);
		}
	}

	/**
	 * @param buildPath
	 * @throws WinkBuildException
	 */
	private static void executeAll(final String buildPath) throws WinkBuildException {
		final File[] files = getFiles(buildPath);
		for (final File f : files) {
			out("------- EXECUTE ------- " + f.getPath());
			executeJs(f.getPath());
			final List<FunctionObject> functions = new ArrayList<FunctionObject>();
			final List<LiteralObject> literals = new ArrayList<LiteralObject>();
			parseFile(f.getPath(), new String[] { externalFile }, functions, literals);
		}
		// "../../wink/wink-1.4.0-default-default.js"
		// "../modules/module1.js"
	}

	/**
	 * @param list
	 * @param so
	 */
	private static void getFunctions(final List<FunctionObject> list, final ScriptObject so) {
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
	private static void getLiterals(final List<LiteralObject> list, final ScriptObject so) {
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
	 * @param f
	 * @param externals
	 * @param fns
	 * @param lits
	 * @return
	 * @throws WinkAstException
	 * @throws WinkParseException
	 */
	private static GlobalObject parseFile(final String f, final String[] externals, final List<FunctionObject> fns, final List<LiteralObject> lits) throws WinkAstException, WinkParseException {
		final WinkParser wp = new WinkParser();
		final List<String> fileNames = new ArrayList<String>();
		if (externals != null) {
			Collections.addAll(fileNames, externals);
		}
		fileNames.add(f);
		wp.parse(fileNames);
		// wp.print();

		final GlobalObject scope = wp.getGlobalScope();
		if (scope != null) {
			getFunctions(fns, scope);
			getLiterals(lits, scope);
		}

		return scope;
	}

	/**
	 * @param filename
	 * @throws WinkBuildException
	 */
	private static void executeJs(final String filename) throws WinkBuildException {
		final Context cx = Context.enter();
		cx.setOptimizationLevel(-1);
		final ScriptableObject scope = cx.initStandardObjects();

		final String fileToInspect = new String(filename);
		boolean goodExecution = false;
		try {
			final Reader buildFile = new FileReader(new File(fileToInspect));
			final Script sc = cx.compileReader(buildFile, fileToInspect, 1, null);

			final NativeObject window = new NativeObject();
			ScriptableObject.putProperty(scope, "window", window);
			final NativeObject htmlelement = new NativeObject();
			ScriptableObject.putProperty(scope, "HTMLElement", htmlelement);
			final NativeObject prototype = new NativeObject();
			ScriptableObject.putProperty(htmlelement, "prototype", prototype);
			final NativeObject external = new NativeObject();
			ScriptableObject.putProperty(scope, "external", external);

			sc.exec(cx, scope);
			buildFile.close();
			goodExecution = true;
		} catch (final org.mozilla.javascript.EcmaError e) {
			goodExecution = false;
		} catch (final FileNotFoundException e) {
			throw new WinkBuildException(e);
		} catch (final IOException e) {
			throw new WinkBuildException(e);
		}
		assertTrue(goodExecution, "Bad execution of " + filename);
	}

	/**
	 * @param so
	 */
	private static String getSource(final ScriptObject so) throws IOException {
		final WinkJsFile jf = new WinkJsFile(so.getSourceName(), so.getGlobalScope());
		final int ls = so.getLineStart();
		final int le = so.getLineEnd();
		final String lines = jf.getLinesAsString(ls, le);
		final String source = lines.substring(so.getCharStart(), so.getCharEnd());
		return source;
	}
}
