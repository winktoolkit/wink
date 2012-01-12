/*--------------------------------------------------------
 * Copyright (c) 2011, The Dojo Foundation
 * This software is distributed under the "Simplified BSD license",
 * the text of which is available at http://www.winktoolkit.org/licence.txt
 * or see the "license.txt" file for more details.
 *--------------------------------------------------------*/

/**
 * @fileOverview Creates a 3D wall (3 rows of images)
 * Displays a 3D wall on the screen. The wall is composed of 3 rows of images. The wall is being moved with its right and left directional arrows
 *
 * @compatibility Iphone OS2 (slow), Iphone OS3, Iphone OS4, BlackBerry 7
 * 
 * @author Jerome GIRAUD
 */

/**
 * The event is fired when the user clicks on one of the images of the wall
 * 
 * @name wink.ui.xyz.Wall#/wall/events/click
 * @event
 * @param {object} param The parameters object
 * @param {HTMLElement} param.item The image on which the user just clicked
 */

define(['../../../../_amd/core', '../../../../fx/_xyz/js/3dfx'], function(wink)
{
	/**
	 * @class Creates a 3D wall (3 rows of images)
	 * Displays a 3D wall on the screen. The wall is composed of 3 rows of images. The wall is being moved with its right and left directional arrows
	 * <br>
	 * When you instantiate the wall, you must specify the images you want to see in it.
	 * Each row must be described and must contain the smae number of images.
	 * You can also specify the images height, width and rightMargin.
	 * Use the 'getDomNodes' method to add the wall, and the left and right directional arrows to the page. The should be added directly to the body of the page.
	 * 
	 * @param {object} properties The properties object
	 * @param {object} properties.wallDatas The wall datas
	 * @param {array} properties.wallDatas.row1 The images to be displayed in the first row of the wall
	 * @param {array} properties.wallDatas.row2 The images to be displayed in the second row of the wall
	 * @param {array} properties.wallDatas.row3 The images to be displayed in the third row of the wall
	 * @param {integer} [properties.thumbHeight=75] The height in pixels of the thumbnails to be displayed
	 * @param {integer} [properties.thumbWidth=125] The width in pixels of the thumbnails to be displayed
	 * @param {integer} [properties.thumbMargins=0] The right margin in pixels of each thumb
	 * @param {float} [properties.speed=1.2] The srcolling speed of the 3D wall
	 * 
	 * @requires wink.fx._xyz
	 * 
	 * @example
	 * 
	 * var wallProperties =
	 * {
	 *   thumbMargins: 20,
	 *   wallDatas: 
	 *   {
	 *      row1: [
	 *      	{ img: "../img/1.gif" },
	 *      	{ img: "../img/2.gif" },
	 *      	{ img: "../img/3.gif" },
	 *      	{ img: "../img/4.gif" },
	 *      	{ img: "../img/5.gif" }
	 *      ],
	 *      row2: [
	 *      	{ img: "../img/1.gif" },
	 *      	{ img: "../img/2.gif" },
	 *      	{ img: "../img/3.gif" },
	 *      	{ img: "../img/4.gif" },
	 *      	{ img: "../img/5.gif" }
	 *      ],
	 *      row3: [
	 *      	{ img: "../img/1.gif" },
	 *      	{ img: "../img/2.gif" },
	 *      	{ img: "../img/3.gif" },
	 *      	{ img: "../img/4.gif" },
	 *      	{ img: "../img/5.gif" }
	 *      ],	
	 *   }
	 * };
	 * 
	 * wall = new wink.ui.xyz.Wall(wallProperties);
	 * 
	 * document.body.appendChild(wall.getDomNodes().wall);
	 * document.body.appendChild(wall.getDomNodes().leftPad);
	 * document.body.appendChild(wall.getDomNodes().rightPad);
	 * 
	 * @see <a href="WINK_ROOT_URL/ui/xyz/wall/test/test_wall.html" target="_blank">Test page</a>
	 */
	wink.ui.xyz.Wall = function(properties)
	{
		/**
		 * Unique identifier
		 * 
		 * @property uId
		 * @type integer
		 */
		this.uId           = wink.getUId();
		
		/**
		 * The height in pixels of the images
		 * 
		 * @property thumbHeight
		 * @type integer
		 */
		this.thumbHeight   = 75;
		
		/**
		 * The width in pixels of the images
		 * 
		 * @property thumbWidth
		 * @type integer
		 */
		this.thumbWidth    = 125;
		
		/**
		 * The right margin in pixels of each thumb
		 * 
		 * @property thumbMargins
		 * @type integer
		 */
		this.thumbMargins  = 0;
		
		/**
		 * The scrolling speed of the 3D wall
		 * 
		 * @property speed
		 * @type float
		 */
		this.speed         = 1.2;
		
		/**
		 * The bricks of the wall
		 * 
		 * @property wallDatas
		 * @type object
		 */
		this.wallDatas     = null;
		
		this._slidingDist  = 350;
		this._rollerWidth  = 0;
		
		this._stopped      = true;
		
		this._motionTimer  = null;
		
		this._domNode      = null;
		this._row1Node     = null;
		this._row2Node     = null;
		this._row3Node     = null;
		this._wallNode     = null;
		this._rollerNode   = null;
		this._padLeftNode  = null;
		this._padRightNode = null;
		
		wink.mixin(this, properties);
		
		if ( this._validateProperties() === false )return;
	
		this._initProperties();	
		this._initDom();
		this._positionTransformOrigin();
		this._initListeners();
	};
	
	wink.ui.xyz.Wall.prototype =
	{
		/**
		 * @returns {object} The 'wall' main dom node but also the 'leftPad' and 'rightPad'
		 * @returns {HTMLElement} object.wall
		 * @returns {HTMLElement} object.leftPad
		 * @returns {HTMLElement} object.rightPad
		 */
		getDomNodes: function()
		{
			return {'wall': this._domNode, 'leftPad': this._padLeftNode, 'rightPad': this._padRightNode};
		},
		
		/**
		 * Adds a new image to the Wall
		 * 
		 * @param {array} bricks The bricks to add
		 * @param {HTMLElement} rowNode The row node
		 */
		_addBricks: function(bricks, rowNode)
		{
			var l = bricks.length;
			
			for ( var i=0; i<l; i++ )
			{
				var img = document.createElement('img');
				
				img.src = bricks[i].img;
				wink.fx.apply(img, {
					height: this.thumbHeight + 'px',
					width: this.thumbWidth + 'px'
				});
				
				img.onclick = function()
				{
					wink.publish('/wall/events/click', {'item': this});
				};
	
				rowNode.appendChild(img);
				
				img.translate((i*(this.thumbWidth+this.thumbMargins)), 0);
			}
		},
		
		/**
		 * Start rolling the wall to the left
		 */
		_padLeftStart: function()
		{
			var x1 = wink.fx.getTransformPosition(this._wallNode).x;
			var x2 = this._rollerWidth - document.documentElement.offsetWidth - this._slidingDist + x1;
			
			if ( Math.abs(x1) >= (this._rollerWidth - document.documentElement.offsetWidth - this._slidingDist) )
			{
				return;
			} else
			{
				this._stopped = false;
			}
	
			wink.fx.applyTransformTransition(this._rollerNode, '1s', 0, 'ease-in');
			wink.fx.applyTransformTransition(this._wallNode, (x2/this.speed) + 'ms', 0, 'ease-in');
			
			wink.fx.set3dTransform(this._rollerNode, { type: "rotate", x: 0, y: 1, z: 0, angle: 30 }, false);
			this._wallNode.translate(-(this._rollerWidth - document.documentElement.offsetWidth - this._slidingDist), 0, 0);
			
			this._motionTimer = wink.setTimeout(this, '_padLeftEnd', x2/this.speed);
		},
		
		/**
		 * Stop rolling the wall to the left
		 */
		_padLeftEnd: function()
		{	
			if ( this._stopped == false )
			{
				clearTimeout(this._motionTimer);
	
				var x = wink.fx.getTransformPosition(this._wallNode).x;
				
				wink.fx.applyTransformTransition(this._rollerNode, (3*(this._slidingDist/this.speed)-100) + 'ms', 100, 'ease-out');
				wink.fx.applyTransformTransition(this._wallNode, 3*(this._slidingDist/this.speed) + 'ms', 0, 'ease-out');
				
				wink.fx.set3dTransform(this._rollerNode, { type: "rotate", x: 0, y: 1, z: 0, angle: 0 }, false);
				this._wallNode.translate(x - this._slidingDist, 0, 0);
				
				this._stopped = true;
			}
		},
		
		/**
		 * Start rolling the wall to the right
		 */
		_padRightStart: function()
		{
			var x1 = wink.fx.getTransformPosition(this._wallNode).x;
			var x2 = Math.abs(x1);
			
			if ( Math.abs(x1) <= this._slidingDist )
			{
				return;
			} else
			{
				this._stopped = false;
			}
			
			wink.fx.applyTransformTransition(this._rollerNode, '1s', 0, 'ease-in');
			wink.fx.applyTransformTransition(this._wallNode, (x2/this.speed) + 'ms', 0, 'ease-in');
			
			wink.fx.set3dTransform(this._rollerNode, { type: "rotate", x: 0, y: 1, z: 0, angle: -30 }, false);
			this._wallNode.translate(-this._slidingDist, 0, 0);
			
			this._motionTimer = wink.setTimeout(this, '_padRightEnd', x2/this.speed);
		},
		
		/**
		 * Stop rolling the wall to the right
		 */
		_padRightEnd: function()
		{
			if ( this._stopped == false )
			{
				clearTimeout(this._motionTimer);
				
				var x = wink.fx.getTransformPosition(this._wallNode).x;
				
				wink.fx.applyTransformTransition(this._rollerNode, (3*(this._slidingDist/this.speed)-100) + 'ms', 100, 'ease-out');
				wink.fx.applyTransformTransition(this._wallNode, 3*(this._slidingDist/this.speed) + 'ms', 0, 'ease-out');
		
				wink.fx.set3dTransform(this._rollerNode, { type: "rotate", x: 0, y: 1, z: 0, angle: 0 }, false);
				this._wallNode.translate(x + this._slidingDist + this.thumbMargins, 0, 0);
				
				this._stopped = true;
			}
		},
		
		/**
		 * 
		 */
		_positionTransformOrigin : function()
		{
			wink.fx.apply(this._rollerNode, {
				"transform-origin": (document.documentElement.offsetWidth/2) + 'px'
			});
		},
		
		/**
		 * Validate the properties of the component
		 * @returns {boolean} True if the properties are valid, false otherwise
		 */
		_validateProperties: function()
		{		
			if ( !wink.isSet(this.wallDatas) || !wink.isSet(this.wallDatas.row1) || !wink.isSet(this.wallDatas.row2) || !wink.isSet(this.wallDatas.row3) ) 
			{
				wink.log('[Wall] The 3 rows of the wallmust be specified using the wallDatas property');
				return false;
			}
			
			if ( !wink.isNumber(this.thumbHeight) ) 
			{
				wink.log('[Wall] The thumbHeight property must be an integer');
				return false;
			}
			
			if ( !wink.isNumber(this.thumbWidth) ) 
			{
				wink.log('[Wall] The thumbWidth property must be an integer');
				return false;
			}
			
			if ( !wink.isNumber(this.thumbMargins) ) 
			{
				wink.log('[Wall] The thumbMargins property must be an integer');
				return false;
			}
			
			if ( !wink.isNumber(this.speed) ) 
			{
				wink.log('[Wall] The speed property must be an integer');
				return false;
			}
			
			return true;
		},
		
		/**
		 * initialize the properties
		 */
		_initProperties: function()
		{
			this._rollerWidth = this.wallDatas.row1.length*(this.thumbWidth+this.thumbMargins);
		},
		
		/**
		 * Initiate touch events listeners
		 */
		_initListeners: function()
		{
			wink.ux.touch.addListener(this._padLeftNode, "start", { context: this, method: "_padLeftStart", arguments: null }, { preventDefault: true });
			wink.ux.touch.addListener(this._padLeftNode, "end", { context: this, method: "_padLeftEnd", arguments: null }, { preventDefault: true });
			
			wink.ux.touch.addListener(this._padRightNode, "start", { context: this, method: "_padRightStart", arguments: null }, { preventDefault: true });
			wink.ux.touch.addListener(this._padRightNode, "end", { context: this, method: "_padRightEnd", arguments: null }, { preventDefault: true });
			
			window.addEventListener("orientationchange", wink.bind(function(){this._positionTransformOrigin();}, this), false);
		},
		
		/**
		 * Creates the DOM nodes of the wall
		 */
		_initDom: function()
		{
			this._domNode = document.createElement('div');
				
			this._row1Node = document.createElement('div');
			this._row2Node = document.createElement('div');
			this._row3Node = document.createElement('div');
			
			this._wallNode = document.createElement('div');
			this._rollerNode = document.createElement('div');
			
			this._padLeftNode = document.createElement('div');
			this._padRightNode = document.createElement('div');
			
			this._row1Node.id = 'row1';
			this._row1Node.className = 'wa_row';
			this._row1Node.style.height = (this.thumbHeight+4) + 'px';
			
			this._row2Node.id = 'row2';
			this._row2Node.className = 'wa_row';
			this._row2Node.style.height = (this.thumbHeight+4) + 'px';
			
			this._row3Node.id = 'row3';
			this._row3Node.className = 'wa_row';
			this._row3Node.style.height = (this.thumbHeight+4) + 'px';
			
			this._rollerNode.className = 'wa_roller';
			this._rollerNode.style.width = this._rollerWidth + 'px'; 
			
			this._padLeftNode.className = 'wa_padLeft';
			this._padRightNode.className = 'wa_padRight';
			
			this._addBricks(this.wallDatas.row1, this._row1Node);
			this._addBricks(this.wallDatas.row2, this._row2Node);
			this._addBricks(this.wallDatas.row3, this._row3Node);
			
			this._wallNode.appendChild(this._row1Node);
			this._wallNode.appendChild(this._row2Node);
			this._wallNode.appendChild(this._row3Node);
			
			this._rollerNode.appendChild(this._wallNode);
	
			this._domNode.className = 'wa_container';
			this._domNode.appendChild(this._rollerNode);
		}
	};
	
	return wink.ui.xyz.Wall;
});