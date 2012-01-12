/*--------------------------------------------------------
 * Copyright (c) 2011, The Dojo Foundation
 * This software is distributed under the "Simplified BSD license",
 * the text of which is available at http://www.winktoolkit.org/licence.txt
 * or see the "license.txt" file for more details.
 *--------------------------------------------------------*/

/**
 * 
 */
package com.orange.wink.model;

import java.util.ArrayList;
import java.util.List;

import com.orange.wink.Constants;

/**
 * @author Sylvain Lalande
 * 
 */
public class Namespace {
	/**
	 * 
	 */
	private List<String> names;
	/**
	 * 
	 */
	private boolean isGlobalScope = false;

	/**
	 * 
	 */
	public Namespace() {
		names = new ArrayList<String>();
	}

	/**
	 * @param begin
	 * @param end
	 * @return
	 */
	public static Namespace build(final Namespace begin, final String end) {
		final Namespace result = new Namespace();
		result.appendNamespace(begin);
		result.addName(end);
		return result;
	}

	/**
	 * @param namespace
	 * @return
	 */
	public static boolean isThisReferenced(final Namespace namespace) {
		return namespace.getNames().contains(Constants.THIS_TOKEN);
	}

	/**
	 * @param name
	 */
	public void addName(final String name) {
		names.add(name);
	}

	/**
	 * @param namespace
	 */
	public void appendNamespace(final Namespace namespace) {
		names.addAll(namespace.getNames());
	}

	/**
	 * @param ns
	 */
	public void resolveThisBy(final Namespace ns) {
		if (!isThisReferenced(this)) {
			return;
		}
		final List<String> newNames = new ArrayList<String>();

		for (final String name : names) {
			if (name.equals(Constants.THIS_TOKEN)) {
				newNames.addAll(ns.getNames());
			} else {
				newNames.add(name);
			}
		}
		names = newNames;
	}

	/**
	 * @param b
	 */
	public void setGlobalScope(final boolean b) {
		isGlobalScope = b;
	}

	/**
	 * @return
	 */
	public boolean isGlobalScope() {
		return isGlobalScope;
	}

	/**
	 * @return
	 */
	public List<String> getNames() {
		return names;
	}

	/**
	 * @return
	 */
	public String getLastName() {
		if (names.size() > 0) {
			return names.get(names.size() - 1);
		}
		return null;
	}

	/**
	 * @see java.lang.Object#equals(java.lang.Object)
	 */
	@Override
	public boolean equals(final Object other) {
		if (!(other instanceof Namespace)) {
			return false;
		}
		final Namespace o = (Namespace) other;
		if (o.toString().equals(toString())) {
			return true;
		}
		return false;
	}

	/**
	 * @see java.lang.Object#toString()
	 */
	@Override
	public String toString() {
		final StringBuffer sb = new StringBuffer();
		if (isGlobalScope) {
			sb.append("<global>");
			sb.append(".");
		}
		for (final String name : names) {
			sb.append(name);
			sb.append(".");
		}
		if (sb.length() > 0) {
			sb.deleteCharAt(sb.length() - 1);
		}
		return sb.toString();
	}
}
