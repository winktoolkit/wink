/*--------------------------------------------------------
 * Copyright (c) 2011, The Dojo Foundation
 * This software is distributed under the "Simplified BSD license",
 * the text of which is available at http://www.winktoolkit.org/licence.txt
 * or see the "license.txt" file for more details.
 *--------------------------------------------------------*/

/**
 * @fileOverview The Event object is an encapsulation of an event. Only the touch object has to create such events.
 * It can thus be seen as an only readable object.
 * 
 * @author Sylvain LALANDE
 */

define(['../../../_amd/core'], function()
{	
	var undef = wink.isUndefined;
	var isSet = wink.isSet;

	/**
	 * @class The Event object is an encapsulation of an event. Only the touch object has to create such events.
	 * It can thus be seen as an only readable object.
	 * 
	 * @param {object} properties The properties object
	 * @param {string} properties.type Type of event (start, move, end, gesturestart, gesturemove, gestureend)
	 * @param {number} properties.x x coordinate of the event
	 * @param {number} properties.y y coordinate of the event
	 * @param {timestamp} properties.timestamp	The event timestamp
	 * @param {HTMLElement} properties.target The target element
	 * @param {DOMEvent} properties.srcEvent The original source event
	 * @param {boolean} properties.multitouch Indicates whether the current event occurs in a multi-touch context
	 * 
	 * @compatibility iOS2, iOS3, iOS4, iOS5, iOS6, Android 1.5, Android 2.1, Android 2.2, Android 2.3, Android 3.0, Android 3.1, Android 4.0, Android 4.1.2, BlackBerry 6, BlackBerry 7, BB10, Bada 1.0, Windows Phone 8
	 */
	wink.ux.Event = function(properties)
	{
		/**
		 * Unique identifier
		 * 
		 * @property uId
		 * @type integer
		 */
		this.uId = wink.getUId();
		
		/**
		 * Type of event (start, move, end, gesturestart, gesturemove, gestureend)
		 * 
		 * @property type
		 * @type string
		 */
		this.type = null;
		
		/**
		 * x coordinate of the event
		 * 
		 * @property x
		 * @type number
		 */
		this.x = null;
		
		/**
		 * y coordinate of the event
		 * 
		 * @property y
		 * @type number
		 */
		this.y = null;
		
		/**
		 * The event timestamp
		 * 
		 * @property timestamp
		 * @type timestamp
		 */
		this.timestamp = null;
		
		/**
		 * The target element
		 * 
		 * @property target
		 * @type HTMLElement
		 */
		this.target = null;
		
		/**
		 * The original source event
		 * 
		 * @property srcEvent
		 * @type DOMEvent
		 */
		this.srcEvent = null;
		
		/**
		 * Indicates whether the current event occurs in a multi-touch context
		 * 
		 * @property multitouch
		 * @type boolean
		 */
		this.multitouch = null;
		
		wink.mixin(this, properties);
		
		if (this._validateProperties() === false) return;
	};
	
	wink.ux.Event.prototype = 
	{
		/**
		 * Allows to prevent the default behavior
		 */
		preventDefault: function()
		{
			this.srcEvent.preventDefault();
		},
	
		/**
		 * Allows to stop the event propagation
		 */
		stopPropagation: function()
		{
			this.srcEvent.stopPropagation();
		},
	
		/**
		 * Dispatch the source event to the given element with the given type
		 * 
		 * @param {HTMLElement} target the node that will receive the dispatched event
		 * @param {string} [type] the type of event dispatched (eg: click)
		 */
		dispatch: function(target, type)
		{
			var srcEvent = this.srcEvent;
			var targetedType = srcEvent.type;
			if (isSet(type))
			{
				targetedType = type;
			}
			var cloneEvent = _createEvent(srcEvent, targetedType);
			target.dispatchEvent(cloneEvent);
		},
		
		/**
		 * Validate the properties of the component
		 * @returns {boolean} True if the properties are valid, false otherwise
		 */
		_validateProperties: function()
		{
			var l = function(p) {
				wink.log('[Event] ' + p + ' must be specified');
			};
			if ( !isSet(this.type) || this.type == '' )
			{
				l('type');
				return false;
			}
			if ( undef(this.x) )
			{
				l('x');
				return false;
			}
			if ( undef(this.y) )
			{
				l('y');
				return false;
			}
			if ( !isSet(this.timestamp) )
			{
				l('timestamp');
				return false;
			}
			if ( undef(this.target) )
			{
				l('target');
				return false;
			}
			if ( !isSet(this.srcEvent) )
			{
				l('srcEvent');
				return false;
			}
		}
	};
	
	/**
	 * @param {HTMLElement} sourceEvent the source event
	 * @param {HTMLElement} type the event type
	 * 
	 * @returns {DOMEvent} a new event
	 */
	var _createEvent = function(sourceEvent, type)
	{
		var s = sourceEvent;
		var eventInterface = "HTMLEvents";
		
		if (/blur|focus|resize|scroll/i.test(type)) {
			eventInterface = "UIEvent";
		} else if (/click|mouse(down|move|up)/i.test(type)) {
			eventInterface = "MouseEvent";
		} else if (/touch(start|move|end|cancel)/i.test(type)) {
			eventInterface = "TouchEvent";
		} else if (/MSPointer/i.test(type)) {
			eventInterface = "MSPointerEvent";
		}
		
		var event = document.createEvent(eventInterface);
		var ct = s.changedTouches;
		if (eventInterface == "HTMLEvents") {
			event.initEvent(type, s.bubbles, s.cancelable);
		} else if (eventInterface == "UIEvent") {
			event.initUIEvent(type, s.bubbles, s.cancelable, window, s.detail);
		} else if (eventInterface == "MouseEvent") {
			var sx = s.screenX, sy = s.screenY, cx = s.clientX, cy = s.clientY;
			if (s.initTouchEvent && ct && ct.length > 0) {
				var t = ct[0];
				sx = t.screenX;
				sy = t.screenY;
				cx = t.clientX;
				cy = t.clientY;
			}
			event.initMouseEvent(type, s.bubbles, s.cancelable, document.defaultView, s.detail, sx, sy, cx, cy, s.ctrlKey, s.altKey, s.shiftKey, s.metaKey, s.button, s.relatedTarget);
		} else if (eventInterface == "TouchEvent") {
			event.initTouchEvent(type, s.bubbles, s.cancelable, window, s.detail, s.screenX, s.screenY, s.clientX, s.clientY, s.ctrlKey, s.altKey, s.shiftKey, s.metaKey, s.touches, s.targetTouches, ct, s.scale, s.rotation);
		} else if (eventInterface == "MSPointerEvent") {
			event.initPointerEvent(type, s.bubbles, s.cancelable, window, s.detail, s.screenX, s.screenY, s.clientX, s.clientY, s.ctrlKey, s.altKey, s.shiftKey, s.metaKey, s.button, s.relatedTarget, s.offsetX, s.offsetY, s.width, s.height, s.pressure, s.rotation, s.tiltX, s.tiltY, s.pointerId, s.pointerType, s.hwTimestamp, s.isPrimary);
		}
		
		return event;
	};
	
	return wink.ux.Event;
});