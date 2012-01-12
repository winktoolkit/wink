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

import com.orange.wink.Constants;
import com.orange.wink.parse.objects.Call;

/**
 * @author Sylvain Lalande
 * 
 */
public class CallObject {
	/**
	 * 
	 */
	private Namespace namespace;
	/**
	 * 
	 */
	private Call call;
	/**
	 * 
	 */
	private String name;
	/**
	 * 
	 */
	private String sourceName;
	/**
	 * 
	 */
	private String source;
	/**
	 * 
	 */
	private int lineStart = -1;
	/**
	 * 
	 */
	private int lineEnd = -1;
	/**
	 * 
	 */
	private int charStart = -1;
	/**
	 * 
	 */
	private int charEnd = -1;

	/**
	 * @param namespace
	 */
	public CallObject(final Call call, final Namespace namespace) {
		this.call = call;
		this.namespace = namespace;
		name = namespace.toString().replace(Constants.THIS_TOKEN, "this");
		lineStart = call.getNode().getLineStart();
		lineEnd = lineStart;
	}

	/**
	 * @see java.lang.Object#toString()
	 */
	@Override
	public String toString() {
		final StringBuffer sb = new StringBuffer();

		sb.append("CALL [").append(name).append("]");
		final String ls = (lineStart == -1) ? "?" : new Integer(lineStart).toString();
		final String le = (lineEnd == -1) ? "?" : new Integer(lineEnd).toString();
		sb.append(" (L:").append(ls).append("-").append(le).append(";");

		final String cs = (charStart == -1) ? "?" : new Integer(charStart).toString();
		final String ce = (charEnd == -1) ? "?" : new Integer(charEnd).toString();
		sb.append(" C:").append(cs).append("-").append(ce).append(")");

		if (source != null) {
			sb.append(" [").append(source).append("]");
		}

		return sb.toString();
	}

	/**
	 * @return the namespace
	 */
	public Namespace getNamespace() {
		return namespace;
	}

	/**
	 * @param namespace
	 *            the namespace to set
	 */
	public void setNamespace(final Namespace namespace) {
		this.namespace = namespace;
	}

	/**
	 * @return the lineStart
	 */
	public int getLineStart() {
		return lineStart;
	}

	/**
	 * @param lineStart
	 *            the lineStart to set
	 */
	public void setLineStart(final int lineStart) {
		this.lineStart = lineStart;
	}

	/**
	 * @return the lineEnd
	 */
	public int getLineEnd() {
		return lineEnd;
	}

	/**
	 * @param lineEnd
	 *            the lineEnd to set
	 */
	public void setLineEnd(final int lineEnd) {
		this.lineEnd = lineEnd;
	}

	/**
	 * @return the charStart
	 */
	public int getCharStart() {
		return charStart;
	}

	/**
	 * @param charStart
	 *            the charStart to set
	 */
	public void setCharStart(final int charStart) {
		this.charStart = charStart;
	}

	/**
	 * @return the charEnd
	 */
	public int getCharEnd() {
		return charEnd;
	}

	/**
	 * @param charEnd
	 *            the charEnd to set
	 */
	public void setCharEnd(final int charEnd) {
		this.charEnd = charEnd;
	}

	/**
	 * @return the call
	 */
	public Call getCall() {
		return call;
	}

	/**
	 * @param call
	 *            the call to set
	 */
	public void setCall(final Call call) {
		this.call = call;
	}

	/**
	 * @return the name
	 */
	public String getName() {
		return name;
	}

	/**
	 * @param name
	 *            the name to set
	 */
	public void setName(final String name) {
		this.name = name;
	}

	/**
	 * @return the sourceName
	 */
	public String getSourceName() {
		return sourceName;
	}

	/**
	 * @param sourceName
	 *            the sourceName to set
	 */
	public void setSourceName(final String sourceName) {
		this.sourceName = sourceName;
	}

	/**
	 * @return the source
	 */
	public String getSource() {
		return source;
	}

	/**
	 * @param source
	 *            the source to set
	 */
	public void setSource(final String source) {
		this.source = source;
	}
}
