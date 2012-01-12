/*--------------------------------------------------------
 * Copyright (c) 2011, The Dojo Foundation
 * This software is distributed under the "Simplified BSD license",
 * the text of which is available at http://www.winktoolkit.org/licence.txt
 * or see the "license.txt" file for more details.
 *--------------------------------------------------------*/

/**
 * @fileOverview Implements a Tag Cloud.
 * The tag cloud is a generic name for a graphical representation of a set of objects defined by user : the tags. 
 * The representation takes the form of a sphere or a circle in 3D. Each tag is an object containing at least one 
 * identifier of a node (the view) and a rating (how can impact be displayed).
 * The user can interact with the tag cloud rotating it around one or more axes, the depth and the rating has an 
 * impact when the size of the tag and makes the visual effect expected.
 *
 * @compatibility Iphone OS2 (slow), Iphone OS3, Iphone OS4, Android 2.1, Android 2.2, Android 2.3, Android 3.0, Android 3.1, BlackBerry 6, BlackBerry 7 (very slow), Bada 1.0 (slow)
 * 
 * @author Sylvain LALANDE
 */

/**
 * A tag selection
 * 
 * @name wink.ui.xyz.TagCloud#/tagcloud/events/selection
 * @event
 * @param {object} param The parameters object
 * @param {object} param.tag The selected tag object
 */

define(['../../../../_amd/core', '../../../../math/_geometric/js/geometric', '../../../../fx/_xyz/js/3dfx', '../../../../ux/movementtracker/js/movementtracker'], function(wink)
{
	/**
	 * @class Implements a Tag Cloud.
	 * The tag cloud is a generic name for a graphical representation of a set of objects defined by user : the tags. 
	 * The representation takes the form of a sphere or a circle in 3D. Each tag is an object containing at least one 
	 * identifier of a node (the view) and a rating (how can impact be displayed).
	 * The user can interact with the tag cloud rotating it around one or more axes, the depth and the rating has an 
	 * impact when the size of the tag and makes the visual effect expected.
	 * 
	 * 
	 * @param {object} properties The properties object
	 * @param {array} properties.tags The list of tags of the cloud
	 * @param {object} properties.tags.item A tag
	 * @param {string} properties.tags.item.id The id of the tag node
	 * @param {number} properties.tags.item.rating The tag rating
	 * @param {number} properties.size The radius size of the TagCloud (in pixel)
	 * @param {object} [properties.textColor] The text color value
	 * @param {integer} properties.textColor.r The red value
	 * @param {integer} properties.textColor.g The green value
	 * @param {integer} properties.textColor.b The blue value
	 * @param {object} [properties.selectedTextColor] The text color value for selected tag
	 * @param {integer} properties.selectedTextColor.r The red value
	 * @param {integer} properties.selectedTextColor.g The green value
	 * @param {integer} properties.selectedTextColor.b The blue value
	 * @param {object} [properties.scaleFactors] Factors (depth and rating) that influence the size of tags
	 * @param {float} properties.scaleFactors.ratioDepth The depth factor
	 * @param {float} properties.scaleFactors.ratioRating The rating factor
	 * @param {boolean} [properties.canMove=false] Indicates whether the user can move the TagCloud
	 * @param {boolean} [properties.canSelect=false] Indicates whether the user can select a tag in the TagCloud
	 * @param {string} [properties.axis] Rotation axis (x, y or xy)
	 * @param {number} [properties.shiftX=0] Shifts the tag cloud on x from the given value (in pixel)
	 * @param {number} [properties.shiftY=0] Shifts the tag cloud on y from the given value (in pixel)
	 * @param {object} [properties.asCircle] If specified, displays TagCloud as a Circle around specified axis
	 * @param {number} properties.asCircle.tilt The tilt value
	 * 
	 * @requires wink.ux.MovementTracker
	 * @requires wink.math._geometric
	 * @requires wink.math._matrix
	 * @requires wink.fx._xyz
	 * 
	 * @example
	 * 
	 * var properties = {
	 *   tags: [ { id: "tagNodeId1", rating: 56.6 }, { id: "tagNodeId2", 	rating: 93.4 } ],
	 *   size: 130,
	 *   textColor: { r: 100, g: 200, b: 255 },
	 *   selectedTextColor: { r: 230, g: 255, b: 170 },
	 *   scaleFactors : { ratioDepth: 0.6, ratioRating: 0.8 },
	 *   canMove: true,
	 *   canSelect: true,
	 *   axis: "xy"
	 * };
	 * var tagcloud = new wink.ui.xyz.TagCloud(properties);
	 * container.appendChild(tagcloud.getDomNode());
	 * 
	 * @see <a href="WINK_ROOT_URL/ui/xyz/tagcloud/test/test_tagcloud_1.html" target="_blank">Test page</a>
	 * @see <a href="WINK_ROOT_URL/ui/xyz/tagcloud/test/test_tagcloud_2.html" target="_blank">Test page (images)</a>
	 * @see <a href="WINK_ROOT_URL/ui/xyz/tagcloud/test/test_tagcloud_3.html" target="_blank">Test page (3d menu)</a>
	 * @see <a href="WINK_ROOT_URL/ui/xyz/tagcloud/test/test_tagcloud_4.html" target="_blank">Test page (3d menu images)</a>
	 * @see <a href="WINK_ROOT_URL/ui/xyz/tagcloud/test/test_tagcloud_5.html" target="_blank">Test page (vertical 3d menu)</a>
	 * 
	 */
	wink.ui.xyz.TagCloud = function(properties) 
	{
		/**
		 * Unique identifier
		 * 
		 * @property uId
		 * @type integer
		 */
		this.uId				= wink.getUId();
	
		/**
		 * The radius size of the TagCloud in pixel
		 * 
		 * @property size
		 * @type number
		 */
		this.size 				= null;
		
		/**
		 * The text color value
		 * 
		 * @property textColor
		 * @type object
		 */
		this.textColor 		    = null;
		
		/**
		 * The text color value for selected tag
		 * 
		 * @property selectedTextColor
		 * @type object
		 */
		this.selectedTextColor	= null;
		
		/**
		 * Factors (depth and rating) that influence the size of tags
		 * 
		 * @property scaleFactors
		 * @type object
		 */
		this.scaleFactors		= {
			ratioDepth: 0.6,
			ratioRating: 0.8
		};
		
		/**
		 * True if user can move the TagCloud
		 * 
		 * @property canMove
		 * @type boolean
		 */
		this.canMove			= false;
		
		/**
		 * True if user can select a tag in the TagCloud
		 * 
		 * @property canSelect
		 * @type boolean
		 */
		this.canSelect			= false;
		
		/**
		 * Rotation axis
		 * 
		 * @property axis
		 * @type string
		 */
		this.axis				= null;
		
		/**
		 * The original X shift
		 * 
		 * @property shiftX
		 * @type number
		 */
		this.shiftX				= 0;
		
		/**
		 * The original Y shift
		 * 
		 * @property shiftY
		 * @type number
		 */
		this.shiftY				= 0;
		
		/**
		 * If specified, displays TagCloud as a Circle around specified axis
		 * 
		 * @property asCircle
		 * @type object
		 */
		this.asCircle			= null;
		
		/**
		 * The list of tags of the cloud
		 * 
		 * @property tags
		 * @type array
		 */
		this.tags				= null;
		
		this._domNode 			= null;
		this._overNode 			= null;
		this._selectCoords		= null;
		this._selection 		= null;
		this._opacities 		= null;
		this._isCircle			= null;
		
		wink.mixin(this, properties);
		
		if (this._validateProperties() === false) return;
		
		this._initProperties();
		this._initDom();
		this._initListeners();
	};
	
	wink.ui.xyz.TagCloud.prototype = {
		_MAX_RATING: 100,
		_Z_INDEX_BACKGROUND: 5,
		_OPACITY_NOT_VISIBLE_FACE: 0.2,
		_OPACITY_VISIBLE_FACE: 0.98,
		_LIGHT_PI: wink.math.round(Math.PI, 3),
		_FRICTIONAL_FORCES: 0.5,
			
		/**
		 * @returns {HTMLElement} The TagCloud dom node
		 */
		getDomNode: function()
		{
			return this._domNode;
		},
		/**
		 * Set a new text color
		 * 
		 * @param {object} inColor The text color value
		 * @param {integer} inColor.r The red value
		 * @param {integer} inColor.g The green value
		 * @param {integer} inColor.b The blue value
		 * @param {object} inSelectedColor The text color value for selected tag
		 * @param {integer} inSelectedColor.r The red value
		 * @param {integer} inSelectedColor.g The green value
		 * @param {integer} inSelectedColor.b The blue value
		 */
		setTextColor: function(inColor, inSelectedColor)
		{
			if (!wink.isSet(inColor))
			{
				return;
			}
			if (!wink.isSet(inSelectedColor))
			{
				return;
			}
			this.textColor = inColor;
			this.selectedTextColor = inSelectedColor;
			this._updateTextColor();
		},
		/**
		 * Validate the properties of the component
		 * @returns {boolean} True if the properties are valid, false otherwise
		 */
		_validateProperties: function() 
		{
			if (!wink.isSet(this.tags))
			{
				this._raisePropertyError('tags');
				return false;
			}
			if (!wink.isSet(this.size))
			{
				this._raisePropertyError('size');
				return false;
			}
			return true;
		},
		/**
		 * Raise the property error
		 */
		_raisePropertyError: function(property)
		{
			wink.log('[TagCloud] Error: ' + property + ' missing or invalid');
		},
		/**
		 * Initialize datas with given properties
		 */
		_initProperties: function() 
		{
			if (!wink.isSet(this.asCircle) || !wink.isSet(this.asCircle.tilt))
			{
				this._isCircle = false;
			}
			else
			{
				this._isCircle = true;
			}
			
			// Opacity
			this._opacities = [];
	
			var minOpacity = this._OPACITY_NOT_VISIBLE_FACE;
			var opacityInterval = this._OPACITY_VISIBLE_FACE - minOpacity;
	
			var l = (this.size * 2) + 1, incOpacity = opacityInterval / (this.size * 2);
			for (var i = 0, opa = minOpacity; i < l; i++, opa += incOpacity)
			{
				this._opacities[i] = wink.math.round(opa, 2);
			}
			
			// Rating
			var i, l = this.tags.length;
			for (i = 0; i < l; i++)
			{
				var tagi = this.tags[i];
				if (tagi.rating < 0) {
					tagi.rating = 0;
				}
				else if (tagi.rating > this._MAX_RATING)
				{
					tagi.rating = this._MAX_RATING;
				}
				tagi.coeffRating = wink.math.round(this.scaleFactors.ratioRating * (tagi.rating / this._MAX_RATING), 2);
			}
		},
		/**
		 * Initialize the DOM nodes
		 */
		_initDom: function()
		{
			this._domNode = document.createElement('div');
			this._overNode = document.createElement('div');
			this._domNode.appendChild(this._overNode);
	
			var i, l = this.tags.length;
			for (i = 0; i < l; i++)
			{
				var tagi = this.tags[i];
				var tagNode = document.createElement('div');
				this._domNode.appendChild(tagNode);
				
				tagNode.style.position = "absolute";
				tagNode.appendChild($(tagi.id));
				
				tagi.tagNode = tagNode;
				tagi.colorOpacity = 1.0;
			}
	
			wink.fx.apply(this._domNode, {
				position: "absolute",
				width: "100%",
				height: "100%"
			});
			wink.fx.apply(this._overNode, {
				position: "absolute",
				width: "100%",
				height: "100%",
				"user-select": "none",
				zIndex: this._Z_INDEX_BACKGROUND
			});
	
			this._updateTextColor();
			
			this._initTransformations();
			this._slide(0.1, 0.1);
		},
		/**
		 * Initialize listeners
		 */
		_initListeners: function() 
		{
			if (this.canMove == true || this.canSelect == true)
			{
				this._movementtracker = new wink.ux.MovementTracker({ target: this._overNode });
				wink.subscribe('/movementtracker/events/mvtbegin', { context: this, method: '_handleMovementBegin' });
				wink.subscribe('/movementtracker/events/mvtchanged', { context: this, method: '_handleMovementChanged' });
				wink.subscribe('/movementtracker/events/mvtstored', { context: this, method: '_handleMovementStored' });
			}
		},
		/**
		 * Handles the movement start
		 * 
		 * @param {object} publishedInfos MovementTracker infos
		 * @see wink.ux.MovementTracker
		 */
		_handleMovementBegin: function(publishedInfos) 
		{
			var publisher = publishedInfos.publisher;
			if (publisher.uId != this._movementtracker.uId)
			{
				return;
			}
			
			this._dragging = false;
			
			if (this.canSelect == true)
			{
				var movement = publishedInfos.movement;
				var firstPoint = movement.pointStatement[0];
				var absPos = this._overNode.getPosition(null, true);
				this._selectCoords = { x: (firstPoint.x - absPos.x), y: (firstPoint.y - absPos.y) };
			}
		},
		/**
		 * Handles the movement updates.
		 * 
		 * @param {object} publishedInfos MovementTracker infos
		 * @see wink.ux.MovementTracker
		 */
		_handleMovementChanged: function(publishedInfos) 
		{
			var publisher = publishedInfos.publisher;
			if (publisher.uId != this._movementtracker.uId)
			{
				return;
			}
			
			if (this.canMove == true)
			{
				var movement = publishedInfos.movement;
				var firstPoint = movement.pointStatement[movement.pointStatement.length - 2];
				var lastPoint = movement.pointStatement[movement.pointStatement.length - 1];
				
				var dx = lastPoint.x - firstPoint.x;
				var dy = lastPoint.y - firstPoint.y;
				
				var angleX = wink.math.getAngle(this.size, dx);
				if (dx < 0) {
					angleX = -angleX;
				}
				var angleY = wink.math.getAngle(this.size, dy);
				if (dy < 0) {
					angleY = -angleY;
				}
				this._dragging = true;
				this._slide(angleX, angleY);
			}
		},
		/**
		 * Handles the movement end
		 * 
		 * @param {object} publishedInfos MovementTracker infos
		 * @see wink.ux.MovementTracker
		 */
		_handleMovementStored: function(publishedInfos)
		{
			var publisher = publishedInfos.publisher;
			if (publisher.uId != this._movementtracker.uId)
			{
				return;
			}
			if (this._dragging == false && this.canSelect == true)
			{
				this._handleChoice(this._selectCoords.x, this._selectCoords.y);
			}
		},
		/**
		 * Slide the Tag Cloud - rotate it by the given angles
		 * 
		 * @param {float} angleX angle on x
		 * @param {float} angleY angle on y
		 */
		_slide: function(angleX, angleY)
		{
			this._updateAngles(angleX, angleY);
			this._updateCoords();
			this._updateOpacity();
			this._updateTextSize();
			this._applyTransformations();
		},
		/**
		 * Update the opacity that depends on z-position
		 */
		_updateOpacity: function()
		{
			var i, l = this.tags.length;
			for (i = 0; i < l; i++)
			{
				var tagi = this.tags[i];
				var zPosition = wink.math.round(tagi.coords.z + this.size, 0);
				var opacity = this._opacities[zPosition];
				if (!wink.isSet(opacity)) {
					wink.log("[TagCloud] warn: opacity not defined for z-position " + zPosition);
				}
				tagi.colorOpacity = opacity;
			}
		},
		/**
		 * Update the text size that depends on z-position
		 */
		_updateTextSize: function()
		{
			var i, l = this.tags.length;
			for (i = 0; i < l; i++)
			{
				var tagi = this.tags[i];
				var zPosition = wink.math.round(tagi.coords.z + this.size, 0);
				tagi.coeffDepth = wink.math.round(this.scaleFactors.ratioDepth * (zPosition / (this.size * 2)), 2);
				tagi.coeffScale = (tagi.coeffDepth + tagi.coeffRating);
			}
		},
		/**
		 * Update the angles on X and Y
		 * 
		 * @param {float} angleX angle on x
		 * @param {float} angleY angle on y
		 */
		_updateAngles: function(angleX, angleY)
		{
			this._angleX = wink.math.round(((angleX * this._FRICTIONAL_FORCES)) % (this._LIGHT_PI * 2), 3);
			this._angleY = wink.math.round(((angleY * this._FRICTIONAL_FORCES)) % (this._LIGHT_PI * 2), 3);
		},
		/**
		 * Update the elements coordinates with the new rotation
		 */
		_updateCoords: function()
		{
			var i, l = this.tags.length;
			for (i = 0; i < l; i++)
			{
				var tagi = this.tags[i];
				var pointI = [ tagi.coords.x, tagi.coords.y, tagi.coords.z ];
	
				var matrixRotationX = wink.math.createTransformMatrix();
	
				if (this.axis == "x" || this.axis == "xy")
				{
					matrixRotationX.rotateAxisAngle(1, 0, 0, wink.math.radToDeg(this._angleY));
				}
				
				var matrixRotationY = wink.math.createTransformMatrix();
				if (this.axis == "y" || this.axis == "xy")
				{
					matrixRotationY.rotateAxisAngle(0, 1, 0, wink.math.radToDeg(-this._angleX));
				}
					
				var pointIRotX = wink.math.multiplyMatrixVector(matrixRotationX.getValues(), pointI);
				var pointIRotY = wink.math.multiplyMatrixVector(matrixRotationY.getValues(), pointIRotX);
				var pointIRot = pointIRotY;
	
				var x = pointIRot[0];
				var y = pointIRot[1];
				var z = pointIRot[2];
				
				if (this._isCircle)
				{
					if (this.axis == "x")
					{
						x = pointIRot[2] * -this.asCircle.tilt;
					}
					else
					{
						y = pointIRot[2] * this.asCircle.tilt;
					}
				}
				tagi.coords = { x : x, y : y, z : z };
			}
		},
		/**
		 * Apply transformation to the tags
		 */
		_applyTransformations: function()
		{
			var i, l = this.tags.length;
			for (i = 0; i < l; i++)
			{
				var tagi = this.tags[i];
				wink.fx.setTransformPart(tagi.tagNode, 1, { type: "scale", x: tagi.coeffScale, y: tagi.coeffScale, z: 1 });
				wink.fx.setTransformPart(tagi.tagNode, 2, { type: "translate", x: tagi.coords.x, y: tagi.coords.y, z: tagi.coords.z });
				wink.fx.applyComposedTransform(tagi.tagNode);
			}
			this._updateTextColor();
		},
		/**
		 * Handles the user choice from given point coordinates
		 * 
		 * @param {float} x x coordinates
		 * @param {float} y y coordinates
		 */
		_handleChoice: function(x, y)
		{
			this._selection = null;
			var nearestFaceIndex = this._getNearestFaceIndex(x, y);
			if (nearestFaceIndex != null) {
				this._selection = this.tags[nearestFaceIndex].tagNode;
				var tag = this.tags[nearestFaceIndex];
				
				this._updateTextColor();
				wink.publish("/tagcloud/events/selection", {
					tag: tag
				});
			}
		},
		/**
		 * Returns the nearest face index from given point coordinates
		 * 
		 * @param {float} x x coordinates
		 * @param {float} y y coordinates
		 */
		_getNearestFaceIndex: function(x, y)
		{
			var nearestFaceIndex = null;
			var matchFaces = [];
	
			var i, l = this.tags.length;
			for (i = 0; i < l; i++)
			{
				var tagi = this.tags[i];
				var pointSizeX = tagi.tagNode.offsetWidth;
				var pointSizeY = tagi.tagNode.offsetHeight;
				
				var shiftScaleX = (pointSizeX * tagi.coeffScale) - pointSizeX;
				var shiftScaleY = (pointSizeY * tagi.coeffScale) - pointSizeY;
	
				var xCoord = tagi.coords.x;
				var yCoord = tagi.coords.y;
	
				var xmin = xCoord + this.size + this.shiftX - (shiftScaleX / 2);
				var ymin = yCoord + this.size + this.shiftY - (shiftScaleY / 2);
				var xmax = xmin + pointSizeX + shiftScaleX;
				var ymax = ymin + pointSizeY + shiftScaleY;
	
				var xMatch = (x > xmin) && (x < xmax);
				var yMatch = (y > ymin) && (y < ymax);
				if (xMatch && yMatch)
				{
					matchFaces.push(i);
				}
			}
			var nearestZCoord = -this.size;
			for ( var i = 0; i < matchFaces.length; i++) {
				var index = matchFaces[i];
				var zCoord = this.tags[index].coords.z;
				if (zCoord > nearestZCoord) {
					nearestZCoord = zCoord;
					nearestFaceIndex = index;
				}
			}
			return nearestFaceIndex;
		},
		/**
		 * Init elements transformations
		 */
		_initTransformations: function()
		{
			// Evenly distributed tags on sphere
			var radius = this.size;
			var deltaLong = wink.math.round(this._LIGHT_PI * (3 - Math.sqrt(5)), 2);
			var dz = 2 / this.tags.length;
			var dc = 2 * Math.PI / this.tags.length;
			
			var l = this.tags.length;
			for (var i = 0, dist = 0, z = 1 - (dz / 2); i < l; i++, dist += deltaLong, z = z - dz)
			{
				var tagi = this.tags[i];
				if (this._isCircle)
				{
					var phi = 0;
					var theta = 0;
					
					if (this.axis == "x")
					{
						phi = dc * i;
						theta = Math.PI / 2;
					}
					else
					{
						phi = (dc * i) + (Math.PI / 2);
					}
					
					var trX = radius * Math.cos(theta) * Math.cos(phi);
					var trY = radius * Math.cos(phi) * Math.sin(theta);
					var trZ = radius * Math.sin(phi);
					
					tagi.coords = { x : trX, y : trY, z : trZ };
				}
				else
				{
					var r = radius * Math.sqrt(1 - (z * z));
					tagi.coords = { x : Math.cos(dist) * r, y : Math.sin(dist) * r, z : z * radius };
				}
				
				wink.fx.initComposedTransform(tagi.tagNode);
			}
	
			wink.fx.set3dTransform(this._domNode, { type: "translate", x: this.size + this.shiftX, y: this.size + this.shiftY, z: 0 });
			wink.fx.set3dTransform(this._overNode, { type: "translate", x: -this.size - this.shiftX, y: -this.size - this.shiftY, z: this.size });
		},
		/**
		 * Update the text color
		 */
		_updateTextColor: function()
		{
			if (wink.isSet(this.textColor))
			{
				var c = this.textColor;
				var i, l = this.tags.length;
				for (i = 0; i < l; i++)
				{
					var tagi = this.tags[i];
					tagi.tagNode.style.color = "rgba(" + c.r + ", " + c.g + ", " + c.b + ", " + tagi.colorOpacity + ")";
				}
			}
			
			if (this._selection != null && wink.isSet(this.selectedTextColor))
			{
				var sc = this.selectedTextColor;
				this._selection.style.color = "rgba(" + sc.r + ", " + sc.g + ", " + sc.b + ", 1)";
			}
		}
	};
	
	return wink.ui.xyz.TagCloud;
});