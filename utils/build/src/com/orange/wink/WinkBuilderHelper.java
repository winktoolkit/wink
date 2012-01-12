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
import java.io.FileNotFoundException;
import java.io.FileReader;
import java.io.IOException;
import java.io.PrintStream;
import java.io.Reader;
import java.io.StringReader;
import java.lang.reflect.InvocationTargetException;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

import org.mozilla.javascript.Context;
import org.mozilla.javascript.Function;
import org.mozilla.javascript.NativeArray;
import org.mozilla.javascript.NativeObject;
import org.mozilla.javascript.Script;
import org.mozilla.javascript.Scriptable;
import org.mozilla.javascript.ScriptableObject;

import com.orange.wink.exception.WinkBuildException;
import com.orange.wink.parse.ParserUtils;
import com.orange.wink.parse.WinkJsModel;
import com.orange.wink.parse.WinkParser;
import com.orange.wink.util.FileManager;
import com.orange.wink.util.FileObject;
import com.orange.wink.util.FileUtil;

/**
 * @author Sylvain Lalande
 * 
 */
public class WinkBuilderHelper {
	/**
	 * @param cx
	 * @param thisObj
	 * @param filename
	 * @throws WinkBuildException
	 */
	public static void executeJsFile(final Context cx, final Scriptable thisObj, final String filename) throws WinkBuildException {
		try {
			final Reader buildFile = new FileReader(new File(filename));
			final Script sc = cx.compileReader(buildFile, filename, 1, null);
			sc.exec(cx, thisObj);
			buildFile.close();
		} catch (final FileNotFoundException e) {
			throw new WinkBuildException(e);
		} catch (final IOException e) {
			throw new WinkBuildException(e);
		}
	}

	/**
	 * @param cx
	 * @param thisObj
	 * @param args
	 * @param funObj
	 */
	public static void print(final Context cx, final Scriptable thisObj, final Object[] args, final Function funObj) {
		final PrintStream out = System.out;
		for (int i = 0; i < args.length; i++) {
			if (i > 0) {
				out.print(" ");
			}
			final String s = Context.toString(args[i]);
			out.print(s);
		}
		out.println();
	}

	/**
	 * @param cx
	 * @param thisObj
	 * @param args
	 * @param funObj
	 */
	public static void error(final Context cx, final Scriptable thisObj, final Object[] args, final Function funObj) throws WinkBuildException {
		if (args.length == 1 && args[0] != null && (args[0] instanceof String)) {
			throw new WinkBuildException((String) args[0]);
		}
		throw new WinkBuildException();
	}

	/**
	 * @param cx
	 * @param thisObj
	 * @param args
	 * @param funObj
	 */
	public static void load(final Context cx, final Scriptable thisObj, final Object[] args, final Function funObj) throws WinkBuildException {
		if (args.length != 1 || args[0] == null || !(args[0] instanceof String)) {
			throw new WinkBuildException("load() error: bad arguments");
		}
		executeJsFile(cx, thisObj, (String) args[0]);
	}

	/**
	 * @param cx
	 * @param thisObj
	 * @param args
	 * @param funObj
	 * @return
	 * @throws WinkBuildException
	 */
	public static boolean isReadableFile(final Context cx, final Scriptable thisObj, final Object[] args, final Function funObj) throws WinkBuildException {
		if (args.length != 1 || args[0] == null || !(args[0] instanceof String)) {
			throw new WinkBuildException("isReadableFile() error: bad arguments");
		}
		return FileUtil.isReadableFile((String) args[0]);
	}

	/**
	 * @param cx
	 * @param thisObj
	 * @param args
	 * @param funObj
	 * @return
	 * @throws WinkBuildException
	 */
	public static boolean isDirectory(final Context cx, final Scriptable thisObj, final Object[] args, final Function funObj) throws WinkBuildException {
		if (args.length != 1 || args[0] == null || !(args[0] instanceof String)) {
			throw new WinkBuildException("isDirectory() error: bad arguments");
		}
		return FileUtil.isDirectory((String) args[0]);
	}

	/**
	 * @param cx
	 * @param thisObj
	 * @param args
	 * @param funObj
	 * @return
	 * @throws WinkBuildException
	 */
	public static boolean createDirectory(final Context cx, final Scriptable thisObj, final Object[] args, final Function funObj) throws WinkBuildException {
		if (args.length != 1 || args[0] == null || !(args[0] instanceof String)) {
			throw new WinkBuildException("isDirectory() error: bad arguments");
		}
		try {
			return FileUtil.createDirectory((String) args[0], ".");
		} catch (final IOException e) {
			throw new WinkBuildException(e);
		}
	}

	/**
	 * @param cx
	 * @param thisObj
	 * @param args
	 * @param funObj
	 * @return
	 * @throws WinkBuildException
	 */
	public static boolean deleteFile(final Context cx, final Scriptable thisObj, final Object[] args, final Function funObj) throws WinkBuildException {
		if (args.length != 1 || args[0] == null || !(args[0] instanceof String)) {
			throw new WinkBuildException("isDirectory() error: bad arguments");
		}
		return FileUtil.deleteFile((String) args[0]);
	}

	/**
	 * @param cx
	 * @param thisObj
	 * @param args
	 * @param funObj
	 */
	public static String readFile(final Context cx, final Scriptable thisObj, final Object[] args, final Function funObj) throws WinkBuildException {
		if (args.length != 1 || args[0] == null || !(args[0] instanceof String)) {
			throw new WinkBuildException("readFile() error: bad arguments");
		}
		try {
			return FileManager.getFileContent((String) args[0]);
		} catch (final IOException e) {
			throw new WinkBuildException(e);
		}
	}

	/**
	 * @param cx
	 * @param thisObj
	 * @param args
	 * @param funObj
	 * @return
	 * @throws WinkBuildException
	 */
	public static String copyFile(final Context cx, final Scriptable thisObj, final Object[] args, final Function funObj) throws WinkBuildException {
		if (args.length != 3 || args[0] == null || args[1] == null || args[2] == null || !(args[0] instanceof String) || !(args[1] instanceof String) || !(args[2] instanceof String)) {
			throw new WinkBuildException("copyFile() error: bad arguments");
		}
		final String finS = (String) args[0];
		final String destIdentifier = (String) args[1];
		final String diroutS = (String) args[2];
		final File fin = new File(finS);
		final File dirOut = new File(diroutS);

		if (!fin.exists() || !fin.isFile() || !fin.canRead()) {
			throw new WinkBuildException("bad input file: " + finS);
		}
		if (!dirOut.exists() || !dirOut.isDirectory() || !dirOut.canWrite()) {
			throw new WinkBuildException("bad output directory: " + diroutS);
		}

		final String finName = fin.getName();
		final int dotPos = finName.lastIndexOf(".");
		final String ext = finName.substring(dotPos);
		final String fdestName = finName.substring(0, dotPos) + destIdentifier + ext;
		final File fout = new File(dirOut, fdestName);

		try {
			FileManager.copyFile(fin, fout);
		} catch (final FileNotFoundException e) {
			throw new WinkBuildException(e);
		} catch (final IOException e) {
			throw new WinkBuildException(e);
		}
		try {
			return fout.getCanonicalPath();
		} catch (final IOException e) {
			throw new WinkBuildException(e);
		}
	}

	/**
	 * @param cx
	 * @param thisObj
	 * @param args
	 * @param funObj
	 * @throws WinkBuildException
	 */
	public static void concatenateFiles(final Context cx, final Scriptable thisObj, final Object[] args, final Function funObj) throws WinkBuildException {
		if (args.length != 2 || args[0] == null || args[1] == null || !(args[0] instanceof NativeArray) || !(args[1] instanceof String)) {
			throw new WinkBuildException("concatenateFiles() error: bad arguments");
		}
		final List<String> files = convertNativeArrayIntoList((NativeArray) args[0]);
		final String destFile = (String) args[1];
		// System.out.println("concatenateFiles:" + destFile);
		// System.out.println("files:" + files);

		try {
			FileManager.concatenateFiles(files, destFile);
		} catch (final FileNotFoundException e) {
			throw new WinkBuildException(e);
		} catch (final IOException e) {
			throw new WinkBuildException(e);
		}
	}

	/**
	 * @param cx
	 * @param thisObj
	 * @param args
	 * @param funObj
	 * @return
	 * @throws WinkBuildException
	 */
	public static WinkJsModel parseFiles(final Context cx, final Scriptable thisObj, final Object[] args, final Function funObj) throws WinkBuildException {
		if (args.length != 2 || args[0] == null || !(args[0] instanceof NativeArray) || args[1] == null || !(args[1] instanceof NativeArray)) {
			throw new WinkBuildException("parseFiles() error: bad arguments");
		}

		final List<String> filesToParse = convertNativeArrayIntoList((NativeArray) args[0]);
		final List<String> dependencies = convertNativeArrayIntoList((NativeArray) args[1]);

		final List<String> files = new ArrayList<String>();
		files.addAll(dependencies);
		files.addAll(filesToParse);

		final WinkParser wp = new WinkParser();
		wp.parse(files);
		// wp.print();

		try {
			ScriptableObject.defineClass(thisObj, WinkJsModel.class);
			final WinkJsModel winkJsModel = (WinkJsModel) cx.newObject(thisObj, "WinkJsModel");
			winkJsModel.setCx(cx);
			winkJsModel.setGlobalScope(wp.getGlobalScope());
			// ScriptableObject.putProperty(thisObj, "jsModel",
			// Context.javaToJS(winkJsModel, thisObj));
			return winkJsModel;
		} catch (final IllegalAccessException e) {
			throw new WinkBuildException(e);
		} catch (final InstantiationException e) {
			throw new WinkBuildException(e);
		} catch (final InvocationTargetException e) {
			throw new WinkBuildException(e);
		}
	}

	/**
	 * @param cx
	 * @param thisObj
	 * @param args
	 * @param funObj
	 * @throws WinkBuildException
	 */
	public static void applyFilterFeature(final Context cx, final Scriptable thisObj, final Object[] args, final Function funObj) throws WinkBuildException {
		if (args.length != 2 || args[0] == null || args[1] == null || !(args[0] instanceof NativeObject) || !(args[1] instanceof NativeArray)) {
			throw new WinkBuildException("applyFilterFeature() error: bad arguments");
		}
		final NativeObject no = (NativeObject) args[0];
		final List<String> files = convertNativeArrayIntoList((NativeArray) args[1]);

		final Map<String, Boolean> featureMap = new HashMap<String, Boolean>();

		final Object[] noIds = no.getIds();
		for (final Object o : noIds) {
			final Boolean value = (Boolean) no.get((String) o, no);
			featureMap.put((String) o, value);
		}

		if (featureMap.size() == 0) {
			return;
		}

		final String winkhasExpr = "(wink[\n\r ]*\\.[\n\r ]*has[\n\r ]*\\([\n\r ]*[\"'])([^\"']+)([\"'][\n\r ]*\\))";
		final Pattern winkhasPattern = Pattern.compile(winkhasExpr, Pattern.MULTILINE);

		for (final String file : files) {
			try {
				final StringBuffer fileContent = new StringBuffer().append(FileManager.getFileContent(file));

				final Matcher m = winkhasPattern.matcher(fileContent);
				final StringBuffer contentReplaced = new StringBuffer();
				while (m.find()) {
					final String feature = m.group(2);
					String featureValue = "";
					if (featureMap.containsKey(feature)) {
						featureValue = featureMap.get(feature).toString();
						m.appendReplacement(contentReplaced, featureValue);
					}
				}
				m.appendTail(contentReplaced);

				FileManager.writeIntoFile(contentReplaced.toString(), file);
			} catch (final FileNotFoundException e) {
				throw new WinkBuildException(e);
			} catch (final IOException e) {
				throw new WinkBuildException(e);
			}
		}
	}

	/**
	 * @param cx
	 * @param thisObj
	 * @param args
	 * @param funObj
	 * @throws WinkBuildException
	 */
	public static void deleteValidateProperties(final Context cx, final Scriptable thisObj, final Object[] args, final Function funObj) throws WinkBuildException {
		if (args.length != 1 || args[0] == null || !(args[0] instanceof NativeArray)) {
			throw new WinkBuildException("deleteValidateProperties() error: bad arguments");
		}
		final List<String> files = convertNativeArrayIntoList((NativeArray) args[0]);

		// System.out.println("deleteValidateProperties: " + files);
		final String validateIdentifier = "_validateProperties";
		final String replacement = "{\nreturn true;\n}";

		for (final String filename : files) {
			try {
				final StringBuffer fileContent = new StringBuffer().append(FileManager.getFileContent(filename));
				final StringBuffer contentReplaced = new StringBuffer();

				final LinkedHashMap<Integer, Integer> blocks = ParserUtils.getBlockLines(fileContent.toString(), validateIdentifier);
				if (blocks.size() == 0) {
					continue;
				}

				final FileObject fo = FileManager.getFileObject(filename);

				int ptrline = 1;
				for (final Integer s : blocks.keySet()) {
					final Integer e = blocks.get(s);

					final String lines = fo.getLinesAsString(s, e);
					// System.out.println("deleteValidateProperties: " + s +
					// " -> " + e + "\n" + lines);

					int x;
					int pos = 0;
					int charStart = 0;
					int charEnd = 0;
					boolean inBlock = false;
					int lp = 0, rp = 0;
					final StringReader r = new StringReader(lines);

					while ((x = r.read()) != -1) {
						final char c = (char) x;
						if (c == '{') {
							if (lp == 0) {
								charStart = pos;
								inBlock = true;
							}
							lp++;
						} else if (inBlock && c == '}') {
							rp++;
						}
						if (inBlock) {
							if (lp == rp) {
								charEnd = pos + 1;
								break;
							}
						}
						pos++;
					}
					final String block = lines.substring(charStart, charEnd);
					// System.out.println("deleteValidateProperties: " +
					// charStart + " -> " + charEnd + "\n" + block);

					if (block.length() < replacement.length()) {
						System.err.println("WARN - cannot replace " + validateIdentifier + ", not enough space");
						continue;
					}

					contentReplaced.append(fo.getLinesAsString(ptrline, (s - 1)));
					contentReplaced.append(lines.substring(0, charStart));
					contentReplaced.append(replacement);
					contentReplaced.append(lines.substring(charEnd));
					ptrline = e + 1;
				}
				contentReplaced.append(fo.getLinesAsString(ptrline));

				FileManager.writeIntoFile(contentReplaced.toString(), filename);
			} catch (final IOException e) {
				throw new WinkBuildException(e);
			}
		}
	}

	/**
	 * @param cx
	 * @param thisObj
	 * @param args
	 * @param funObj
	 * @throws WinkBuildException
	 */
	public static void deleteLogs(final Context cx, final Scriptable thisObj, final Object[] args, final Function funObj) throws WinkBuildException {
		if (args.length != 1 || args[0] == null || !(args[0] instanceof NativeArray)) {
			throw new WinkBuildException("deleteValidateProperties() error: bad arguments");
		}
		final List<String> files = convertNativeArrayIntoList((NativeArray) args[0]);

		final String winklogExpr = "((wink|console)[\n\r ]*\\.[\n\r ]*log[\n\r ]*\\([\n\r ]*[\"'])([^\"']+)([\"'][\n\r ]*\\))([;]?)";
		final Pattern winklogPattern = Pattern.compile(winklogExpr, Pattern.MULTILINE);

		for (final String file : files) {
			try {
				final StringBuffer fileContent = new StringBuffer().append(FileManager.getFileContent(file));

				final Matcher m = winklogPattern.matcher(fileContent);
				final StringBuffer contentReplaced = new StringBuffer();
				while (m.find()) {
					// System.out.println("delete log: " + m.group(0) + " in " +
					// file);
					m.appendReplacement(contentReplaced, "");
				}
				m.appendTail(contentReplaced);

				FileManager.writeIntoFile(contentReplaced.toString(), file);
			} catch (final FileNotFoundException e) {
				throw new WinkBuildException(e);
			} catch (final IOException e) {
				throw new WinkBuildException(e);
			}
		}
	}

	/**
	 * @param cx
	 * @param thisObj
	 * @param args
	 * @param funObj
	 * @throws WinkBuildException
	 */
	public static void applyBadSyntaxFilter(final Context cx, final Scriptable thisObj, final Object[] args, final Function funObj) throws WinkBuildException {
		if (args.length != 1 || args[0] == null || !(args[0] instanceof NativeArray)) {
			throw new WinkBuildException("applyBadSyntaxFilter() error: bad arguments");
		}
		final List<String> files = convertNativeArrayIntoList((NativeArray) args[0]);

		final String commaAccoladeExpr = "([,]+)([\t\n\r ]*)(})";
		final Pattern commaAccoladePattern = Pattern.compile(commaAccoladeExpr, Pattern.MULTILINE);

		for (final String filename : files) {
			try {
				final StringBuffer fileContent = new StringBuffer().append(FileManager.getFileContent(filename));

				final Matcher m = commaAccoladePattern.matcher(fileContent);
				final StringBuffer contentReplaced = new StringBuffer();
				while (m.find()) {
					final String replaceby = m.group(2) + m.group(3);
					m.appendReplacement(contentReplaced, replaceby);
				}
				m.appendTail(contentReplaced);

				FileManager.writeIntoFile(contentReplaced.toString(), filename);
			} catch (final FileNotFoundException e) {
				throw new WinkBuildException(e);
			} catch (final IOException e) {
				throw new WinkBuildException(e);
			}
		}
	}

	/**
	 * @param cx
	 * @param thisObj
	 * @param args
	 * @param funObj
	 * @throws WinkBuildException
	 */
	public static void rewriteImageURL(final Context cx, final Scriptable thisObj, final Object[] args, final Function funObj) throws WinkBuildException {
		if (args.length != 3 || args[0] == null || args[1] == null || args[2] == null || !(args[0] instanceof NativeArray) || !(args[1] instanceof NativeArray) || !(args[2] instanceof String)) {
			throw new WinkBuildException("rewriteImageURL() error: bad arguments");
		}

		final List<String> files = convertNativeArrayIntoList((NativeArray) args[0]);
		final List<String> tmpfiles = convertNativeArrayIntoList((NativeArray) args[1]);
		final String basePath = (String) args[2];

		final String winkUrlExpr = "(url[\n\r ]*\\([\n\r ]*)([\"']?)([^)\"']+)([\"']?)([)])";
		final Pattern winkUrlPattern = Pattern.compile(winkUrlExpr, Pattern.MULTILINE);
		final int leftGroup = 1;
		final int urlGroup = 3;
		final int rightGroup = 5;

		File baseFile;
		String baseCanonical;
		try {
			baseFile = new File(basePath);
			baseCanonical = baseFile.getCanonicalPath();
		} catch (final IOException e) {
			throw new WinkBuildException(e);
		}

		for (int i = 0; i < files.size(); i++) {
			final String filename = files.get(i);
			final String tmpfilename = tmpfiles.get(i);

			try {
				final StringBuffer fileContent = new StringBuffer().append(FileManager.getFileContent(tmpfilename));
				final File file = new File(filename);
				final File parent = file.getParentFile();

				final Matcher m = winkUrlPattern.matcher(fileContent);
				final StringBuffer contentReplaced = new StringBuffer();
				while (m.find()) {
					final String url = m.group(urlGroup);
					if (url.equals("")) {
						continue;
					}
					if (url.contains("data:")) {
						continue;
					}
					if (url.contains("http:")) {
						continue;
					}

					// System.out.println("find ------------------ : \n" + url +
					// " in " + file.getAbsolutePath());

					final File cssLink = new File(parent, url);
					final String cssLinkCanonical = cssLink.getCanonicalPath();
					File ptr = new File(cssLinkCanonical);

					final StringBuffer relativePath = new StringBuffer();
					relativePath.insert(0, ptr.getName());

					if (Constants.fromWinkPath) {
						while (true) {
							ptr = ptr.getParentFile();
							if (ptr == null) {
								throw new IllegalStateException("cannot rewrite Image URL: bad css url: must be in: " + baseCanonical);
							}
							if (ptr.getCanonicalPath().equals(baseFile.getCanonicalPath())) {
								break;
							}
							relativePath.insert(0, "/");
							relativePath.insert(0, ptr.getName());
						}
					}
					if (!Constants.relativePath.equals("")) {
						if (!Constants.relativePath.endsWith("/")) {
							relativePath.insert(0, "/");
						}
						relativePath.insert(0, Constants.relativePath);
					}

					m.appendReplacement(contentReplaced, m.group(leftGroup) + relativePath + m.group(rightGroup));
				}
				m.appendTail(contentReplaced);

				FileManager.writeIntoFile(contentReplaced.toString(), tmpfilename);
			} catch (final IOException e) {
				throw new WinkBuildException(e);
			}
		}
	}

	/**
	 * @param na
	 * @return
	 */
	private static List<String> convertNativeArrayIntoList(final NativeArray na) {
		final List<String> list = new ArrayList<String>();

		final Object[] naIds = na.getIds();
		for (final Object o : naIds) {
			final String value = (String) na.get((Integer) o, na);
			list.add(value);
		}
		return list;
	}
}
