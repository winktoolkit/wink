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

import java.util.ArrayList;
import java.util.List;

import org.mozilla.javascript.FunctionNode;
import org.mozilla.javascript.ScriptOrFnNode;
import org.mozilla.javascript.Token;

import com.orange.wink.exception.WinkAstException;

/**
 * @author Sylvain Lalande
 * 
 */
public class Ast {
	/**
	 * 
	 */
	private AstNode head;

	/**
	 * 
	 */
	public Ast() {

	}

	/**
	 * @throws WinkAstException
	 */
	public void expand() throws WinkAstException {
		head.expand();
	}

	/**
	 * @return the head
	 */
	public AstNode getHead() {
		return head;
	}

	/**
	 * @param head
	 *            the head to set
	 */
	public void setHead(final AstNode head) {
		this.head = head;
	}

	/**
	 * @see java.lang.Object#equals(java.lang.Object)
	 */
	@Override
	public boolean equals(final Object obj) {
		if (!(obj instanceof Ast)) {
			return false;
		}
		return ((Ast) obj).getHead() == head;
	}

	/**
	 * @see java.lang.Object#toString()
	 */
	@Override
	public String toString() {
		final StringBuffer sb = new StringBuffer();
		toStringTree(head, sb);
		return sb.toString();
	}

	/**
	 * @see org.mozilla.javascript.Node#toStringTree()
	 */
	public String toStringInner() {
		final StringBuffer sb = new StringBuffer();
		if (Token.printTrees) {
			sb.append(head.getNode().toStringTree((ScriptOrFnNode) head.getNode()));
		} else {
			sb.append("AST (no details)");
		}
		return sb.toString();
	}

	/**
	 * @return
	 */
	private void toStringTree(final AstNode n, final StringBuffer sb) {
		for (int i = 0; i < n.getDepth(); i++) {
			sb.append("    ");
		}
		sb.append(n.toString());
		sb.append("\n");
		for (final AstNode child : n.getChilds()) {
			toStringTree(child, sb);
		}
	}

	/**
	 * @param top
	 * @param type
	 * @param depth
	 * @return
	 */
	public static List<AstNode> getNodesByType(final AstNode top, final int type, final int depth) {
		final List<AstNode> result = new ArrayList<AstNode>();
		for (final AstNode an : top.getChilds()) {
			getNodesByTypeR(an, type, depth, 1, result);
		}
		return result;
	}

	/**
	 * @param top
	 * @param type
	 * @param depth
	 * @param currentDepth
	 * @param result
	 */
	private static void getNodesByTypeR(final AstNode top, final int type, final int depth, final int currentDepth, final List<AstNode> result) {
		if (depth != -1 && currentDepth > depth) {
			return;
		}
		if (type == -1 || top.getNode().getType() == type) {
			result.add(top);
		}
		for (final AstNode an : top.getChilds()) {
			getNodesByTypeR(an, type, depth, currentDepth + 1, result);
		}
	}

	/**
	 * @param n
	 * @return
	 */
	public static String getPositionInfo(final AstNode n) {
		String position = null;
		try {
			position = "(" + n.getScope().getAsScriptOrFn().getSourceName() + ":" + n.getLineStart() + ")";
		} catch (final WinkAstException e) {
			position = "(unknown position)";
		}
		return position;
	}

	/**
	 * @param type
	 * @return
	 */
	public static String functionTypeName(final int type) {
		switch (type) {
		case FunctionNode.FUNCTION_STATEMENT:
			return "FUNCTION_STATEMENT";
		case FunctionNode.FUNCTION_EXPRESSION:
			return "FUNCTION_EXPRESSION";
		case FunctionNode.FUNCTION_EXPRESSION_STATEMENT:
			return "FUNCTION_EXPRESSION_STATEMENT";
		default:
			return "unknown type";
		}
	}

	/**
	 * @param token
	 * @return
	 */
	public static String tokenName(final int token) {
		switch (token) {
		case Token.ERROR:
			return "ERROR";
		case Token.EOF:
			return "EOF";
		case Token.EOL:
			return "EOL";
		case Token.ENTERWITH:
			return "ENTERWITH";
		case Token.LEAVEWITH:
			return "LEAVEWITH";
		case Token.RETURN:
			return "RETURN";
		case Token.GOTO:
			return "GOTO";
		case Token.IFEQ:
			return "IFEQ";
		case Token.IFNE:
			return "IFNE";
		case Token.SETNAME:
			return "SETNAME";
		case Token.BITOR:
			return "BITOR";
		case Token.BITXOR:
			return "BITXOR";
		case Token.BITAND:
			return "BITAND";
		case Token.EQ:
			return "EQ";
		case Token.NE:
			return "NE";
		case Token.LT:
			return "LT";
		case Token.LE:
			return "LE";
		case Token.GT:
			return "GT";
		case Token.GE:
			return "GE";
		case Token.LSH:
			return "LSH";
		case Token.RSH:
			return "RSH";
		case Token.URSH:
			return "URSH";
		case Token.ADD:
			return "ADD";
		case Token.SUB:
			return "SUB";
		case Token.MUL:
			return "MUL";
		case Token.DIV:
			return "DIV";
		case Token.MOD:
			return "MOD";
		case Token.NOT:
			return "NOT";
		case Token.BITNOT:
			return "BITNOT";
		case Token.POS:
			return "POS";
		case Token.NEG:
			return "NEG";
		case Token.NEW:
			return "NEW";
		case Token.DELPROP:
			return "DELPROP";
		case Token.TYPEOF:
			return "TYPEOF";
		case Token.GETPROP:
			return "GETPROP";
		case Token.GETPROPNOWARN:
			return "GETPROPNOWARN";
		case Token.SETPROP:
			return "SETPROP";
		case Token.GETELEM:
			return "GETELEM";
		case Token.SETELEM:
			return "SETELEM";
		case Token.CALL:
			return "CALL";
		case Token.NAME:
			return "NAME";
		case Token.NUMBER:
			return "NUMBER";
		case Token.STRING:
			return "STRING";
		case Token.NULL:
			return "NULL";
		case Token.THIS:
			return "THIS";
		case Token.FALSE:
			return "FALSE";
		case Token.TRUE:
			return "TRUE";
		case Token.SHEQ:
			return "SHEQ";
		case Token.SHNE:
			return "SHNE";
		case Token.REGEXP:
			return "OBJECT";
		case Token.BINDNAME:
			return "BINDNAME";
		case Token.THROW:
			return "THROW";
		case Token.RETHROW:
			return "RETHROW";
		case Token.IN:
			return "IN";
		case Token.INSTANCEOF:
			return "INSTANCEOF";
		case Token.LOCAL_LOAD:
			return "LOCAL_LOAD";
		case Token.GETVAR:
			return "GETVAR";
		case Token.SETVAR:
			return "SETVAR";
		case Token.CATCH_SCOPE:
			return "CATCH_SCOPE";
		case Token.ENUM_INIT_KEYS:
			return "ENUM_INIT_KEYS";
		case Token.ENUM_INIT_VALUES:
			return "ENUM_INIT_VALUES";
		case Token.ENUM_INIT_ARRAY:
			return "ENUM_INIT_ARRAY";
		case Token.ENUM_NEXT:
			return "ENUM_NEXT";
		case Token.ENUM_ID:
			return "ENUM_ID";
		case Token.THISFN:
			return "THISFN";
		case Token.RETURN_RESULT:
			return "RETURN_RESULT";
		case Token.ARRAYLIT:
			return "ARRAYLIT";
		case Token.OBJECTLIT:
			return "OBJECTLIT";
		case Token.GET_REF:
			return "GET_REF";
		case Token.SET_REF:
			return "SET_REF";
		case Token.DEL_REF:
			return "DEL_REF";
		case Token.REF_CALL:
			return "REF_CALL";
		case Token.REF_SPECIAL:
			return "REF_SPECIAL";
		case Token.DEFAULTNAMESPACE:
			return "DEFAULTNAMESPACE";
		case Token.ESCXMLTEXT:
			return "ESCXMLTEXT";
		case Token.ESCXMLATTR:
			return "ESCXMLATTR";
		case Token.REF_MEMBER:
			return "REF_MEMBER";
		case Token.REF_NS_MEMBER:
			return "REF_NS_MEMBER";
		case Token.REF_NAME:
			return "REF_NAME";
		case Token.REF_NS_NAME:
			return "REF_NS_NAME";
		case Token.TRY:
			return "TRY";
		case Token.SEMI:
			return "SEMI";
		case Token.LB:
			return "LB";
		case Token.RB:
			return "RB";
		case Token.LC:
			return "LC";
		case Token.RC:
			return "RC";
		case Token.LP:
			return "LP";
		case Token.RP:
			return "RP";
		case Token.COMMA:
			return "COMMA";
		case Token.ASSIGN:
			return "ASSIGN";
		case Token.ASSIGN_BITOR:
			return "ASSIGN_BITOR";
		case Token.ASSIGN_BITXOR:
			return "ASSIGN_BITXOR";
		case Token.ASSIGN_BITAND:
			return "ASSIGN_BITAND";
		case Token.ASSIGN_LSH:
			return "ASSIGN_LSH";
		case Token.ASSIGN_RSH:
			return "ASSIGN_RSH";
		case Token.ASSIGN_URSH:
			return "ASSIGN_URSH";
		case Token.ASSIGN_ADD:
			return "ASSIGN_ADD";
		case Token.ASSIGN_SUB:
			return "ASSIGN_SUB";
		case Token.ASSIGN_MUL:
			return "ASSIGN_MUL";
		case Token.ASSIGN_DIV:
			return "ASSIGN_DIV";
		case Token.ASSIGN_MOD:
			return "ASSIGN_MOD";
		case Token.HOOK:
			return "HOOK";
		case Token.COLON:
			return "COLON";
		case Token.OR:
			return "OR";
		case Token.AND:
			return "AND";
		case Token.INC:
			return "INC";
		case Token.DEC:
			return "DEC";
		case Token.DOT:
			return "DOT";
		case Token.FUNCTION:
			return "FUNCTION";
		case Token.EXPORT:
			return "EXPORT";
		case Token.IMPORT:
			return "IMPORT";
		case Token.IF:
			return "IF";
		case Token.ELSE:
			return "ELSE";
		case Token.SWITCH:
			return "SWITCH";
		case Token.CASE:
			return "CASE";
		case Token.DEFAULT:
			return "DEFAULT";
		case Token.WHILE:
			return "WHILE";
		case Token.DO:
			return "DO";
		case Token.FOR:
			return "FOR";
		case Token.BREAK:
			return "BREAK";
		case Token.CONTINUE:
			return "CONTINUE";
		case Token.VAR:
			return "VAR";
		case Token.WITH:
			return "WITH";
		case Token.CATCH:
			return "CATCH";
		case Token.FINALLY:
			return "FINALLY";
		case Token.VOID:
			return "VOID";
		case Token.RESERVED:
			return "RESERVED";
		case Token.EMPTY:
			return "EMPTY";
		case Token.BLOCK:
			return "BLOCK";
		case Token.LABEL:
			return "LABEL";
		case Token.TARGET:
			return "TARGET";
		case Token.LOOP:
			return "LOOP";
		case Token.EXPR_VOID:
			return "EXPR_VOID";
		case Token.EXPR_RESULT:
			return "EXPR_RESULT";
		case Token.JSR:
			return "JSR";
		case Token.SCRIPT:
			return "SCRIPT";
		case Token.TYPEOFNAME:
			return "TYPEOFNAME";
		case Token.USE_STACK:
			return "USE_STACK";
		case Token.SETPROP_OP:
			return "SETPROP_OP";
		case Token.SETELEM_OP:
			return "SETELEM_OP";
		case Token.LOCAL_BLOCK:
			return "LOCAL_BLOCK";
		case Token.SET_REF_OP:
			return "SET_REF_OP";
		case Token.DOTDOT:
			return "DOTDOT";
		case Token.COLONCOLON:
			return "COLONCOLON";
		case Token.XML:
			return "XML";
		case Token.DOTQUERY:
			return "DOTQUERY";
		case Token.XMLATTR:
			return "XMLATTR";
		case Token.XMLEND:
			return "XMLEND";
		case Token.TO_OBJECT:
			return "TO_OBJECT";
		case Token.TO_DOUBLE:
			return "TO_DOUBLE";
		case Token.GET:
			return "GET";
		case Token.SET:
			return "SET";
		case Token.LET:
			return "LET";
		case Token.YIELD:
			return "YIELD";
		case Token.CONST:
			return "CONST";
		case Token.SETCONST:
			return "SETCONST";
		case Token.ARRAYCOMP:
			return "ARRAYCOMP";
		case Token.WITHEXPR:
			return "WITHEXPR";
		case Token.LETEXPR:
			return "LETEXPR";
		case Token.DEBUGGER:
			return "DEBUGGER";
		default:
			return String.valueOf(token);
		}
	}
}
