/*--------------------------------------------------------
 * Copyright (c) 2011, The Dojo Foundation
 * This software is distributed under the "Simplified BSD license",
 * the text of which is available at http://www.winktoolkit.org/licence.txt
 * or see the "license.txt" file for more details.
 *--------------------------------------------------------*/

/**
 * @fileOverview Implements a 2D Gesture recognition engine. 
 * Gesture recognition engine based on the $1 gesture recognition algorithm (Wobbrock, J.O., Wilson, A.D. and Li, Y. (2007). 
 * Gestures without libraries, toolkits or training: A $1 recognizer for user interface prototypes. 
 * Proceedings of the ACM Symposium on User Interface Software and Technology (UIST '07). Newport, Rhode Island (October 7-10, 2007). New York: ACM Press, pp. 159-168.). The user can define its own recognition templates (a template generator has been included in the test directory that will  allow ou to generate the templates from a mobile device)
 * 
 * @see http://depts.washington.edu/aimgroup/proj/dollar/
 * 
 * @compatibility Iphone OS2, Iphone OS3, Iphone OS4, Android 1.5, Android 2.1, Android 2.2, Android 2.3, Android 3.0, Android 3.1, BlackBerry 6, BlackBerry 7, Bada 1.0
 * 
 * @author Jerome GIRAUD
 */

/**
 * This event is fired when the recognition is done
 * 
 * @name wink.ux.GestureRecognizer#/gesturerecognizer/events/result
 * @event
 * @param {object} param The parameters object
 * @param {string} param.result the name of the template which has been recognized
 * @param {float} param.score The recognition score rate (from 0 to 1)
 */

define(['../../../_amd/core'], function(wink)
{
	/**
	 * @class  
	 * 
	 * Implements a 2D Gesture recognition engine. 
	 * Gesture recognition engine based on the $1 gesture recognition algorithm (Wobbrock, J.O., Wilson, A.D. and Li, Y. (2007). 
	 * Gestures without libraries, toolkits or training: A $1 recognizer for user interface prototypes. 
	 * Proceedings of the ACM Symposium on User Interface Software and Technology (UIST '07). Newport, Rhode Island (October 7-10, 2007). New York: ACM Press, pp. 159-168.). The user can define its own recognition templates (a template generator has been included in the test directory that will allow you to generate the templates from a mobile device)
	 * 
	 * @param {object} properties The properties object
	 * @param {HTMLElement} properties.node The dom node on which you want to listen for the recognition
	 * @param {array} properties.templates An array of objects. Each object contains the 'name' of the template and an array of 'points' describing the template
	 * @param {object} properties.gestureStartCallback A callback object containing a 'method' name and the 'context' of this method. This callback will be called when the user start touching the 'node' specified earlier
	 * @param {object} properties.gestureCallback A callback object containing a 'method' name and the 'context' of this method. This callback will be called when the user touches the 'node' specified earlier
	 * @param {object} properties.gestureEndCallback A callback object containing a 'method' name and the 'context' of this method. This callback will be called when the user stop touching the 'node' specified earlier
	 * 
	 * @example
	 * 
	 * var t0 = {'name': '0', 'points': new Array({x: 127, y: 141}, ...)};
	 * var t1 = {'name': '1', 'points': new Array({x: -125.03325130002096, y: 4.547473508864641e-12}, ...)};
	 * var t2 = {'name': '1', 'points': new Array({x: -125.48142255953155, y: 5.4569682106375694e-12}, ...)};
	 * var t3 = {'name': '2', 'points': new Array({x: -40.80771885140598, y: -2.842170943040401e-14}, ...)};
	 * var t4 = {'name': '2', 'points': new Array({x: -61.758600043770485, y: 0}, ...)};
	 * var t5 = {'name': '2', 'points': new Array({x: -130.42334210005822, y: 0}, ...)};
	 * var t6 = {'name': '3', 'points': new Array({x: -137.37766990687157, y: -5.684341886080802e-14}, ...)};
	 * var t7 = {'name': '3', 'points': new Array({x: -136.45115105405623, y: 0}, ...)};
	 * 
	 * var properties = 
	 * {
	 * 	'node': document,
	 * 	'templates': [t0, t1, t2, t3, t4, t5, t6, t7],
	 * 	'gestureStartCallback': 
	 * 	{
	 * 		'method': 'start',
	 * 		'context': null
	 * 	},
	 * 	'gestureCallback': 
	 * 	{
	 * 		'method': 'move',
	 * 		'context': null
	 * 	},
	 * 	'gestureEndCallback': 
	 * 	{
	 * 		'method': 'end',
	 * 		'context': null
	 * 	}
	 * };
	 * 
	 * recognizer = new wink.ux.GestureRecognizer(properties);
	 * 
	 * @see <a href="WINK_ROOT_URL/ux/gesturerecognizer/test/test_gesturerecognizer.html" target="_blank">Test page</a>
	 */
	wink.ux.GestureRecognizer = function(properties)
	{
		/**
		 * Unique identifier
		 * 
		 * @property uId
		 * @type integer
		 */
		this.uId                   = wink.getUId();
		
		this._properties           = properties;
		
		this._gestureStartCallback = null;
		this._gestureCallback      = null;
		this._gestureEndCallback   = null;
		
		this._points               = [];
		this._templates            = [];
		
		this._isDown               = false;
		
		this.numTemplates          = 8,
		this.numPoint              = 64,
		this.squareSize            = 250.0,
		this.origin                = {x: 0, y: 0},
		this.diagonal              = Math.sqrt(this.squareSize * this.squareSize + this.squareSize * this.squareSize),
		this.halfDiagonal          = 0.5 * this.diagonal,
		this.angleRange            = this.utils.deg2Rad(45.0),
		this.anglePrecision        = this.utils.deg2Rad(2.0),
		this.phi                   = 0.5 * (-1.0 + Math.sqrt(5.0));	
	
		this._domNode              = null;
		
		if ( this._validateProperties() ===  false )return;
	
		this._initProperties();
		this._initListeners();
	};
	
	wink.ux.GestureRecognizer.prototype =
	{
		/**
		 * Set of mathematic functions used by the Gesture recognition algorithm
		 * 
		 * @property utils
		 * @type object
		 */
		utils :
		{
			resample: function(points, n)
			{
				var I = this.pathLength(points) / (n - 1);
				var D = 0.0;
				var newpoints = new Array(points[0]);
				for (var i = 1; i < points.length; i++)
				{
					var d = this.distance(points[i - 1], points[i]);
					if ((D + d) >= I)
					{
						var qx = points[i - 1].x + ((I - D) / d) * (points[i].x - points[i - 1].x);
						var qy = points[i - 1].y + ((I - D) / d) * (points[i].y - points[i - 1].y);
						var q = {x: qx, y: qy};
						newpoints[newpoints.length] = q;
						points.splice(i, 0, q);
						D = 0.0;
					}
					else D += d;
				}
	
				if (newpoints.length == n - 1)
				{
					newpoints[newpoints.length] = {x: points[points.length - 1].x, y: points[points.length - 1].y};
				}
				
				return newpoints;
			},
			
			indicativeAngle: function(points)
			{
				var c = this.centroid(points);
				return Math.atan2(c.y - points[0].y, c.x - points[0].x);
			},
			
			rotateBy: function(points, radians)
			{
				var c = this.centroid(points);
				var cos = Math.cos(radians);
				var sin = Math.sin(radians);
				
				var newpoints = new Array();
				for (var i = 0; i < points.length; i++)
				{
					var qx = (points[i].x - c.x) * cos - (points[i].y - c.y) * sin + c.x;
					var qy = (points[i].x - c.x) * sin + (points[i].y - c.y) * cos + c.y;
					newpoints[newpoints.length] = {x: qx, y: qy};
				}
				return newpoints;
			},
			
			scaleTo: function(points, size)
			{
				var B = this.boundingBox(points);
				var newpoints = new Array();
				for (var i = 0; i < points.length; i++)
				{
					var qx = points[i].x * (size / B.width);
					var qy = points[i].y * (size / B.height);
					newpoints[newpoints.length] = {x: qx, y: qy};
				}
				return newpoints;
			},
			
			translateTo: function(points, pt)
			{
				var c = this.centroid(points);
				var newpoints = new Array();
				for (var i = 0; i < points.length; i++)
				{
					var qx = points[i].x + pt.x - c.x;
					var qy = points[i].y + pt.y - c.y;
					newpoints[newpoints.length] = {x: qx, y: qy};
				}
				return newpoints;
			},
			
			distanceAtBestAngle: function(points, T, a, b, threshold, phi)
			{
				var x1 = phi * a + (1.0 - phi) * b;
				var f1 = this.distanceAtAngle(points, T, x1);
				var x2 = (1.0 - phi) * a + phi * b;
				var f2 = this.distanceAtAngle(points, T, x2);
				
				while (Math.abs(b - a) > threshold)
				{
					if (f1 < f2)
					{
						b = x2;
						x2 = x1;
						f2 = f1;
						x1 = phi * a + (1.0 - phi) * b;
						f1 = this.distanceAtAngle(points, T, x1);
					}
					else
					{
						a = x1;
						x1 = x2;
						f1 = f2;
						x2 = (1.0 - phi) * a + phi * b;
						f2 = this.distanceAtAngle(points, T, x2);
					}
				}
				return Math.min(f1, f2);
			},
			
			distanceAtAngle: function(points, T, radians)
			{
				var newpoints = this.rotateBy(points, radians);
				return this.pathDistance(newpoints, T.points);
			},
			
			centroid: function(points)
			{
				var x = 0.0, y = 0.0;
				for (var i = 0; i < points.length; i++)
				{
					x += points[i].x;
					y += points[i].y;
				}
				x /= points.length;
				y /= points.length;
				return {x: x, y: y};
			},
			
			boundingBox: function(points)
			{
				var minx = +Infinity, maxx = -Infinity, miny = +Infinity, maxy = -Infinity;
				for (var i = 0; i < points.length; i++)
				{
					if (points[i].x < minx)
						minx = points[i].x;
					if (points[i].x > maxx)
						maxx = points[i].x;
					if (points[i].y < miny)
						miny = points[i].y;
					if (points[i].y > maxy)
						maxy = points[i].y;
				}
				return {x: minx, y: miny, width: maxx - minx, height: maxy - miny};
			},
			
			pathDistance: function(pts1, pts2)
			{
				var d = 0.0;
				for (var i = 0; i < pts1.length; i++) // assumes pts1.length == pts2.length
					d += this.distance(pts1[i], pts2[i]);
				return d / pts1.length;
			},
			
			pathLength: function(points)
			{
				var d = 0.0;
				for (var i = 1; i < points.length; i++)
					d += this.distance(points[i - 1], points[i]);
				return d;
			},
			
			distance: function(p1, p2)
			{
				var dx = p2.x - p1.x;
				var dy = p2.y - p1.y;
				return Math.sqrt(dx * dx + dy * dy);
			},
			
			deg2Rad: function(d)
			{ 
				return (d * Math.PI / 180.0);
			},
			
			rad2Deg: function(r)
			{
				return (r * 180.0 / Math.PI);
			}
		},
			
		/**
		 * the DOM node where to listen to for the gesture recognition
		 * 
		 * @returns {HTMLElement} The dom node
		 */
		getDomNode: function()
		{
			return this._domNode;
		},
		
		/**
		 * Listen to the start events
		 * 
		 * @param {wink.ux.Event} e The start event
		 */
		_touchStart: function(e)
		{
			var x = e.x;
	        var y = e.y;
	        
	        this._points.length = 1;
	        this._points[0] = {x: x, y: y};
	        
	        this._isDown = true;
	        
	        if ( this._gestureStartCallback != null )
			{
	        	wink.call(this._gestureStartCallback, e);	
			}
		},
		
		/**
		 * Listen to the move events
		 * 
		 * @param {wink.ux.Event} e The move event
		 */
		_touchMove: function(e)
		{
			var x = e.x;
	        var y = e.y;
			
			if (this._isDown)
			{
				this._points[this._points.length] = {x: x, y: y};
			}
			
			if ( this._gestureCallback != null )
			{
				wink.call(this._gestureCallback, e);
			}
		},
		
		/**
		 * Listen to the end events
		 * 
		 * @param {wink.ux.Event} e The end event
		 */
		_touchEnd: function(e)
		{
			if (this._isDown)
			{
				if (this._points.length >= 10)
				{
					var result = this._recognize(this._points);
	
					wink.publish('/gesturerecognizer/events/result', result);
				} else
				{
					wink.publish('/gesturerecognizer/events/result', {'result': null, 'score': 0});
				}
				
				this._isDown = false;
				
				if ( this._gestureEndCallback != null )
				{
					wink.call(this._gestureEndCallback, e);	
				}
			}
		},
		
		/**
		 * Add a new template to the templates list
		 * 
		 * @param {string} name The name of the template
		 * @param {array} points An array of GRPoints representing the shape
		 */
		_addTemplate: function(name, points)
		{
			var template = new this.Template(name, this.numPoint, this.squareSize, this.origin, points);
			this._templates.push(template);
		},
		
		/**
		 * Launch the recognition on all the captured points since the beginning of the movement
		 * 
		 * @param {array} points All the captured points since the beginning of the movement
		 */
		_recognize: function(points)
		{
			points = this.utils.resample(points, this.numPoint);
			var radians = this.utils.indicativeAngle(points);
			points = this.utils.rotateBy(points, -radians);
			points = this.utils.scaleTo(points, this.squareSize);
			points = this.utils.translateTo(points, this.origin);
			var b = +Infinity;
			var t = 0;
			for (var i = 0; i < this._templates.length; i++)
			{
				var d = this.utils.distanceAtBestAngle(points, this._templates[i], -this.angleRange, +this.angleRange, this.anglePrecision, this.phi);
				
				if (d < b)
				{
					b = d;
					t = i;
				}
			}
			
			var score = 1.0 - (b / this.halfDiagonal);
			
			return {'result': this._templates[t].name, 'score': score};
		},
		
		/**
		 * Initialize start, move and end listeners
		 */
		_initListeners: function()
		{
			wink.ux.touch.addListener(this._domNode, "start", { context: this, method: "_touchStart", arguments: null }, { preventDefault: true });
			wink.ux.touch.addListener(this._domNode, "move", { context: this, method: "_touchMove", arguments: null }, { preventDefault: true });
			wink.ux.touch.addListener(this._domNode, "end", { context: this, method: "_touchEnd", arguments: null }, { preventDefault: true });
		},
		
		/**
		 * Initialize the recognizer's properties
		 */
		_initProperties: function()
		{
			var l = this._properties.templates.length;
				
			for ( var i=0; i<l; i++)
			{
				this._addTemplate(this._properties.templates[i].name, this._properties.templates[i].points);
			}
			
			this.numTemplates = l;
			this._domNode = this._properties.node;
			
			if ( this._properties && this._properties.gestureStartCallback )
			{
				this._gestureStartCallback = this._properties.gestureStartCallback;
			}
			
			if ( this._properties && this._properties.gestureCallback)
			{
				this._gestureCallback = this._properties.gestureCallback;
			}
			
			if ( this._properties && this._properties.gestureEndCallback)
			{
				this._gestureEndCallback = this._properties.gestureEndCallback;
			}
		},
		
		/**
		 * Validate the properties of the component
		 * @returns {boolean} True if the properties are valid, false otherwise
		 */
		_validateProperties: function()
		{
			if ( wink.isUndefined(this._properties.templates) || !wink.isArray(this._properties.templates) )
			{
				wink.log('[GestureRecognizer] the templates must be defined and must be set in an array');
				return false;
			}
			
			if ( wink.isUndefined(this._properties.node))
			{	
				wink.log('[GestureRecognizer] The node property must be defined');
				return false;
			}
			
			if ( this._properties && this._properties.gestureStartCallback )
			{
				if ( !wink.isCallback(this._properties.gestureStartCallback) )
				{
					wink.log('[GestureRecognizer] Invalid gestureStartCallback');
					return false;
				}
			}
			
			if ( this._properties && this._properties.gestureCallback)
			{
				if ( !wink.isCallback(this._properties.gestureCallback) )
				{
					wink.log('[GestureRecognizer] Invalid gestureCallback');
					return false;
				}
			}
			
			if ( this._properties && this._properties.gestureEndCallback)
			{
				if ( !wink.isCallback(this._properties.gestureEndCallback) )
				{
					wink.log('[GestureRecognizer] Invalid gestureEndCallback');
					return false;
				}
			}
		},
		
		/**
		 * @class Representation of a recognition template
		 * @private
		 */
		Template: function (name, numPoint, squareSize, origin, points)
		{
			this.name   = name;
	
			this.points = wink.ux.GestureRecognizer.prototype.utils.resample(points, numPoint);
			var radians = wink.ux.GestureRecognizer.prototype.utils.indicativeAngle(this.points);
			this.points = wink.ux.GestureRecognizer.prototype.utils.rotateBy(this.points, -radians);
			this.points = wink.ux.GestureRecognizer.prototype.utils.scaleTo(this.points, squareSize);
			this.points = wink.ux.GestureRecognizer.prototype.utils.translateTo(this.points, origin);
		}
	};
	
	return wink.ux.GestureRecognizer;
});