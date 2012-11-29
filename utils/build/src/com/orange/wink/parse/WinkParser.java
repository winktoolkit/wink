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

import java.io.File;
import java.io.FileReader;
import java.io.IOException;
import java.io.Reader;
import java.util.Collection;
import java.util.List;

import org.mozilla.javascript.CompilerEnvirons;
import org.mozilla.javascript.ErrorReporter;
import org.mozilla.javascript.Parser;
import org.mozilla.javascript.ScriptOrFnNode;

import com.orange.wink.Constants;
import com.orange.wink.ast.Ast;
import com.orange.wink.ast.AstBuilder;
import com.orange.wink.exception.WinkAstException;
import com.orange.wink.exception.WinkParseException;
import com.orange.wink.model.FunctionObject;
import com.orange.wink.model.GlobalObject;
import com.orange.wink.model.LiteralObject;
import com.orange.wink.model.ScriptObject;
import com.orange.wink.util.Common;
import com.orange.wink.util.FileManager;
import com.orange.wink.util.FileObject;
import com.orange.wink.util.WinkJsFile;

/**
 * @author Sylvain Lalande
 * 
 */
public class WinkParser {
	/**
	 * 
	 */
	private final Parser parser;
	/**
	 * 
	 */
	private final CompilerEnvirons compilerEnv;
	/**
	 * 
	 */
	private final ErrorReporter errorReporter;
	/**
	 * 
	 */
	private final List<WinkJsFile> jsFiles;
	/**
	 * 
	 */
	private GlobalObject globalScope;

	/**
	 * 
	 */
	public WinkParser() {
		compilerEnv = new CompilerEnvirons();
		errorReporter = compilerEnv.getErrorReporter();
		parser = new Parser(compilerEnv, errorReporter);
		jsFiles = Common.newArrayList(1);
	}

	/**
	 * @param files
	 * @throws WinkAstException
	 * @throws WinkParseException
	 */
	public void parse(final List<String> files) throws WinkAstException, WinkParseException {
		for (final String fname : files) {
			parse(fname);
		}
		if (getGlobalScope() != null) {
			populateFunctions();
			populateLiterals();
		}
	}

	/**
	 * @param fileName
	 * @throws WinkAstException
	 * @throws WinkParseException
	 */
	private void parse(final String fileName) throws WinkAstException, WinkParseException {
		ScriptOrFnNode tree;
		Ast ast;
		final AstBuilder astBuilder = new AstBuilder();
		try {
			tree = getParsedAst(fileName);
			ast = astBuilder.build(tree);
			// System.out.println(ast);
		} catch (final IOException e) {
			throw new WinkParseException(e);
		}
		addJsFile(fileName, new GlobalObject(ast));
	}

	/**
	 * @param fileName
	 * @return
	 * @throws IOException
	 */
	private ScriptOrFnNode getParsedAst(final String fileName) throws IOException {
		final File f = new File(fileName);
		final Reader reader = new FileReader(f);
		String sourceURI;
		ScriptOrFnNode tree = null;

		sourceURI = f.getCanonicalPath();
		tree = parser.parse(reader, sourceURI, 1);

		reader.close();

		return tree;
	}

	/**
	 * @param filename
	 * @param scope
	 * @throws WinkParseException
	 */
	private void addJsFile(final String filename, final GlobalObject scope) throws WinkParseException {
		scope.setParent(getGlobalScope());

		if (globalScope == null) {
			globalScope = scope;
		}
		if (Constants.optimDontKeepJsFile) {

		} else {
			jsFiles.add(new WinkJsFile(filename, scope));
		}

		scope.setSourceName(filename);
		scope.interpret();
	}

	/**
	 * @param filename
	 * @return
	 */
	private WinkJsFile getJsFile(final String filename) {
		for (final WinkJsFile jf : jsFiles) {
			if (jf.getFilename().equals(filename)) {
				return jf;
			}
		}
		return null;
	}

	/**
	 * @return
	 */
	public GlobalObject getGlobalScope() {
		// if (jsFiles.size() > 0) {
		// return jsFiles.get(0).getScope();
		// }
		return globalScope;
	}

	/**
	 * @param scope
	 * @throws WinkAstException
	 * @throws WinkParseException
	 */
	private void populateFunctionR(final ScriptObject scope) throws WinkAstException, WinkParseException {
		final Collection<FunctionObject> fns = scope.getFunctions().values();

		for (final FunctionObject f : fns) {
			final String sourceName = f.getGlobalScope().getSourceName();
			f.setSourceName(sourceName);

			String fsource;
			try {
				if (Constants.optimDontKeepJsFile) {
					fsource = FileManager.getFileObject(sourceName).getLinesAsString(f.getLineStart(), f.getLineEnd());
				} else {
					fsource = getJsFile(sourceName).getLinesAsString(f.getLineStart(), f.getLineEnd());
				}
				ParserUtils.updateFunctionInfo(f, fsource);
			} catch (final IOException e) {
				throw new WinkParseException(e);
			}

			populateFunctionR(f);
		}
		final Collection<LiteralObject> lts = scope.getLiterals().values();
		for (final LiteralObject l : lts) {
			populateFunctionR(l);
		}
	}

	/**
	 * @throws WinkAstException
	 * @throws WinkParseException
	 */
	private void populateFunctions() throws WinkAstException, WinkParseException {
		populateFunctionR(getGlobalScope());
	}

	/**
	 * @param scope
	 * @throws WinkAstException
	 * @throws WinkParseException
	 */
	private void populateLiteralsR(final ScriptObject scope) throws WinkAstException, WinkParseException {
		final Collection<LiteralObject> lts = scope.getLiterals().values();

		for (final LiteralObject lt : lts) {
			final String sourceName = lt.getGlobalScope().getSourceName();
			lt.setSourceName(sourceName);

			if (scope.getSourceName().equals(sourceName)) {
				if (lt.getLineStart() == -1) {
					lt.setLineStart(scope.getLineStart());
				}
			}

			if (!lt.isVirtual()) {
				FileObject fo = null;
				WinkJsFile jf = null;
				String ltSource;
				int linesSize = -1;

				try {
					if (Constants.optimDontKeepJsFile) {
						fo = FileManager.getFileObject(sourceName);
						if ((lt.getLineEnd() == -1)) {
							linesSize = fo.getLines().size();
						}
					} else {
						jf = getJsFile(sourceName);
						if ((lt.getLineEnd() == -1)) {
							linesSize = jf.getLines().size();
						}
					}

					final int lns = (lt.getLineStart() == -1) ? 1 : lt.getLineStart();
					final int lne = (lt.getLineEnd() == -1) ? linesSize : lt.getLineEnd();

					if (Constants.optimDontKeepJsFile) {
						ltSource = fo.getLinesAsString(lns, lne);
					} else {
						ltSource = jf.getLinesAsString(lns, lne);
					}

					ParserUtils.updateLiteralLines(lt, ltSource, lns);
					if (lt.getLineStart() == -1 || lt.getLineEnd() == -1) {
						throw new WinkParseException("Bad literal lines [" + lt.getNamespace() + "] identified (L:" + lt.getLineStart() + ", " + lt.getLineEnd() + ")");
					}

					String las;
					if (Constants.optimDontKeepJsFile) {
						las = fo.getLinesAsString(lt.getLineStart(), lt.getLineEnd());
					} else {
						las = jf.getLinesAsString(lt.getLineStart(), lt.getLineEnd());
					}
					ParserUtils.updateLiteralChars(lt, las);
				} catch (final IOException e) {
					throw new WinkParseException(e);
				}
			}

			populateLiteralsR(lt);
		}
		final Collection<FunctionObject> fns = scope.getFunctions().values();
		for (final FunctionObject f : fns) {
			populateLiteralsR(f);
		}
	}

	/**
	 * @throws WinkAstException
	 * @throws WinkParseException
	 */
	private void populateLiterals() throws WinkAstException, WinkParseException {
		populateLiteralsR(getGlobalScope());
	}

	/**
	 * @param o
	 * @throws WinkParseException
	 */
	private void printSource(final ScriptObject o) throws WinkParseException {
		if (!(o instanceof FunctionObject || o instanceof LiteralObject)) {
			return;
		}
		if (!(o instanceof GlobalObject)) {
			WinkJsFile jf;
			FileObject fo;
			String lines, source;
			try {
				if (Constants.optimDontKeepJsFile) {
					fo = FileManager.getFileObject(o.getSourceName());
					lines = fo.getLinesAsString(o.getLineStart(), o.getLineEnd());
				} else {
					jf = getJsFile(o.getSourceName());
					lines = jf.getLinesAsString(o.getLineStart(), o.getLineEnd());
				}

				System.out.println("------------ " + o);
				if (!o.isVirtual()) {
					source = lines.substring(o.getCharStart(), o.getCharEnd());
					System.out.println(source);
				}
				System.out.println();
			} catch (final IOException e) {
				throw new WinkParseException(e);
			}
		}

		final Collection<FunctionObject> fns = o.getFunctions().values();
		for (final FunctionObject c : fns) {
			printSource(c);

		}
		final Collection<LiteralObject> lts = o.getLiterals().values();
		for (final LiteralObject c : lts) {
			printSource(c);
		}
	}

	/**
	 * @throws WinkParseException
	 */
	public void print() throws WinkParseException {
		final GlobalObject scope = getGlobalScope();
		if (scope == null) {
			return;
		}

		System.out.println(scope.getAst().toStringInner());
		System.out.println(scope.getAst());

		// System.out.println("------------ FILES");
		// for (final WinkJsFile jsfile : jsFiles) {
		// System.out.println("- " + jsfile.getFilename());
		// }

		System.out.println("\n------------ MODEL");
		System.out.println(scope.toStringRecursive(null, 0));

		// System.out.println("\n------------ SOURCES");
		// printSource(scope);
	}
}
