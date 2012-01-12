/*--------------------------------------------------------
 * Copyright (c) 2011, The Dojo Foundation
 * This software is distributed under the "Simplified BSD license",
 * the text of which is available at http://www.winktoolkit.org/licence.txt
 * or see the "license.txt" file for more details.
 *--------------------------------------------------------*/

/**
 * 
 */
package com.orange.wink.parse.objects;

import java.util.Comparator;

import com.orange.wink.ast.AstNode;

/**
 * @author Sylvain Lalande
 * 
 */
public class ParseObject {
	/**
	 * 
	 */
	protected AstNode node;

	/**
	 * @param n
	 */
	public ParseObject(final AstNode n) {
		node = n;
	}

	/**
	 * @return
	 */
	public static LineComparator getLineComparator() {
		return new ParseObject(null).new LineComparator();
	}

	/**
	 * @return
	 */
	public static TypeComparator getTypeComparator() {
		return new ParseObject(null).new TypeComparator();
	}

	/**
	 * 
	 */
	public class LineComparator implements Comparator<ParseObject> {
		/**
		 * @see java.util.Comparator#compare(java.lang.Object, java.lang.Object)
		 */
		@Override
		public int compare(final ParseObject o1, final ParseObject o2) {
			final AstNode n1 = o1.getNode();
			final AstNode n2 = o2.getNode();
			return new Integer(n1.getLineStart()).compareTo(n2.getLineStart());
		}
	}

	/**
	 * 
	 */
	public class TypeComparator implements Comparator<ParseObject> {
		/**
		 * @see java.util.Comparator#compare(java.lang.Object, java.lang.Object)
		 */
		@Override
		public int compare(final ParseObject o1, final ParseObject o2) {
			if (o1 instanceof Function && o2 instanceof ExprResultCall) {
				return -1;
			}
			return 0;
		}
	}

	/**
	 * @return the node
	 */
	public AstNode getNode() {
		return node;
	}
}
