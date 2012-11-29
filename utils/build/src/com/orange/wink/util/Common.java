/*--------------------------------------------------------
 * Copyright (c) 2011, The Dojo Foundation
 * This software is distributed under the "Simplified BSD license",
 * the text of which is available at http://www.winktoolkit.org/licence.txt
 * or see the "license.txt" file for more details.
 *--------------------------------------------------------*/

/**
 * 
 */
package com.orange.wink.util;

import java.util.ArrayList;
import java.util.List;

import com.orange.wink.Constants;

/**
 * @author Sylvain Lalande
 * 
 */
public class Common {
	/**
	 * @param <T>
	 * @param expectedCapacity
	 * @return
	 */
	public static <T> ArrayList<T> newArrayList(final int expectedCapacity) {
		int capacity = 10;
		if (Constants.optimArrayList) {
			capacity = expectedCapacity;
		}
		return new ArrayList<T>(capacity);
	}

	/**
	 * @param <T>
	 * @param l
	 */
	public static <T> void trimList(final List<T> l) {
		if (Constants.optimArrayList) {
			if (l instanceof ArrayList) {
				((ArrayList<T>) l).trimToSize();
			}
		}
	}
}
