/*--------------------------------------------------------
 * Copyright (c) 2011, The Dojo Foundation
 * This software is distributed under the "Simplified BSD license",
 * the text of which is available at http://www.winktoolkit.org/licence.txt
 * or see the "license.txt" file for more details.
 *--------------------------------------------------------*/

/**
 * @fileOverview Implements a Cover Flow. 
 * The Cover Flow allows the user to browse a list of items ; each item consisting of an image, and perhaps a title, a rear face or an action to invoke when it is selected.
 * It is developed to be as flexible and configurable as possible, so the user can enable or disable some graphical options to adapt visual rendering.
 * The user must pay attention to the fact that the parameters significantly affect performance (number of covers, reflected and displayTitle especially).
 * Developed to be as flexible and configurable as possible.
 *
 * @compatibility Iphone OS2 (slow), Iphone OS3, Iphone OS4, BlackBerry 7 (partial)
 * 
 * @author Sylvain LALANDE
 */
define(['../../../../_amd/core', '../../../../math/_geometric/js/geometric', '../../../../fx/_xyz/js/3dfx', '../../../../ux/movementtracker/js/movementtracker', '../../../../ux/gesture/js/gesture', '../../../../ux/window/js/window'], function(wink)
{
	/**
	 * @class Implements a Cover Flow. The Cover Flow allows the user to browse a list of items ; each item consisting of an image, and perhaps a title, a rear face or an action to invoke when it is selected.
	 * It is developed to be as flexible and configurable as possible, so the user can enable or disable some graphical options to adapt visual rendering.
	 * The user must pay attention to the fact that the parameters significantly affect performance (number of covers, reflected and displayTitle especially).
	 * Developed to be as flexible and configurable as possible.
	 * 
	 * @param {object} properties The properties object
	 * @param {array} properties.covers An array of covers
	 * @param {object} properties.covers.item A cover
	 * @param {string} properties.covers.item.image URL of the cover image
	 * @param {string} [properties.covers.item.title] The id of the title node that will appear below image (mandatory if "displayTitle" is set to true)
	 * @param {string} [properties.covers.item.backFaceId] The id of the backface node that will appear when selecting a cover (if no action is specified)
	 * @param {object} [properties.covers.item.action] The callback action that will be invoked when selecting a cover
	 * @param {integer} properties.size The component size
	 * @param {integer} [properties.position=middle] The initial selected cover
	 * @param {integer} properties.viewportWidth The width of the viewport (viewable area)
	 * @param {boolean} properties.reflected Indicates if reflection must be displayed
	 * @param {boolean} properties.displayTitle Indicates if title must be displayed
	 * @param {boolean} [properties.fadeEdges=false] Indicates if fade along the component edges must be displayed
	 * @param {boolean} properties.handleOrientationChange Indicates if the component must resized itself automatically if orientation has changed
	 * @param {boolean} properties.handleGesture Indicates if gestures must be handled to rotate the Cover Flow on x-axis
	 * @param {object} properties.backgroundColor The background color value
	 * @param {object} properties.backgroundColor.r Red value
	 * @param {object} properties.backgroundColor.g Green value
	 * @param {object} properties.backgroundColor.b Blue value
	 * @param {integer} [properties.coverSpacing] The spacing between covers
	 * @param {integer} [properties.displayTitleDuration=0] The duration in millisecond of the title display
	 * @param {integer} [properties.borderSize=0] The cover shaded border size
	 * 
	 * @requires wink.math._geometric
	 * @requires wink.math._matrix
	 * @requires wink.fx._xyz
	 * @requires wink.ux.MovementTracker
	 * @requires wink.ux.gesture
	 * @requires wink.ux.window
	 * 
	 * @example
	 * 
	 * var properties = {
	 *   covers: covers,
	 *   size: 300,
	 *   viewportWidth: 320,
	 *   reflected: true,
	 *   displayTitle: true,
	 *   fadeEdges: true,
	 *   handleOrientationChange: true,
	 *   handleGesture: true,
	 *   backgroundColor: { r: 25, g: 25, b: 25 },
	 *   coverSpacing: 40,
	 *   displayTitleDuration: 0,
	 *   borderSize: 2
	 * };
	 * var coverflow = new wink.ui.xyz.CoverFlow(properties);
	 * container.appendChild(coverflow.getDomNode());
	 * 
	 * @see <a href="WINK_ROOT_URL/ui/xyz/coverflow/test/test_coverflow_1.html" target="_blank">Test page</a>
	 * @see <a href="WINK_ROOT_URL/ui/xyz/coverflow/test/test_coverflow_2.html" target="_blank">Test page (numerical)</a>
	 * 
	 */
	wink.ui.xyz.CoverFlow = function(properties) {
		/**
		 * Unique identifier
		 * 
		 * @property uId
		 * @type integer
		 */
		this.uId				     = wink.getUId();
		
		/**
		 * The list of covers
		 * 
		 * @property covers
		 * @type array
		 */
		this.covers			         = null;
		
		/**
		 * The background color of the coverflow
		 * 
		 * @property backgroundColor
		 * @type object
		 */
		this.backgroundColor	     = null;
		
		/**
		 * Whether reflection is displayed
		 * 
		 * @property reflected
		 * @type boolean
		 */
		this.reflected			     = false;
		
		/**
		 * Whether a title is displayed for each cover
		 * 
		 * @property displayTitle
		 * @type boolean
		 */
		this.displayTitle		     = false;
		
		/**
		 * Whether the coverflow edges are faded
		 * 
		 * @property fadeEdges
		 * @type boolean
		 */
		this.fadeEdges			     = false;
		
		/**
		 * The coverflow size
		 * 
		 * @property size
		 * @type integer
		 */
		this.size				     = 0;
		
		/**
		 * The width of the viewport
		 * 
		 * @property viewportWidth
		 * @type integer
		 */
		this.viewportWidth		     = null;
		
		/**
		 * Whether the coverflow can be rotated
		 * 
		 * @property handleGesture
		 * @type boolean
		 */
		this.handleGesture		     = false;
		
		/**
		 * Whether the coverflow is automatically resized on orientation changes
		 * 
		 * @property handleOrientationChange
		 * @type boolean
		 */
		this.handleOrientationChange = false;
		
		/**
		 * Spacing between covers
		 * 
		 * @property coverSpacing
		 * @type integer
		 */
		this.coverSpacing		     = null;
		
		/**
		 * How long it takes the title to be displayed
		 * 
		 * @property displayTitleDuration
		 * @type integer
		 */
		this.displayTitleDuration    = 0;
		
		/**
		 * The covers border size
		 * 
		 * @property borderSize
		 * @type integer
		 */
		this.borderSize		         = 0;
		
		this._domNode				 = null;
		this._trayNode				 = null;
		this._gestureNode			 = null;
		this._faderLeft				 = null;
		this._faderRight			 = null;
		this._movementtracker 		 = null;
		this._positions				 = null;
		this._transformations		 = null;
		this._transformsQueue		 = null;
		this._renderer				 = null;
		this._middleViewIndex		 = null;
		this._lastRenderedIndex 	 = null;
		this._timerTitle			 = null;
		
		this._dragging				 = false;
		this._displayMode			 = false;
		this._flipping				 = false;
		
		this._view 					 = {
			x: 0,
			sizeX: 0,
			shiftX: 25,
			shiftFromMiddle: 200,
			coverRotation: 55,
			coverScale: 0.28,
			zMiddleCover: 175,
			zAroundCover: 0,
			numberOfCoverToRender: 5,
			distanceToCenter: 0,
			distanceFromTop: 0,
			zGestureNode: 1000,
			observerRotation: 0,
			currentObserverRotation: 0
		};
		
		wink.mixin(this, properties);
		
		if (this._validateProperties() === false) return;
		
		this._initProperties();
		this._initDom();
		this._initListeners();
	};
	
	wink.ui.xyz.CoverFlow.prototype = {
		_Z_INDEX_BACKGROUND: 5,
		_DURATION_BACKTO_BOUND: 200,
		_DURATION_MIDDLE: 600,
		_DURATION_AROUND: 300,
		_DURATION_FLIP: 1000,
		_TRANSITION_FUNC: 'default',
		_OUTOFBOUND_FRICTIONAL_FORCES: 4,
		_RENDERER_INTERVAL: 15,
		_DELAY_BEFORE_IMAGE_LOADING: 50,
		_PERSPECTIVE: 500,
		_REFLECTION_ATTENUATION: 0.6,
		_DELAY_FOR_TITLE_DISPLAY: 400,
			
		/**
		 * @returns {HTMLElement} The Cover Flow dom node
		 */
		getDomNode: function()
		{
			return this._domNode;
		},
		/**
		 * Updates the component sizes
		 * 
		 * @param {integer} size The component size
		 * @param {integer} viewportWidth The width of the viewport (viewable area)
		 */
		updateSize: function(size, viewportWidth)
		{
			this.size = size;
			this.viewportWidth = viewportWidth;
			var v = this._view;
			
			// View
			var ratioShift = 0.07;
			if (wink.isSet(this.coverSpacing))
			{
				ratioShift = (this.coverSpacing * 0.003);
			}
			v.shiftX  = ratioShift * size;
			this._positions 		= [];
			var i, cvs = this.covers, l = cvs.length;
			for (i = 0; i < l; i++)
			{
				this._positions[i] = (v.shiftX * i);
			}
			v.sizeX = this._positions[l - 1];
			v.shiftFromMiddle = 0.7 * size;
			
			var ratioTraySize = Math.max((viewportWidth / size) - 1, 0);
			v.distanceToCenter = ratioTraySize * (size / 2);
			v.distanceFromTop = size * (v.coverScale / 1.5);
			
			// DOM
			var viewWidth = size * (1 + ratioTraySize);
			var viewWidthPx = viewWidth + "px";
			var sizePx = size + "px";
			
			wink.fx.apply(this._domNode, {
				width: viewWidthPx,
				height: sizePx
			});
			wink.fx.apply(this._trayNode, {
				width: viewWidthPx,
				height: sizePx
			});
			wink.fx.apply(this._gestureNode, {
				width: viewWidthPx,
				height: sizePx
			});
			
			for (i = 0; i < l; i++)
			{
				var c = cvs[i];
				
				wink.fx.apply(c.coverNode, {
					width: sizePx,
					height: sizePx
				});
				wink.fx.apply(c.coverInnerNode, {
					width: sizePx,
					height: sizePx
				});
				wink.fx.apply(c.imageNode, {
					width: sizePx,
					height: sizePx
				});
				wink.fx.apply(c.coverReflection, {
					width: sizePx
				});
				
				if (this.reflected)
				{
					wink.fx.apply(c.coverReflectionBack, {
						width: sizePx,
						height: this._REFLECTION_ATTENUATION * size + "px"
					});
				}
				if (this.displayTitle)
				{
					wink.fx.apply(c.titleNode, {
						width: sizePx
					});
				}
			}
			
			if (this.fadeEdges)
			{
				var fl = this._faderLeft, fr = this._faderRight;
				var faderWidth		= viewportWidth / 15;
				fl.width			= faderWidth;
				fl.height			= size;
				fr.width			= faderWidth;
				fr.height			= size;
				fr.style.left		= viewWidth - faderWidth + 1 + "px";
				this._updateEdgeFaders();
			}
	
			// Transform
			this._createTransformations();
			this._initTransformations();
			this._slideTo(this._positions[this._currentPosition], true);
		},
		/**
		 * Updates the background color
		 * 
		 * @param {object} color The background color value
		 * @param {integer} color.r red Value
		 * @param {integer} color.g green Value
		 * @param {integer} color.b blue Value
		 */
		setBackgroundColor: function(color)
		{
			var bg = this.backgroundColor = color;
			var bs = this.borderSize;
	
			var inverseColor = {
				r: (255 - bg.r),
				g: (255 - bg.g),
				b: (255 - bg.b)
			};
			var rgbaBg = "rgba(" + bg.r + ", " + bg.g + ", " + bg.b + ", 1.0)";
			
			this._domNode.style.backgroundColor = rgbaBg;
			//this._gestureNode.style.opacity = 0.0;
			
			var coverShadow = bs + "px -" + bs + "px 6px rgba(" + inverseColor.r + ", " + inverseColor.g + ", " + inverseColor.b + ", 0.5)";
			
			var i, cvs = this.covers, l = cvs.length;
			for (i = 0; i < l; i++)
			{
				var c = cvs[i];
				if (this.reflected)
				{
					c.coverReflectionBack.style.backgroundColor = rgbaBg;
				}
				if (wink.isSet(bs) && bs > 0)
				{
					wink.fx.apply(c.imageNode, { 
						"box-shadow": coverShadow
					});
				}
			}
			
			if (this.fadeEdges)
			{
				this._updateEdgeFaders();
			}
		},
		/**
		 * Get current position
		 * 
		 * @returns {integer} the current position
		 */
		getPosition: function()
		{
			return this._currentPosition;
		},
		/**
		 * Set position
		 * 
		 * @param {integer} pos The position to set
		 */
		setPosition: function(pos)
		{
			this._slideTo(this._positions[pos], true);
		},
		/**
		 * Validate the properties of the component
		 * @returns {boolean} True if the properties are valid, false otherwise
		 */
		_validateProperties: function() 
		{
			var toSpecify = function(property) {
				wink.log('[CoverFlow] Error: ' + property + ' property must be specified');
			};
			var logError = function(error) {
				wink.log('[CoverFlow] Error: ' + error);
			};
			
			if (!wink.isSet(this.covers) || this.covers.length == 0)
			{
				logError('covers property must be specified with at least one cover');
				return false;
			}
			if (!wink.isSet(this.size))
			{
				toSpecify('size');
				return false;
			}
			if (wink.isSet(this.position) && (this.position < 0 || this.position > (this.covers.length - 1)))
			{
				logError('bad position');
				return false;
			}
			if (!wink.isSet(this.viewportWidth))
			{
				toSpecify('viewportWidth');
				return false;
			}
			if (!wink.isSet(this.backgroundColor))
			{
				toSpecify('backgroundColor');
				return false;
			}
			if (!wink.isSet(this.backgroundColor.r) 
				|| !wink.isSet(this.backgroundColor.g)
				|| !wink.isSet(this.backgroundColor.b)) {
				logError('backgroundColor property must be specified with "r, g, b" values');
				return false;
			}
			if (!wink.isSet(this.reflected))
			{
				toSpecify('reflected');
				return false;
			}
			if (!wink.isSet(this.displayTitle))
			{
				toSpecify('displayTitle');
				return false;
			}
			if (!wink.isSet(this.handleOrientationChange))
			{
				toSpecify('handleOrientationChange');
				return false;
			}
			if (!wink.isSet(this.handleGesture))
			{
				toSpecify('handleGesture');
				return false;
			}
			
			var i, cvs = this.covers, l = cvs.length;
			for (i = 0; i < l; i++)
			{
				if (!this._isValidCover(cvs[i]))
				{
					logError('bad cover structure');
					return false;
				}
			}
			return true;
		},
		/**
		 * Check if the given cover is valid.
		 * 
		 * @param {object} cover The cover to check
		 */
		_isValidCover: function(cover)
		{
			var isValid = true;
			isValid = isValid && wink.isSet(cover);
			isValid = isValid && wink.isSet(cover.image);
			isValid = isValid && wink.isSet(cover.title);
			return isValid;
		},
		/**
		 * Initialize datas with given properties
		 */
		_initProperties: function() 
		{
			var pos = this.position;
			if (pos !== 0 && !pos) {
				pos = Math.floor(this.covers.length / 2);
			}
			this._currentPosition 			= pos;
			this._view.x					= 0;
			this._middleViewIndex 			= Math.floor(this._view.numberOfCoverToRender / 2);
			this._lastRenderedIndex			= this._currentPosition;
			this._transformsQueue			= [];
	
			if (this.handleOrientationChange === true)
			{
				wink.subscribe('/window/events/orientationchange', { context: this, method: '_onOrientationChange' });
			}
		},
		/**
		 * Initialize the DOM nodes
		 */
		_initDom: function()
		{
			var dn = this._domNode = document.createElement('div');
			wink.fx.apply(dn, {
				"user-select": "none"
			});
			
			var tn = this._trayNode = document.createElement('div');
			tn.style.position = "absolute";
			dn.appendChild(tn);
			
			wink.fx.apply(tn, {
				"transform-style": "preserve-3d"
			});
			
			var gn = this._gestureNode = document.createElement('div');
			gn.style.position = "absolute";
			dn.appendChild(gn);
			
			var i, cvs = this.covers, l = cvs.length;
			for (i = 0; i < l; i++)
			{
				var c = cvs[i];
				var coverNode = document.createElement('div');
				var coverOutlineNode = document.createElement('div');
				var coverInnerNode = document.createElement('div');
				var imageNode = document.createElement('img');
				var coverReflection = document.createElement('div');
				
				coverInnerNode.appendChild(imageNode);
				coverInnerNode.appendChild(coverReflection);
				coverOutlineNode.appendChild(coverInnerNode);
				coverNode.appendChild(coverOutlineNode);
				tn.appendChild(coverNode);
				
				coverNode.style.position = "absolute";
				coverInnerNode.style.position = "absolute";
				
				c.coverNode 		= coverNode;
				c.coverOutlineNode 	= coverOutlineNode;
				c.coverInnerNode 	= coverInnerNode;
				c.imageNode 		= imageNode;
				c.coverReflection 	= coverReflection;
				
				c.transformation 	= null;
				c.diffTransform		= true;
				c.displayed 		= false;
				
				if (this.reflected)
				{
					var coverReflectionFront = document.createElement('canvas');
					var coverReflectionBack = document.createElement('div');
					coverReflection.appendChild(coverReflectionFront);
					coverReflection.appendChild(coverReflectionBack);
					coverReflectionFront.style.position = "absolute";
					coverReflectionBack.style.position = "absolute";
					
					c.coverReflectionFront = coverReflectionFront;
					c.coverReflectionBack	= coverReflectionBack;
				}
				if (this.displayTitle)
				{
					var titleNode = document.createElement('div');
					coverReflection.appendChild(titleNode);
					titleNode.style.position = "absolute";
					//titleNode.style.textAlign = "center";
					var titleInnerNode = $(c.title);
					titleNode.appendChild(titleInnerNode);
					
					c.titleNode = titleNode;
					c.titleInnerNode = titleInnerNode;
				}
	
				wink.fx.apply(c.coverNode, {
					"perspective": this._PERSPECTIVE,
					"transform-style": "preserve-3d"
				});
				wink.fx.apply(c.coverOutlineNode, {
					"transform-style": "preserve-3d"
				});
			}
			
			if (this.fadeEdges)
			{
				var fl = this._faderLeft = document.createElement('canvas');
				var fr = this._faderRight = document.createElement('canvas');
				dn.appendChild(fl);
				dn.appendChild(fr);
				fl.style.position = "absolute";
				fr.style.position = "absolute";
			}
			
			this._hideBackFaces();
			this._organizeDepth();
			this.updateSize(this.size, this.viewportWidth);
			this.setBackgroundColor(this.backgroundColor);		
			wink.setTimeout(this, "_setImages", this._DELAY_BEFORE_IMAGE_LOADING);
		},
		/**
		 * Initialize listeners
		 */
		_initListeners: function() 
		{
			this._movementtracker = new wink.ux.MovementTracker({ target: this._gestureNode });
			wink.subscribe('/movementtracker/events/mvtbegin', { context: this, method: '_handleMovementBegin' });
			wink.subscribe('/movementtracker/events/mvtchanged', { context: this, method: '_handleMovementChanged' });
			wink.subscribe('/movementtracker/events/mvtstored', { context: this, method: '_handleMovementStored' });
			
			if (this.handleGesture)
			{
				this._gestureNode.listenToGesture(
					"instant_rotation", 
					{ context: this, method: "_handleRotation", arguments: null }, 
					{ preventDefault: true }
				);
				this._gestureNode.listenToGesture(
					"gesture_end", 
					{ context: this, method: "_handleGestureEnd", arguments: null }, 
					{ preventDefault: true }
				);
			}
		},
		/**
		 * Handle the rotation Gesture that impacts the Cover Flow rotation on x-axis
		 * 
		 * @param {object} gestureInfos Gesture infos
		 * @see wink.ux.gesture
		 */
		_handleRotation: function(gestureInfos)
		{
			if (this._displayMode == false)
			{
				var v = this._view;
				var targetedRotation = v.observerRotation + gestureInfos.rotation;
				if (targetedRotation > 17 || targetedRotation < -70)
				{
					return;
				}
				v.currentObserverRotation = targetedRotation;
				var i, cvs = this.covers, l = cvs.length;
				for (i = 0; i < l; i++)
				{
					var c = cvs[i];
					wink.fx.setTransformPart(c.coverOutlineNode, 3, { type: "rotate", x: 1, y: 0, z: 0, angle: v.currentObserverRotation });
					wink.fx.applyComposedTransform(c.coverOutlineNode);
				}
			}
		},
		/**
		 * Handle the end of the Gesture
		 * 
		 * @param {object} gestureInfos Gesture infos
		 * @see wink.ux.gesture
		 */
		_handleGestureEnd: function(gestureInfos)
		{
			if (this._displayMode == false)
			{
				this._view.observerRotation = this._view.currentObserverRotation;
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
			if (this._displayMode)
			{
				return;
			}
			
			var movement = publishedInfos.movement;
			
			var beforeLastPoint = movement.pointStatement[movement.pointStatement.length - 2];
			var lastPoint = movement.pointStatement[movement.pointStatement.length - 1];
			
			var dx = lastPoint.x - beforeLastPoint.x;
			dx /= 2;
			
			var boundsInfos = this._getBoundsInfos(this._view.x);
			if (boundsInfos.outsideOfBounds) {
				if ( (boundsInfos.direction > 0 && lastPoint.directionX > 0)
					|| (boundsInfos.direction < 0 && lastPoint.directionX < 0) ) {
					dx /= this._OUTOFBOUND_FRICTIONAL_FORCES;
				}
			}
			
			this._dragging = true;
			this._slideTo(this._view.x - dx);
		},
		/**
		 * Handles the movement end : flip, unflip or invoke action
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
			
			if (this._dragging == false)
			{
				if (this._flipping)
				{
					return;
				}
				
				var position = this._currentPosition;
				var lastPoint = publishedInfos.movement.pointStatement[publishedInfos.movement.pointStatement.length - 1];
				var absPos = this._domNode.getPosition(null, true);
				
				if (this._displayMode)
				{
					if (!this._onMiddleCover(lastPoint.x - absPos.x, lastPoint.y - absPos.y))
					{
						this._flipping = true;
						this._unflipCover(position);
					}
					else
					{
						var uxEvent = publishedInfos.uxEvent;
						uxEvent.dispatch(uxEvent.target, "click");
					}
				}
				else
				{
					if (this._onMiddleCover(lastPoint.x - absPos.x, lastPoint.y - absPos.y))
					{
						var coverClicked = this.covers[position];
						if (wink.isSet(coverClicked.action))
						{
							if (!wink.isCallback(coverClicked.action))
							{
								wink.log('[CoverFlow] Invalid action for cover : ' + position);
								return;
							}
							wink.call(coverClicked.action, coverClicked);
						}
						else if (wink.isSet(coverClicked.backFaceId))
						{
							this._flipping = true;
							this._prepareCoverBackFace(position);
							wink.setTimeout(this, "_flipCover", 1, position);
						}
					}
				}
				return;
			}
			if (this._backToBounds()) {
				return;
			}
		},
		/**
		 * Prepare the backface of the selected cover in order to flip
		 * 
		 * @param {integer} position The position of the cover to prepare
		 */
		_prepareCoverBackFace: function(position)
		{
			var cp = this.covers[position];
			var backFaceNode = $(cp.backFaceId);
			
			wink.fx.apply(backFaceNode, {
				display: "block",
				position: "absolute",
				width: this.size + "px",
				height: this.size + "px",
				"backface-visibility": "hidden"
			});
			
			wink.fx.apply(cp.coverInnerNode, {
				"transform-origin-z": this._view.zMiddleCover + "px",
				"backface-visibility": "hidden"
			});
	
			wink.fx.set3dTransform(backFaceNode, { type: "rotate", x: 0, y: 1, z: 0, angle: 180 });
			
			wink.fx.applyTransformTransition(cp.coverOutlineNode, '0ms', '0ms', this._TRANSITION_FUNC);
			wink.fx.setTransformPart(cp.coverOutlineNode, 2, { type: "translate", x: 0, y: 0, z: this._view.zMiddleCover });
			wink.fx.applyComposedTransform(cp.coverOutlineNode);
	
			cp.coverOutlineNode.appendChild(backFaceNode);
		},
		/**
		 * Flip the selected cover in order to display the back face
		 * 
		 * @param {integer} position The position of the cover to flip
		 */
		_flipCover: function(position)
		{
			var cp = this.covers[position];
			wink.fx.onTransitionEnd(cp.coverOutlineNode, wink.bind(this._postFlipCover, this, position));
			
			wink.fx.applyTransformTransition(cp.coverOutlineNode, this._DURATION_FLIP + 'ms', '0ms', this._TRANSITION_FUNC);
			wink.fx.setTransformPart(cp.coverOutlineNode, 1, { type: "rotate", x: 0, y: 1, z: 0, angle: 180 });
			wink.fx.setTransformPart(cp.coverOutlineNode, 2, { type: "translate", x: 0, y: this._view.distanceFromTop, z: this._view.zMiddleCover * 1.5 });
			wink.fx.setTransformPart(cp.coverOutlineNode, 3, { type: "rotate", x: 1, y: 0, z: 0, angle: 0 });
			wink.fx.applyComposedTransform(cp.coverOutlineNode);
			this._displayMode = true;
		},
		/**
		 * Handles the end of the flip process
		 * 
		 * @param {integer} position The position of the cover flipped
		 */
		_postFlipCover: function(position)
		{
			this._flipping = false;
			this._gestureNode.style.zIndex = this._Z_INDEX_BACKGROUND;
			wink.fx.set3dTransform(this._gestureNode, { type: "translate", x: 0, y: 0, z: this._view.zMiddleCover / 2 });
		},
		/**
		 * Unflip the selected cover in order to display the front face
		 * 
		 * @param {integer} position The position of the cover to unflip
		 */
		_unflipCover: function(position)
		{
			var cp = this.covers[position];
			wink.fx.setTransformPart(cp.coverOutlineNode, 1, { type: "rotate", x: 0, y: 1, z: 0, angle: 0 });
			wink.fx.setTransformPart(cp.coverOutlineNode, 2, { type: "translate", x: 0, y: 0, z: 0 });
			wink.fx.setTransformPart(cp.coverOutlineNode, 3, { type: "rotate", x: 1, y: 0, z: 0, angle: this._view.currentObserverRotation });
			wink.fx.applyComposedTransform(cp.coverOutlineNode);
			wink.fx.apply(cp.coverInnerNode, {
				"transform-origin-z": "0px"
			});
			
			wink.fx.onTransitionEnd(cp.coverOutlineNode, wink.bind(this._postUnflipCover, this, position));
		},
		/**
		 * Handles the end of the unflip process
		 * 
		 * @param {integer} position The position of the cover unflipped
		 */
		_postUnflipCover: function(position)
		{
			var cp = this.covers[position];
			wink.fx.applyTransformTransition(cp.coverOutlineNode, '0ms', '0ms', this._TRANSITION_FUNC);
			var backFaceNode = $(cp.backFaceId);
			backFaceNode.style.display = "none";
			this._displayMode = false;
			this._flipping = false;
			
			this._gestureNode.style.zIndex = this._Z_INDEX_BACKGROUND + 4;
			wink.fx.set3dTransform(this._gestureNode, { type: "translate", x: 0, y: 0, z: this._view.zGestureNode });
		},
		/**
		 * Handles an orientation change
		 * 
		 * @param {object} properties Window Events
		 * @see wink.ux.Window
		 */
		_onOrientationChange: function(properties)
		{
			var viewportWidth = properties.width;
			this.updateSize(this.size, viewportWidth);
		},
		/**
		 * Returns the current position (the middle Cover) that depends on covers positions
		 * 
		 * @param {object} x The current coordinate
		 */
		_getPosition: function(x)
		{
			var currentPosition = null;
			var i, ps = this._positions, l = ps.length;
			for (i = 0; i < l; i++)
			{
				currentPosition = i;
				if (x < (ps[i] + (this._view.shiftX / 2)))
				{
					break;
				}
			}
			return currentPosition;
		},
		/**
		 * Slide to the given position.
		 * 
		 * @param {number} x The targeted position
		 * @param {boolean} force True only if view must be slided even if there is no position difference
		 */
		_slideTo: function(x, force) 
		{
			var v = this._view;
			var newX = wink.math.round(x, 2);
			if (newX != v.x || force === true)
			{
				v.x = newX;
				wink.fx.set3dTransform(this._trayNode, { type: "translate", x: -v.x + v.distanceToCenter, y: -v.distanceFromTop, z: 0 });
				this._updateView();
			}
		},
		/**
		 * Updates the view if the current displayed cover has changed.
		 */
		_updateView: function()
		{
			var newPosition = this._getPosition(this._view.x);
			if (newPosition != this._currentPosition)
			{
				this._currentPosition = newPosition;
				this._addToQueue(this._currentPosition);
			}
		},
		/**
		 * Starts the renderer process
		 */
		_startRenderer: function()
		{
			if (this._renderer == null)
			{
				this._renderer = wink.setTimeout(this, '_rendererProcess', 1);
			}
		},
		/**
		 * Stops the renderer process
		 */
		_stopRenderer: function()
		{
			if (this._renderer != null)
			{
				clearTimeout(this._renderer);
				this._renderer = null;
			}
		},
		/**
		 * Execute the renderer process : compute and apply transformations successively on the different positions requested by the user
		 */
		_rendererProcess: function()
		{
			var tq = this._transformsQueue, tql = tq.length, tq0 = tq[0];
			if (tq0.rendering == false)
			{
				tq0.rendering = true;
				var position = tq0.position;
				
				wink.fx.onTransitionEnd(this.covers[position].coverInnerNode, wink.bind(this._handleCoverRendered, this, position));
				
				this._updateTransformations(position);
				var durationForMiddle = wink.math.round(this._DURATION_MIDDLE / (tql * 2), 0);
				var durationForAround = wink.math.round(this._DURATION_AROUND / (tql * 2), 0);
				this._updateTransitions(position, durationForMiddle, durationForAround);
				this._applyTransformations();
			}
			else if (tq0.rendered == true)
			{
				tq.shift();
				tql = tq.length;
				if (tql == 0)
				{
					this._stopRenderer();
					return;
				}
			}
			else
			{
				if (tql > 1)
				{
					this._handleCoverRendered(tq0.position);
				}
			}
			
			this._renderer = wink.setTimeout(this, '_rendererProcess', this._RENDERER_INTERVAL);
		},
		/**
		 * Handles a rendered cover
		 * 
		 * @param {integer} index The index of the rendered cover
		 */
		_handleCoverRendered: function(index) 
		{
			this._lastRenderedIndex = index;
			var tq = this._transformsQueue;
			if (tq.length == 0)
			{
				return;
			}
			tq[0].rendered = true;
		},
		/**
		 * Add to the renderer process queue the given position
		 * 
		 * @param {integer} position The position to render
		 */
		_addToQueue: function(position)
		{
			this._transformsQueue.push({
				timestamp: new Date().getTime(),
				position: position,
				rendered: false,
				rendering: false
			});
			this._startRenderer();
		},
		/**
		 * Update transformation of the covers
		 * 
		 * @param {integer} middlePosition The middle position
		 */
		_updateTransformations: function(middlePosition)
		{
			var shift = Math.abs(this._lastRenderedIndex - middlePosition) - 1;
			var half = this._middleViewIndex + shift;
			
			var start = middlePosition - half;
			var end = middlePosition + (half + 1);
			
			var cvs = this.covers, l = cvs.length;
			
			if (middlePosition < half)
			{
				start = 0;
			}
			if (end > l)
			{
				end = l;
			}
			
			for (var i = 0; i < l; i++)
			{
				cvs[i].diffTransform = false;
			}
			
			for (var i = start; i < end; i++)
			{
				var c = cvs[i];
				c.oldTransformation = c.transformation;
				c.transformation	= this._getTargetedTransformation(i, middlePosition);
				c.diffTransform  	= this._transformationsDifferent(c.oldTransformation, c.transformation);
			}
		},
		/**
		 * Update transitions of the covers
		 * 
		 * @param {integer} middlePosition The middle position
		 * @param {integer} durationForMiddle The transition duration for the cover at the middle
		 * @param {integer} durationForAround The transition duration for the covers around
		 */
		_updateTransitions: function(middlePosition, durationForMiddle, durationForAround)
		{
			var i, cvs = this.covers, l = cvs.length;
			for (i = 0; i < l; i++)
			{
				var c = cvs[i];
				if (c.diffTransform)
				{
					var tf = this._TRANSITION_FUNC;
					if (i == middlePosition)
					{
						wink.fx.applyTransformTransition(c.coverInnerNode, durationForMiddle + 'ms', '0ms', tf);
					}
					else
					{
						wink.fx.applyTransformTransition(c.coverInnerNode, durationForAround + 'ms', '0ms', tf);
					}
				}
			}
		},
		/**
		 * Apply transformation to the covers
		 */
		_applyTransformations: function()
		{
			var cp = this._currentPosition,
				cvs = this.covers,
				l = cvs.length,
				middle = Math.floor(l / 2),
				i;

			for (i = 0; i < l; i++)
			{
				var c = cvs[i],
					cover = c.coverNode,
					coverinner = c.coverInnerNode,
					depth = c.depth1;
				
				if ((i < middle && i >= cp) || (i >= middle && i <= cp)) {
					depth = c.depth2;
				}
				if (c.depth != depth) {
					c.depth = depth;
					wink.fx.setTransformPart(cover, 2, { type: "translate", x: this._positions[i], y: 0, z: depth });
					wink.fx.applyComposedTransform(cover);
				}
				
				if (c.diffTransform)
				{
					wink.fx.setTransformPart(coverinner, 1, c.transformation.rotation);
					wink.fx.setTransformPart(coverinner, 2, c.transformation.translation);
					wink.fx.applyComposedTransform(coverinner);
						
					if (this.displayTitle)
					{
						var dd = this.displayTitleDuration;
						if (i == this._currentPosition)
						{
							if (dd > 0)
							{
								if (wink.isSet(this._timerTitle))
								{
									clearTimeout(this._timerTitle);
									this._timerTitle = null;
								}
								this._timerTitle = wink.setTimeout(this, "_showTitle", this._DELAY_FOR_TITLE_DISPLAY, i);
							}
							else
							{
								this._showTitle(i);
							}
						}
						else
						{
							if (dd > 0)
							{
								wink.fx.applyTransition(c.titleNode, "opacity", '0ms', '0ms', this._TRANSITION_FUNC);
							}
							this._setTitleOpacity(i, 0.0);
						}
					}
				}
			}
		},
		/**
		 * Returns true if the givens transformations are considered different
		 * 
		 * @param {object} t1 First transformation
		 * @param {object} t2 Second transformation
		 */
		_transformationsDifferent: function(t1, t2)
		{
			return (t1.rotation.angle != t2.rotation.angle);
		},
		/**
		 * Initialize transformations of the covers
		 */
		_initTransformations: function()
		{
			var cp = this._currentPosition,
				cvs = this.covers,
				l = cvs.length,
				middle = Math.floor(l / 2),
				i, depth1 = 0, depth2 = (l - 1) + middle;
			
			for (i = 0; i < l; i++)
			{
				var c = cvs[i],
					cover = c.coverNode;
				
				if (i <= middle) {
					depth1++;
					depth2--;
				} else {
					depth1--;
					depth2++;
				}
				c.depth1 = depth1;
				c.depth2 = depth2;
				
				wink.fx.initComposedTransform(cover);
				wink.fx.setTransformPart(cover, 1, { type: "scale", x: this._view.coverScale, y: this._view.coverScale, z: 1 });
				
				wink.fx.initComposedTransform(c.coverOutlineNode);
				
				wink.fx.initComposedTransform(c.coverInnerNode);
				c.transformation = this._getTargetedTransformation(i, this._currentPosition);
			}
			this._applyTransformations();
			wink.fx.set3dTransform(this._gestureNode, { type: "translate", x: 0, y: 0, z: this._view.zGestureNode });
		},
		/**
		 * Create transformations to load later
		 */
		_createTransformations: function()
		{
			var v = this._view,
				cr = v.coverRotation,
				za = v.zAroundCover,
				sm = v.shiftFromMiddle;
			this._transformations = {
				left: {
					rotation: 		{ type: "rotate", x: 0, y: 1, z: 0, angle: cr },
					translation: 	{ type: "translate", x: -sm, y: 0, z: za }
				},
				middle: {
					rotation: 		{ type: "rotate", x: 0, y: 1, z: 0, angle: 0 },
					translation: 	{ type: "translate", x: 0, y: 0, z: v.zMiddleCover }
				},
				right: {
					rotation: 		{ type: "rotate", x: 0, y: 1, z: 0, angle: -cr },
					translation: 	{ type: "translate", x: sm, y: 0, z: za }
				}
			};
		},
		/**
		 * Returns the transformation to apply to the given index
		 * 
		 * @param {integer} index The current index
		 * @param {integer} middle The middle index
		 * @returns {object} The current transformation
		 */
		_getTargetedTransformation: function(index, middle)
		{
			var tfs = this._transformations;
			if (index < middle)
			{
				return tfs.left;
			}
			else if (index > middle)
			{
				return tfs.right;
			}
			else
			{
				return tfs.middle;
			}
		},
		/**
		 * Show the title
		 * 
		 * @param {integer} index The index of the associated cover
		 */
		_showTitle: function(index)
		{
			if (wink.isSet(this._timerTitle))
			{
				clearTimeout(this._timerTitle);
				this._timerTitle = null;
			}
			if (index == this._currentPosition)
			{
				var dd = this.displayTitleDuration;
				if (dd > 0)
				{
					wink.fx.applyTransition(this.covers[index].titleNode, "opacity", dd + 'ms', '0ms', this._TRANSITION_FUNC);
				}
				this._setTitleOpacity(index, 1.0);
			}
		},
		/**
		 * Updates sur title opacity
		 * 
		 * @param {integer} index The index of the associated cover
		 * @param {integer} opacity The opacity value
		 */
		_setTitleOpacity: function(index, opacity)
		{
			this.covers[index].titleNode.style.opacity = opacity;
		},
		/**
		 * Hides all back faces
		 */
		_hideBackFaces: function()
		{
			var i, cvs = this.covers, l = cvs.length;
			for (i = 0; i < l; i++)
			{
				var c = cvs[i];
				if (wink.isSet(c.backFaceId))
				{
					var backFaceNode = $(c.backFaceId);
					backFaceNode.style.display = "none";
				}
			}
		},
		/**
		 * Set all cover images
		 */
		_setImages: function()
		{
			var i, cvs = this.covers, l = cvs.length;
			for (i = 0; i < l; i++)
			{
				var c = cvs[i];
				if (this.reflected)
				{
					this._applyReflection(i);
				}
				c.imageNode.src = c.image;
			}
		},
		/**
		 * Organize the Cover Flow depth
		 */
		_organizeDepth: function()
		{
			var zib = this._Z_INDEX_BACKGROUND;
			this._domNode.style.zIndex = zib;
			this._trayNode.style.zIndex = zib + 1;
			this._gestureNode.style.zIndex = zib + 4;
			
			if (this.reflected)
			{
				var i, cvs = this.covers, l = cvs.length;
				for (i = 0; i < l; i++)
				{
					var c = cvs[i];
					if (this.displayTitle)
					{
						c.titleNode.style.zIndex 			= zib + 4;
					}
					c.coverReflectionFront.style.zIndex 	= zib + 3;
					c.coverReflectionBack.style.zIndex 		= zib + 2;
				}
			}
			if (this.fadeEdges)
			{
				this._faderLeft.style.zIndex 	= zib + 4;
				this._faderRight.style.zIndex 	= zib + 4;
			}
		},
		/**
		 * Apply Reflection on a cover
		 * 
		 * @param {integer} index The index of the cover to reflect
		 */
		_applyReflection: function(index)
		{
			var c = this.covers[index];
			var img = c.imageNode;
			var canvas = c.coverReflectionFront;
			c.imageLoadingHandler = wink.bind(function () {
				this._reflect(index, img, canvas, img.width, img.height);
			}, this);
			img.addEventListener("load", c.imageLoadingHandler);
		},
		/**
		 * Reflection process
		 * 
		 * @param {integer} index The index of the cover to reflect
		 * @param {HTMLImageElement} image The image to reflect
		 * @param {HTMLCanvasElement} canvas The target canvas
		 * @param {integer} width The width of the canvas
		 * @param {integer} height The height of the canvas
		 */
		_reflect: function(index, image, canvas, width, height)
		{
		    canvas.width = width;
		    canvas.height = height;
	
		    var ctx = canvas.getContext("2d");
	
		    ctx.save();
	
		    ctx.translate(0, (height / 1.5));
		    ctx.scale(1, -1);
		    ctx.drawImage(image, 0, 0, width, height / 1.5);
	
		    ctx.restore();
	
		    ctx.globalCompositeOperation = "destination-out";
	
		    var gradient = ctx.createLinearGradient(0, 0, 0, height);
		    gradient.addColorStop(0, "rgba(255, 255, 255, " + this._REFLECTION_ATTENUATION + ")");
		    gradient.addColorStop(0.6, "rgba(255, 255, 255, 1.0)");
		    
		    ctx.fillStyle = gradient;
		    ctx.fillRect(0, 0, width, height);
		    image.removeEventListener("load", this.covers[index].imageLoadingHandler);
		},
		/**
		 * Update the edge faders
		 */
		_updateEdgeFaders: function()
		{
			var bg = this.backgroundColor,
				fl = this._faderLeft,
				fr = this._faderRight,
				ctx = fl.getContext("2d");
			
		    var gradient = ctx.createLinearGradient(0, 0, fl.width, 0);
		    gradient.addColorStop(0.0, "rgba(" + bg.r + ", " + bg.g + ", " + bg.b + ", 1.0)");
		    gradient.addColorStop(1.0, "rgba(" + bg.r + ", " + bg.g + ", " + bg.b + ", 0.0)");
		    
		    ctx.fillStyle = gradient;
		    ctx.fillRect(0, 0, fl.width, fl.height);
		    
		    ctx = fr.getContext("2d");
	
		    gradient = ctx.createLinearGradient(0, 0, fr.width, 0);
		    gradient.addColorStop(0.0, "rgba(" + bg.r + ", " + bg.g + ", " + bg.b + ", 0.0)");
		    gradient.addColorStop(1.0, "rgba(" + bg.r + ", " + bg.g + ", " + bg.b + ", 1.0)");
		    
		    ctx.fillStyle = gradient;
		    ctx.fillRect(0, 0, fr.width, fr.height);
		},
		/**
		 * Go back to bound if necessary.
		 */
		_backToBounds: function()
		{
			var boundsInfos = this._getBoundsInfos(this._view.x);
			if (boundsInfos.outsideOfBounds) {
				this._slideTo(boundsInfos.positionOfBound, this._DURATION_BACKTO_BOUND);
				return true;
			}
			return false;
		},
		/**
		 * Get bounds informations that allows caller to determine if the target is out of bounds,
		 * the direction associated, the distance to the bound and the position to reach.
		 * 
		 * @param {number} nextX The next position on x
		 */
		_getBoundsInfos: function(nextX)
		{
			var v = this._view;
			var boundsInfos = {};
			boundsInfos.outsideOfBounds = false;
			
			if (nextX < 0 || nextX > v.sizeX) {
				boundsInfos.outsideOfBounds = true;
				if (nextX < 0) {
					boundsInfos.distanceToBound = Math.abs(nextX);
					boundsInfos.direction = 1;
					boundsInfos.positionOfBound = 0;
				} else {
					boundsInfos.distanceToBound = Math.abs(nextX - v.sizeX);
					boundsInfos.direction = -1;
					boundsInfos.positionOfBound = v.sizeX;
				}
			}
			return boundsInfos;
		},
		/**
		 * This method allows to determine if the digit selection refers to the middle cover
		 * 
		 * @param {integer} x The digit position on x-axis
		 * @param {integer} y The digit position on y-axis
		 */
		_onMiddleCover: function(x, y)
		{
			var v = this._view,
				s = this.size,
				rf = wink.math.round;
			var coverSize = rf((s * v.coverScale) * 1.5, 0); // depends on perspective
			var ymin = rf((s / 2) - (coverSize / 2) - v.distanceFromTop, 0);
			var xmin = rf((s / 2) - (coverSize / 2) + v.distanceToCenter, 0);
			var ymax = ymin + coverSize;
			var xmax = xmin + coverSize;
			
			if (this._displayMode)
			{
				coverSize = rf((s * v.coverScale) * 2.1, 0); // depends on perspective
				ymin = rf((s / 2) - (coverSize / 2) - (v.distanceFromTop / 2.1), 0);
				xmin = rf((s / 2) - (coverSize / 2) + v.distanceToCenter, 0);
				ymax = ymin + coverSize;
				xmax = xmin + coverSize;
			}
			
			if (x >= xmin && x <= xmax && y >= ymin && y <= ymax)
			{
				return true;
			}
			return false;
		}
	};
	
	return wink.ui.xyz.CoverFlow;
});
