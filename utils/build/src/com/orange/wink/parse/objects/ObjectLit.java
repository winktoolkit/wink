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

import com.orange.wink.ast.AstNode;
import com.orange.wink.exception.WinkUnmanagedSyntaxException;

/**
 * @author Sylvain Lalande
 * 
 */
public class ObjectLit extends ParseObject {
	// OBJECTLIT:
	// [object_ids_prop: ...]
	/**
	 * @param n
	 * @throws WinkUnmanagedSyntaxException
	 */
	public ObjectLit(final AstNode n) throws WinkUnmanagedSyntaxException {
		super(n);
	}
}
