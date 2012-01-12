/*--------------------------------------------------------
 * Copyright (c) 2011, The Dojo Foundation
 * This software is distributed under the "Simplified BSD license",
 * the text of which is available at http://www.winktoolkit.org/licence.txt
 * or see the "license.txt" file for more details.
 *--------------------------------------------------------*/

/**
 * @fileOverview Object providing a layer of abstraction with all specifics related to the css rules.
 * 
 * @compatibility Iphone OS2, Iphone OS3, Iphone OS4, Android 1.5, Android 2.1, Android 2.2, Android 2.3, Android 3.0, Android 3.1, Bada 1.0, Windows Phone 7.5
 * @author Sylvain LALANDE
 */
define(['../../../_base/_base/js/base', '../../../_base/_feat/js/feat_css'], function(wink) 
{
	var _isSet = wink.isSet;
	var getprop = wink.has.prop;
	var _local = {
		u: undefined
	};
	
	wink.fx = {};

	/**
	 * Add a css class to the node
	 * 
	 * @function
	 * 
	 * @param {HTMLElement} node The DOM node
	 * @param {string} classStr The css class to add
	 * 
	 * @example
	 * 
	 * wink.addClass(node, 'MyCssClass');
	 * 
	 */
	wink.fx.addClass = addClass;
	function addClass(node, classStr) 
	{
		var cls = node.className;
		if ((" " + cls + " ").indexOf(" " + classStr + " ") < 0)
		{
			node.className = cls + (cls ? ' ' : '') + classStr;
		}
	};
	/**
	 * Remove a css class from the node
	 * 
	 * @function
	 * 
	 * @param {HTMLElement} node The DOM node
	 * @param {string} classStr The css class to remove
	 */
	wink.fx.removeClass = removeClass;
	function removeClass(node, classStr)
	{
		var t = wink.trim((" " + node.className + " ").replace(" " + classStr + " ", " "));
		if (node.className != t)
		{
			node.className = t;
		}
	};
	/**
	 * Apply styles to a given node
	 * 
	 * @function
	 * 
	 * @param {HTMLElement} node The node on which styles will be applied
	 * @param {object} properties An object containing all the properties to set
	 */
	wink.fx.apply = apply;
	function apply(node, properties)
	{
		var p, s = node.style;
		for (p in properties)
		{
			var styleResolved = getprop(p);
			s[styleResolved] = properties[p];
		}
	};
	/**
	 * Apply a transition to the given node
	 * 
	 * @function
	 * 
	 * @param {HTMLElement} node The node on which transition will be applied
	 * @param {string} property The transition property
	 * @param {integer} duration The transition duration
	 * @param {integer} delay The transition delay
	 * @param {string} func The transition function
	 * 
	 * @example
	 * 
	 * wink.fx.applyTransition(node, 'opacity', '500ms', '0ms', 'linear');
	 * 
	 */
	wink.fx.applyTransition = applyTransition;
	function applyTransition(node, property, duration, delay, func) 
	{
		apply(node, {
			"transition-property": _resolveProperties(property),
	    	"transition-duration": duration,
	    	"transition-delay": delay,
	    	"transition-timing-function": func
		});
	};
	/**
	 * Apply a transform transition to the given node
	 * 
	 * @function
	 * 
	 * @param {HTMLElement} node The node on which transition will be applied
	 * @param {integer} duration The transition duration
	 * @param {integer} delay The transition delay
	 * @param {string} func The transition function
	 * 
	 * @example
	 * 
	 * wink.fx.applyTransformTransition(node, '800ms', '0ms', 'default');
	 * 
	 */
	wink.fx.applyTransformTransition = applyTransformTransition;
	function applyTransformTransition(node, duration, delay, func) 
	{
		applyTransition(node, "transform", duration, delay, func);
	};
	/**
	 * Connect a function to the end of a transition on the given node.
	 * returns the listener in order to be able to remove it.
	 * 
	 * @function
	 * 
	 * @param {HTMLElement} node The node on which a transition is applied
	 * @param {string} func The function to connect
	 * @param {boolean} [persistent=false] Specify that the listener must be kept
	 * 
	 * @returns {function} The transition end listener
	 */
	wink.fx.onTransitionEnd = onTransitionEnd;
	function onTransitionEnd(node, func, persistent)
	{
		var trend = getprop("transitionend");
		var postwork = function(e) {
			if (persistent !== true) {
				node.removeEventListener(trend, postwork, false);
			}
			func(e);
		};
		node.addEventListener(trend, postwork, false);
		return postwork;
	};
	/**
	 * Returns the instantaneous position of the node, even during a transition.
	 * 
	 * @function
	 * 
	 * @param {HTMLElement} node The DOM node
	 * 
	 * @returns {object} The position of the element
	 */
	wink.fx.getTransformPosition = getTransformPosition;
	function getTransformPosition(node)
	{
		var result = {
			x: null,
			y: null
		};
		var transform = getTransform(node);
		
		if (!wink.has("css-matrix"))
		{
			var reg = new RegExp(/matrix/i);
			if (reg.test(transform)) 
			{
				var reg = new RegExp("[, ()]+", "g");
				var transformSplited = transform.split(reg);
				if (transformSplited.length > 6 && transformSplited[0] == "matrix")
				{
					result.x = parseInt(transformSplited[5]);
					result.y = parseInt(transformSplited[6]);
				}
			}
		}
		else
		{
			if (transform == "none")
			{
				transform = "";
			}
			var transformMatrix = new WebKitCSSMatrix(transform);
			result.x = transformMatrix.m41;
			result.y = transformMatrix.m42;
		}
		return result;
	};
	/**
	 * Apply the CSS Translation to the given node
	 * 
	 * @function
	 * 
	 * @param {HTMLElement} node The node to translate
	 * @param {integer} x The x coordinate of the translation
	 * @param {integer} y The y coordinate of the translation
	 * @param {boolean} [force2d] True to prevent "translate3d"
	 */
	wink.fx.applyTranslate = applyTranslate;
	function applyTranslate(node, x, y, force2d)
	{
		_computeTransform(node, x, y, _local.u, _local.u, _local.u, force2d);
	};
	/**
	 * Apply the CSS Scale to the given node
	 * 
	 * @function
	 * 
	 * @param {HTMLElement} node The node to scale
	 * @param {integer} x The x ratio of the scale
	 * @param {integer} y The y ratio of the scale
	 */
	wink.fx.applyScale = applyScale;
	function applyScale(node, x, y)
	{
		_computeTransform(node, _local.u, _local.u, x, y, _local.u, _local.u);
	};
	/**
	 * Apply the CSS Rotation to the given node
	 * 
	 * @function
	 * 
	 * @param {HTMLElement} node The node to rotate
	 * @param {number} angle The angle of the rotation in degrees
	 */
	wink.fx.applyRotate = applyRotate;
	function applyRotate(node, angle)
	{
		_computeTransform(node, _local.u, _local.u, _local.u, _local.u, angle, _local.u);
	};
	/**
	 * Return the transform affected to the given node
	 * 
	 * @function
	 * 
	 * @param {HTMLElement} node The DOM node
	 *  
	 * @returns {string} The transform
	 */
	wink.fx.getTransform = getTransform;
	function getTransform(node) 
	{
		return window.getComputedStyle(node)[getprop("transform-property")];
	};
	/**
	 * Apply the given transformation to the given node
	 * 
	 * @function
	 * 
	 * @param {HTMLElement} node The DOM node
	 * @param {string} transform The transformation to affect
	 */
	wink.fx.setTransform = setTransform;
	function setTransform(node, transform) 
	{
		apply(node, {
			"transform-property": transform
		});
	};
	/**
	 * apply the computed transformation to the given node
	 * 
	 * @param {HTMLElement} node The DOM node
	 * @param {number} tx The x coordinate of the translation
	 * @param {number} ty The y coordinate of the translation
	 * @param {number} sx The x ratio of the scale
	 * @param {number} sy The y ratio of the scale
	 * @param {number} a The angle of the rotation in degrees
	 * @param {boolean} force2d Used to prevent "translate3d"
	 */
	var _computeTransform = function(node, tx, ty, sx, sy, a, force2d)
	{
		var o = node._cssT || {};
		o = node._cssT = {
			t: (_isSet(tx) || _isSet(ty)) ? { tx: tx, ty: ty } : o.t,
			s: (_isSet(sx) || _isSet(sy)) ? { sx: sx, sy: sy } : o.s,
			r: _isSet(a) ? { a: a } : o.r
		};
		
		var hasT = (o.t && (_isSet(o.t.tx) || _isSet(o.t.ty))),
			hasS = (o.s && (_isSet(o.s.sx) || _isSet(o.s.sy))),
			hasR = (o.r && _isSet(o.r.a)),
			force2d = force2d;
		
		if (!wink.has("css-translate3d")
			|| (wink.ua.isAndroid && (hasS || hasR))) { // WORKAROUND - Android issue 12451 (>= 2.2) : translate3d combined with scale / rotate fails
			force2d = true;
		}
		
		var t = hasT ? _getTranslateTransform(o.t.tx, o.t.ty, force2d) : "",
			s = hasS ? _getScaleTransform(o.s.sx, o.s.sy) : "",
			r = hasR ? _getRotateTransform(o.r.a) : "",
			c = wink.trim(t + " " + s + " " + r);

		setTransform(node, c);
	};
	/**
	 * Get the translation transformation.
	 * 
	 * @param {number} x The x coordinate
	 * @param {number} y The y coordinate
	 * @param {boolean} force2d True to prevent "translate3d"
	 * 
	 * @returns {string} The transform
	 */
	var _getTranslateTransform = function(x, y, force2d)
	{
		var transform = "";
		var xParam = x;
		if (!_isSet(xParam))
		{
			xParam = 0;
		}
		var yParam = y;
		if (!_isSet(yParam))
		{
			yParam = 0;
		}
		var zParam = "0";
		
		var isPercentage = false;
		isPercentage = isPercentage || (wink.isString(xParam) && (xParam.indexOf('%', 0) != -1));
		isPercentage = isPercentage || (wink.isString(yParam) && (yParam.indexOf('%', 0) != -1));
		if (!isPercentage)
		{
			xParam = xParam + "px";
			yParam = yParam + "px";
			zParam = zParam + "px";
		}
		
		if (force2d) 
		{
			transform = "translate(" + xParam + ", " + yParam + ")";
		}
		else
		{
			transform = "translate3d(" + xParam + ", " + yParam + ", " + zParam + ")";
		}
		return transform;
	};
	/**
	 * Get the scale transformation.
	 * 
	 * @param {number} x The ratio on x
	 * @param {number} y The ratio on y
	 * 
	 * @returns {string} The transform
	 */
	var _getScaleTransform = function(x, y)
	{
		var transform = "";
		var xParam = x;
		if (!_isSet(xParam))
		{
			xParam = 1;
		}
		var yParam = y;
		if (!_isSet(yParam))
		{
			yParam = 1;
		}
		if (!wink.has("css-perspective"))
		{
			transform = "scale(" + xParam + ", " + yParam + ")";
		}
		else
		{
			transform = "scale3d(" + xParam + ", " + yParam + ", 1)";
		}
		return transform;
	};
	/**
	 * Get the rotate transformation.
	 * 
	 * @param {number} degree The rotation angle in degree
	 *
	 * @returns {string} The transform
	 */
	var _getRotateTransform = function(angle)
	{
		var transform = "";
		var angleParam = angle;
		if (!_isSet(angleParam))
		{
			angleParam = 0;
		}
		transform = "rotate(" + angleParam + "deg)";
		return transform;
	};
	/**
	 * Resolve the given property which may be a separated list of properties
	 * 
	 * @param {string} str The property to resolve
	 * 
	 * @returns {string} The resolved property
	 */
	var _resolveProperties = function(str)
	{
		var propertyResolved = str;
		if (str.indexOf(",") == -1) {
			propertyResolved = getprop(str);
		} else {
			var parts = str.split(",");
			var i, l = parts.length;
			for (i = 0; i < l; i++) {
				parts[i] = getprop(wink.trim(parts[i]));
			}
			propertyResolved = parts.join(",");
		}
		
		return propertyResolved;
	};
	
	/**
	 * @function
	 * @see wink.fx.addClass
	 */
	wink.addClass = addClass;
	
	/**
	 * @function
	 * @see wink.fx.removeClass
	 */
	wink.removeClass = removeClass;
	
	return wink.fx;
});