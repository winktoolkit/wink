/*--------------------------------------------------------
 * Copyright (c) 2011, The Dojo Foundation
 * This software is distributed under the "Simplified BSD license",
 * the text of which is available at http://www.winktoolkit.org/licence.txt
 * or see the "license.txt" file for more details.
 *--------------------------------------------------------*/

/**
 * @fileOverview Implements a Scroller with inertia capability.
 * The Scroller allows to scroll vertically or horizontally a content ; it prevents the native scroll.
 * 
 * @compatibility Iphone OS2 (slow), Iphone OS3, Iphone OS4, Android 1.5, Android 2.1, Android 2.2, Android 2.3, Android 3.0, Android 3.1, BlackBerry 6, BlackBerry 7, Bada 1.0
 * 
 * @author Sylvain LALANDE
 */
define(['../../../../_amd/core', '../../../../ux/inertia/js/inertia'], function(wink)
{
	/**
	 * @class Implements a Scroller with inertia capability.
	 * 
	 * The Scroller allows to scroll vertically or horizontally a content ; it prevents the native scroll.<br>
	 * It is associated with an element of the Web page as a target.<br>
	 * Its operation relies on the Inertia component which provides the information necessary for the production of a movement
	 * taking into account the speed of user movement.<br><br>
	 * The user should be warned about the fact that the size of the viewable area (Viewport) and the size of the scrollable area may be carefully parameterized (see "updateTargetSize" and "updateViewportSize" methods).
	 * Indeed, the size of these areas is useful for determining the edges of the component and whether scrolling is possible.<br>
	 * For this, it is possible to use the public method "autorefresh" to let the component handle changes of the content, which impacts the size of the scrollable area.
	 * Moreover, in order to manage the viewport size changes, this module can be eventually associated with the Window component.<br>
	 * Secondly, it is possible to configure the display of scrollbars, and especially it is possible to specify callbacks during the various stages of scrolling.
	 * <br>
	 * 
	 * @param {object} properties The properties object
	 * @param {string} properties.target
	 * @param {string} properties.direction The direction of the scrollable area - possible values are "x", "y", or "xy"
	 * @param {integer} [properties.friction=14] Value that determines the friction forces and influences the deceleration of the movement (value between 1 and 100)
	 * @param {boolean} [properties.captureFlow=true] indicates whether the capture event flow is used
	 * @param {object} [properties.callbacks] This identifies the callback functions invoked at different stages of the scroll. Callbacks names are : scrollerTouched, startScrolling, scrolling, endScrolling, startSliding, stopSliding 
	 * @param {object} [properties.scrollbars] The scrollbar options
	 * @param {boolean} [properties.scrollbars.active=true] Indicates whether the scrollbars are activated (false is recommended when the performance of the device are low)
	 * @param {integer} [properties.scrollbars.width=5] Width of the scrollbar
	 * @param {string} [properties.scrollbars.backgroundColor="rgba(0, 0, 0, 0.55)"] The background color of the scrollbar
	 * @param {string} [properties.scrollbars.borderColor="rgba(0, 0, 0, 0.2)"] The border color of the scrollbar
	 * @param {boolean} [properties.scrollbars.opacityTransition=true] Indicates whether an opacity transition must be set
	 * @param {integer} [properties.shiftOriginY] Apply a shift on y direction since the origin of the scrollable area (top)
	 * @param {integer} [properties.shiftLimitY] Apply a shift on y direction at the limit of the scrollable area (bottom)
	 * 
	 * @requires wink.ux.MovementTracker
	 * @requires wink.ux.Inertia
	 * 
	 * @example
	 * 
	 * var properties = {
	 *   target: "targetElementId",
	 *   direction: "y"
	 * };
	 * 
	 * scroller = new wink.ui.layout.Scroller(properties);
	 * 
	 * @see <a href="WINK_ROOT_URL/ui/layout/scroller/test/test_scroller_1.html" target="_blank">Test page</a>
	 * @see <a href="WINK_ROOT_URL/ui/layout/scroller/test/test_scroller_2.html" target="_blank">Test page (horizontal)</a>
	 * @see <a href="WINK_ROOT_URL/ui/layout/scroller/test/test_scroller_3.html" target="_blank">Test page (both directions)</a>
	 * @see <a href="WINK_ROOT_URL/ui/layout/scroller/test/test_scroller_4.html" target="_blank">Test page (classical layout)</a>
	 * @see <a href="WINK_ROOT_URL/ui/layout/scroller/test/test_scroller_5.html" target="_blank">Test page (nested)</a>
	 * @see <a href="WINK_ROOT_URL/ui/layout/scroller/test/test_scroller_6.html" target="_blank">Test page (tablet layout)</a>
	 * 
	 */
	wink.ui.layout.Scroller = function(properties) {
		/**
		 * Unique identifier
		 * 
		 * @property uId
		 * @type integer
		 */
		this.uId				= wink.getUId();
		
		this._target			= null;
		this._direction			= null;
		this._captureFlow 		= true;
		this._view 				= {
			x: 0,
			y: 0,
			viewportSizeX: 0,
			viewportSizeY: 0,
			sizeX: 0,
			sizeY: 0,
			limitX: 0,
			limitY: 0,
			shiftOriginY: 0,
			shiftLimitY: 0,
			scrollbars: {
				x: null,
				y: null,
				active: true,
				width: null,
				backgroundColor: null,
				borderColor: null,
				opacityTransition: null
			},
			autoRefreshOptions: {
				active: false,
				checkDelay: 1000,
				handler: null
			},
			timerSize: null
		};
		this._scroll 			= {
			canScrollX: false,
			canScrollY: false,
			mustScrollX: false,
			mustScrollY: false,
			friction: 14,
			acceleration: -0.00126,
			minSpeed: 0.05
		};
		this._transition 		= {
			duration: 0,
			delay: 0,
			func: "cubic-bezier(0.1, 0.2, 0.5, 1)",
			endHandler: null
		};
		this._callbacks			= {
			scrollerTouched: null,
			scrollerClicked: null,
			startScrolling: null,
			scrolling: null,
			endScrolling: null,
			startSliding: null,
			stopSliding: null
		};
		
		this._movementtracker 	= null;
		this._inertia			= null;
		
		this._activated 		= true;
		this._moveOutside		= false;
		this._animated			= false;
		this._selectionEvent	= null;
		
		this._updateContext(properties);
	};
	
	wink.ui.layout.Scroller.prototype = {
		_DIRECTION_X: "x",
		_DIRECTION_Y: "y",
		_DIRECTION_XY: "xy",
			
		/**
		 * Updates target sizes; To Call when target size change. Without parameters, it takes the offsets of the target DOM Node
		 * 
		 * @param {integer} [sizeX=target.offsetWidth] Target size on x
		 * @param {integer} [sizeY=target.offsetHeight] Target size on y
		 * @param {boolean} [recheck=false] Indicates whether there should be an audit delayed to ensure that the size of the content has not changed (useful in cases where the content is not completely loaded)
		 */
		updateTargetSize: function(sizeX, sizeY, recheck)
		{
			if (this._view.timerSize != null) {
				return;
			}
			if (recheck === true && this._view.timerSize == null) {
				this._refreshTargetSize(sizeX, sizeY, false);
				this._view.timerSize = wink.setTimeout(this, '_refreshTargetSize', this._view.autoRefreshOptions.checkDelay, sizeX, sizeY, recheck);
				return;
			}
			this._refreshTargetSize(sizeX, sizeY, recheck);
		},
		/**
		 * Updates viewport sizes ; To call when the viewport change. Without parameters, it takes the client sizes of the target parent
		 * 
		 * @param {integer} [viewportSizeX=target.parentNode.clientWidth] Size of the viewport on x
		 * @param {integer} [viewportSizeY=target.parentNode.clientHeight] Size of the viewport on y
		 */
		updateViewportSize: function(viewportSizeX, viewportSizeY)
		{
			var vsx = this._target.parentNode.clientWidth;
			var vsy = this._target.parentNode.clientHeight;
			if (wink.isSet(viewportSizeX)) {
				vsx = viewportSizeX;
			}
			if (wink.isSet(viewportSizeY)) {
				vsy = viewportSizeY;
			}
			
			if (this._view.viewportSizeX != vsx || this._view.viewportSizeY != vsy) {
				this._setViewportSize(vsx, vsy);
				this._refreshView();
			}
		},
		/**
		 * Updates the shift at bounds of the scrollable area
		 * 
		 * @param {integer} originY The new shift origin
		 * @param {integer} limitY The new shift limit
		 */
		updateShiftBounds: function(originY, limitY)
		{
			var hasChanged = false;
			if (originY != this._view.shiftOriginY) {
				this._view.shiftOriginY = originY;
				if (this._view.y == 0) {
					this._view.y = originY;
				}
				hasChanged = true;
			}
			if (limitY != this._view.shiftLimitY) {
				this._view.shiftLimitY = limitY;
				hasChanged = true;
			}
			if (hasChanged) {
				this._refreshView();
				this._backToBounds();
			}
		},
		/**
		 * Allows to let the component handle changes of the content, which impacts the size of the scrollable area
		 * 
		 * @param {object} options Options
		 * @param {boolean} [options.active=false] True to activate the auto-management, false otherwise
		 * @param {integer} [options.checkDelay=1000] The number of milliseconds before rechecking the size of the content, 0 to indicate that no further verification is necessary
		 */
		autoRefresh: function(options)
		{
			if (wink.isSet(options.checkDelay) && options.checkDelay >= 0) {
				this._view.autoRefreshOptions.checkDelay = options.checkDelay;
			}
			if (wink.isSet(options.active) && this._view.autoRefreshOptions.active !== options.active) {
				this._view.autoRefreshOptions.active = options.active;
				this._listenToContentChanges(options.active);
			}
		},
		/**
		 * Scroll explicitly to the given position
		 * 
		 * @param {number} x x targeted coordinates
		 * @param {number} y y targeted coordinates
		 * @param {integer} [duration=0] The duration of the scroll
		 */
		scrollTo: function(x, y, duration)
		{
			this._slideTo(x, y, { duration : duration });
		},
		/**
		 * Force explicitly the scroller to go back to bounds if necessary
		 */
		backToBounds: function()
		{
			this._backToBounds();
		},
		/**
		 * Returns the scroll position
		 * 
		 * @returns {object} the scroll position as { x, y }
		 */
		getPosition: function()
		{
			return { x: this._view.x, y: this._view.y };
		},
		/**
		 * Returns the view properties
		 * 
		 * @returns {object} the view properties
		 */
		getViewProperties: function()
		{
			return this._view;
		},
		/**
		 * Allows to enable scrolling (enabled by default)
		 */
		enable: function()
		{
			this._activated = true;
		},
		/**
		 * Allows to disable scrolling. 
		 * This can be useful if another component must take control, 
		 * or if you want to reactivate the default behavior when the touch occurs on certain elements (after the scrollerTouched callback).
		 */
		disable: function()
		{
			this._activated = false;
		},
		/**
		 * Destroys the component
		 */
		destroy: function()
		{
			this._removeListeners();
				
			this._movementtracker.destroy();
			delete this._movementtracker;
				
			this._inertia.destroy();
			delete this._inertia;
			
			this._removeScrollbars(true, true);
			
			for (var cn in this._callbacks)
			{
				this._callbacks[cn] = null;
			}
			
			if (this._view.timerSize != null) {
				clearTimeout(this._view.timerSize);
				this._view.timerSize = null;
			}
			
			wink.fx.apply(this._target, {
				"user-select": ""
			});
			wink.fx.applyTransition(this._target, "", "", "", "");
			wink.fx.setTransform(this._target, "");
			this._target = null;
		},
		/**
		 * Changes the context of the component ; a single Scroller can thus be used for multiple content (eg in order to optimize performance)
		 * 
		 * @param {object} properties The same object as to initialize the component
		 */
		changeContext: function(properties)
		{
			this.destroy();
			this._updateContext(properties);
		},
		/**
		 * Updates target sizes
		 * 
		 * @param {integer} sizeX target size on x
		 * @param {integer} sizeY target size on y
		 */
		_setTargetSize: function(sizeX, sizeY)
		{
			this._view.sizeX = sizeX;
			this._view.sizeY = sizeY;
		},
		/**
		 * Updates viewport sizes
		 * 
		 * @param {integer} viewportSizeX Size of the viewport on x
		 * @param {integer} viewportSizeY Size of the viewport on y
		 */
		_setViewportSize: function(viewportSizeX, viewportSizeY)
		{
			this._view.viewportSizeX = viewportSizeX;
			this._view.viewportSizeY = viewportSizeY;
		},
		/**
		 * Updates the context of the component
		 * 
		 * @param {object} properties Properties of the component initialization
		 */
		_updateContext: function(properties)
		{
			this._properties = properties;
			
			if (this._validateProperties() === false) return;
			
			this._initProperties();	
			this._initListeners();
	
			this._slideTo(0, 0);
			this._refreshView();
		},
		/**
		 * Validate the properties of the component
		 * @returns {boolean} True if the properties are valid, false otherwise
		 */
		_validateProperties: function() 
		{
			if (wink.isUndefined(this._properties.target) || wink.isNull($(this._properties.target)))
			{
				this._raisePropertyError('target');
				return false;
			}
			if (wink.isUndefined(this._properties.direction) || (
				(this._properties.direction != this._DIRECTION_X)
				&& (this._properties.direction != this._DIRECTION_Y)
				&& (this._properties.direction != this._DIRECTION_XY)
				)) 
			{
				this._raisePropertyError('direction');
				return false;
			}
			if (wink.isSet(this._properties.callbacks))
			{
				for (var c in this._callbacks)
				{
					var cs = this._properties.callbacks[c];
					if (wink.isSet(cs) && !wink.isCallback(cs))
					{
						this._raisePropertyError(('callbacks.' + c));
						return false;
					}
				}
			}
			return true;
		},
		/**
		 * Raise the property error
		 */
		_raisePropertyError: function(property)
		{
			wink.log('[Scroller] Error: ' + property + ' missing or invalid');
		},
		/**
		 * Initialize datas with given properties
		 */
		_initProperties: function() 
		{
			this._target = $(this._properties.target);
			wink.fx.apply(this._target, {
				"user-select": "none"
			});
			
			if (wink.isSet(this._properties.shiftOriginY)) {
				this._view.shiftOriginY = this._properties.shiftOriginY;
			}
			if (wink.isSet(this._properties.shiftLimitY)) {
				this._view.shiftLimitY = this._properties.shiftLimitY;
			}
			
			this._setTargetSize(this._target.offsetWidth, this._target.offsetHeight);
			this._setViewportSize(this._target.parentNode.clientWidth, this._target.parentNode.clientHeight);
			
			this._direction = this._properties.direction;
			if (this._direction == this._DIRECTION_X || this._direction == this._DIRECTION_XY) {
				this._scroll.mustScrollX = true;
			}
			if (this._direction == this._DIRECTION_Y || this._direction == this._DIRECTION_XY) {
				this._scroll.mustScrollY = true;
			}
			if (this._properties.captureFlow === false) {
				this._captureFlow = false;
			}
			if (wink.isSet(this._properties.callbacks)) {
				for (var c in this._callbacks)
				{
					var cs = this._properties.callbacks[c];
					if (wink.isSet(cs))
					{
						this._callbacks[c] = cs;
					}
				}
			}
			if (wink.isSet(this._properties.scrollbars)) {
				for (var c in this._view.scrollbars)
				{
					var cs = this._properties.scrollbars[c];
					if (wink.isSet(cs))
					{
						this._view.scrollbars[c] = cs;
					}
				}
			}
			
			var f = this._properties.friction;
			if (wink.isSet(f) && wink.isInteger(f)) {
				this._scroll.friction = Math.max(Math.min(f, 100), 1);
				this._scroll.acceleration = Math.min(-0.00009 * this._scroll.friction, -0.0001);
				this._scroll.minSpeed = Math.sqrt(Math.abs(this._scroll.acceleration * 2));
			}
			
			delete this._properties;
		},
		/**
		 * Initialize listeners
		 */
		_initListeners: function() 
		{
			this._movementtracker = new wink.ux.MovementTracker({
				target: this._target, 
				captureFlow: this._captureFlow,
				preventStart: false,
				preventMove: false,
				trackThresholdX: 5,
				trackThresholdY: 5
			});
			wink.subscribe('/movementtracker/events/notrack', { context: this, method: '_handleTouchNotTracked' });
			wink.subscribe('/movementtracker/events/mvtbegin', { context: this, method: '_handleMovementBegin' });
			wink.subscribe('/movementtracker/events/mvtchanged', { context: this, method: '_handleMovementChanged' });
			
			this._inertia = new wink.ux.Inertia({ movementtracker: this._movementtracker });
			wink.subscribe('/inertia/events/inertiaComputed', { context: this, method: '_handleMovementStored' });
			
			this._transition.endHandler = wink.fx.onTransitionEnd(this._target, wink.bind(this._handleTransitionEnd, this), true);
		},
		/**
		 * Removes listeners
		 */
		_removeListeners: function()
		{
			wink.unsubscribe('/movementtracker/events/notrack', { context: this, method: '_handleTouchNotTracked' });
			wink.unsubscribe('/movementtracker/events/mvtbegin', { context: this, method: '_handleMovementBegin' });
			wink.unsubscribe('/movementtracker/events/mvtchanged', { context: this, method: '_handleMovementChanged' });
			wink.unsubscribe('/inertia/events/inertiaComputed', { context: this, method: '_handleMovementStored' });
			this._target.removeEventListener(wink.has.prop("transitionend"), this._transition.endHandler, false);
			this._transition.endHandler = null;
			this._listenToContentChanges(false);
		},
		/**
		 * Updates listening status on changes of the content
		 * 
		 * @param {boolean} listen Indicates whether the component must listen or not
		 */
		_listenToContentChanges: function(listen)
		{
			var eventName = 'DOMSubtreeModified';
			if (listen) {
				var recheck = (this._view.autoRefreshOptions.checkDelay > 0);
				this._view.autoRefreshOptions.handler = wink.bind(function() {
					var sx = this._target.offsetWidth;
					var sy = this._target.offsetHeight;
					if (this._view.sizeX != sx || this._view.sizeY != sy) {
						this.updateTargetSize(null, null, recheck);
					}
				}, this);
				this._target.addEventListener(eventName, this._view.autoRefreshOptions.handler, false);
			} else {
				if (this._view.autoRefreshOptions.handler != null) {
					this._target.removeEventListener(eventName, this._view.autoRefreshOptions.handler, false);
					this._view.autoRefreshOptions.handler = null;
				}
			}
		},
		/**
		 * Updates the target sizes if they have changed and refreshes the view impacted
		 * 
		 * @param {integer} [sizeX=target.offsetWidth] Target size on x
		 * @param {integer} [sizeY=target.offsetHeight] Target size on y
		 * @param {boolean} [recheck=false] Indicates whether there should be an audit delayed to ensure that the size of the content has not changed (useful in cases where the content is not completely loaded)
		 */
		_refreshTargetSize: function(sizeX, sizeY, recheck)
		{
			if (this._view.timerSize != null) {
				clearTimeout(this._view.timerSize);
			}
			
			var sx = this._target.offsetWidth;
			var sy = this._target.offsetHeight;
			if (wink.isSet(sizeX)) {
				sx = sizeX;
			}
			if (wink.isSet(sizeY)) {
				sy = sizeY;
			}
			
			this._view.timerSize = null;
			if (this._view.sizeX != sx || this._view.sizeY != sy) {
				this._setTargetSize(sx, sy);
				this._refreshView();
				
				if (recheck === true) {
					this._view.timerSize = wink.setTimeout(this, '_refreshTargetSize', this._view.autoRefreshOptions.checkDelay, sizeX, sizeY, recheck);
				}
			}
		},
		/**
		 * Refresh the view properties
		 */
		_refreshView: function() 
		{
			var csx = this._scroll.canScrollX;
			var csy = this._scroll.canScrollY;
			
			if (this._view.sizeX > this._view.viewportSizeX) {
				this._view.limitX = this._view.viewportSizeX - this._view.sizeX;
				this._scroll.canScrollX = true;
			} else {
				this._view.limitX = 0;
				this._scroll.canScrollX = false;
			}
			
			var shiftSizeY = this._view.sizeY - (this._view.shiftOriginY + this._view.shiftLimitY);

			if (shiftSizeY > this._view.viewportSizeY) {
				this._view.limitY = this._view.viewportSizeY - shiftSizeY;
				this._scroll.canScrollY = true;
			} else {
				this._view.limitY = 0;
				this._scroll.canScrollY = false;
			}
			
			if (!this._scroll.canScrollX) {
				this._movementtracker.updateTrackThresholdX(999);
			} else {
				this._movementtracker.updateTrackThresholdX(5);
			}
			if (!this._scroll.canScrollY) {
				this._movementtracker.updateTrackThresholdY(999);
			} else {
				this._movementtracker.updateTrackThresholdY(5);
			}
			
			if (csx != this._scroll.canScrollX) {
				if (this._view.x != 0) {
					this._view.x = 0;
					this._slideTo(null, null, { backToBound: true, duration: 1 });
				}
				
			}
			if (csy != this._scroll.canScrollY) {
				if (this._view.y != 0) {
					this._view.y = 0;
					this._slideTo(null, null, { backToBound: true, duration: 1 });
				}
			}
	
			if (this._view.scrollbars.active == true) {
				if (this._scroll.canScrollX && this._scroll.mustScrollX) {
					var sx = this._view.scrollbars.x;
					if (sx == null) {
						sx = this._view.scrollbars.x = new wink.ui.layout.Scroller.Scrollbar({
							direction: 'x',
							width: this._view.scrollbars.width,
							backgroundColor: this._view.scrollbars.backgroundColor,
							borderColor: this._view.scrollbars.borderColor,
							opacityTransition: this._view.scrollbars.opacityTransition
						});
					}
					sx.updateSize(this._view.viewportSizeX, this._view.sizeX);
					this._target.parentNode.appendChild(sx.getDomNode());
				} else {
					this._removeScrollbars(true, false);
				}
				if (this._scroll.canScrollY && this._scroll.mustScrollY) {
					var sy = this._view.scrollbars.y;
					if (sy == null) {
						sy = this._view.scrollbars.y = new wink.ui.layout.Scroller.Scrollbar({
							direction: 'y',
							width: this._view.scrollbars.width,
							backgroundColor: this._view.scrollbars.backgroundColor,
							borderColor: this._view.scrollbars.borderColor,
							opacityTransition: this._view.scrollbars.opacityTransition
						});
					}
					sy.updateSize(this._view.viewportSizeY, shiftSizeY);
					this._target.parentNode.appendChild(sy.getDomNode());
				} else {
					this._removeScrollbars(false, true);
				}
				
				var ctx = {
					timeout: null,
					hide: function(parentCtx) {
						clearTimeout(this.timeout);
						parentCtx._hideScrollbars();
					}
				};
				ctx.timeout = wink.setTimeout(ctx, 'hide', 1000, this);
			}
		},
		/**
		 * Remove the scrollbars
		 * 
		 * @param {boolean} x Indicates whether the scrollbar on x-axis must be removed
		 * @param {boolean} y Indicates whether the scrollbar on y-axis must be removed
		 */
		_removeScrollbars: function(x, y)
		{
			if (x == true && this._view.scrollbars.x != null) {
				this._target.parentNode.removeChild(this._view.scrollbars.x.getDomNode());
				this._view.scrollbars.x = null;
			}
			if (y == true && this._view.scrollbars.y != null) {
				this._target.parentNode.removeChild(this._view.scrollbars.y.getDomNode());
				this._view.scrollbars.y = null;
			}
		},
		/**
		 * Handle the touch events of the movement are not currently tracked
		 * 
		 * @param {object} publishedInfos MovementTracker infos
		 * @see wink.ux.MovementTracker
		 */
		_handleTouchNotTracked: function(publishedInfos)
		{
			var publisher = publishedInfos.publisher;
			if (publisher.uId != this._movementtracker.uId) {
				return;
			}
			
			var uxEvent = publishedInfos.uxEvent;
			if (uxEvent.type == "start")
			{
				if (wink.isSet(this._callbacks.scrollerTouched))
				{
					wink.call(this._callbacks.scrollerTouched, { uxEvent: uxEvent });
				}
			}
			
			if (this._activated == false) {
				return;
			}
			
			uxEvent.preventDefault();
			uxEvent.stopPropagation();
			
			if (uxEvent.type == "start")
			{
				this._selectionEvent = null;
				if (this._animated == false)
				{
					this._selectionEvent = uxEvent;
				}
				
				var position = this._getInstantPosition();
				if (!this._isAtPosition(position.x, position.y)) {
					if (wink.isSet(this._callbacks.stopSliding))
					{
						wink.call(this._callbacks.stopSliding, { });
					}
					
					this._slideTo(position.x, position.y);
				}
			}
			else if (uxEvent.type == "end")
			{
				this._backToBounds();
				this._hideScrollbars();
				if (wink.isSet(this._selectionEvent))
				{
					var d = 0;
					if (!this._scroll.canScrollX && !this._scroll.canScrollY) {
						var p1 = this._selectionEvent,
							p2 = uxEvent,
							dx = p2.x - p1.x,
							dy = p2.y - p1.y;
						d = Math.sqrt((dx * dx) + (dy * dy));
					}

					if (d < 5) {
						if (wink.isSet(this._callbacks.scrollerClicked))
						{
							wink.call(this._callbacks.scrollerClicked, { uxEvent: uxEvent });
						}
						this._handleSelection(uxEvent);
					}
				}
			}
		},
		/**
		 * Handle the Scroll beginning.
		 * 
		 * @param {object} publishedInfos MovementTracker infos
		 * @see wink.ux.MovementTracker
		 */
		_handleMovementBegin: function(publishedInfos) 
		{
			var publisher = publishedInfos.publisher;
			if (publisher.uId != this._movementtracker.uId) {
				return;
			}
			if (this._activated == false) {
				return;
			}
			var uxEvent = publishedInfos.uxEvent;
			
			uxEvent.preventDefault();
			uxEvent.stopPropagation();
			
			if (wink.isSet(this._callbacks.startScrolling))
			{
				wink.call(this._callbacks.startScrolling, { uxEvent: uxEvent });
			}
			if (wink.isSet(this._view.autoRefreshOptions.handler)) {
				this._view.autoRefreshOptions.handler();
			}
		},
		/**
		 * Propagate a scroller touch to others listeners if no drag occurs.
		 * 
		 * @param {wink.ux.Event} uxEvent The event to propagate
		 */
		_handleSelection: function(uxEvent)
		{
			var properTarget = this._getProperEventTarget(uxEvent),
				tn = properTarget.tagName,
				type = properTarget.type,
				tnlower, isInputText, isText;

			if (wink.isSet(tn)) {
				tnlower = tn.toLowerCase();
				isInputText = (tnlower == 'input' && type) ? (type.toLowerCase() == 'text') : false;
				isText = isInputText || (tnlower == 'textarea');
			}
			if (isText || (tnlower == 'select')) {
				properTarget.focus();
			}
			
			if (wink.has("touch")) {
				uxEvent.dispatch(properTarget, "click");
			}
		},
		/**
		 * @param {wink.ux.Event} uxEvent The event
		 * @returns {HTMLElement} the proper target of the given event
		 */
		_getProperEventTarget: function(uxEvent)
		{
			var properTarget = uxEvent.target;
			if (uxEvent.target.nodeType == 3) {
				properTarget = properTarget.parentNode;
			}
			return properTarget;
		},
		/**
		 * Handle the Scroll updates.
		 * 
		 * @param {object} publishedInfos MovementTracker infos
		 * @see wink.ux.MovementTracker
		 */
		_handleMovementChanged: function(publishedInfos) 
		{
			var publisher = publishedInfos.publisher;
			if (publisher.uId != this._movementtracker.uId) {
				return;
			}
			if (this._activated == false) {
				return;
			}
			
			publishedInfos.uxEvent.stopPropagation();
			
			var movement = publishedInfos.movement;
			
			var beforeLastPoint = movement.pointStatement[movement.pointStatement.length - 2];
			var lastPoint = movement.pointStatement[movement.pointStatement.length - 1];
			
			var dx = lastPoint.x - beforeLastPoint.x;
			var dy = lastPoint.y - beforeLastPoint.y;
			var boundFriction = 3;
	
			var ny = this._view.y;
			if (ny > 0) {
				ny -= this._view.shiftOriginY;
			} else if (ny < this._view.limitY) {
				ny += this._view.shiftLimitY;
			}
			
			this._moveOutside = false;
			var boundsInfos = this._getBoundsInfos(this._view.x, ny);
			if (boundsInfos.outsideOfBoundsX) {
				if ( (boundsInfos.directionX > 0 && lastPoint.directionX > 0)
					|| (boundsInfos.directionX < 0 && lastPoint.directionX < 0) ) {
					dx /= boundFriction;
					this._moveOutside = true;
				}
			}
			if (boundsInfos.outsideOfBoundsY) {
				if ( (boundsInfos.directionY > 0 && lastPoint.directionY > 0)
					|| (boundsInfos.directionY < 0 && lastPoint.directionY < 0) ) {
					dy /= boundFriction;
					this._moveOutside = true;
				}
			}
			
			var destX = this._view.x + wink.math.round(dx, 0);
			var destY = this._view.y + wink.math.round(dy, 0);
			this._slideTo(destX, destY);
			
			if (wink.isSet(this._callbacks.scrolling))
			{
				wink.call(this._callbacks.scrolling, { uxEvent: publishedInfos.uxEvent });
			}
		},
		/**
		 * Handle the Scroll end.
		 * 
		 * @param {object} publishedInfos Inertia infos
		 * @see wink.ux.Inertia
		 */
		_handleMovementStored: function(publishedInfos)
		{
			var publisher = publishedInfos.publisher;
			if (publisher.uId != this._inertia.uId) {
				return;
			}
			if (this._activated == false) {
				return;
			}
			if (wink.isSet(this._callbacks.endScrolling))
			{
				wink.call(this._callbacks.endScrolling, { uxEvent: publishedInfos.uxEvent });
			}
			
			var movement = publishedInfos.movement;
			this._interpretInertia(movement);
			
			if (!this._moveOutside && !this._isAtPosition(movement.destX, movement.destY)) {
				this._slideTo(movement.destX, movement.destY, { duration: movement.duration, speed: movement.speed });
			} else {
				this._backToBounds();
				this._hideScrollbars();
			}
		},
		/**
		 * Interpret inertia datas to propel the target in the right place.
		 * 
		 * @param {object} movement The movement that carry inertia datas
		 */
		_interpretInertia: function(movement)
		{
			var onX = this._scroll.canScrollX && this._scroll.mustScrollX;
			var onY = this._scroll.canScrollY && this._scroll.mustScrollY;
			var minDuration = 1;
			var maxDistToBoundX = wink.math.round(this._view.viewportSizeX / 3, 1);
			var maxDistToBoundY = wink.math.round(this._view.viewportSizeY / 3, 1);
			var acc = this._scroll.acceleration;
			var minSpeed = this._scroll.minSpeed;
			
			var sx = movement.speedX, sy = movement.speedY;
			
			sx = sx < minSpeed ? 0 : sx;
			sy = sy < minSpeed ? 0 : sy;
			
			var dx = (-(sx * sx) / (2 * acc)); // (-v0 * v0) / 2a
			var dy = (-(sy * sy) / (2 * acc)); // (-v0 * v0) / 2a
			
			var dtx = -sx / acc; // -v0 / a
			var dty = -sy / acc; // -v0 / a
			
			if (!onX) {
				dx = dtx = 0;
			}
			
			if (!onY) {
				dy = dty = 0;
			}
			
			var destX = this._view.x + (dx * movement.directionX);
			var destY = this._view.y + (dy * movement.directionY);
			
			var boundsInfos = this._getBoundsInfos(destX, destY);
			if (boundsInfos.outsideOfBoundsX && boundsInfos.distanceToBoundX > maxDistToBoundX) {
				var distToMax = boundsInfos.distanceToBoundX - maxDistToBoundX;
				var ratio = distToMax / dx;
				dx -= distToMax;
				dtx -= (ratio * dtx);
			}
			if (boundsInfos.outsideOfBoundsY && boundsInfos.distanceToBoundY > maxDistToBoundY) {
				var distToMax = boundsInfos.distanceToBoundY - maxDistToBoundY;
				var ratio = distToMax / dy;
				dy -= distToMax;
				dty -= (ratio * dty);
			}
			
			movement.destX = this._view.x + wink.math.round(dx * movement.directionX, 0);
			movement.destY = this._view.y + wink.math.round(dy * movement.directionY, 0);
			dtx = Math.max(wink.math.round(dtx, 0), minDuration);
			dty = Math.max(wink.math.round(dty, 0), minDuration);
			
			movement.duration = dty;
			movement.speed = wink.math.round(sy, 3);
			if ((onX && !onY) || (onX && onY && dtx > dty)) {
				movement.duration = dtx;
				movement.speed = wink.math.round(sx, 3);
			}
		},
		/**
		 * At the end of a movement, go back to bounds if necessary.
		 */
		_handleTransitionEnd: function() 
		{
			if (this._animated == true)
			{
				this._animated = false;
				if (wink.isSet(this._callbacks.stopSliding)) {
					wink.call(this._callbacks.stopSliding, { });
				}
				var dl = 0;
				if (this._backToBounds()) {
					dl = 350;
				}
				this._hideScrollbars(dl);
			}
		},
		/**
		 * Go back to bound if necessary.
		 */
		_backToBounds: function()
		{
			var boundsInfos = this._getBoundsInfos(this._view.x, this._view.y);
			if (boundsInfos.outsideOfBounds) {
				var targetX = this._view.x;
				var targetY = this._view.y;
				
				if (boundsInfos.outsideOfBoundsX) {
					targetX = boundsInfos.positionOfBoundX;
				}
				if (boundsInfos.outsideOfBoundsY) {
					targetY = boundsInfos.positionOfBoundY;
				}
				this._slideTo(targetX, targetY, { backToBound: true });
				return true;
			}
			return false;
		},
		/**
		 * Get bounds informations that allows caller to determine if the target is out of bounds,
		 * the direction associated, the distance to the bound and the position to reach.
		 * 
		 * @param {integer} nextX The next position on x
		 * @param {integer} nextY The next position on y
		 */
		_getBoundsInfos: function(nextX, nextY)
		{
			var boundsInfos = {
				outsideOfBoundsX: false,
				outsideOfBoundsY: false,
				distanceToBoundX: 0,
				distanceToBoundY: 0
			};
			
			if (nextX > 0 || nextX < this._view.limitX) {
				boundsInfos.outsideOfBoundsX = true;
				if (nextX > 0) {
					boundsInfos.distanceToBoundX = Math.abs(nextX);
					boundsInfos.directionX = 1;
					boundsInfos.positionOfBoundX = 0;
				} else {
					boundsInfos.distanceToBoundX = Math.abs(nextX - this._view.limitX);
					boundsInfos.directionX = -1;
					boundsInfos.positionOfBoundX = this._view.limitX;
				}
			}
			if (nextY > 0 || nextY < this._view.limitY) {
				boundsInfos.outsideOfBoundsY = true;
				if (nextY > 0) {
					boundsInfos.distanceToBoundY = Math.abs(nextY);
					boundsInfos.directionY = 1;
					boundsInfos.positionOfBoundY = 0;
				} else {
					boundsInfos.distanceToBoundY = Math.abs(nextY - this._view.limitY);
					boundsInfos.directionY = -1;
					boundsInfos.positionOfBoundY = this._view.limitY;
				}
			}
			boundsInfos.outsideOfBounds = boundsInfos.outsideOfBoundsX || boundsInfos.outsideOfBoundsY;
			
			return boundsInfos;
		},
		/**
		 * Determines if the target has currently the given position.
		 * 
		 * @param {integer} x x coordinates
		 * @param {integer} y y coordinates
		 */
		_isAtPosition: function(x, y)
		{
			if (this._view.x == x && this._view.y == y) {
				return true;
			}
			return false;
		},
		/**
		 * Slide nicely to the given position.
		 * 
		 * @param {integer} x x targeted coordinates
		 * @param {integer} y y targeted coordinates
		 * @param {object} [options] Options
		 * @param {integer} [options.duration=0] the duration of the slide
		 * @param {integer} [options.speed=0] the speed of the slide
		 * @param {boolean} [options.backToBound=false] Indicates whether the sliding takes back to the bound
		 */
		_slideTo: function(x, y, options) 
		{
			var dt = (options && options.duration) ? options.duration : 0;
			var s = (options && options.speed) ? options.speed : 0;
			var btb = (options && options.backToBound) ? options.backToBound : false;
			
			this._transition.duration = dt;
			if (dt >= 1) {
				this._animated = true;
				if (wink.isSet(this._callbacks.startSliding))
				{
					wink.call(this._callbacks.startSliding, { duration: dt, speed: s });
				}
			} else {
				this._animated = false;
			}
			
			var d = dt + "ms";
			var dl = this._transition.delay + "ms";
			var tr = this._transition.func;
			if (btb) {
				d = "350ms";
				tr = "cubic-bezier(0.3, 0.1, 1.0, 0.5)";
			}
			
			wink.fx.applyTransformTransition(this._target, d, dl, tr);
			
			if (this._view.scrollbars.active == true) {
				if (this._view.scrollbars.x != null) {
					this._view.scrollbars.x.applyTransition(d, dl, tr);
				}
				if (this._view.scrollbars.y != null) {
					this._view.scrollbars.y.applyTransition(d, dl, tr);
				}
			}
			this._translateTo(x, y);
		},
		/**
		 * Get the instant position of the target. May be different from current position
		 * because of transitions.
		 * 
		 * @returns {object} the current position
		 */
		_getInstantPosition: function() 
		{
			var position = wink.fx.getTransformPosition(this._target);
			position.y = position.y + this._view.shiftOriginY;
			return position;
		},
		/**
		 * Apply translation to the target.
		 * 
		 * @param {integer} x x targeted coordinates
		 * @param {integer} y y targeted coordinates
		 */
		_translateTo: function(x, y)
		{
			var targetX = this._view.x;
			var targetY = this._view.y;
	
			if (wink.isSet(x) && this._scroll.canScrollX && this._scroll.mustScrollX) {
				targetX = x;
			}
			if (wink.isSet(y) && this._scroll.canScrollY && this._scroll.mustScrollY) {
				targetY = y;
			}
			
			this._view.x = parseInt(targetX);
			this._view.y = parseInt(targetY);
			this._target.translate(this._view.x, this._view.y - this._view.shiftOriginY);

			if (this._view.scrollbars.active == true) {
				if (this._view.scrollbars.x != null) {
					this._view.scrollbars.x.updatePosition(this._view.x, this._view.y);
				}
				if (this._view.scrollbars.y != null) {
					this._view.scrollbars.y.updatePosition(this._view.x, this._view.y);
				}
			}
		},
		/**
		 * Hides scrollbars.
		 * 
		 * @param {integer} [delay=300] The delay before hiding (only when opacity transition is active)
		 */
		_hideScrollbars: function(delay)
		{
			if (this._view.scrollbars.active == true) {
				if (this._view.scrollbars.x != null) {
					this._view.scrollbars.x.hide(delay);
				}
				if (this._view.scrollbars.y != null) {
					this._view.scrollbars.y.hide(delay);
				}
			}
		}
	};
	
	/**
	 * @class Implements a Scrollbar for the Scroller.
	 * 
	 * @param {object} properties The properties object
	 * @param {direction} properties.direction The direction : possible values are "x" or "y"
	 * @param {integer} [properties.width=5] width of the scrollbar
	 * @param {string} [properties.backgroundColor="rgba(0, 0, 0, 0.55)"] The background color of the scrollbar
	 * @param {string} [properties.borderColor="rgba(0, 0, 0, 0.2)"] The border color of the scrollbar
	 * @param {boolean} [properties.opacityTransition=true] A boolean that indicates whether an opcaity transition must be set
	 */
	wink.ui.layout.Scroller.Scrollbar = function(properties) {
		/**
		 * Unique identifier
		 * 
		 * @property uId
		 * @type integer
		 */
		this.uId				= wink.getUId();
		this._properties		= properties;
		
		this._direction			= null;
		this._backgroundColor	= "rgba(0, 0, 0, 0.55)";
		this._borderColor		= "rgba(0, 0, 0, 0.2)";
		this._opacityTransition	= true;
		this._view				= {
			x: 0,
			y: 0,
			viewportSize: 0,
			contentSize: 0,
			size: 0,
			width: 0,
			ratioSize: 0,
			ratioPosition: 0,
			ratioBounce: 0,
			borderSize: 1,
			availableSpace: 0,
			showed: true
		};
		this._transition		= {
			duration: '',
			delay: '',
			func: ''
		};
		
		this._domNode			= null;
		this._canvasNode		= null;
		this._ctx				= null;
		this._firstHide			= true;
		
		if (this._validateProperties() === false) return;
		
		this._initProperties();
		this._initDom();
	};
	
	wink.ui.layout.Scroller.Scrollbar.prototype = {
		_DEFAULT_WIDTH: 5,
			
		/**
		 * @returns {HTMLElement} The DOM node of the component
		 */
		getDomNode: function()
		{
			return this._domNode;
		},
		/**
		 * Updates the size of the scrollbar
		 * 
		 * @param {integer} viewportSize The viewport size
		 * @param {integer} contentSize The content size
		 */
		updateSize: function(viewportSize, contentSize)
		{
			var sizeX = 0, sizeY = 0;
			
			this._view.viewportSize = viewportSize - (this._view.borderSize * 2);
			this._view.contentSize = contentSize;
			
			if (viewportSize < contentSize) {
				this._view.ratioSize = (this._view.viewportSize / this._view.contentSize);
				var sizeAdapter = 0.11 * (this._view.contentSize / this._view.viewportSize) + 0.89; // linear function
				this._view.ratioSize *= sizeAdapter;
			} else {
				this._view.ratioSize = 1;
			}
			sizeX = sizeY = this._view.ratioSize * this._view.viewportSize;
			
			if (this._direction == 'y') {
				sizeX = this._view.width;
			} else {
				sizeY = this._view.width;
			}
			this._resize(sizeX, sizeY);
			
			// ratio position = (available space for scrollbar) / (size of the hidden area)
			this._view.availableSpace = (this._view.viewportSize - this._view.size);
			this._view.ratioPosition = this._view.availableSpace / (this._view.contentSize - this._view.viewportSize);
			this._view.ratioBounce = 0.00100 * this._view.contentSize + 3; // linear function
		},
		/**
		 * Updates the position of the scrollbar
		 * 
		 * @param {number} viewX The position of the viewport on x-axis
		 * @param {number} viewY The position of the viewport on y-axis
		 */
		updatePosition: function(viewX, viewY)
		{
			if (this._view.showed == false) {
				this.show();
			}
			
			var x = 0, y = 0;
			
			var avs = this._view.availableSpace;
			
			if (this._direction == 'y') {
				y = -viewY * this._view.ratioPosition;
				
				if (y < 0 || y > avs) {
					if (y < 0) {
						y = Math.max(y + (y * this._view.ratioBounce), -this._view.size + 5);
					} else {
						y = Math.min(y + ((y - avs) * this._view.ratioBounce), this._view.viewportSize - 5);
					}
				}
			} else {
				x = -viewX * this._view.ratioPosition;
				
				if (x < 0 || x > avs) {
					if (x < 0) {
						x = Math.max(x + (x * this._view.ratioBounce), -this._view.size + 5);
					} else {
						x = Math.min(x + ((x - avs) * this._view.ratioBounce), this._view.viewportSize - 5);
					}
				}
			}
			this._translateTo(x, y);
		},
		/**
		 * Shows the scrollbar
		 */
		show: function()
		{
			if (this._view.showed == true) {
				return;
			}
			this._view.showed = true;
			wink.fx.applyTransition(this._canvasNode, 'opacity', '0ms', '0ms', 'default');
			this._canvasNode.style.opacity = 1;
		},
		/**
		 * Hides the scrollbar
		 * 
		 * @param {integer} [delay=300] The delay before hiding (only when opacity transition is active)
		 */
		hide: function(delay)
		{
			if (this._view.showed == false) {
				return;
			}
			this._view.showed = false;
			if (this._opacityTransition == true) {
				var dl = 300; 
				if (wink.isSet(delay)) {
					dl += delay;
				}
				if (this._firstHide) {
					this._firstHide = false;
					dl += 600;
				}
				dl = dl + 'ms';
				wink.fx.applyTransition(this._canvasNode, 'opacity', '200ms', dl, 'default');
			}
			this._canvasNode.style.opacity = 0;
		},
		/**
		 * Applies a transition on the scrollbar
		 * 
		 * @param {string} duration The duration of the transition
		 * @param {string} delay The delay of the transition
		 * @param {string} func The function of the transition
		 */
		applyTransition: function(duration, delay, func)
		{
			var diff = false;
			diff = diff || duration != this._transition.duration;
			diff = diff || delay != this._transition.delay;
			diff = diff || func != this._transition.func;
			
			if (!diff) {
				return;
			}
			this._transition.duration = duration;		
			this._transition.delay = delay;
			this._transition.func = func;
			
			wink.fx.applyTransformTransition(this._domNode, duration, delay, func);
		},
		/**
		 * Validate the properties of the component
		 * @returns {boolean} True if the properties are valid, false otherwise
		 */
		_validateProperties: function() 
		{
			if (!wink.isSet(this._properties.direction) || (this._properties.direction != 'x' && this._properties.direction != 'y')) {
				this._raisePropertyError('direction');
				return false;
			}
			return true;
		},
		/**
		 * Raise the property error
		 */
		_raisePropertyError: function(property)
		{
			wink.log('[Scrollbar] Error: ' + property + ' missing or invalid');
		},
		/**
		 * Initialize datas with given properties
		 */
		_initProperties: function() 
		{
			this._direction = this._properties.direction;
			
			this._view.width = this._DEFAULT_WIDTH;
			if (wink.isSet(this._properties.width)) {
				this._view.width = this._properties.width;
			}
			if (wink.isSet(this._properties.borderColor)) {
				this._borderColor = this._properties.borderColor;
			}
			if (wink.isSet(this._properties.backgroundColor)) {
				this._backgroundColor = this._properties.backgroundColor;
			}
			if (wink.isSet(this._properties.opacityTransition)) {
				this._opacityTransition = this._properties.opacityTransition;
			}
		},
		/**
		 * Initialize the DOM nodes
		 */
		_initDom: function()
		{
			var dn = this._domNode = document.createElement('div');
			var cn = this._canvasNode = document.createElement('canvas');
			this._ctx = cn.getContext('2d');
			dn.appendChild(cn);
			
			var st = {
				position: "absolute",
				"pointer-events": "none",
				opacity: 1
			};
			
			if (this._direction == 'y') {
				st.top = "0px";
				st.right = "1px";
			} else {
				st.bottom = "2px";
				st.left = "0px";
			}
			
			wink.fx.apply(dn, st);
			wink.fx.apply(cn, {
				position: "absolute"
			});
			cn.translate(0, 0);
		},
		/**
		 * Draws the scrollbar
		 */
		_drawbar: function()
		{
			var v = (this._direction == 'y');
			var c = this._ctx;
			var x = v ? this._view.width / 2 : this._view.width / 2 + 1; 
			var y = v ? this._view.width / 2 + 1 : this._view.width / 2;
			var w = v ? this._view.width : this._view.size - 1;
			var h = v ? this._view.size - 1 : this._view.width;
			var half = v ? w / 2 : h / 2;
			
			c.fillStyle = this._backgroundColor;
			c.strokeStyle = this._borderColor;
			c.lineWidth = this._view.borderSize;
			
			c.beginPath();
			if (v) {
				c.arc(x, y, half, Math.PI, 0, false);
				c.lineTo(x + half, h - half);
				c.arc(x, h - half, half, 0, Math.PI, false);
				c.lineTo(x - half, y);
			} else {
				c.arc(x, y, half, Math.PI / 2, 3 * Math.PI / 2, false);
				c.lineTo(w - half, y - half);
				c.arc(w - half, y, half, 3 * Math.PI / 2, Math.PI / 2, false);
				c.lineTo(x, y + half);
			}
			c.closePath();
			c.fill();
			c.stroke();
		},
		/**
		 * Resizes the scrollbar
		 * 
		 * @param {integer} sizeX Size on x-axis
		 * @param {integer} sizeY Size on y-axis
		 */
		_resize: function(sizeX, sizeY)
		{
			if (this._direction == 'y') {
				this._view.size = sizeY;
			} else {
				this._view.size = sizeX;
			}
			
			var cn = this._canvasNode;
			this._ctx.clearRect(0, 0, cn.width, cn.height);
			
			wink.fx.apply(this._domNode, {
				width: (sizeX + 1) + "px",
				height: sizeY + "px"
			});
			cn.width = sizeX;
			cn.height = sizeY;
			
			this._drawbar();
		},
		/**
		 * Apply translation to the target.
		 * 
		 * @param {integer} x x targeted coordinates
		 * @param {integer} y y targeted coordinates
		 */
		_translateTo: function(x, y)
		{
			this._view.x = x;
			this._view.y = y;
			this._domNode.translate(x, y);
		}
	};
	
	return wink.ui.layout.Scroller;
});