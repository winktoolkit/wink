/*--------------------------------------------------------
 * Copyright (c) 2011, The Dojo Foundation
 * This software is distributed under the "Simplified BSD license",
 * the text of which is available at http://www.winktoolkit.org/licence.txt
 * or see the "license.txt" file for more details.
 *--------------------------------------------------------*/

/**
 * @fileOverview Implements a media wheel
 * 
 * @compatibility Iphone OS4, Ipad, Android 3.0, Android 3.1, BlackBerry 7
 * @author Sylvain LALANDE
 */

/**
 * The event is fired when there is a time update
 * 
 * @name wink.mm.MediaWheel#/mediawheel/events/timeupdate

 * @event
 * 
 * @param {object} param The parameters object
 * @param {integer} param.publisher The media wheel that triggered the event
 * @param {integer} param.time The current time
 */
define(['../../../_amd/core', '../../../math/_geometric/js/geometric', '../../../ux/movementtracker/js/movementtracker'], function(wink)
{
	 /** 
	  * @class Implements a media wheel. The media wheel is a progress bar, displayed as a wheel, used for media files and based on the Canvas tag.
	  * The audio player can take several parameters. It takes at least the width and height parameters. Use the getDomNode method to add the component to the page
	  * 
	  * @param {object} properties The properties object
	  * @param {integer} properties.width The width of the container
	  * @param {integer} properties.height The height of the container
	  * @param {integer} [properties.radius=(size / 2 - (size / 10))] The radius of the wheel
	  * @param {integer} [properties.thickness=Math.max((size / 20), 25)] The thickness of the wheel
	  * @param {integer} [properties.startAngle=10] The start angle of the wheel
	  * @param {integer} [properties.endAngle=350] The end angle of the wheel
	  * @param {array} [properties.readGradientColors=[{ pos : 0, color : '#000' },{ pos : 0.75, color : '#cacaca' },{ pos : 1, color : '#000' }]] The gradient colors of the read part of the media (eg. [{ pos: 0, color: color1 },{ pos: 0.75, color: color2 },{ pos: 1, color: color3 }])
	  * @param {array} [properties.bgGradientColors=[{ pos : 0, color : '#000' },{ pos : 0.75, color : '#a1a1a1' },{ pos : 1, color : '#000' }]] The gradient colors of the background part of the media (eg. [{ pos: 0, color: color1 },{ pos: 0.75, color: color2 },{ pos: 1, color: color3 }])
	  * @param {array} [properties.unbufferedGradientColors=[{ pos : 0, color : '#111' },{ pos : 0.75, color : '#fff' },{ pos : 1, color : '#111' }]] The gradient colors of the unbuffered part of the media (eg. [{ pos: 0, color: color1 },{ pos: 0.75, color: color2 },{ pos: 1, color: color3 }])
	  * @param {array} [properties.cursorRectColor=[ "rgba(255, 255, 255, 0.5)", "rgba(255, 255, 255, 0.7)" ]] The color of the cursor's rectangle
	  * @param {array} [properties.cursorTriangleColor=[ "rgba(255, 255, 255, 1.0)", "rgba(0, 0, 0, 0.6)" ]] The color of the cursor's triangle
	  * @param {boolean} [properties.canChangeTime=true] Indicates whether the user can change the time by moving or clicking on the wheel
	  * 
	  * @example
	  * 
	  * var mediaWheel = new wink.mm.MediaWheel(
	  * {
	  * 	width: $('content').offsetWidth,
	  * 	height: $('content').offsetHeight
	  * });
	  * 
	  * @requires wink.math (geometric)
	  * @requires wink.ux.MovementTracker
	  * 
	  * @see <a href="WINK_ROOT_URL/mm/mediawheel/test/test_mediawheel_1.html" target="_blank">Test page (audio)</a>
	  * @see <a href="WINK_ROOT_URL/mm/mediawheel/test/test_mediawheel_2.html" target="_blank">Test page (video)</a>
	  */ 
	wink.mm.MediaWheel = function(properties)
	{
		/**
		 * Unique identifier
		 * 
		 * @property
		 * @type integer
		 */
		this.uId = wink.getUId();
		
		wink.mixin(this, properties);
		
		if (this._validateProperties() === false) return;
		
		this._initProperties();
		this._initDom();
		this._initListeners();
	};
	
	wink.mm.MediaWheel.prototype = 
	{
		/**
		 * Returns the DOM node of the component
		 * 
		 * @returns {HTMLElement} The main dom node
		 */
		getDomNode: function()
		{
			return this._domNode;
		},
		/**
		 * Set the duration
		 * 
		 * @param {number} duration The media duration
		 */
		setDuration: function(duration)
		{
			var _this = this;
			_this._duration = duration;
			_this._draw();
		},
		/**
		 * Set the time
		 * 
		 * @param {number} time The media time
		 */
		setTime: function(time)
		{
			var _this = this;
			_this._time = time;
			_this._cursorAngle = _this._timeToAngle(time);
			_this._draw();
		},
		/**
		 * Set the buffered time
		 * 
		 * @param {number} buftime The buffered time
		 */
		setBufferedTime: function(buftime)
		{
			var _this = this;
			_this._bufferedTime = buftime;
			_this._draw();
		},
		
		/**
		 * 
		 */
		_draw: function()
		{
			var _this = this;
			_this._ctx.clearRect(0, 0, _this.width, _this.height);
			
			var a1 = Math.max(_this.startAngle, _this._timeToAngle(_this._time)),
				a2 = Math.max(a1, _this._timeToAngle(_this._bufferedTime)),
				drawFromTo = function(from, to, gradients) {
					_drawWheel(_this._ctx, _this._cx, _this._cy, _this._r1, _this._r2, from, to, gradients, 1);
				};
			drawFromTo(_this.startAngle, a1, _this.readGradientColors);
			drawFromTo(a1, a2, _this.bgGradientColors);
			drawFromTo(a2, _this.endAngle, _this.unbufferedGradientColors);
			
			this._drawCursor();
		},
		
		/**
		 * 
		 */
		_drawCursor: function()
		{
			var _this = this,
				rect = _this._getCursorRect();
			_this._ctxCursor.clearRect(0, 0, _this.width, _this.height);
			_drawPlayCursor(_this._ctxCursor, _this._cx, _this._cy, rect.h, rect.w, rect.x, rect.y, _this._cursorAngle, _this.cursorRectColor, _this.cursorTriangleColor);
		},
		
		/**
		 * 
		 */
		_getCursorRect: function()
		{
			var _this = this,
				delta = (_this._r2 - _this._r1),
				middle = -(_this._r1 + _this._r2) / 2,
				h = delta + (0.4 * delta),
				w = h / 6;
			return { x: 0, y: middle, h: h, w: w };
		},
		
		/**
		 * @param {object} publishedInfos see wink.ux.MovementTracker Events
		 */
		_mvtStart: function(publishedInfos)
		{
			var _this = this, publisher = publishedInfos.publisher;
			if (publisher.uId != _this._movementtracker.uId)
			{
				return;
			}
			var uxEvent = publishedInfos.uxEvent;
			_this._drag = false;
			_this._track = false;
			
			if (_this._duration == 0) {
				return;
			}
			
			var polarCoord = _getPolarCoordinates(_this._canvasCursorNode, uxEvent.x, uxEvent.y, _this._cx, _this._cy),
				cursorRect = _this._getCursorRect(),
				cursorRadiusH = cursorRect.h / 2,
				cursorRadiusW = cursorRect.w / 2;
			
			var infos = {
				coords: polarCoord
			};
			
			if (polarCoord.rho >= (-cursorRect.y - cursorRadiusH) && polarCoord.rho <= (-cursorRect.y + cursorRadiusH)) {
				infos.onWheel = true;
				if (polarCoord.theta >= (_this._cursorAngle - cursorRadiusW) && polarCoord.theta <= (_this._cursorAngle + cursorRadiusW)) {
					_this._track = true;
					infos.onCursor = true;
				}
			}
			_this._startInfo = infos;
		},
		
		/**
		 * @param {object} publishedInfos see wink.ux.MovementTracker Events
		 */
		_mvtMove: function(publishedInfos)
		{
			var _this = this, publisher = publishedInfos.publisher;
			if (publisher.uId != _this._movementtracker.uId)
			{
				return;
			}
			_this._drag = true;
			if (!_this._track) {
				return;
			}
			var uxEvent = publishedInfos.uxEvent,
				polarCoord = _getPolarCoordinates(_this._canvasCursorNode, uxEvent.x, uxEvent.y, _this._cx, _this._cy),
				vAngle = _this._adjustAngle(polarCoord.theta),
				time = _this._angleToTime(vAngle);
			_this.setTime(time);
			_this._notifyTimeUpdate(time);
		},
		
		/**
		 * @param {object} publishedInfos see wink.ux.MovementTracker Events
		 */
		_mvtEnd: function(publishedInfos)
		{
			var _this = this, publisher = publishedInfos.publisher;
			if (publisher.uId != _this._movementtracker.uId)
			{
				return;
			}
			
			if (_this._duration == 0) {
				return;
			}
			
			if (!_this._drag) {
				if (_this._startInfo.onWheel) {
					var polarCoord = _this._startInfo.coords,
						vAngle = _this._adjustAngle(polarCoord.theta),
						time = _this._angleToTime(vAngle);
					_this.setTime(time);
					_this._notifyTimeUpdate(time);
				}
			}
		},
		
		/**
		 * 
		 */
		_notifyTimeUpdate: function(time)
		{
			wink.publish('/mediawheel/events/timeupdate', { publisher: this, time: time });
		},
		
		/**
		 * 
		 */
		_timeToAngle: function(time)
		{
			var _this = this;
			if (_this._duration == 0) {
				return 0;
			}
			return (time * _this._at / _this._duration) + _this.startAngle;
		},
		/**
		 * 
		 */
		_angleToTime: function(angle)
		{
			var _this = this;
			if (_this._duration == 0) {
				return 0;
			}
			return ((angle - _this.startAngle) * _this._duration / _this._at);
		},
		/**
		 * 
		 */
		_adjustAngle: function(angle)
		{
			var _this = this, 
				ca = angle;
			if (ca < _this.startAngle) {
				ca = _this.startAngle;
			} else if (ca > _this.endAngle) {
				ca = _this.endAngle;
			}
			return ca;
		},
		
		/**
		 * Initialize DOM nodes
		 */
		_initDom: function()
		{
			var _this = this,
				dn = _this._domNode = document.createElement('div'),
				cn = _this._canvasNode = document.createElement('canvas'),
				cnc = _this._canvasCursorNode = document.createElement('canvas');
			
			wink.addClass(dn, "mw_container");
			
			_this._ctx = cn.getContext('2d');
			_this._ctxCursor = cnc.getContext('2d');
			dn.appendChild(cn);
			dn.appendChild(cnc);
			
			cn.translate(0, 0);
			cnc.translate(0, 0);
			
			cn.width = _this.width;
			cn.height = _this.height;
			cnc.width = _this.width;
			cnc.height = _this.height;
			
			wink.fx.apply(dn, {
				width: _this.width + "px",
				height: _this.height + "px"
			});
			
			_this._draw();
		},
		/**
		 * Initialize listeners
		 */
		_initListeners: function()
		{
			var _this = this; 
			if (_this.canChangeTime) {
				_this._movementtracker = new wink.ux.MovementTracker({ target: _this._canvasCursorNode });
				wink.subscribe('/movementtracker/events/mvtbegin', { context: _this, method: '_mvtStart' });
				wink.subscribe('/movementtracker/events/mvtchanged', { context: _this, method: '_mvtMove' });
				wink.subscribe('/movementtracker/events/mvtstored', { context: _this, method: '_mvtEnd' });
			}
		},
		/**
		 * Initialize the wheel properties
		 */
		_initProperties: function()
		{
			var _this = this;
			
			_this.height = _this.height || 300;
			_this.width = _this.width || 300;
			
			var size = Math.min(_this.height, _this.width);
			_this.radius = _this.radius || (size / 2 - (size / 10));
			_this.thickness = _this.thickness || Math.max((size / 20), 25);
			_this.startAngle = _this.startAngle || 10;
			_this.endAngle = _this.endAngle || 350;
			
			_this.cursorRectColor = _this.cursorRectColor || [ "rgba(255, 255, 255, 0.5)", "rgba(255, 255, 255, 0.7)" ];
			_this.cursorTriangleColor = _this.cursorTriangleColor || [ "rgba(255, 255, 255, 1.0)", "rgba(0, 0, 0, 0.6)" ];
			
			var getGrd = function(c1, c2, c3) {
				return [{ pos : 0, color : c1 },{ pos : 0.75, color : c2 },{ pos : 1, color : c3 }];
			};
			_this.bgGradientColors = _this.bgGradientColors || getGrd('#000', '#cacaca', '#000');
			_this.unbufferedGradientColors = _this.unbufferedGradientColors || getGrd('#000', '#a1a1a1', '#000');
			_this.readGradientColors = _this.readGradientColors || getGrd('#111', '#fff', '#111');
			
			_this.canChangeTime = !(_this.canChangeTime === false);
			
			_this._cx = _this.width / 2;
			_this._cy = _this.height / 2;
			_this._r1 = _this.radius;
			_this._r2 = _this._r1 + _this.thickness;
			_this._at = _this.endAngle - _this.startAngle;
			_this._duration = 0;
			_this._bufferedTime = 0;
			_this._time = 0;
			_this._cursorAngle = _this.startAngle;
		},
		/**
		 * Validate the properties of the component
		 * @returns {boolean} True if the properties are valid, false otherwise
		 */
		_validateProperties: function()
		{
			var _this = this,
				isset = wink.isSet,
				isint = wink.isInteger,
				isarr = wink.isArray,
				_raisePropertyError = function(property) {
					wink.log('[MediaWheel] Error: ' + property + ' missing or invalid');
				},
				_h = _this.height,
				_w = _this.width,
				_r = _this.radius,
				_tk = _this.thickness,
				_sa = _this.startAngle,
				_ea = _this.endAngle,
				_crc = _this.cursorRectColor,
				_ctc = _this.cursorTriangleColor,
				_bggc = _this.bgGradientColors,
				_ugc = _this.unbufferedGradientColors,
				_rgc = _this.readGradientColors;
				
			if (isset(_h) && !isint(_h))
			{
				_raisePropertyError('height');
				return false;
			}
			if (isset(_w) && !isint(_w))
			{
				_raisePropertyError('width');
				return false;
			}
			if (isset(_r) && !isint(_r))
			{
				_raisePropertyError('radius');
				return false;
			}
			if (isset(_tk) && !isint(_tk))
			{
				_raisePropertyError('thickness');
				return false;
			}
			if (isset(_sa) && !isint(_sa))
			{
				_raisePropertyError('startAngle');
				return false;
			}
			if (isset(_ea) && !isint(_ea))
			{
				_raisePropertyError('endAngle');
				return false;
			}
			if (isset(_crc) && !isarr(_crc))
			{
				_raisePropertyError('cursorRectColor');
				return false;
			}
			if (isset(_ctc) && !isarr(_ctc))
			{
				_raisePropertyError('cursorTriangleColor');
				return false;
			}
			if ((isset(_bggc) && !isarr(_bggc)) || (isset(_ugc) && !isarr(_ugc)) || (isset(_rgc) && !isarr(_rgc)))
			{
				_raisePropertyError('gradientColors');
				return false;
			}
			return true;
		}
	};
	
	var _round = wink.math.round,
		_degToRad = wink.math.degToRad,
		_radToDeg = wink.math.radToDeg,
		_FRACTION_COUNT = 100;
	
	/**
	 * 
	 */
	var _drawWheel = function(ctx, cx, cy, r1, r2, a1, a2, gradientColors, linewidth)
	{
		var angle = a2 - a1;
		if (angle == 0) {
			return;
		}
		var i, l = _getFractionCount(angle), ai = angle / l, ac = a1;
		for (i = 0; i < l; i++) {
			_drawFraction(ctx, cx, cy, r1, r2, ac, (ac + ai), gradientColors, linewidth);
			ac += ai;
		}
	};
	
	/**
	 * 
	 */
	var _getFractionCount = function(angle)
	{
		var n = _round(angle * _FRACTION_COUNT / 360, 0);
		n = Math.max(n, 1);
		return n;
	};
	
	/**
	 * 
	 */
	var _drawFraction = function(ctx, cx, cy, r1, r2, a1, a2, gradientColors, linewidth)
	{
		ctx.beginPath();
	
		var p = _getCirclePoint(cx, cy, r1, a1);
		ctx.moveTo(p.x, p.y);
	
		_drawArc(ctx, cx, cy, r1, a1, a2);
	
		var p = _getCirclePoint(cx, cy, r2, a2);
		ctx.lineTo(p.x, p.y);
	
		_drawArc(ctx, cx, cy, r2, a2, a1);
	
		var p = _getCirclePoint(cx, cy, r1, a1);
		ctx.lineTo(p.x, p.y);
	
		ctx.closePath();
	
		var gradientP1 = _getCirclePoint(cx, cy, r1, a1 + (Math.abs(a2 - a1) / 2));
		var gradientP2 = _getCirclePoint(cx, cy, r2, a1 + (Math.abs(a2 - a1) / 2));
		
		var grd = _computeGradient(ctx, gradientP1.x, gradientP1.y, gradientP2.x, gradientP2.y, gradientColors);
		
		ctx.fillStyle = grd;
		ctx.fill();
	
		ctx.lineWidth = 1;
		ctx.strokeStyle = grd;
		ctx.stroke();
	};
	
	/**
	 * 
	 */
	var _drawPlayCursor = function(ctx, cx, cy, height, width, x, y, angle, cursorRectColors, cursorTriangleColors)
	{
		// 
		ctx.save();
		ctx.translate(cx, cy);
		ctx.rotate(_degToRad(angle));
		ctx.translate(x, y);
		
		var w2 = width / 2;
		var h2 = height / 2;
		
		// 
		ctx.save();
		ctx.beginPath();
	
		ctx.moveTo(w2, h2);
		ctx.lineTo(w2, -h2);
		ctx.lineTo(-w2, -h2);
		ctx.lineTo(-w2, h2);
		ctx.lineTo(w2, h2);
	
		ctx.closePath();
		
		ctx.fillStyle = cursorRectColors[0];
		ctx.fill();
	
		ctx.lineWidth = 1;
		ctx.strokeStyle = cursorRectColors[1];
		ctx.stroke();
		ctx.restore();
		
		// 
		ctx.save();
		ctx.beginPath();
	
		ctx.moveTo(w2 * 4, 0);
		ctx.lineTo(-w2 * 2, h2 / 2);
		ctx.lineTo(-w2 * 2, -h2 / 2);
		ctx.lineTo(w2 * 4, 0);
	
		ctx.closePath();
	
		ctx.fillStyle = cursorTriangleColors[0];
		ctx.fill();
	
		ctx.lineWidth = 1;
		ctx.strokeStyle = cursorTriangleColors[1];
		ctx.stroke();
		ctx.restore();
		
		ctx.restore();
	};
	
	/**
	 * 
	 */
	var _drawArc = function(ctx, x, y, r, a1, a2, dir)
	{
		var dir = (a2 > a1) ? false : true;
		ctx.arc(x, y, r, _degToRad(_asDeg(a1)), _degToRad(_asDeg(a2)), dir);
	};
	
	/**
	 * 
	 */
	var _getCirclePoint = function(cx, cy, r, a)
	{
		return {
			x : cx + (r * Math.cos(_degToRad(_asDeg(a)))),
			y : cy + (r * Math.sin(_degToRad(_asDeg(a))))
		};
	};
	
	/**
	 * 
	 */
	var _computeGradient = function(ctx, x1, y1, x2, y2, gradientColors)
	{
		var grd = ctx.createLinearGradient(x1, y1, x2, y2);
		var i, l = gradientColors.length;
		for (i = 0; i < l; i++) {
			var c = gradientColors[i];
			grd.addColorStop(c.pos, c.color);
		}
		return grd;
	};
	
	/**
	 * 
	 */
	var _asDeg = function(angleDeg)
	{
		return (angleDeg - 90);
	};
	
	/**
	 * 
	 */
	var _getPolarCoordinates = function(node, absX, absY, cx, cy)
	{
		var pos = node.getPosition(null, true);
			offsetX = absX - pos.x,
			offsetY = absY - pos.y,
			xTrigo = (offsetX - cx),
			yTrigo = -(offsetY - cy),
			rho = Math.sqrt((xTrigo * xTrigo) + (yTrigo * yTrigo)),
			theta = _radToDeg((Math.PI/2) - Math.atan2(yTrigo, xTrigo));
		
		if (theta < 0) {
			theta += 360;
		}
		return { rho: rho, theta: theta };
	};
	
	return wink.mm.MediaWheel;
});