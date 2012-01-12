/*--------------------------------------------------------
 * Copyright (c) 2011, The Dojo Foundation
 * This software is distributed under the "Simplified BSD license",
 * the text of which is available at http://www.winktoolkit.org/licence.txt
 * or see the "license.txt" file for more details.
 *--------------------------------------------------------*/

/** 
 * @fileOverview HTML Elements extensions
 * 
 * @compatibility Iphone OS2, Iphone OS3, Iphone OS4, Android 1.1 (partial), Android 1.5, Android 2.1, Android 2.2, Android 2.3, Android 3.0, Android 3.1, BlackBerry 6, BlackBerry 7, Bada 1.0, Windows Phone 7.5
 * @author Sylvain LALANDE
 */

/**
 * @namespace HTMLElement
 * @name HTMLElement
 */

define(['../../../_base/_base/js/base'], function(wink)
{
	var htmlelement = HTMLElement.prototype;
	
	var isUndef = wink.isUndefined;
	
	/**
	 * @function Extends HTMLElements in order to retrieve their top and left position
	 * 
	 * @name HTMLElement#getPosition
	 * 
	 * @param {HTMLElement} [parentNode] If specified, the returned value is relative to the parentNode node. If parentNode is not a parent node of the current HTML element or if not specified, the returned value will be an absolute position
	 * @param {boolean} [transform] Take CSS transforms into account while calculating the position
	 * 
	 * @returns {object} the x and y position of the element
	 */
	var getPosition = function(parentNode, transform)
	{
		var position = {x: 0, y: 0};
		var obj = this;

		while (obj && obj != parentNode) 
		{
			position.x += obj.offsetLeft;
			position.y += obj.offsetTop;

			if ( transform )
			{
				position.x += wink.fx.getTransformPosition(obj).x;
				position.y += wink.fx.getTransformPosition(obj).y;
			}
			
			obj = obj.offsetParent;
		}
		
		return position;
	};
		
	/**
	 * @function Extends HTMLElements in order to retrieve their top position
	 * 
	 * @name HTMLElement#getTopPosition
	 * 
	 * @param {HTMLElement} [parentNode] If specified, the returned value is relative to the parentNode node. If parentNode is not a parent node of the current HTML element or if not specified, the returned value will be an absolute top position
	 * @param {boolean} [transform] Take CSS transforms into account while calculating the position
	 * 
	 * @returns {integer} the y position of the element
	 */
	var getTopPosition = function(parentNode, transform)
	{
		return (this.getPosition(parentNode, transform).y);
	};
	
	/**
	 * @function Extends HTMLElements in order to retrieve their left position
	 * 
	 * @name HTMLElement#getLeftPosition
	 * 
	 * @param {HTMLElement} [parentNode] If specified, the returned value is relative to the parentNode node. If parentNode is not a parent node of the current HTML element or if not specified, the returned value will be an absolute left position
	 * @param {boolean} [transform] Take CSS transforms into account while calculating the position
	 * 
	 * @returns {integer} The x position of the element
	 */
	var getLeftPosition = function(parentNode, transform)
	{
		return (this.getPosition(parentNode, transform).x);
	};
	
	/**
	 * @function Extends HTMLElements in order to translate the node
	 * 
	 * @name HTMLElement#translate
	 * 
	 * @param {integer|string} x The x position (can be a value in pixels or a value in percentage)
	 * @param {integer|string} y The y position (can be a value in pixels or a value in percentage)
	 * @param {boolean} [force2d] Used to prevent "translate3d"
	 */
	var translate = function(x, y, force2d)
	{
		wink.fx.applyTranslate(this, x, y, force2d);
	};
	
	/**
	 * @function Extends HTMLElements in order to scale the node
	 * 
	 * @name HTMLElement#scale
	 * 
	 * @param {integer} x The x ratio of the scale
	 * @param {integer} y The y ratio of the scale
	 */
	var scale = function(x, y)
	{
		wink.fx.applyScale(this, x, y);
	};
	
	/**
	 * @function Extends HTMLElements in order to rotate the node
	 * 
	 * @name HTMLElement#rotate
	 * 
	 * @param {integer} x The angle of the rotation in degrees
	 */
	var rotate = function(angle)
	{
		wink.fx.applyRotate(this, angle);
	};
	
	/**
	 * @function Extends HTMLElements in order to listen to gesture
	 * 
	 * @name HTMLElement#listenToGesture
	 * 
	 * @param {string} gesture The gesture name to listen
	 * @param {object} callback The callback to invoke when this gesture is done
	 * @param {object} [options] The options associated to the listener
	 * @param {boolean} [options.preventDefault=false] Indicates whether an automatic preventDefault must be done
	 * 
	 * @requires wink.ux.gesture
	 */
	var listenToGesture = function(gesture, callback, options)
	{
		wink.ux.gesture.listenTo(this, gesture, callback, options);
	};
	
	/**
	 * @function Extends HTMLElements in order to unlisten to gesture
	 * 
	 * @name HTMLElement#unlistenToGesture
	 * 
	 * @param {string} gesture The gesture name to unlisten
	 * @param {object} callback The callback that was previously added (identified by { context, method })
	 * 
	 * @requires wink.ux.gesture
	 */
	var unlistenToGesture = function(gesture, callback)
	{
		wink.ux.gesture.unlistenTo(this, gesture, callback);
	};
	
	htmlelement.winkGetPosition = getPosition;
	htmlelement.winkGetTopPosition = getTopPosition;
	htmlelement.winkGetLeftPosition = getLeftPosition;
	htmlelement.winkTranslate = translate;
	htmlelement.winkScale = scale;
	htmlelement.winkRotate = rotate;
	htmlelement.winkListenToGesture = listenToGesture;
	htmlelement.winkUnlistenToGesture = unlistenToGesture;
	
	// Bindings
	if ( isUndef(htmlelement.getPosition)) { htmlelement.getPosition = getPosition; }
	if ( isUndef(htmlelement.getTopPosition)) { htmlelement.getTopPosition = getTopPosition; }
	if ( isUndef(htmlelement.getLeftPosition)) { htmlelement.getLeftPosition = getLeftPosition; }
	if ( isUndef(htmlelement.rotate)) { htmlelement.rotate = rotate; }
	if ( isUndef(htmlelement.scale)) { htmlelement.scale = scale; }
	if ( isUndef(htmlelement.translate)) { htmlelement.translate = translate; }
	if ( isUndef(htmlelement.listenToGesture)) { htmlelement.listenToGesture = listenToGesture; }
	if ( isUndef(htmlelement.unlistenToGesture)) { htmlelement.unlistenToGesture = unlistenToGesture; }
	
	return wink;
});