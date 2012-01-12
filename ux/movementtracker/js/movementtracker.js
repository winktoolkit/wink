/*--------------------------------------------------------
 * Copyright (c) 2011, The Dojo Foundation
 * This software is distributed under the "Simplified BSD license",
 * the text of which is available at http://www.winktoolkit.org/licence.txt
 * or see the "license.txt" file for more details.
 *--------------------------------------------------------*/

/**
 * @fileOverview Implements a Movement Tracker. The Movement Tracker follows the touch movement performed on a node.
 * It listens to touch events and elaborates a movement which consists of points statements sequence. 
 * Each point statement includes these informations : a position, a direction, a distance and a duration.
 * 
 * @author Sylvain LALANDE
 * 
 * @compatibility Iphone OS2, Iphone OS3, Iphone OS4, Android 1.5, Android 2.1, Android 2.2, Android 2.3, Android 3.0, Android 3.1, BlackBerry 6, BlackBerry 7, Bada 1.0
 * 
 */

/**
 * The movement begins
 * 
 * @name wink.ux.MovementTracker#/movementtracker/events/mvtbegin
 * @event
 * @param {object} param The parameters object
 * @param {wink.ux.MovementTracker} param.publisher Identifies the movement tracker itself in order, for the caller, to check whether the event relates to it
 * @param {object} param.movement A Movement object
 * @param {array} param.movement.pointStatement an array of "points" : a point is an object which is composed as { x, y, timestamp, duration, globalDuration, dx, dy, globalDx, globalDy, directionX, directionY }
 * @param {integer} param.movement.duration duration is the duration of the movement
 * @param {integer} param.movement.dx dx is the distance on x-axis
 * @param {integer} param.movement.dy dy is the distance on x-axis
 * @param {wink.ux.Event} param.uxEvent The Wink Event that is the cause of the event
 * @param {HTMLElement} param.target The target DOM node tracked
 */

/**
 * The movement changes
 * 
 * @name wink.ux.MovementTracker#/movementtracker/events/mvtchanged
 * @event
 * @param {object} param The parameters object
 * @param {wink.ux.MovementTracker} param.publisher Identifies the movement tracker itself in order, for the caller, to check whether the event relates to it
 * @param {object} param.movement A Movement object
 * @param {array} param.movement.pointStatement an array of "points" : a point is an object which is composed as { x, y, timestamp, duration, globalDuration, dx, dy, globalDx, globalDy, directionX, directionY }
 * @param {integer} param.movement.duration duration is the duration of the movement
 * @param {integer} param.movement.dx dx is the distance on x-axis
 * @param {integer} param.movement.dy dy is the distance on x-axis
 * @param {wink.ux.Event} param.uxEvent The Wink Event that is the cause of the event
 * @param {HTMLElement} param.target The target DOM node tracked
 */

/**
 * The movement stops
 * 
 * @name wink.ux.MovementTracker#/movementtracker/events/mvtstored
 * @event
 * @param {object} param The parameters object
 * @param {wink.ux.MovementTracker} param.publisher Identifies the movement tracker itself in order, for the caller, to check whether the event relates to it
 * @param {object} param.movement A Movement object
 * @param {array} param.movement.pointStatement an array of "points" : a point is an object which is composed as { x, y, timestamp, duration, globalDuration, dx, dy, globalDx, globalDy, directionX, directionY }
 * @param {integer} param.movement.duration duration is the duration of the movement
 * @param {integer} param.movement.dx dx is the distance on x-axis
 * @param {integer} param.movement.dy dy is the distance on x-axis
 * @param {wink.ux.Event} param.uxEvent The Wink Event that is the cause of the event
 * @param {HTMLElement} param.target The target DOM node tracked
 */

/**
 * The touch events of the movement are not currently tracked
 * 
 * @name wink.ux.MovementTracker#/movementtracker/events/notrack
 * @event
 * @param {object} param The parameters object
 * @param {wink.ux.MovementTracker} param.publisher Identifies the movement tracker itself in order, for the caller, to check whether the event relates to it
 * @param {wink.ux.Event} param.uxEvent The Wink Event that is the cause of the event
 * @param {HTMLElement} param.target The target DOM node tracked
 */

define(['../../../_amd/core'], function(wink)
{
	/**
	 * @class Implements a Movement Tracker. The Movement Tracker follows the touch movement performed on a node.
	 * It listens to touch events and elaborates a movement which consists of points statements sequence. 
	 * Each point statement includes these informations : a position, a direction, a distance and a duration.
	 * 
	 * @param {object} properties The properties object
	 * @param {HTMLElement} properties.target The target DOM node which must be tracked
	 * @param {boolean} [properties.captureFlow=true] Indicates whether the capture event flow is used
	 * @param {boolean} [properties.preventStart=true] Indicates whether the start event must be prevented
	 * @param {boolean} [properties.preventMove=false] Indicates whether the move event must be prevented
	 * @param {integer} [properties.trackThresholdX=0] The minimum distance on x-axis before tracking the movement - in pixels
	 * @param {integer} [properties.trackThresholdY=0] The minimum distance on y-axis before tracking the movement - in pixels
	 * 
	 * @example
	 * 
	 * var mvt = new wink.ux.MovementTracker({ target: $("nodeId") });
	 * wink.subscribe('/movementtracker/events/mvtbegin', { context: window, method: 'handleMovementBegin' });
	 * wink.subscribe('/movementtracker/events/mvtchanged', { context: window, method: 'handleMovementChanged' });
	 * wink.subscribe('/movementtracker/events/mvtstored', { context: window, method: 'handleMovementStored' });
	 * 
	 * @see <a href="WINK_ROOT_URL/ux/movementtracker/test/test_movementtracker.html" target="_blank">Test page</a>
	 */
	wink.ux.MovementTracker = function(properties) 
	{
		/**
		 * Unique identifier
		 * 
		 * @property uId
		 * @type integer
		 */
		this.uId			= wink.getUId();
		this._properties 	= properties;
		
		this._target 		= null;
		
		this._pointStatement= null;
		this._startPoint	= null;
		this._previousPoint	= null;
		this._tracking		= false;
		this._acceptEvents	= true;
		this._multitouch	= false;
		
		this._params		= {
			captureFlow: true,
			preventStart: true,
			preventMove: false,
			shiftThreshold: 0, // pixel
			trackThresholdX: 0, // pixel
			trackThresholdY: 0 // pixel
		};
		
		if (this._validateProperties() === false) return;
		
		this._initProperties();	
		this._initListeners();
	};
	
	wink.ux.MovementTracker.prototype = {
		/**
		 * Updates the tracking threshold on x-axis
		 * 
		 * @param {integer} threshold The threshold to set
		 */
		updateTrackThresholdX: function(threshold)
		{
			if (!this._isValidThreshold(threshold))
			{
				this._raisePropertyError('trackThresholdX');
			}
			else
			{
				this._params.trackThresholdX = threshold;
			}
		},
		/**
		 * Updates the tracking threshold on y-axis
		 * 
		 * @param {integer} threshold The threshold to set
		 */
		updateTrackThresholdY: function(threshold)
		{
			if (!this._isValidThreshold(threshold))
			{
				this._raisePropertyError('trackThresholdY');
			}
			else
			{
				this._params.trackThresholdY = threshold;
			}
		},
		/**
		 * Destroys the component
		 * 
		 */
		destroy: function()
		{
			this._removeListeners();
		},
		/**
		 * Validate the properties of the component
		 * @returns {boolean} True if the properties are valid, false otherwise
		 */
		_validateProperties: function()
		{
			if (wink.isUndefined(this._properties.target) || wink.isNull($(this._properties.target))) {
				this._raisePropertyError('target');
				return false;
			}
			if (wink.isSet(this._properties.trackThresholdX) && !this._isValidThreshold(this._properties.trackThresholdX)) {
				this._raisePropertyError('trackThresholdX');
				return false;
			}
			if (wink.isSet(this._properties.trackThresholdY) && !this._isValidThreshold(this._properties.trackThresholdY)) {
				this._raisePropertyError('trackThresholdY');
				return false;
			}
			return true;
		},
		/**
		 * Returns true if the given threshold is valid
		 */
		_isValidThreshold: function(threshold)
		{
			return wink.isInteger(threshold) && threshold >= 0;
		},
		/**
		 * Raise the property error
		 */
		_raisePropertyError: function(property)
		{
			wink.log('[MovementTracker] Error: ' + property + ' missing or invalid');
		},
		/**
		 * Initialize datas with given properties
		 */
		_initProperties: function()
		{
			this._target = $(this._properties.target);
			if (this._properties.captureFlow === false) {
				this._params.captureFlow = false;
			}
			if (this._properties.preventStart === false) {
				this._params.preventStart = false;
			}
			if (this._properties.preventMove === true) {
				this._params.preventMove = true;
			}
			if (wink.isSet(this._properties.trackThresholdX)) {
				this._params.trackThresholdX = this._properties.trackThresholdX;
			}
			if (wink.isSet(this._properties.trackThresholdY)) {
				this._params.trackThresholdY = this._properties.trackThresholdY;
			}
			delete this._properties;
		},
		/**
		 * Initialize listeners
		 */
		_initListeners: function()
		{
			wink.ux.touch.addListener(this._target, "start", { context: this, method: "_handleTouchStart" }, { preventDefault: this._params.preventStart, captureFlow: this._params.captureFlow });
			wink.ux.touch.addListener(this._target, "move", { context: this, method: "_handleTouchMove" }, { preventDefault: this._params.preventMove, captureFlow: this._params.captureFlow });
			wink.ux.touch.addListener(this._target, "end", { context: this, method: "_handleTouchEnd" }, { captureFlow: this._params.captureFlow });
		},
		/**
		 * Removes listeners
		 */
		_removeListeners: function()
		{
			wink.ux.touch.removeListener(this._target, "start", { context: this, method: "_handleTouchStart" });
			wink.ux.touch.removeListener(this._target, "move", { context: this, method: "_handleTouchMove" });
			wink.ux.touch.removeListener(this._target, "end", { context: this, method: "_handleTouchEnd" });
		},
		/**
		 * Handle touch start
		 * 
		 * @param {wink.ux.Event} uxEvent The wink.ux.Event associated
		 */
		_handleTouchStart: function(uxEvent)
		{
			if (wink.ua.isAndroid) {
				// workaround : android shows a popup (selection) when the start handling is too long. So we must defer the execution in this case
				if (!this.defered) {
					this.defered = true;
					var time = new Date().getTime() - uxEvent.timestamp;
					if (time > 100) {
						this._acceptEvents = false;
						uxEvent.preventDefault();
						var t, ctx = {
							exec: wink.bind(function() {
								clearTimeout(t);
								this._acceptEvents = true;
								this._handleTouchStart(uxEvent);
							}, this)
						};
						t = wink.setTimeout(ctx, 'exec', 0);
						return;
					}
				}
			}
	
			if (this._acceptEvents == false) {
				return;
			}
			
			this._multitouch = false;
			if (uxEvent.multitouch == true) {
				this._multitouch = true;
				return;
			}
			
			this._acceptEvents = false;
			
			this._pointStatement = [];
			this._previousPoint = null;
			this._tracking = false;
			this._startPoint = {
				x: uxEvent.x,
				y: uxEvent.y
			};
			
			var topic = this._onNewTouch(uxEvent);
			wink.publish(topic.name, topic.params);
			
			this._acceptEvents = true;
		},
		/**
		 * Handle touch move
		 * 
		 * @param {wink.ux.Event} uxEvent The wink.ux.Event associated
		 */
		_handleTouchMove: function(uxEvent)
		{
			if (this._acceptEvents == false) {
				return;
			}
			if (this._multitouch) {
				return;
			}
			
			this._acceptEvents = false;
			
			var topic = this._onNewTouch(uxEvent);
			wink.publish(topic.name, topic.params);
			
			this._acceptEvents = true;
		},
		/**
		 * Handle touch end
		 * 
		 * @param {wink.ux.Event} uxEvent The wink.ux.Event associated
		 */
		_handleTouchEnd: function(uxEvent)
		{
			if (this._acceptEvents == false) {
				return;
			}
			if (this._multitouch) {
				return;
			}
			
			this._acceptEvents = false;
			
			var topic = this._onNewTouch(uxEvent);
			wink.publish(topic.name, topic.params);
			
			this._acceptEvents = true;
		},
		/**
		 * Handle a new touch.
		 * 
		 * @param {wink.ux.Event} uxEvent The wink.ux.Event associated
		 * 
		 * @returns {object} the topic to publish
		 */
		_onNewTouch: function(uxEvent)
		{
			if (this._tracking == false) {
				if (this._params.trackThresholdX == 0 || this._params.trackThresholdY == 0) {
					this._tracking = true;
				} else {
					var currentPoint = {
						x: uxEvent.x,
						y: uxEvent.y
					};
					var dx = Math.abs(currentPoint.x - this._startPoint.x);
					var dy = Math.abs(currentPoint.y - this._startPoint.y);
					
					if (dx > this._params.trackThresholdX || dy > this._params.trackThresholdY) {
						this._tracking = true;
					}
				}
			}
			
			var topic = {
				name: '/movementtracker/events/notrack',
				params: {
					publisher: this,
					uxEvent: uxEvent,
					target: this._target
				}
			};
			
			if (this._tracking == false) {
				return topic;
			}
			
			if (this._pointStatement.length == 0) {
				topic.name = '/movementtracker/events/mvtbegin';
			} else if (uxEvent.type == "move") {
				topic.name = '/movementtracker/events/mvtchanged';
			} else if (uxEvent.type == "end") {
				topic.name = '/movementtracker/events/mvtstored';
			}
			
			this._addTouch(uxEvent);
			topic.params.movement = this._getCurrentMovement();
			
			return topic;
		},
		/**
		 * Add a point statement to the movement
		 * 
		 * @param {wink.ux.Event} uxEvent The wink.ux.Event associated to the touch
		 */
		_addTouch: function(uxEvent)
		{
			var point = {
				x: uxEvent.x,
				y: uxEvent.y,
				timestamp : uxEvent.timestamp
			};
	
			var previousX = 0;
			var previousY = 0;
			var previousDx = 0;
			var previousDy = 0;
			var previousDirectionX = 0;
			var previousDirectionY = 0;
	
			if (this._previousPoint == null) {
				// duration
				point.duration = 0;
				point.globalDuration = 0;
				previousX = point.x;
				previousY = point.y;
			} else {
				previousX = this._previousPoint.x;
				previousY = this._previousPoint.y;
				previousDx = this._previousPoint.globalDx;
				previousDy = this._previousPoint.globalDy;
				previousDirectionX = this._previousPoint.directionX;
				previousDirectionY = this._previousPoint.directionY;
			
				// duration
				point.duration = (point.timestamp - this._previousPoint.timestamp);
				point.globalDuration = point.duration + this._previousPoint.globalDuration;
			}
		
			// distance
			point.dx = Math.abs(point.x - previousX);
			point.dy = Math.abs(point.y - previousY);
			point.globalDx = point.dx + previousDx;
			point.globalDy = point.dy + previousDy;
		
			// direction
			point.directionX = previousDirectionX;
			point.directionY = previousDirectionY;
		
			if (previousDirectionX == 0 && this._previousPoint != null) {
				if (point.x < previousX) {
					point.directionX = -1;
				} else if (point.x > previousX) {
					point.directionX = 1;
				}
				this._previousPoint.directionX = point.directionX;
			}
			if (previousDirectionY == 0 && this._previousPoint != null) {
				if (point.y < previousY) {
					point.directionY = -1;
				} else if (point.y > previousY) {
					point.directionY = 1;
				}
				this._previousPoint.directionY = point.directionY;
			}
		
			if (previousDirectionX > 0 && (point.x + this._params.shiftThreshold) < previousX) {
				point.directionX = -1;
			} else if (previousDirectionX < 0 && (point.x - this._params.shiftThreshold) > previousX) {
				point.directionX = 1;
			}
			if (previousDirectionY > 0 && (point.y + this._params.shiftThreshold) < previousY) {
				point.directionY = -1;
			} else if (previousDirectionY < 0 && (point.y - this._params.shiftThreshold) > previousY) {
				point.directionY = 1;
			}
		
			this._pointStatement.push(point);
			this._previousPoint = point;
		},
		/**
		 * Build the current movement
		 * 
		 * @returns {object} the current movement
		 */
		_getCurrentMovement: function()
		{
			var lastPoint = this._pointStatement[(this._pointStatement.length - 1)];
			var movement = {
				pointStatement : this._pointStatement,
				duration : lastPoint.globalDuration,
				dx : lastPoint.globalDx,
				dy : lastPoint.globalDy
			};
			return movement;
		}
	};
	
	return wink.ux.MovementTracker;
});