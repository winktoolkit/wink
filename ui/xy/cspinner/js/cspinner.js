/*--------------------------------------------------------
 * Copyright (c) 2011, The Dojo Foundation
 * This software is distributed under the "Simplified BSD license",
 * the text of which is available at http://www.winktoolkit.org/licence.txt
 * or see the "license.txt" file for more details.
 *--------------------------------------------------------*/

/**
 * @fileOverview Implements a configurable spinner based on a canvas
 * 
 * @dependencies wink.math.geometric
 *
 * @compatibility Iphone OS2, Iphone OS3, Iphone OS4, Android 1.5, Android 2.1, Android 2.2, Android 2.3, Android 3.0, Android 3.1, BlackBerry 6, BlackBerry 7, Bada 1.0, Windows Phone 7.5
 * @author Sylvain LALANDE
 */

define(['../../../../_amd/core', '../../../../math/_geometric/js/geometric'], function(wink)
{
	/**
	 * @class Implements a configurable spinner based on a canvas.
	 * CSpinner is fully configurable, all parameters are optional.
	 * 
	 * @param {object} properties The properties object
	 * @param {integer} [properties.size=25] The size of the container
	 * @param {integer} [properties.radius=7] The inner radius of the spinner
	 * @param {integer} [properties.thickness=5] The thickness of the spinner
	 * @param {integer} [properties.count=Math.floor(radius * 1.5)] The number of parts
	 * @param {integer} [properties.space=10] The space between parts
	 * @param {string} [properties.fromcolor='#ccc'] The begin color of the gradient
	 * @param {string} [properties.tocolor='#000'] The end color of the gradient
	 * @param {float} [properties.stopcolor=0.4] The stop position of the gradient
	 * @param {string} [properties.linecolor] The border color
	 * @param {integer} [properties.linewidth=1] The border width
	 * @param {string} [properties.refreshRate=40] The refresh rate
	 * 
	 * @requires wink.math._geometric
	 * 
	 * @example
	 * 
	 * var cspinner = new wink.ui.xy.CSpinner(
	 * {
	 * 	size: 50,
	 * 	radius: 2,
	 * 	thickness: 10,
	 * 	count: 12,
	 * 	space: 20
	 * }
	 * 
	 * @see <a href="WINK_ROOT_URL/ui/xy/cspinner/test/test_cspinner_1.html" target="_blank">Test page</a>
	 * @see <a href="WINK_ROOT_URL/ui/xy/cspinner/test/test_cspinner_2.html" target="_blank">Test page (custom)</a>
	 */
	wink.ui.xy.CSpinner = function(properties)
	{
		/**
		 * Unique identifier
		 * 
		 * @property
		 * @type integer
		 */
		this.uId = wink.getUId();
		
		
		this._domNode        = null;
			
		wink.mixin(this, properties);
			
		if (this._validateProperties() === false)return;
		
		this._initProperties();
		this._initDom();
	};
	
	wink.ui.xy.CSpinner.prototype = 
	{
		/**
		 * Returns the main DOM node of the Spinner
		 * 
		 * @returns {HTMLElement} The main dom node
		 */
		getDomNode: function()
		{
			return this._domNode;
		},
		
		/**
		 * Starts / Stops rendering
		 */
		toggle: function()
		{
			if (this._timer)
			{
				this._stopRendering();
			}
			else
			{
				this._startRendering();
			}
		},
		
		/**
		 * Starts the rendering process
		 */
		_startRendering: function()
		{
			var _this = this;
			if (_this._timer)
			{
				return;
			}
			_this._timer = wink.setInterval(_this, '_render', _this.refreshRate);
		},
		
		/**
		 * Stops the rendering process
		 */
		_stopRendering: function()
		{
			clearInterval(this._timer);
			this._timer = null;
		},
		
		/**
		 * 
		 */
		_render: function()
		{
			var _this = this;
			_this._ctx.clearRect(0, 0, _this.size, _this.size);
			_drawWheel(_this._ctx, _this._cx, _this._cy, _this._r1, _this._r2, 0, 360, 
				_this.count,
				_this._position,
				_this.space,
				_this.linewidth,
				_this._grdcolors,
				_this.linecolor);
			_this._position = (_this._position + 1) % _this.count;
		},
		
		/**
		 * Validate the properties of the component
		 * @returns {boolean} True if the properties are valid, false otherwise
		 */
		_validateProperties: function()
		{
			return true;
		},
		
		/**
		 * Initialize the Spinner DOM node
		 */
		_initDom: function()
		{
			var _this = this,
				dn = _this._domNode = document.createElement('canvas');
			
			dn.translate(0, 0);
			
			_this._ctx = dn.getContext('2d');
			
			dn.width = _this.size;
			dn.height = _this.size;
			
			_this._render();
			_this._startRendering();
		},
		
		/**
		 * Initialize the lyrics properties
		 */
		_initProperties: function()
		{
			var _this = this,
				_assign = function(p, defaultValue) {
					if (_this[p] === 0) {
						return;
					}
					_this[p] = _this[p] || defaultValue;
				};
			
			_assign('size', 25);
			_assign('fromcolor', '#ccc');
			_assign('tocolor', '#000');
			_assign('stopcolor', 0.4);
			_assign('linecolor', null);
			_assign('radius', 7);
			_assign('thickness', 5);
			_assign('count', Math.floor(_this.radius * 1.5));
			_assign('space', 10);
			_assign('linewidth', 1);
			_assign('refreshRate', 40);
			
			_this._cx = _this.size / 2;
			_this._cy = _this.size / 2;
			_this._r1 = _this.radius;
			_this._r2 = _this._r1 + _this.thickness;
			_this._timer = null;
			_this._grdcolors = _getGradient(_this.fromcolor, _this.tocolor, _this.stopcolor, _this.count);
			_this._position = 0;
		}
	};
	
	var _round = wink.math.round,
		_degToRad = wink.math.degToRad,
		_radToDeg = wink.math.radToDeg;
	
	/**
	 * 
	 */
	var _drawWheel = function(ctx, cx, cy, r1, r2, a1, a2, count, position, space, linewidth, grdcolors, linecolor)
	{
		var angle = a2 - a1;
		if (angle == 0) {
			return;
		}
		var spt = space * count;
		var at = angle - spt;
		
		var i, j, l = count, ai = at / l, ac = a1;

		for (i = 0, j = (l - position - 1); i < l; i++) {
			j = (j + 1) % l;
			var ci = grdcolors[j];
			_drawFraction(ctx, cx, cy, r1, r2, ac, (ac + ai), linewidth, ci, linecolor);
			ac += (ai + space);
		}
	};
	
	/**
	 * 
	 */
	var _drawFraction = function(ctx, cx, cy, r1, r2, a1, a2, linewidth, color, linecolor)
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
		
		ctx.fillStyle = color;
		ctx.fill();

		if (linewidth > 0) {
			ctx.lineWidth = linewidth;
			ctx.strokeStyle = linecolor || 'transparent';
			ctx.stroke();
		}
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
	var _asDeg = function(angleDeg)
	{
		return (angleDeg - 90);
	};
	
	/**
	 * 
	 */
	var _getGradient = function(from, to, stop, count)
	{
		var cfrom = _getRGB(from) || { r: 0, g: 0, b: 0, a: 1 },
	    	cto = _getRGB(to) || { r: 255, g: 255, b: 255, a: 1 },
	    	colors = [],
	    	i, cursor, percent = 1.0, pi = 1 / count, pci = 0;
	    
	    for (i = 0, cursor = 0; i < count; i++, cursor += pi) {
	    	var c = {
	    		r: cfrom.r * percent + (1 - percent) * cto.r,
	    		g: cfrom.g * percent + (1 - percent) * cto.g,
	    		b: cfrom.b * percent + (1 - percent) * cto.b,
	    		a: cfrom.a * percent + (1 - percent) * cto.a
	    	};
	    	colors.push("rgba(" + _round(c.r, 0) + "," + _round(c.g, 0) + "," + _round(c.b, 0) + "," + _round(c.a, 2) + ")");

	    	if (pci == 0 && cursor >= stop) {
	    		pci = 1 / (count - i);
	    	}
	    	percent -= pci;
	    	
	    	if (i == (count - 2)) {
	    		percent = 0;
	    	}
	    }
	    return colors;
	};
	
	/**
	 * 
	 */
	var _getRGB = function(colorS)
	{
		var mt = null,
			rgb = null;
		
		if (!mt) {
			mt = (/^#?([a-fA-F0-9]{1,2})([a-fA-F0-9]{1,2})([a-fA-F0-9]{1,2})$/).exec(colorS);
			if (mt) {
				for (var i = 1; i < 4; i++) {
					mt[i] = mt[i].length == 1 ? mt[i] + mt[i] : mt[i];
				}
				rgb = { r: parseInt(mt[1], 16), g: parseInt(mt[2], 16), b: parseInt(mt[3], 16), a: 1.0 };
			}
		}
		if (!mt) {
			mt = (/[^0-9]*([0-9\.]+)[^0-9]*([0-9\.]+)[^0-9]*([0-9\.]+)[^0-9]*([0-9\.]+)?/).exec(colorS);
			if (mt) {
				rgb = { r: mt[1], g: mt[2], b: mt[3], a: mt[4] || 1.0 };
			}
		}
		return rgb;
	};
	
	return wink.ui.xy.CSpinner;
});