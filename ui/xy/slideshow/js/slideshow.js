/*--------------------------------------------------------
 * Copyright (c) 2011, The Dojo Foundation
 * This software is distributed under the "Simplified BSD license",
 * the text of which is available at http://www.winktoolkit.org/licence.txt
 * or see the "license.txt" file for more details.
 *--------------------------------------------------------*/

/**
 * @fileOverview Implements a slideshow based on the html canvas tag. 

 * @compatibility Iphone OS2, Iphone OS3, Android 1.5, Android 1.6, Android 2.2, Android 2.3, Android 3.0, Android 3.1, BlackBerry 6, BlackBerry 7, Bada 1.0, Windows Phone 7.5
 * @author Sylvain LALANDE
 */

/**
 * The animation is starting
 * 
 * @name wink.ui.xy.Slideshow#/slideshow/events/animstart

 * @event
 * 
 * @param {object} param The parameters object
 * @param {object} param.currentItem The item currently displayed
 * @param {object} param.nextItem The next item
 * @param {object} param.animation The current animation
 */

/**
 * The animation is ending
 * 
 * @name wink.ui.xy.Slideshow#/slideshow/events/animend

 * @event
 * 
 * @param {object} param The parameters object
 * @param {object} param.currentItem The item currently displayed
 * @param {object} param.previousItem The next item
 * @param {object} param.animation The current animation
 */

/**
 * The item displayed has changed
 * 
 * @name wink.ui.xy.Slideshow#/slideshow/events/itemChanged

 * @event
 * 
 * @param {object} param The parameters object
 * @param {object} param.currentItem The item currently displayed
 */
define(['../../../../_amd/core', '../../../../ux/movementtracker/js/movementtracker'], function(wink)
{
	/**
	 * @class Implements a slideshow based on the html canvas tag. 
	 * This component is highly customizable on how to display images: interaction with the user to touch, 
	 * sliding between images, transition animations, etc. It takes as an argument a list of items related to images; 
	 * operation consists of distinct parts: loading images, the process of sliding, the process of animation and rendering process. 
	 * The rendering process is based on a single JavaScript interval, which stops when the slideshow is inactive.
	 * The user must be careful about the fact that performance depends on the platform, the size of images and animations selected.
	 * Also, some animations have different behaviors between iPhone and Android (fade, light), because they depend on the implementation 
	 * of the tag Canvas. The Android OS 2.1 introduces bugs in the implementation of the Canvas tag, which does not allow for proper operation 
	 * of the component.
	 * 
	 * @param {object} properties The properties object
	 * @param {number} properties.height The height of the slideshow
	 * @param {number} properties.width The with of the slideshow
	 * @param {array} properties.items An array of items ( item: { image: the image path, title: the item title, info: the items details })
	 * @param {integer} properties.position The index of the displayed item in the item list
	 * @param {boolean} [properties.listeningTouch=true] Indicates whether the component must listen to touch events
	 * @param {boolean} [properties.touchTranslation=false] Indicates whether a translation based on the user's touch must be performed
	 * @param {boolean} [properties.withSliding=false] Indicates whether the sliding mode is active
	 * @param {boolean} [properties.withAnim=false] Indicates whether the animation mode is active
	 * @param {array} [properties.anims] An array of named animation. Animation names : oneSquare, nSquare, fade, horizontalOut, horizontalIn, circleOut, circleIn, circlesOut, circlesIn, rowDown, rowUp, colLeft, colRight, rotate, spin, spinQuarter, light, wrap, scaleIn, scaleOut
	 * @param {boolean} [properties.animRandom=false] Indicates whether a random selection of animation in the list must be done
	 * @param {boolean} [properties.autoplay=false] Indicates whether the autoplay mode is active
	 * @param {integer} [properties.autoplayDuration=5000] The duration between two displays of items
	 * @param {integer} [properties.slideDuration=200] The duration of the slide
	 * @param {integer} [properties.animDuration=800] The duration of the animations
	 * @param {boolean} [properties.displayHeader=true] Indicates whether the header is displayed
	 * @param {boolean} [properties.displayFooter=true] Indicates whether the footer is displayed
	 * @param {integer} [properties.headerHeight=26] height of the header
	 * @param {integer} [properties.footerHeight=26] height of the footer
	 * @param {integer} [properties.scopeSize=4] number of loaded images around the current image
	 * 
	 * @example
	 * 
	 * var properties = 
	 * {
	 * 	height: 250,
	 * 	width: 310,
	 * 	items: 
	 * 	[
	 * 		{ image: 'image1.jpg', title: 'Image 1', info: 'Details of Image 1' },
	 * 		{ image: 'image2.jpg', title: 'Image 2', info: 'Details of Image 2' }
	 * 	]
	 * 	position: 0,
	 * 	withAnim: true,
	 * 	autoplay: true,
	 * 	anims: [ "spin", "spinQuarter" ],
	 * 	animRandom: false
	 * }
	 * 
	 * var slideshow = new wink.ui.xy.Slideshow(properties);
	 * 
	 * $('container').appendChild(slideshow.getDomNode());
	 * 
	 * @requires wink.ux.MovementTracker
	 * 
	 * @see <a href="WINK_ROOT_URL/ui/xy/slideshow/test/test_slideshow.html" target="_blank">Test page</a>
	 */
	wink.ui.xy.Slideshow = function(properties) 
	{
		/**
		 * Unique identifier
		 * 
		 * @property
		 * @type integer
		 */
		this.uId = wink.getUId();
		
		
		this._properties		= properties;
		
		this._items 			= null;
		this._params			= {
			scopeSize: 4,
			displayHeader: true,
			displayFooter: true,
			headerHeight: 26,
			footerHeight: 26,
			listeningTouch: true,
			touchTranslation: false,
			withSliding: false,
			withAnim: false,
			autoplay: false,
			animRandom: false,
			anims: null,
			autoplayDuration: 5000,
			inactivityDuration: 10000,
			slideDuration: 200,
			animDuration: 800,
			refreshRate: 40,
			fpms: 0.025
		},
		this._view				= {
			h: 0,
			w: 0,
			scopeBegin: 0,
			scopeEnd: 0,
			position: 0,
			x: 0,
			tx: 0,
			sx: 0,
			stepDistance: 0,
			targetSlide: 0,
			nearestItem: 0,
			currentAnim: 0,
			animPos: -1
		};
		this._anims				= {
			oneSquare: 0,
			nSquare: 1,
			fade: 2,
			horizontalOut: 3,
			horizontalIn: 4,
			circleOut: 5,
			circleIn: 6,
			circlesOut: 7,
			circlesIn: 8,
			rowDown: 9,
			rowUp: 10,
			colLeft: 11,
			colRight: 12,
			rotate: 13,
			spin: 14,
			spinQuarter: 15,
			light: 16,
			wrap: 17,
			scaleIn: 18,
			scaleOut: 19
		},
		
		this._domNode			= null;
		this._canvasNode		= null;
		this._headerNode		= null;
		this._footerNode		= null;
		this._ctx				= null;
		this._movementtracker	= null;
		this._timer				= null;
		this._transitions 		= null;
		this._transitionContext	= null;
		this._autoplayTiming	= null;
		this._renderingTiming	= null;
		
		this._loading			= false; // image loading
		this._rendering			= false;
		this._sliding			= false;
		this._animated			= false;
		
		if (this._validateProperties() === false) return;
		
		this._initProperties();
		this._initDom();
		this._initListeners();
		
		this._goToItem(this._view.position);
		this._startRendering();
	};
	
	wink.ui.xy.Slideshow.prototype = 
	{
		/**
		 * Returns the Slideshow dom node
		 * 
		 * @returns {HTMLElement} The main dom node
		 */
		getDomNode: function() {
			return this._domNode;
		},
		/**
		 * Returns the current displayed item
		 * 
		 * @returns {object} The current item
		 */
		getCurrentItem: function() {
			return this._items[this._view.position];
		},
		/**
		 * Updates the slideshow parameters
		 * 
		 * @param {object} properties The new properties
		 */
		updateParameters: function(properties) {
			this._stopRendering();
			
			this._mixParams(properties);
			if (this._params.displayHeader)
			{
				if (this._headerNode == null)
				{
					this._createHeader();
				}
			}
			else
			{
				if (this._headerNode != null)
				{
					this._headerNode.style.display = 'none';
				}
			}
			
			if (this._params.displayFooter)
			{
				if (this._footerNode == null)
				{
					this._createFooter();
				}
			}
			else
			{
				if (this._footerNode != null)
				{
					this._footerNode.style.display = 'none';
				}
			}
			
			this._initListeners();
			this._goToItem(this._view.position);
			this._startRendering();
		},
		/**
		 * Shows the next item
		 */
		next: function() {
			this._computeNearestPosition(-1);
			this._goToNearestPosition();
		},
		/**
		 * Shows the previous item
		 */
		previous: function() {
			this._computeNearestPosition(1);
			this._goToNearestPosition();
		},
		
		/**
		 * Starts the rendering process
		 */
		_startRendering: function()
		{
			if (this._rendering == true)
			{
				return;
			}
			this._rendering = true;
			this._timer = wink.setInterval(this, '_render', this._params.refreshRate);
			
			var ct = new Date().getTime();
			if (this._params.autoplay == true)
			{
				this._autoplayTiming = ct;
			}
			this._renderingTiming = ct;
		},
		/**
		 * Stops the rendering process
		 */
		_stopRendering: function()
		{
			clearInterval(this._timer);
			this._rendering = false;
		},
		/**
		 * Notifies the slideshow that an activity occurs, in order to stop the rendering process when the slideshow is inactive
		 */
		_notifyActivity: function()
		{
			var ct = new Date().getTime();
			if (this._params.autoplay == true)
			{
				this._autoplayTiming = ct;
			}
			this._renderingTiming = ct;
			if (this._rendering == false)
			{
				this._startRendering();
			}
		},
		/**
		 * The rendering process
		 */
		_render: function()
		{
			if (this._rendering == false)
			{
				return;
			}
			
			if (this._loading == false)
			{
				var ct = new Date().getTime();
	
				if (this._params.autoplay == true)
				{
					var elapsed = ct - this._autoplayTiming;
					if (elapsed > this._params.autoplayDuration)
					{
						this._computeNearestPosition(-1);
						if (this._view.position == this._items.length - 1)
						{
							this._view.nearestItem = 0;
						}
						this._goToNearestPosition();
						this._autoplayTiming = ct;
					}
				} 
				else
				{
					var elapsed = ct - this._renderingTiming;
					if (elapsed > this._params.inactivityDuration)
					{
						this._stopRendering();
					}
				}
			}
			
			if (this._sliding == true)
			{
				this._onSlideMotion();
			}
			else if (this._animated == true)
			{
				this._onAnimMotion();
			}
			
			this._drawBackground();
			this._ctx.save();
			this._translate();
			this._drawItems();
			this._ctx.restore();
		},
		/**
		 * Draws the background
		 */
		_drawBackground: function()
		{
			this._ctx.fillStyle = 'rgba(0, 0, 0, 1.0)';
			this._ctx.fillRect(0, 0, this._view.w, this._view.h);
		},
		/**
		 * Draws items
		 */
		_drawItems: function()
		{
			if (this._animated == true)
			{
				var fgImage = this._transitionContext.fgImage;
				var bgImage = this._transitionContext.bgImage;
				
				if (fgImage.imgLoaded == false || bgImage.imgLoaded == false)
				{
					return;
				}
				
				this._ctx.globalCompositeOperation = "source-over";
				this._ctx.drawImage(bgImage.imageObj, 0, 0, this._view.w, this._view.h);
				
				var ratioCanvasImgW = wink.math.round(fgImage.w / this._view.w, 10);
				var ratioCanvasImgH = wink.math.round(fgImage.h / this._view.h, 10);
				
				for (var i = 0; i < this._transitions.length; i++)
				{
					var trI = this._transitions[i];
					if (trI.isOnDelay() || trI.isFinished())
					{
						continue;
					}
					var sx = wink.math.round(trI.x * ratioCanvasImgW, 5);
					var sy = wink.math.round(trI.y * ratioCanvasImgH, 5);
					var sw = wink.math.round(trI.w * ratioCanvasImgW, 5);
					var sh = wink.math.round(trI.h * ratioCanvasImgH, 5);
	
					var originX = trI.x;
					var originY = trI.y;
					if (wink.isSet(trI.originX) && wink.isSet(trI.originY))
					{
						this._ctx.translate(-trI.originX, -trI.originY);
						originX += trI.originX;
						originY += trI.originY;
					}
					
					this._ctx.save();
					
					if (wink.isSet(trI.circle))
					{
						this._ctx.beginPath();
						var angleBegin = 0;
						var angleEnd = Math.PI * 2;
						var centerX = (trI.x + (trI.w / 2));
						var centerY = (trI.y + (trI.h / 2));
						if (wink.isSet(trI.angleBegin) && wink.isSet(trI.angleEnd))
						{
							angleBegin = trI.angleBegin;
							angleEnd = trI.angleEnd;
						}
						if (wink.isSet(trI.centerX) && wink.isSet(trI.centerY))
						{
							centerX = trI.centerX;
							centerY = trI.centerY;
						}
						this._ctx.moveTo(centerX, centerY);
						this._ctx.arc(centerX, centerY, trI.circle, angleBegin, angleEnd, true);
						
						this._ctx.clip();
						this._ctx.closePath();
					}
					
					if (wink.isSet(trI.rotate))
					{
						this._ctx.rotate(trI.rotate);
					}
					
					if (wink.isSet(trI.scale))
					{
						var w2 = this._view.w * trI.scale;
						var h2 = this._view.h * trI.scale;
						originX = (this._view.w - w2) / 2;
						originY = (this._view.h - h2) / 2;
						trI.w = w2;
						trI.h = h2;
					}
					
					this._ctx.save();
					if (wink.isSet(trI.opacity))
					{
						this._ctx.globalAlpha = trI.opacity;
					}
					
					if (wink.isSet(trI.wrapPos))
					{
						var props = trI.getProperties();
						var x = trI.wrapPos;
						var w = trI.w;
						
						var ratioCanvasImgW = wink.math.round(fgImage.w / this._view.w, 10);
						var ratioCanvasImgH = wink.math.round(fgImage.h / this._view.h, 10);
						var xInv = this._view.w - x - w;
						var sx = wink.math.round(xInv * ratioCanvasImgW, 4);
						var sw = wink.math.round(w * ratioCanvasImgW, 4);
						
						var delta = -(props.stepCount * 0.005);
						var sx2 = Math.max(sx - (trI.currentStep * delta), 0);
						var sw2 = sw - delta;
						
						// roll
						this._ctx.save();
						this._ctx.translate(this._view.w, 0);
						this._ctx.scale(-1, 1);
						this._ctx.drawImage(fgImage.imageObj, sx2, 0, sw2, sh, x, 0, w, this._view.h);
						this._ctx.restore();
						
						var s = this._ctx.createLinearGradient(xInv, 0, xInv + w, 0);
						var o = 0.6;
						s.addColorStop(0.0, 'rgba(0, 0, 0,' + o + ')');
						s.addColorStop(0.2, 'rgba(0, 0, 0, 0)');
						s.addColorStop(0.3, 'rgba(254, 254, 254, 0)');
						s.addColorStop(0.45, 'rgba(254, 254, 254,' + o + ')');
						s.addColorStop(0.6, 'rgba(254, 254, 254, 0)');
						s.addColorStop(0.66, 'rgba(0, 0, 0, 0)');
						s.addColorStop(1.0, 'rgba(0, 0, 0,' + o + ')');
						this._ctx.fillStyle = s;
						this._ctx.fillRect(xInv, 0, w, this._view.h);
						
						// draw foreground remains
						var sw = wink.math.round(xInv * ratioCanvasImgW, 2);
						if (sw > 0)
						{
							this._ctx.drawImage(fgImage.imageObj, 0, 0, sw, sh, 0, 0, xInv, this._view.h);
						}
						
						// shadow
						var dx = xInv + w;
						s = this._ctx.createLinearGradient(dx, 0, dx + 30, 0);
						o = 0.8;
						s.addColorStop(0.0, 'rgba(0, 0, 0,' + o + ')');
						s.addColorStop(1.0, 'rgba(0, 0, 0, 0)');
						this._ctx.fillStyle = s;
						this._ctx.fillRect(dx, 0, (this._view.w - dx), this._view.h);
					} 
					else
					{
						this._ctx.drawImage(fgImage.imageObj, sx, sy, sw, sh, originX, originY, trI.w, trI.h);
					}
					
					this._ctx.restore();
					
					if (wink.isSet(trI.radialGradientR1) && wink.isSet(trI.radialGradientR2))
					{
						var rg1 = trI.radialGradientR1;
						var rg2 = trI.radialGradientR2;
						var props = trI.getProperties();
						var props1 = props.radialGradientR1;
						var props2 = props.radialGradientR2;
						var rgradient = this._ctx.createRadialGradient(props1.x, props1.y, rg1, props2.x, props2.y, rg2);
						
						var go = 1.0;
						if (wink.isSet(trI.gradientOpacity))
						{
							go = trI.gradientOpacity;
						}
						rgradient.addColorStop(0, "rgba(255, 255, 255, " + go + ")");
						rgradient.addColorStop(1, "rgba(255, 255, 255, 0.0)");
						this._ctx.fillStyle = rgradient;
						this._ctx.fillRect(0, 0, this._view.w, this._view.h);
					}
					
					this._ctx.restore();
				}
			}
			else
			{
				for (var i = this._view.scopeBegin; i <= this._view.scopeEnd; i++)
				{
					this._ctx.save();
					this._drawItem(this._items[i]);
					
					if (i == this._view.position)
					{
						this._drawHeader(this._items[i]);
						this._drawFooter(this._items[i]);
					}
					
					this._ctx.restore();
				}
			}
		},
		/**
		 * Draws the given item
		 * 
		 * @param {object}item The item to draw
		 */
		_drawItem: function(item)
		{
			if (item.imgLoaded == true)
			{
				if (item.index == this._view.position || item.index == this._view.nearestItem)
				{
					var itemX = this._getXPosition(item);
					this._ctx.translate(itemX, 0);
					this._ctx.drawImage(item.imageObj, 0, 0, this._view.w, this._view.h);
				}
			}
		},
		/**
		 * Updates the header title
		 * 
		 * @param {object}item The item
		 */
		_drawHeader: function(item)
		{
			if (this._params.displayHeader)
			{
				this._headerNode.innerHTML = item.title;
			}
		},
		/**
		 * Updates the footer title
		 * 
		 * @param {object}item The item
		 */
		_drawFooter: function(item)
		{
			if (this._params.displayFooter)
			{
				this._footerNode.innerHTML = item.info;
			}
		},
		/**
		 * Handles the movement updates
		 * 
		 * @param {object} publishedInfos See wink.ux.MovementTracker Events
		 */
		_handleMovementChanged: function(publishedInfos)
		{
			var publisher = publishedInfos.publisher;
			if (publisher.uId != this._movementtracker.uId)
			{
				return;
			}
			if (this._sliding == true || this._animated == true)
			{
				return;
			}
			
			var movement = publishedInfos.movement;
			
			var beforeLastPoint = movement.pointStatement[movement.pointStatement.length - 2];
			var lastPoint = movement.pointStatement[movement.pointStatement.length - 1];
			
			var dx = lastPoint.x - beforeLastPoint.x;
			this._computeNearestPosition(dx);
			
			this._notifyActivity();
		},
		/**
		 * Handles the movement end
		 * 
		 * @param {object} publishedInfos See wink.ux.MovementTracker Events
		 */
		_handleMovementStored: function(publishedInfos)
		{
			var publisher = publishedInfos.publisher;
			if (publisher.uId != this._movementtracker.uId)
			{
				return;
			}
			if (this._sliding == true || this._animated == true)
			{
				return;
			}
			if (this._items[this._view.nearestItem].imgLoaded == false)
			{
				return;
			}
			this._goToNearestPosition();
			
			this._notifyActivity();
		},
		/**
		 * Updates the nearest item from the current position
		 * 
		 * @param {number} dx The delta on x-axis
		 */
		_computeNearestPosition: function(dx)
		{
			this._computePosition(dx, null);
			this._view.nearestItem = this._getNearest();
		},
		/**
		 * Goes to the nearest item, using the appropriate transition
		 */
		_goToNearestPosition: function()
		{
			if (this._params.withSliding)
			{
				this._slideToNearest();
			}
			else if (this._params.withAnim)
			{
				this._animToNearest();
			}
			else
			{
				this._goToItem(this._view.nearestItem);
			}
		},
		/**
		 * Goes to the given position index
		 * 
		 * @param {integer} position The position to go
		 */
		_goToItem: function(position)
		{
			this._view.tx = 0;
			this._view.sx = 0;
			this._view.x = 0;
			this._view.position = position;
			this._loadImagesInScope();
			
			wink.publish("/slideshow/events/itemChanged", {
				currentItem: this._items[this._view.position]
			});
		},
		/**
		 * Gets the position of the item on x-axis, which depends on the item index
		 * 
		 * @param {object} item The item
		 */
		_getXPosition: function(item)
		{
			var unit = this._view.w;
			var diff = item.index - this._view.position;
			var posX = (diff * unit);
			return posX;
		},
		/**
		 * Computes the translated position of the view, which depends on the user touch and on the sliding process
		 * 
		 * @param {number} dx The user touch delta on x-axis
		 * @param {number} sx The sliding delta on x-axis
		 */
		_computePosition: function(dx, sx)
		{
			if (dx)
			{
				this._view.tx += dx;
			}
			if (sx)
			{
				this._view.sx += sx;
			}
			this._view.x = 0;
			if (this._params.touchTranslation)
			{
				this._view.x += this._view.tx;
			}
			if (this._params.withSliding)
			{
				this._view.x += this._view.sx;
			}
		},
		/**
		 * Translates the view
		 */
		_translate: function()
		{
			this._ctx.translate(this._view.x, 0);
		},
		/**
		 * Returns the nearest index position
		 * 
		 * @returns {integer} The nearest index position
		 */
		_getNearest: function()
		{
			var nearest = this._view.position;
			if (this._view.tx == 0)
			{
				
			}
			else if (this._view.tx > 0)
			{
				nearest--;
				nearest = Math.max(nearest, 0);
			}
			else
			{
				nearest++;
				nearest = Math.min(nearest, this._items.length - 1);
			}
			return nearest;
		},
		/**
		 * Slides to the nearest position
		 */
		_slideToNearest: function()
		{
			this._view.targetSlide = this._getXPosition(this._items[this._view.nearestItem]);
			var distance = Math.abs(this._view.targetSlide + this._view.x);
			this._view.stepDistance = wink.math.round(distance / (this._params.fpms * this._params.slideDuration), 0);
			this._sliding = true;
		},
		/**
		 * Executes a sliding step
		 */
		_onSlideMotion: function()
		{
			var d = this._view.stepDistance;
			if (this._view.targetSlide > 0)
			{
				d = -d;
			}
			this._computePosition(null, d);
			
			var a = Math.abs(this._view.x);
			var b = this._view.stepDistance;
			var c = Math.abs(this._view.targetSlide);
			
			if ((a + b) >= c)
			{
				this._sliding = false;
				this._goToItem(this._view.nearestItem);
			}
		},
		/**
		 * Returns the next animation
		 */
		_getNextAnim: function()
		{
			var result = this._view.currentAnim;
			
			if (this._params.anims.length > 0)
			{
				if (this._params.animRandom)
				{
					this._view.animPos = Math.floor(this._params.anims.length * Math.random());
				}
				else
				{
					this._view.animPos = (this._view.animPos + 1) % this._params.anims.length;
				}
					
				var animName = this._params.anims[this._view.animPos];
				result = this._anims[animName];
			}
			
			if (!wink.isSet(result))
			{
				result = 0;
			}
			
			return result;
		},
		/**
		 * Animates to the nearest position
		 */
		_animToNearest: function()
		{
			if (this._view.nearestItem == this._view.position)
			{
				this._goToItem(this._view.nearestItem);
				return;
			}
			
			var w = this._view.w;
			var h = this._view.h;
			this._transitions = [];
			this._transitionContext = {
				fgImage: this._items[this._view.position],
				bgImage: this._items[this._view.nearestItem]
			};
			var stepCount = Math.floor(this._params.fpms * this._params.animDuration);
			this._view.currentAnim = this._getNextAnim();
			
			if (this._view.currentAnim == this._anims.oneSquare)
			{
				this._transitions.push(new wink.ui.xy.Slideshow.Transition({
					stepCount: stepCount,
					x: { from: 0, to: w / 2 },
					y: { from: 0, to: h / 2 },
					h: { from: h, to: 0 },
					w: { from: w, to: 0 }
				}));
			}
			else if (this._view.currentAnim == this._anims.nSquare)
			{
				var cols = 6;
				var rows = 4;
				var squareW = this._view.w / cols;
				var squareH = this._view.h / rows;
				
				var deltaSc = (this._params.animDuration / cols) / 1.2;
				
				for (var i = 0; i < cols; i++)
				{
					var xFrom = i * squareW;
					var xTo = (xFrom + (squareW / 2));
					
					var deltaDur = (cols - i) * deltaSc;
					if (this._view.nearestItem > this._view.position)
					{
						deltaDur = i * deltaSc;
					}
					var animDuration = this._params.animDuration - deltaDur;
					var stepCount = this._params.fpms * animDuration;
					
					for (var j = 0; j < rows; j++)
					{
						var yFrom = j * squareH;
						var yTo = (yFrom + (squareH / 2));
						
						var tr = new wink.ui.xy.Slideshow.Transition({
							stepCount: stepCount,
							x: { from: xFrom, to: xTo },
							y: { from: yFrom, to: yTo },
							h: { from: squareH, to: 0 },
							w: { from: squareW, to: 0 }
						});
						this._transitions.push(tr);
					}
				}
			}
			else if (this._view.currentAnim == this._anims.fade)
			{
				this._transitions.push(new wink.ui.xy.Slideshow.Transition({
					stepCount: stepCount,
					x: { from: 0, to: 0 },
					y: { from: 0, to: 0 },
					h: { from: h, to: h },
					w: { from: w, to: w },
					opacity: { from: 1, to: 0 }
				}));
			} 
			else if (this._view.currentAnim == this._anims.horizontalIn || this._view.currentAnim == this._anims.horizontalOut)
			{
				var h1From = h / 2;
				var h1To = 0;
				var y2From = h / 2;
				var y2To = h;
				var h2From = h / 2;
				var h2To = 0;
				
				var modeIn = (this._view.currentAnim == this._anims.horizontalIn);
				if (modeIn)
				{
					var tmp = this._transitionContext.bgImage;
					this._transitionContext.bgImage = this._transitionContext.fgImage;
					this._transitionContext.fgImage = tmp;
					
					h1From = 0;
					h1To = h / 2;
					y2From = h;
					y2To = h / 2;
					h2From = 0;
					h2To = h / 2;
				}
				
				this._transitions.push(new wink.ui.xy.Slideshow.Transition({
					stepCount: stepCount,
					x: { from: 0, to: 0 },
					y: { from: 0, to: 0 },
					h: { from: h1From, to: h1To },
					w: { from: w, to: w }
				}));
				this._transitions.push(new wink.ui.xy.Slideshow.Transition({
					stepCount: stepCount,
					x: { from: 0, to: 0 },
					y: { from: y2From, to: y2To },
					h: { from: h2From, to: h2To },
					w: { from: w, to: w }
				}));
			}
			else if (this._view.currentAnim == this._anims.circleIn || this._view.currentAnim == this._anims.circleOut)
			{
				var radius = (w > h) ? w / 2 : h / 2;
				radius = Math.sqrt(radius * radius * 2);
				var rFrom = radius;
				var rTo = 0;
				
				var modeIn = (this._view.currentAnim == this._anims.circleIn);
				if (modeIn)
				{
					var tmp = this._transitionContext.bgImage;
					this._transitionContext.bgImage = this._transitionContext.fgImage;
					this._transitionContext.fgImage = tmp;
					
					rFrom = 0;
					rTo = radius;
				}
				
				this._transitions.push(new wink.ui.xy.Slideshow.Transition({
					stepCount: stepCount,
					x: { from: 0, to: 0 },
					y: { from: 0, to: 0 },
					h: { from: h, to: h },
					w: { from: w, to: w },
					circle: { from: rFrom, to: rTo }
				}));
			}
			else if (this._view.currentAnim == this._anims.circlesIn || this._view.currentAnim == this._anims.circlesOut)
			{
				var modeIn = (this._view.currentAnim == this._anims.circlesIn);
				
				if (modeIn)
				{
					var tmp = this._transitionContext.bgImage;
					this._transitionContext.bgImage = this._transitionContext.fgImage;
					this._transitionContext.fgImage = tmp;
				}
				
				var cols = 5;
				var rows = 5;
				var circleW = w / cols;
				var circleH = h / rows;
				var radius = (circleW > circleH) ? circleW / 2 : circleH / 2;
				radius = Math.sqrt(radius * radius * 2);
				
				for (var i = 0; i < cols; i++)
				{
					for (var j = 0; j < rows; j++)
					{
						var xf = circleW * i;
						var yf = circleH * j;
						var rf = radius;
						var rt = 0;
						
						if (modeIn)
						{
							rf = 0;
							rt = radius;
						}
						
						var tr = new wink.ui.xy.Slideshow.Transition({
							stepCount: stepCount,
							x: { from: xf, to: xf },
							y: { from: yf, to: yf },
							h: { from: circleH, to: circleH },
							w: { from: circleW, to: circleW },
							circle: { from: rf, to: rt }
						});
						this._transitions.push(tr);
					}
				}
				
			}
			else if (this._view.currentAnim == this._anims.rowDown || this._view.currentAnim == this._anims.rowUp)
			{
				var up = (this._view.currentAnim == this._anims.rowUp);
				
				if (up)
				{
					var tmp = this._transitionContext.bgImage;
					this._transitionContext.bgImage = this._transitionContext.fgImage;
					this._transitionContext.fgImage = tmp;
				}
				
				var rows = 8;
				var rowH = h / rows;
				
				for (var i = 0; i < rows; i++)
				{
					var yFrom = i * rowH;
					var yTo = yFrom + rowH;
					var hFrom = rowH;
					var hTo = 0;
					if (up)
					{
						yFrom = yFrom + rowH;
						yTo = i * rowH;
						hFrom = 0;
						hTo = rowH;
					}
					
					var tr = new wink.ui.xy.Slideshow.Transition({
						stepCount: stepCount,
						x: { from: 0, to: 0 },
						y: { from: yFrom, to: yTo },
						h: { from: hFrom, to: hTo },
						w: { from: w, to: w }
					});
					this._transitions.push(tr);
				}
			}
			else if (this._view.currentAnim == this._anims.colLeft || this._view.currentAnim == this._anims.colRight)
			{
				var left = (this._view.currentAnim == this._anims.colLeft);
				
				if (left)
				{
					var tmp = this._transitionContext.bgImage;
					this._transitionContext.bgImage = this._transitionContext.fgImage;
					this._transitionContext.fgImage = tmp;
				}
				
				var cols = 8;
				var colW = w / cols;
				
				for (var i = 0; i < cols; i++)
				{
					var xFrom = i * colW;
					var xTo = xFrom + colW;
					var wFrom = colW;
					var wTo = 0;
					if (left)
					{
						xFrom = xFrom + colW;
						xTo = i * colW;
						wFrom = 0;
						wTo = colW;
					}
					
					var tr = new wink.ui.xy.Slideshow.Transition({
						stepCount: stepCount,
						x: { from: xFrom, to: xTo },
						y: { from: 0, to: 0 },
						h: { from: h, to: h },
						w: { from: wFrom, to: wTo }
					});
					this._transitions.push(tr);
				}
			}
			else if (this._view.currentAnim == this._anims.rotate)
			{
				var angleDeg = 90;
				var ox = -w;
				var oy = -h;
				if (this._view.nearestItem > this._view.position)
				{
					angleDeg = -90;
					ox = 0;
				}
				
				var af = 0;
				var at = angleDeg * Math.PI / 180;
				
				this._transitions.push(new wink.ui.xy.Slideshow.Transition({
					stepCount: stepCount,
					x: { from: 0, to: 0 },
					y: { from: 0, to: 0 },
					h: { from: h, to: h },
					w: { from: w, to: w },
					translateX: { from: w, to: w },
					translateY: { from: h, to: h },
					rotate: { from: af, to: at },
					originX: { from: ox, to: ox },
					originY: { from: oy, to: oy }
				}));
			}
			else if (this._view.currentAnim == this._anims.spin || this._view.currentAnim == this._anims.spinQuarter)
			{
				var radius = (w > h) ? w / 2 : h / 2;
				radius = Math.sqrt(radius * radius * 2);
				
				var trParams = [
					{ x: 0, y: 0, h: h, w: w, from: 0, to: Math.PI * 2 }
				];
				
				if (this._view.currentAnim == this._anims.spinQuarter)
				{
					trParams = [
						{ x: w/2, y: h/2, h: h/2, w: w/2, from: 0, to: Math.PI / 2 },
						{ x: w/2, y: 0, h: h/2, w: w/2, from: -Math.PI / 2, to: 0 },
						{ x: 0, y: 0, h: h/2, w: w/2, from: -Math.PI, to: -Math.PI / 2 },
						{ x: 0, y: h/2, h: h/2, w: w/2, from: -3/2 * Math.PI, to: -Math.PI }
					];
				}
				
				for (var i = 0; i < trParams.length; i++)
				{
					var trp = trParams[i];
					this._transitions.push(new wink.ui.xy.Slideshow.Transition({
						stepCount: stepCount,
						x: { from: trp.x, to: trp.x },
						y: { from: trp.y, to: trp.y },
						h: { from: trp.h, to: trp.h },
						w: { from: trp.w, to: trp.w },
						circle: { from: radius, to: radius },
						centerX: { from: w / 2, to: w / 2 },
						centerY: { from: h / 2, to: h / 2 },
						angleBegin: { from: trp.from, to: trp.from },
						angleEnd: { from: trp.from, to: trp.to }
					}));
				}
			}
			else if (this._view.currentAnim == this._anims.light)
			{
				var radius = (w > h) ? w / 2 : h / 2;
				radius = Math.sqrt(radius * radius * 2);
				
				var sc = Math.floor(stepCount / 2);
				
				this._transitions.push(new wink.ui.xy.Slideshow.Transition({
					stepCount: sc,
					x: { from: 0, to: 0 },
					y: { from: 0, to: 0 },
					h: { from: h, to: h },
					w: { from: w, to: w },
					radialGradientR1: { from: 0, to: radius, x: w / 2, y: h / 2 },
					radialGradientR2: { from: radius / 2, to: radius * 1.5, x: w / 2, y: h / 2 }
				}));
				
				this._transitions.push(new wink.ui.xy.Slideshow.Transition({
					stepCount: sc,
					stepCountDelay: sc,
					x: { from: 0, to: 0 },
					y: { from: 0, to: 0 },
					h: { from: h, to: h },
					w: { from: w, to: w },
					radialGradientR1: { from: radius, to: radius - 1, x: w / 2, y: h / 2 },
					radialGradientR2: { from: radius, to: radius, x: w / 2, y: h / 2 },
					gradientOpacity: { from: 1, to: 0 },
					opacity: { from: 0, to: 0 }
				}));
			}
			else if (this._view.currentAnim == this._anims.wrap)
			{
				var wg = w / 8;
				
				this._transitions.push(new wink.ui.xy.Slideshow.Transition({
					stepCount: stepCount,
					x: { from: 0, to: 0 },
					y: { from: 0, to: 0 },
					h: { from: h, to: h },
					w: { from: wg, to: wg },
					wrapPos: { from: 0, to: w }
				}));
			}
			else if (this._view.currentAnim == this._anims.scaleIn || this._view.currentAnim == this._anims.scaleOut)
			{
				var modeIn = (this._view.currentAnim == this._anims.scaleIn);
				
				var start = 1;
				var end = 0;
				if (modeIn)
				{
					var tmp = this._transitionContext.bgImage;
					this._transitionContext.bgImage = this._transitionContext.fgImage;
					this._transitionContext.fgImage = tmp;
					start = 0;
					end = 1;
				}
				
				this._transitions.push(new wink.ui.xy.Slideshow.Transition({
					stepCount: stepCount,
					x: { from: 0, to: 0 },
					y: { from: 0, to: 0 },
					h: { from: h, to: h },
					w: { from: w, to: w },
					scale: { from: start, to: end }
				}));
			}
			
			this._animated = true;
			wink.publish("/slideshow/events/animstart", {
				currentItem: this._items[this._view.position],
				nextItem: this._items[this._view.nearestItem],
				animation: this._params.anims[this._view.animPos]
			});
		},
		/**
		 * Executes an animation step
		 */
		_onAnimMotion: function()
		{
			var finished = true;
			for (var i = 0; i < this._transitions.length; i++)
			{
				this._transitions[i].nextStep();
				finished = finished && this._transitions[i].isFinished();
			}
			
			if (finished)
			{
				this._animated = false;
				wink.publish("/slideshow/events/animend", {
					previousItem: this._items[this._view.position],
					currentItem: this._items[this._view.nearestItem],
					animation: this._params.anims[this._view.animPos]
				});
				this._goToItem(this._view.nearestItem);
			}
		},
		
		/**
		 * Loads images in scope
		 */
		_loadImagesInScope: function()
		{
			this._loading = true;
			
			var scopeBegin, scopeEnd;
			
			var half = Math.floor(this._params.scopeSize / 2);
			scopeBegin = this._view.position - half;
			scopeEnd = this._view.position + half;
			if (scopeBegin < 0)
			{
				scopeBegin = 0;
				scopeEnd = this._params.scopeSize - 1;
			}
			if (scopeEnd > (this._items.length - 1))
			{
				scopeEnd = this._items.length - 1;
			}
			
			this._loadItemImages(scopeBegin, scopeEnd);
			if (scopeBegin > 0)
			{
				this._unloadItemImages(0, scopeBegin - 1);
			}
			if (scopeEnd < (this._items.length - 1))
			{
				this._unloadItemImages(scopeEnd + 1, this._items.length - 1);
			}
		},
		/**
		 * Loads item images according to the given scope
		 * 
		 * @param {integer} scopeBegin The begin of the scope
		 * @param {integer} scopeEnd The end of the scope
		 */
		_loadItemImages: function(scopeBegin, scopeEnd)
		{
			this._view.scopeBegin = scopeBegin;
			this._view.scopeEnd = scopeEnd;
			
			for (var i = scopeBegin; i <= scopeEnd; i++)
			{
				this._loadItemImage(this._items[i]);
			}
			this._checkImagesLoaded();
		},
		/**
		 * Unloads item images according to the given scope
		 * 
		 * @param {integer} scopeBegin The begin of the scope
		 * @param {integer} scopeEnd The end of the scope
		 */
		_unloadItemImages: function(scopeBegin, scopeEnd)
		{
			for (var i = scopeBegin; i <= scopeEnd; i++)
			{
				this._unloadItemImage(this._items[i]);
			}
		},
		/**
		 * Loads an item image
		 * 
		 * @param {object} item The item to load
		 */
		_loadItemImage: function(item)
		{
			if (item.loading == true || item.imgLoaded == true)
			{
				return; // already loaded
			}
			item.imageObj = new Image();
			item.imageObj.src = item.image;
			item.loading = true;
			
			item.imageObj.onload = wink.bind(function(e)
			{
				if (item.imageObj.complete === true)
				{
					item.imgLoaded = true;
					item.loading = false;
					item.w = item.imageObj.width;
					item.h = item.imageObj.height;
					this._checkImagesLoaded();
				}
			}, this);
			item.imageObj.onunload = function(e)
			{
				item.imgLoaded = false;
				item.loading = false;
			};
			item.imageObj.onerror = function(e)
			{
				item.loading = false;
			};
			item.imageObj.abort = function(e)
			{
			};
		},
		/**
		 * Unloads the item image
		 * 
		 * @param {object} item The item to unload
		 */
		_unloadItemImage: function(item)
		{
			if (item.imgLoaded == false)
			{
				return;
			}
			
			item.imageObj.onload = item.imageObj.onunload;
			item.imageObj.src = 'data:image/gif;base64,R0lGODlhAQABAIAAAP///wAAACH5BAEAAAAALAAAAAABAAEAAAICRAEAOw==';
			item.w = item.imageObj.width;
			item.h = item.imageObj.height;
		},
		/**
		 * Clears items status
		 */
		_clearItemsStatus: function()
		{
			for (var i = 0; i < this._items.length; i++)
			{
				this._items[i].imgLoaded = false;
				this._items[i].loading = false;
			}
		},
		/**
		 * Updates the images loading status
		 */
		_checkImagesLoaded: function()
		{
			var allLoaded = true;
			for (var i = this._view.scopeBegin; i <= this._view.scopeEnd; i++)
			{
				allLoaded = allLoaded && this._items[i].imgLoaded == true;
			}
			
			if (allLoaded)
			{
				this._loading = false;
			}
		},
		
		/**
		 * Validate the properties of the component
		 * @returns {boolean} True if the properties are valid, false otherwise
		 */
		_validateProperties: function() 
		{
			if (!wink.isSet(this._properties.height) || !wink.isSet(this._properties.width))
			{
				this._raisePropertyError('height and/or width');
				return false;
			}
			
			if (wink.isSet(this._properties.anims))
			{
				if (!wink.isArray(this._properties.anims) || this._properties.anims.length == 0)
				{
					this._raisePropertyError('anims');
					return false;
				}
				else
				{
					for (var i = 0; i < this._properties.anims.length; i++)
					{
						var animName = this._properties.anims[i];
						if (!wink.isSet(this._anims[animName]))
						{
							this._raisePropertyError('animation named "' + animName + '"');
							return false;
						}
					}
				}
			}
			
			return true;
		},
		/**
		 * Raise the property error
		 * 
		 * @param {object} property The invalid property
		 */
		_raisePropertyError: function(property)
		{
			wink.log('[Slideshow] Error: ' + property + ' missing or invalid');
		},
		/**
		 * Initialize datas with given properties
		 */
		_initProperties: function()
		{
			this._mixParams(this._properties);
			delete this._properties;
		},
		/**
		 * Updates the slideshow parameters with the given ones
		 * 
		 * @param {object} properties A set of properties
		 */
		_mixParams: function(properties)
		{
			if (wink.isSet(properties.height))
			{
				this._view.h = properties.height;
				if (this._domNode != null)
				{
					this._domNode.style.height = this._view.h + 'px';
				}
				if (this._canvasNode != null)
				{
					this._canvasNode.height = this._view.h;
				}
				if (this._footerNode != null)
				{
					this._footerNode.style.top = (this._view.h - this._params.footerHeight) + 'px';
				}
			}
			if (wink.isSet(properties.width))
			{
				this._view.w = properties.width;
				if (this._domNode != null)
				{
					this._domNode.style.width = this._view.w + 'px';
				}
				if (this._canvasNode != null)
				{
					this._canvasNode.width = this._view.w;
				}
				if (this._headerNode != null)
				{
					this._headerNode.style.width = this._view.w + 'px';
				}
				if (this._footerNode != null)
				{
					this._footerNode.style.width = this._view.w + 'px';
				}
			}
			if (wink.isSet(properties.headerHeight) && this._headerNode != null)
			{
				this._headerNode.style.height = properties.headerHeight + 'px';
			}
			if (wink.isSet(properties.footerHeight) && this._footerNode != null)
			{
				this._footerNode.style.height = properties.footerHeight + 'px';
			}
			if (wink.isSet(properties.position))
			{
				this._view.position = properties.position;
			}
			if (!wink.isSet(this._view.position))
			{
				this._view.position = 0;
			}
			
			if (wink.isSet(properties.items))
			{
				this._items = new Array().concat(properties.items);
				for (var i = 0; i < this._items.length; i++)
				{
					this._items[i].index = i;
				}
				this._clearItemsStatus();
			}
			
			for (var p in this._params)
			{
				if (wink.isSet(properties[p]))
				{
					this._params[p] = properties[p];
				}
			}
			if (!wink.isSet(this._params.anims))
			{
				this._params.anims = [];
			}
		},
		/**
		 * Initialize the DOM nodes
		 */
		_initDom: function()
		{
			this._domNode = document.createElement('div');
			wink.fx.apply(this._domNode, {
				height: this._view.h + 'px',
				width: this._view.w + 'px'
			});
	
			this._canvasNode = document.createElement('canvas');
			this._canvasNode.height = this._view.h;
			this._canvasNode.width = this._view.w;
			this._ctx = this._canvasNode.getContext('2d');
			this._domNode.appendChild(this._canvasNode);
			this._canvasNode.translate(0, 0);
			
			wink.addClass(this._domNode, 'ss_container');
			wink.addClass(this._canvasNode, 'ss_canvas');
			
			if (this._params.displayHeader)
			{
				this._createHeader();
			}
			
			if (this._params.displayFooter)
			{
				this._createFooter();
			}
		},
		/**
		 * Initialize the DOM nodes
		 */
		_createHeader: function()
		{
			this._headerNode = document.createElement('div');
			this._domNode.appendChild(this._headerNode);
			wink.addClass(this._headerNode, 'ss_header');
			
			wink.fx.apply(this._headerNode, {
				top: 0 + 'px',
				left: 0 + 'px',
				width: this._view.w + 'px',
				height: this._params.headerHeight + 'px'
			});
		},
		/**
		 * Initialize the DOM nodes
		 */
		_createFooter: function()
		{
			this._footerNode = document.createElement('div');
			this._domNode.appendChild(this._footerNode);
			wink.addClass(this._footerNode, 'ss_footer');
	
			wink.fx.apply(this._footerNode, {
				top: (this._view.h - this._params.footerHeight) + 'px',
				left: 0 + 'px',
				width: this._view.w + 'px',
				height: this._params.footerHeight + 'px'
			});
		},
		/**
		 * Initialize listeners
		 */
		_initListeners: function() 
		{
			if (this._params.listeningTouch == true)
			{
				if (this._movementtracker == null)
				{
					this._movementtracker = new wink.ux.MovementTracker({ target: this._domNode });
				}
				wink.subscribe('/movementtracker/events/mvtchanged', { context: this, method: '_handleMovementChanged' });
				wink.subscribe('/movementtracker/events/mvtstored', { context: this, method: '_handleMovementStored' });
			}
			else
			{
				wink.unsubscribe('/movementtracker/events/mvtchanged', { context: this, method: '_handleMovementChanged' });
				wink.unsubscribe('/movementtracker/events/mvtstored', { context: this, method: '_handleMovementStored' });
			}
		}
	};
	
	/**
	 * @class Implements a slideshow Transition. A transition, allows to change the value of one or more properties in the steps that compose it.
	 * 
	 * @param {object} properties The properties object
	 * @param {integer} properties.stepCount The number of stages of the transition.
	 * @param {object} properties.x An obect containing the start and end values of the variable
	 * @param {object} properties.x.from The start value
	 * @param {object} properties.x.to The end value
	 */
	wink.ui.xy.Slideshow.Transition = function(properties) 
	{
		/**
		 * Unique identifier
		 * 
		 * @property
		 * @type integer
		 */
		this.uId = wink.getUId();
		
		
		this._properties		= properties;
		
		this._props				= [];
		this.currentStep		= 0;
		this.currentStepDelay	= 0;
		this._stepCount			= 0;
		this._stepCountDelay	= 0;
		
		this._init();
	};
	
	wink.ui.xy.Slideshow.Transition.prototype = 
	{
		/**
		 * Performs the next step of the transition
		 */
		nextStep: function()
		{
			if (this.isOnDelay())
			{
				this.currentStepDelay++;
				return;
			}
			
			for (var prop in this._props)
			{
				var p = this._props[prop];
				if (p.toCheck)
				{
					(p.to > p.from) ? p.current += p.step : p.current -= p.step;
				}
				p.current = wink.math.round(p.current, 3);
			}
			this._updatePublicProps();
			this.currentStep++;
		},
		/**
		 * Returns true if the transition is over
		 * 
		 * @returns {boolean} True is the transition is over, false otherwise
		 */
		isFinished: function()
		{
			var f = false;
			var checked = false;
			for (var prop in this._props)
			{
				var p = this._props[prop];
				if (p.toCheck)
				{
					f = f || ((p.to > p.from) ? ((p.current >= p.to) ? true : false) : ((p.current <= p.to) ? true : false));
					checked = true;
				}
			}
			if (!checked)
			{
				f = true;
			}
			return f;
		},
		/**
		 * Returns true if the transition is on hold
		 * 
		 * @returns {boolean} True is the transition is on hold, false otherwise
		 */
		isOnDelay: function()
		{
			var onDelay = (this.currentStepDelay != this._stepCountDelay);
			return onDelay;
		},
		/**
		 * Returns the transition properties
		 * 
		 * @returns {object} The transition properties
		 */
		getProperties: function()
		{
			return this._properties;
		},
		/**
		 * Initialize the transtion
		 */
		_init: function()
		{
			for (var p in this._properties)
			{
				var value = this._properties[p];
				if (p == 'stepCount')
				{
					this._stepCount = value;
				}
				if (p == 'stepCountDelay')
				{
					this._stepCountDelay = value;
				}
			}
			
			for (var p in this._properties)
			{
				var value = this._properties[p];
				if (p != 'stepCount' && p != 'stepCountDelay') {
					this._props[p] = {
						from: value.from,
						to: value.to,
						step: Math.max(wink.math.round(Math.abs(value.to - value.from) / this._stepCount, 3), 0.01),
						current: value.from,
						toCheck: (value.from != value.to)
					};
				}
			}
			this._updatePublicProps();
		},
		/**
		 * Updated public properties
		 */
		_updatePublicProps: function()
		{
			for (var prop in this._props)
			{
				this[prop] = this._props[prop].current;
			}
		}
	};
	
	return wink.ui.xy.Slideshow;
});