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
public class SetElem extends SetProp {
	// SETELEM:
	// NAME-STRING-OBJECTLIT
	// NAME-STRING-FUNCTION
	// GETPROP-STRING-OBJECTLIT
	// GETPROP-STRING-FUNCTION

	/**
	 * @param n
	 * @throws WinkUnmanagedSyntaxException
	 */
	public SetElem(final AstNode n) throws WinkUnmanagedSyntaxException {
		super(n);
	}
}
