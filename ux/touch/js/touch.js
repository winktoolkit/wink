/*--------------------------------------------------------
 * Copyright (c) 2011, The Dojo Foundation
 * This software is distributed under the "Simplified BSD license",
 * the text of which is available at http://www.winktoolkit.org/licence.txt
 * or see the "license.txt" file for more details.
 *--------------------------------------------------------*/

/**
 * @fileOverview The Touch object provides a layer of abstraction with all event listeners and listened elements.
 * It manages the events of the finger or the mouse so that the caller does not care about the target platform.
 * When events occur, the touch object handles them invoking callbacks with the resulting event and associated arguments.
 *
 * @author Sylvain LALANDE
 * 
 * @compatibility Iphone OS2, Iphone OS3, Iphone OS4, Android 1.5, Android 2.1, Android 2.2, Android 2.3, Android 3.0, Android 3.1, BlackBerry 6, BlackBerry 7, Bada 1.0
 */
define(['../../../_base/_base/js/base', '../../../_base/error/js/error', '../../../_base/_feat/js/feat_event', '../../event/js/event'], function(wink) 
{
	var _els = []; // touch elements
	
	var _SE = "start";
	var _ME = "move";
	var _EE = "end";
	var _GS_SE = "gesturestart";
	var _GS_CE = "gesturechange";
	var _GS_EE = "gestureend";
	
	var hasprop = wink.has.prop;
	var _MAP = {
		"start": hasprop("touchstart"),
		"move": hasprop("touchmove"),
		"end": hasprop("touchend"),
		"gesturestart": hasprop("gesturestart"),
		"gesturechange": hasprop("gesturechange"),
		"gestureend": hasprop("gestureend")
	};
	var _MAP_INV = {};
	for (var key in _MAP)
	{
		var value = _MAP[key];
		_MAP_INV[value] = key;
	}
	
	/**
	 * @namespace The Touch object provides a layer of abstraction with all event listeners and listened elements.
	 * It manages the events of the finger or the mouse so that the caller does not care about the target platform.
	 * When events occur, the touch object handles them invoking callbacks with the resulting event and associated arguments.
	 * 
	 * @see <a href="WINK_ROOT_URL/ux/touch/test/test_touch_1.html" target="_blank">Test page</a>
	 * @see <a href="WINK_ROOT_URL/ux/touch/test/test_touch_2.html" target="_blank">Test page (move)</a>
	 * @see <a href="WINK_ROOT_URL/ux/touch/test/test_touch_3.html" target="_blank">Test page (selection)</a>
	 */
	wink.ux.touch = {};

	/**
	 * Adds a new listener
	 * 
	 * @function
	 * 
	 * @param {HTMLElement} domNode The DOM node reference
	 * @param {string} eventType The event type that must match with one of { "start", "move", "end", "gesturestart", "gesturemove", "gestureend" }
	 * @param {object} callback The callback to invoke when event is received by the node : { context, method, arguments }
	 * @param {options} [options] The options associated to the listener
	 * @param {boolean} [options.preventDefault=false] Indicates whether an automatic preventDefault must be done
	 * @param {boolean} [options.tracking=true] Indicates whether the node must be tracked after the first start event (taken into account in the first method call)
	 * @param {boolean} [options.captureFlow=false] Indicates whether the capture event flow is used
	 * 
	 * @example
	 * 
	 * var handleStart = function(uxEvent)
	 * {
	 *   alert("Start At: " + uxEvent.x + ", " + uxEvent.y);
	 * };
	 * 
	 * wink.ux.touch.addListener($("nodeId"), "start", { context: window, method: "handleStart" });
	 * 
	 */
	wink.ux.touch.addListener = addListener;
	function addListener(domNode, eventType, callback, options)
	{
		if (wink.isUndefined(_MAP[eventType]))
		{
			wink.log('[touch] Cannot add listener for unknown eventType: ' + eventType);
			return false;
		}
		
		if (!wink.isSet(options))
		{
			options = {};
		}
		if (options === true)
		{
			options = { preventDefault: true }; // backwards compatibility
		}
		var opts = {
			preventDefault: options.preventDefault === true ? true : false,
			tracking: options.tracking === false ? false : true,
			captureFlow: options.captureFlow === true ? true : false
		};
		
		var touchElement = null;
		var index = _getTouchElementIndex(domNode);
		if (index == null) 
		{
			var properties = { domNode: domNode, tracking: opts.tracking };
			touchElement = new wink.ux.touch.Element(properties);
			_els.push(touchElement);
		}
		else
		{
			touchElement = _els[index];
		}
		
		if (!touchElement.isListening(eventType))
		{
			if (touchElement.eventHandler == null) {
				touchElement.eventHandler = function(e) {
					_handleEvent(e, touchElement);
				};
			}
			touchElement.eventCaptures[eventType] = opts.captureFlow;
			touchElement.domNode.addEventListener(_MAP[eventType], touchElement.eventHandler, touchElement.eventCaptures[eventType]);
		}
		touchElement.addEventCallback(eventType, callback, opts.preventDefault);
	};
	
	/**
	 * Removes an existing listener
	 * 
	 * @function
	 * 
	 * @param {HTMLElement} domNode The DOM node reference
	 * @param {string} eventType The event type that must match with one of { "start", "move", "end", "gesturestart", "gesturemove", "gestureend" }
	 * @param {object} callback The callback that was previously added (identified by { context, method })
	 * 
	 */
	wink.ux.touch.removeListener = removeListener;
	function removeListener(domNode, eventType, callback) 
	{
		var index = _getTouchElementIndex(domNode);
		if (index != null) 
		{
			var touchElement = _els[index];
			touchElement.removeEventCallback(eventType, callback);
			if (!touchElement.isListening(eventType))
			{
				touchElement.domNode.removeEventListener(_MAP[eventType], touchElement.eventHandler, touchElement.eventCaptures[eventType]);
			}
		}
	};
	
	/**
	 * Returns the given touch properties.
	 * 
	 * @function
	 * 
	 * @param {object} touch The touch object
	 * @returns The touch properties (x, y, target)
	 */
	wink.ux.touch.getTouchProperties = getTouchProperties;
	function getTouchProperties(touch)
	{
		var properties = {};
		properties.x = touch.pageX;
		properties.y = touch.pageY;
		properties.target = touch.target;
		return properties;
	};
	
	/**
	 * @param {HTMLElement} domNode The DOM node reference
	 */
	var _getTouchElementIndex = function(domNode) 
	{
		var i, l = _els.length;
		for (i = 0; i < l; i++) 
		{
			var touchElementI = _els[i];
			if (touchElementI.domNode == domNode) 
			{
				return i;
			}
		}
		return null;
	};
	
	/**
	 * @param {DOMEvent} e A DOM event
	 * @param {wink.ux.touch.Element} touchElement The associated touch element
	 */
	var _handleEvent = function(e, touchElement)
	{
		var eventType = _MAP_INV[e.type];
		var uxEvent = _createUxEvent(eventType, e);
		
		if (!touchElement.isListening(_SE) || touchElement.tracking == false) 
		{
			touchElement.tracked = true;
		} 
		else if (eventType == _SE)
		{
			touchElement.tracked = true;
		}
		if (touchElement.tracked == true)
		{
			if (eventType == _EE)
			{
				touchElement.tracked = false;
			}
			touchElement.notifyEvent(uxEvent);
		}
	};
	
	/**
	 * @param {string} type The event type that must maches with one of {"start", "move", "end", "gesturestart", "gesturemove", "gestureend" }
	 * @param {DOMEvent} e A DOM event
	 */
	var _createUxEvent = function(type, e)
	{
		var properties = {};
		
		properties.type 		= type;
		properties.srcEvent 	= e;
		properties.timestamp 	= e.timeStamp;
		properties.multitouch	= false;
		
		if (!properties.timestamp)
		{
			properties.timestamp = new Date().getTime();
		}
		
		if (wink.has("touch"))
		{
			if (type == _GS_SE 
			 || type == _GS_CE
			 || type == _GS_EE)
			{
				properties.target = e.target;
				properties.x = 0;
				properties.y = 0;
			}
			else
			{
				var lastTouch = null;
				if (type == _EE) 
				{
					if (e.changedTouches && e.changedTouches.length > 0) 
					{
						lastTouch = e.changedTouches[0];
					}
				}
				else 
				{
					if (e.targetTouches && e.targetTouches.length > 0) 
					{
						lastTouch = e.targetTouches[0];
					}
					else if (e.changedTouches && e.changedTouches.length > 0) 
					{
						lastTouch = e.changedTouches[0];
					}
				}
				if (lastTouch != null) 
				{
					var props = getTouchProperties(lastTouch);
					properties.x = props.x;
					properties.y = props.y;
					properties.target = props.target;
					if (e.touches && e.touches.length > 1)
					{
						properties.multitouch = true;
					}
				}
			}
		}
		else 
		{
			var props = getTouchProperties(e);
			properties.x = props.x;
			properties.y = props.y;
			properties.target = props.target;
		}
		
		return new wink.ux.Event(properties);
	};

	/**
	 * Implements an object encapsulating the concept of the DOM element receiving user events.
	 * An element is linked to one or more events and each event refers to one or more callbacks.
	 * 
	 * @class The touch Element component handled by the Touch object.
	 * It is an object encapsulating the concept of the DOM element receiving user events.
	 * An element is linked to one or more events and each event refers to one or more callbacks.
	 * 
	 * @param {object} properties The properties object
	 * @param {HTMLElement} properties.domNode The dom node associated to the touch element
	 * @param {boolean} properties.tracking Indicates whether the touch element is in tracking mode
	 * @param {boolean} properties.tracked Indicates whether the touch element is currently tracked
	 * 
	 */
	wink.ux.touch.Element = function(properties)
	{
		/**
		 * Unique identifier
		 * 
		 * @property uId
		 * @type integer
		 */
		this.uId				= wink.getUId();
		
		/**
		 * The dom node associated to the touch element
		 * 
		 * @property domNode
		 * @type HTMLElement
		 */
		this.domNode			= null;
		
		/**
		 * Indicates whether the touch element is in tracking mode
		 * 
		 * @property tracking
		 * @type boolean
		 */
		this.tracking			= false;
		
		/**
		 * Indicates whether the touch element is currently tracked
		 * 
		 * @property tracked
		 * @type boolean
		 */
		this.tracked			= false;
		
		this.eventHandler		= null;
		this.eventCaptures		= {};
		this._els				= {}; // events listened
		wink.mixin(this, properties);
		
		if (this._validateProperties() === false) return;
	};
	
	wink.ux.touch.Element.prototype = 
	{
		/**
		 * Adds a new callback associated to the given event type
		 * 
		 * @param {string} eventType The type of event
		 * @param {object} callback The callback to add : { context, method, arguments }
		 * @param {boolean} preventDefault Lets do a "preventDefault" automatically when receiving the event
		 * 
		 */
		addEventCallback: function(eventType, callback, preventDefault)
		{
			if (!wink.isCallback(callback))
			{
				wink.log('[touch.Element] Invalid callback');
				return false;
			}
			
			var listenedEvent = this._els[eventType];
			
			if (!listenedEvent)
			{
				listenedEvent = 
				{
					preventDefault: preventDefault,
					callbacks: []
				};
				this._els[eventType] = listenedEvent;
			}
			else 
			{
				var callbacks = listenedEvent.callbacks;
				var j, l = callbacks.length;
				for (j = 0; j < l; j++)
				{
					var cj = callbacks[j];
					if (callback.context == cj.context && callback.method == cj.method) 
					{
						return false;
					}
				}
			}
			listenedEvent.callbacks.push(callback);
			return true;
		},
	
		/**
		 * Removes a callback associated to the given event type
		 * 
		 * @param {string} eventType The type of event
		 * @param {object} callback The callback to remove (identified by { context, method })
		 */
		removeEventCallback: function(eventType, callback)
		{
			if (!wink.isCallback(callback))
			{
				wink.log('[touch.Element] Invalid callback');
				return false;
			}
			var listenedEvent = this._els[eventType];
			if (!listenedEvent)
			{
				return false;
			}
			var callbacks = listenedEvent.callbacks;
			
			var j, l = callbacks.length;
			for (j = 0; j < l; j++)
			{
				var cj = callbacks[j];
				if (callback.context == cj.context && callback.method == cj.method) 
				{
					listenedEvent.callbacks.splice(j, 1);
					break;
				}
			}
			return true;
		},
	
		/**
		 * Indicates whether the element should be notified of events that matches to the given one because at least one callback target exists
		 * 
		 * @param {string} eventType The type of event
		 */
		isListening: function(eventType) 
		{
			var listenedEvent = this._els[eventType];
			if (listenedEvent && listenedEvent.callbacks.length > 0)
			{
				return true;
			}
			return false;
		},
	
		/**
		 * Notifies the element so that it handles the given Wink Event
		 * 
		 * @param {wink.ux.Event} uxEvent The event to handle
		 */
		notifyEvent: function(uxEvent)
		{
			var listenedEvent = this._els[uxEvent.type];
			if (listenedEvent) {
				if (listenedEvent.preventDefault == true)
				{
					uxEvent.preventDefault();
				}
				
				var callbacks = listenedEvent.callbacks;
				for (var j = 0; j < callbacks.length; j++)
				{
					wink.call(callbacks[j], uxEvent);
				}
			}
		},
	
		/**
		 * Validate the properties of the component
		 * @returns {boolean} True if the properties are valid, false otherwise
		 */
		_validateProperties: function()
		{
			if (!wink.isSet(this.domNode) || this.domNode == '')
			{
				wink.log('[touch.Element] domNode must be specified');
				return false;
			}
		}
	};

	return wink.ux.touch;
});