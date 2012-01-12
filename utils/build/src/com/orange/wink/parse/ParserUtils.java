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
import java.io.StreamTokenizer;
import java.io.StringReader;
import java.util.LinkedHashMap;
import java.util.List;

import org.mozilla.javascript.Token;

import com.orange.wink.Constants;
import com.orange.wink.ast.AstNode;
import com.orange.wink.exception.WinkParseException;
import com.orange.wink.exception.WinkUnmanagedSyntaxException;
import com.orange.wink.model.DefaultObject;
import com.orange.wink.model.FunctionObject;
import com.orange.wink.model.LiteralObject;
import com.orange.wink.model.ScriptObject;
import com.orange.wink.parse.objects.Call;
import com.orange.wink.parse.objects.ExprResultCall;
import com.orange.wink.parse.objects.Function;
import com.orange.wink.parse.objects.ObjectLit;
import com.orange.wink.parse.objects.ParseObject;
import com.orange.wink.parse.objects.SetElem;
import com.orange.wink.parse.objects.SetName;
import com.orange.wink.parse.objects.SetProp;

/**
 * @author Sylvain Lalande
 * 
 */
public class ParserUtils {
	/**
	 * @param n
	 * @param silent
	 * @return
	 * @throws WinkUnmanagedSyntaxException
	 */
	public static ParseObject resolveParseObject(final AstNode n, final boolean silent) throws WinkUnmanagedSyntaxException {
		ParseObject result = null;
		final int type = n.getType();

		try {
			if (type == Token.SETPROP || type == Token.SETELEM && SetProp.isValidSetProp(n)) {
				if (type == Token.SETPROP) {
					result = new SetProp(n);
				} else if (type == Token.SETELEM) {
					result = new SetElem(n);
				}
			} else if (type == Token.SETNAME) {
				result = new SetName(n);
			} else if (type == Token.OBJECTLIT) {
				result = new ObjectLit(n);
			} else if (type == Token.FUNCTION) {
				result = new Function(n);
			} else if (type == Token.CALL && Call.isValidCall(n)) {
				result = Call.getAppropriateCall(n);
			} else if (type == Token.EXPR_RESULT && ExprResultCall.isValidCall(n)) {
				result = new ExprResultCall(n);
			} else {
				result = new ParseObject(n);
			}
		} catch (final WinkUnmanagedSyntaxException e) {
			if (silent) {
				result = new ParseObject(n);
			} else {
				if (Constants.failOnUnmanagedSyntax) {
					throw e;
				} else if (Constants.warnOnUnmanagedSyntax) {
					System.err.println(e.getMessage());
					result = new ParseObject(n);
				}
			}
		}

		return result;
	}

	/**
	 * @param n
	 * @return
	 * @throws WinkUnmanagedSyntaxException
	 */
	public static ParseObject resolveParseObject(final AstNode n) throws WinkUnmanagedSyntaxException {
		return resolveParseObject(n, false);
	}

	/**
	 * @param po
	 * @param parentScope
	 * @return
	 */
	public static ScriptObject buildScriptObject(final ParseObject po, final ScriptObject parent) throws WinkParseException {
		ScriptObject so;

		if (po instanceof Function) {
			so = new FunctionObject(po.getNode());
		} else if (po instanceof ObjectLit) {
			so = new LiteralObject(po.getNode());
		} else {
			so = new DefaultObject(po.getNode());
		}
		return so;
	}

	/**
	 * @param n
	 * @param result
	 * @throws WinkParseException
	 */
	public static void getSetProp(final AstNode n, final List<SetProp> result) throws WinkParseException {
		final ParseObject po = ParserUtils.resolveParseObject(n);

		if (po instanceof SetProp) {
			final SetProp setp = (SetProp) po;
			result.add(setp);
		} else if (po instanceof Function) {
			return;
		} else {
			for (final AstNode child : n.getChilds()) {
				getSetProp(child, result);
			}
		}
	}

	/**
	 * @param n
	 * @param result
	 * @throws WinkParseException
	 */
	public static void getSetName(final AstNode n, final List<SetName> result) throws WinkParseException {
		final ParseObject po = ParserUtils.resolveParseObject(n);

		if (po instanceof SetName) {
			final SetName setn = (SetName) po;
			result.add(setn);
		} else if (po instanceof Function) {
			return;
		} else {
			for (final AstNode child : n.getChilds()) {
				getSetName(child, result);
			}
		}
	}

	/**
	 * @param n
	 * @param result
	 * @throws WinkParseException
	 */
	public static void getCalls(final AstNode n, final List<Call> result) throws WinkParseException {
		final ParseObject po = ParserUtils.resolveParseObject(n, true);
		if (po instanceof Call) {
			final Call call = (Call) po;
			result.add(call);
		} else if (po instanceof Function) {
			return;
		} else {
			for (final AstNode child : n.getChilds()) {
				getCalls(child, result);
			}
		}
	}

	/**
	 * @param n
	 * @param result
	 * @throws WinkParseException
	 */
	public static void getFunctions(final AstNode n, final List<Function> result) throws WinkParseException {
		final ParseObject po = ParserUtils.resolveParseObject(n);

		if (po instanceof SetName || po instanceof SetProp || po instanceof ObjectLit) {
			return;
		} else if (po instanceof Function) {
			final Function func = (Function) po;
			result.add(func);
		} else {
			for (final AstNode child : n.getChilds()) {
				getFunctions(child, result);
			}
		}
	}

	/**
	 * @param n
	 * @param result
	 * @throws WinkParseException
	 */
	public static void getExprResultCall(final AstNode n, final List<ExprResultCall> result) throws WinkParseException {
		final ParseObject po = ParserUtils.resolveParseObject(n);

		if (po instanceof ExprResultCall) {
			final ExprResultCall c = (ExprResultCall) po;
			result.add(c);
		} else if (po instanceof Function) {
			return;
		} else {
			for (final AstNode child : n.getChilds()) {
				getExprResultCall(child, result);
			}
		}
	}

	/**
	 * @param f
	 * @param source
	 * @throws WinkParseException
	 */
	public static void updateFunctionInfo(final FunctionObject f, final String source) throws WinkParseException {
		final StreamTokenizer st = ParserUtils.getStreamTokenizer(source);
		boolean end = false;
		boolean firstWord = true;
		while (!end) {
			int ttype;
			try {
				ttype = st.nextToken();
			} catch (final IOException e) {
				throw new WinkParseException(e);
			}

			switch (ttype) {
			case StreamTokenizer.TT_EOF:
				end = true;
				break;
			case StreamTokenizer.TT_WORD:
				if (firstWord) {
					final String identifier = st.sval;
					f.setCharStart(source.indexOf(identifier));
					final int idx = source.lastIndexOf('}');
					f.setCharEnd(idx + 1);
					final int idxv = source.indexOf(',', idx);
					final int idxpv = source.indexOf(';', idx);

					if (idxv != -1) {
						final String between = source.substring(idx + 1, idxv + 1);
						if (between.trim().length() == 1) {
							f.setCharEnd(idxv + 1);
						}
					}

					if (idxpv != -1) {
						final String between = source.substring(idx + 1, idxpv + 1);
						if (between.trim().length() == 1) {
							f.setCharEnd(idxpv + 1);
						}
					}
					firstWord = false;
					end = true;
				}
				break;
			case StreamTokenizer.TT_NUMBER:
				break;
			default:
				break;
			}
		}
	}

	/**
	 * @param lt
	 * @param source
	 * @param relativeShiftLine
	 * @throws WinkParseException
	 */
	public static void updateLiteralLines(final LiteralObject lt, final String source, final int relativeShiftLine) throws WinkParseException {
		final StreamTokenizer st = ParserUtils.getStreamTokenizer(source);
		boolean end = false;
		boolean identifyBegin = false;
		boolean inBlock = false;
		boolean afterBlock = false;
		final StringBuffer afterBlockBuffer = new StringBuffer();

		int lpCount = 0;
		int rpCount = 0;

		while (!end) {
			int ttype;
			try {
				ttype = st.nextToken();
			} catch (final IOException e) {
				throw new WinkParseException(e);
			}

			switch (ttype) {
			case StreamTokenizer.TT_EOF:
				end = true;
				break;
			case StreamTokenizer.TT_WORD:
				if (!identifyBegin) {
					final String identifier = st.sval;
					final String ltName = lt.getNamespace().getLastName();
					if (identifier.indexOf(ltName) != -1) {
						final int ln = relativeShiftLine + (st.lineno() - 1);
						lt.setLineStart(ln);
						identifyBegin = true;
					}
				}
				if (afterBlock) {
					end = true;
				}
				break;
			case StreamTokenizer.TT_NUMBER:
				if (afterBlock) {
					end = true;
				}
				break;
			default:
				if (afterBlock) {
					afterBlockBuffer.append((char) ttype);
					final String c = new String(new StringBuffer().append((char) ttype));

					if (c.equals(",") || c.equals(";")) {
						if (afterBlockBuffer.toString().trim().length() == 1) {
							final int ln = relativeShiftLine + (st.lineno() - 1);
							lt.setLineEnd(ln);
							end = true;
						}
					}
				} else if (identifyBegin) {
					final String c = new String(new StringBuffer().append((char) ttype));
					if (c.equals("{")) {
						if (lpCount == 0) {
							inBlock = true;
						}
						lpCount++;
					} else if (c.equals("}")) {
						if (inBlock) {
							rpCount++;
						}
					}
					if (inBlock) {
						if (lpCount == rpCount) {
							final int ln = relativeShiftLine + (st.lineno() - 1);
							lt.setLineEnd(ln);
							inBlock = false;
							afterBlock = true;
							// end = true;
						}
					}
				}
				break;
			}
		}

		if (lpCount != rpCount) {
			throw new WinkParseException("bad syntax : left braces count differ from right braces count in " + lt.getNamespace());
		}
	}

	/**
	 * @param lt
	 * @param source
	 * @throws WinkParseException
	 */
	public static void updateLiteralChars(final LiteralObject lt, final String source) throws WinkParseException {
		final StreamTokenizer st = ParserUtils.getStreamTokenizer(source);
		boolean end = false;
		boolean firstWord = true;
		while (!end) {
			int ttype;
			try {
				ttype = st.nextToken();
			} catch (final IOException e) {
				throw new WinkParseException(e);
			}

			switch (ttype) {
			case StreamTokenizer.TT_EOF:
				end = true;
				break;
			case StreamTokenizer.TT_WORD:
				if (firstWord) {
					final String identifier = st.sval;
					final String ltName = lt.getNamespace().getLastName();
					if (identifier.indexOf(ltName) != -1) {
						lt.setCharStart(source.indexOf(identifier));
						firstWord = false;
						end = true;
					}
				}
				break;
			case StreamTokenizer.TT_NUMBER:
				break;
			default:
				break;
			}
		}

		final StringReader sr = new StringReader(source);
		int c;
		int la = 0;
		int ra = 0;
		int index = 0;
		boolean started = false;
		boolean endMarked = false;
		final StringBuffer afterBlockBuffer = new StringBuffer();

		try {
			final long ns = sr.skip(lt.getCharStart());
			index += ns;
			while ((c = sr.read()) != -1) {
				if (started && la == ra) {
					if (!endMarked) {
						lt.setCharEnd(index);
						endMarked = true;
					}

					afterBlockBuffer.append((char) c);
					if (c == ',' || c == ';') {
						if (afterBlockBuffer.toString().trim().length() == 1) {
							lt.setCharEnd(index + 1);
							break;
						} else {
							throw new WinkParseException("bad syntax : expected , or ; following } in " + lt.getNamespace());
						}
					}
				} else {
					if (c == '{') {
						la++;
						started = true;
					} else if (started && c == '}') {
						ra++;
					}
				}
				index++;
			}
		} catch (final IOException e) {
			throw new WinkParseException(e);
		}
	}

	/**
	 * @param content
	 * @param method
	 * @return
	 * @throws IOException
	 */
	public static LinkedHashMap<Integer, Integer> getBlockLines(final String content, final String method) throws IOException {
		final StreamTokenizer st = ParserUtils.getStreamTokenizer(content);
		final LinkedHashMap<Integer, Integer> result = new LinkedHashMap<Integer, Integer>();

		boolean end = false;
		boolean identifyBegin = false;
		boolean justAfterBegin = false;
		boolean inBlock = false;
		int lpCount = 0;
		int rpCount = 0;
		int lineStart = 0;
		int lineEnd = 0;

		while (!end) {
			final int ttype = st.nextToken();

			switch (ttype) {
			case StreamTokenizer.TT_EOF:
				end = true;
				break;
			case StreamTokenizer.TT_WORD:
				if (!identifyBegin) {
					if (st.sval.indexOf(method) != -1) {
						identifyBegin = true;
						justAfterBegin = true;
					}
				}
				break;
			default:
				final String c = String.valueOf((char) ttype);
				if (justAfterBegin) {
					if (c.equals("(")) {
						identifyBegin = false;
						justAfterBegin = false;
					}
				}

				if (identifyBegin) {
					justAfterBegin = false;
					if (c.equals("{")) {
						if (lpCount == 0) {
							lineStart = st.lineno();
							inBlock = true;
						}
						lpCount++;
					} else if (c.equals("}")) {
						if (inBlock) {
							rpCount++;
						}
					}
					if (inBlock) {
						if (lpCount == rpCount) {
							lineEnd = st.lineno();
							inBlock = false;
							result.put(lineStart, lineEnd);

							identifyBegin = false;
							inBlock = false;
							lpCount = 0;
							rpCount = 0;
							lineStart = 0;
							lineEnd = 0;
						}
					}
				}
				break;
			}
		}
		return result;
	}

	/**
	 * @param source
	 * @return
	 */
	public static StreamTokenizer getStreamTokenizer(final String source) {
		final StreamTokenizer st = new StreamTokenizer(new StringReader(source));
		st.wordChars('_', '_');
		st.wordChars('/', '/');
		st.wordChars('[', '[');
		st.wordChars(']', ']');
		st.wordChars('"', '"');
		st.slashStarComments(true);
		st.slashSlashComments(true);
		return st;
	}
}
