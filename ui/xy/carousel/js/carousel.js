/*--------------------------------------------------------
 * Copyright (c) 2011, The Dojo Foundation
 * This software is distributed under the "Simplified BSD license",
 * the text of which is available at http://www.winktoolkit.org/licence.txt
 * or see the "license.txt" file for more details.
 *--------------------------------------------------------*/

/**
 * @fileOverview Implements a carousel
 * 
 * @compatibility Iphone OS2, Iphone OS3, Iphone OS4, Android 1.5, Android 2.1, Android 2.2, Android 2.3, Android 3.0, Android 3.1, BlackBerry 6, BlackBerry 7, Bada 1.0
 * @author Jerome GIRAUD
 */

/**
 * The event is fired when there is an item switch
 * 
 * @name wink.ui.xy.Carousel#/carousel/events/switch

 * @event
 * 
 * @param {object} param The parameters object
 * @param {integer} param.carouselId The uId of the carousel triggering the event
 * @param {integer} param.currentItemIndex The current carousel item
 */
define(['../../../../_amd/core'], function(wink)
{
	/**
	 * @class Implements a carousel
	 * <br>
	 * Built to add a Carousel in your page. You can insert images or DOM nodes inside your Carousel.
	 * The navigation is handled through touch events (a gesture on the left or on the right will make it switch items).
	 * The carousel also handles the click events on its items.
	 * Note that it could also be used with the 'history' component to handle the 'back' and 'forward' buttons in a custom way
	 * <br><br>
	 * The Carousel needs properties to define its behaviour and its items. As all other graphical components,
	 * it has a getDomNode method that should be used after the instantiation to add the carousel node to the page.
	 * The code sample shows how to instantiate a new carousel and to add it to a section of a webpage.
	 * 
	 * @param {object} properties The properties object
	 * @param {integer} [properties.itemsWidth=250] The width of the items of the Carousel
	 * @param {integer} [properties.itemsHeight=100] The height of the items of the Carousel
	 * @param {string} [properties.display="horizontal"] Either vertical or horizontal
	 * @param {integer} [properties.displayDots=1] Whether or not to display the position indicators
	 * @param {integer} [properties.autoAdjust=1] Should the Carousel auto-adjust items position after each movement
	 * @param {integer} [properties.autoAdjustDuration=800] The transition duration for the auto adjust slide
	 * @param {integer} [properties.autoPlay=0] Does the Carousel automatically starts sliding
	 * @param {integer} [properties.autoPlayDuration=800] The time interval between two autoplays
	 * @param {integer} [properties.firstItemIndex=1] The item to be displayed in the center of the page at startup
	 * @param {integer} [properties.containerWidth=window.innerWidth] The width of the div containing the carousel
	 * @param {string} [properties.itemsAlign="center"] The alignment of the first item of the carousel (either "left" or "center")
	 * @param {array} properties.items An array containing the items of the carousel
	 * @param {string} properties.items.type The type of the content (can be a DOM node or a string)
	 * @param {string|HTMLElement} properties.items.content The content of the item
	 * @param {boolean} [properties.touchPropagation=true] Indicates whether the touch event on the Carousel must be propagated
	 * 
	 * @example
	 * 
	 * var properties = 
	 * {
	 * 	itemsWidth: 280,
	 * 	itemsHeight: 136,
	 * 	autoAdjust: 1,
	 * 	autoAdjustDuration: 400,
	 * 	autoPlay: 1,
	 * 	autoPlayDuration: 4000,
	 * 	firstItemIndex: 2,
	 * 	items:
	 * 	[
	 * 		{'type': 'string', 'content': '&lt;img src="../img/carousel_image_01.png" onclick="alert(1)" /&gt;'},
	 * 		{'type': 'string', 'content': '&lt;img src="../img/carousel_image_02.png" onclick="alert(2)" /&gt;'},
	 * 		{'type': 'string', 'content': '&lt;img src="../img/carousel_image_03.png" onclick="alert(3)"/&gt;'}
	 * 	]
	 * }
	 * 
	 * carousel = new wink.ui.xy.Carousel(properties);
	 * 
	 * $('output').appendChild(carousel.getDomNode());
	 * 
	 * @see <a href="WINK_ROOT_URL/ui/xy/carousel/test/test_carousel_1.html" target="_blank">Test page</a>
	 * @see <a href="WINK_ROOT_URL/ui/xy/carousel/test/test_carousel_2.html" target="_blank">Test page (vertical)</a>
	 */
	wink.ui.xy.Carousel = function(properties)
	{
		/**
		 * Unique identifier
		 * 
		 * @property uId
		 * @type integer
		 */
		this.uId = wink.getUId();
		
		/**
		 * The list of carousel items
		 * 
		 * @property items
		 * @type array
		 */
		this.items = [];
		
		/**
		 * The item to be displayed in the center of the page at startup
		 * 
		 * @property firstItemIndex
		 * @type integer
		 * @default 1
		 */
		this.firstItemIndex = 1;
		
		/**
		 * The width of the items of the Carousel
		 * 
		 * @property itemsWidth
		 * @type integer
		 * @default 250
		 */
		this.itemsWidth = 250;
		
		/**
		 * The height of the items of the Carousel
		 * 
		 * @property itemsHeight
		 * @type integer
		 * @default 100
		 */
		this.itemsHeight = 100;
		
		/**
		 * The type of display: either vertical or horizontal
		 * 
		 * @property display
		 * @type string
		 * @default horizontal
		 */
		this.display = this._HORIZONTAL_POSITION;
		
		/**
		 * The width of the div containing the carousel
		 * 
		 * @property containerWidth
		 * @type integer
		 * @default window.innerWidth
		 */
		this.containerWidth = window.innerWidth;
		
		/**
		 * The height of the div containing the carousel
		 * 
		 * @property containerHeight
		 * @type integer
		 */
		this.containerHeight = null;
		
		/**
		 * Whether or not to display the position indicators
		 * 
		 * @property displayDots
		 * @type integer
		 * @default 1
		 */
		this.displayDots = 1;
		
		/**
		 * Should the Carousel auto-adjust items position after each movement
		 * 
		 * @property autoAdjust
		 * @type integer
		 * @default 1
		 */
		this.autoAdjust = 1;
		
		/**
		 * The transition duration for the auto adjust slide
		 * 
		 * @property autoAdjustDuration
		 * @type integer
		 * @default 800
		 */
		this.autoAdjustDuration = 800;
		
		/**
		 * Does the Carousel automatically starts sliding
		 * 
		 * @property autoPlay
		 * @type integer
		 * @default 0
		 */
		this.autoPlay = 0;
		
		/**
		 * The time interval between two autoplays
		 * 
		 * @property autoPlayDuration
		 * @type integer
		 * @default 3000
		 */
		this.autoPlayDuration = 3000;
		
		/**
		 * The alignment of the first item of the carousel
		 * 
		 * @property itemsAlign
		 * @type string
		 * @default center
		 */
		this.itemsAlign = this._CENTER_POSITION;
		
		/**
		 * Indicates whether the touch event on the Carousel must be propagated
		 * 
		 * @property touchPropagation
		 * @type boolean
		 * @default true
		 */
		this.touchPropagation = true;
		
		this._currentItemIndex  = 0;
		
		this._containerWidthSet = 0;
	
		this._beginXY           = 0;
		this._currentXY         = 0;
		
		this._position          = 0;
		
		this._iD                = 0;
		this._cD                = 0;
		
		this._minXY             = 0;
		this._maxXY             = 0;
		
		this._autoPlayInterval  = null;
		this._autoPlayDirection = 1;
		
		this._startEvent        = null;
		this._endEvent          = null;
		
		this._itemsList         = [];
		this._dotsList          = [];
		
		this._domNode           = null;
		this._headerNode        = null;
		this._itemsNode         = null;
		this._dotsNode          = null;
		this._footerNode        = null;
	
		wink.mixin(this, properties);
		
		if ( this._validateProperties() ===  false )return;
		if ( wink.isSet(properties.containerWidth) )this._containerWidthSet = 1;
		
		this._initProperties();
		this._initDom();
		this._positionItems();
		this._initListeners();
	};
	
	wink.ui.xy.Carousel.prototype =
	{
		_LEFT_POSITION: 'left',
		_CENTER_POSITION: 'center',
		_VERTICAL_POSITION: 'vertical',
		_HORIZONTAL_POSITION: 'horizontal',
	
		/**
		 * Returns the dom node containing the Carousel
		 * 
		 * @returns {HTMLElement} The main dom node
		 */
		getDomNode: function()
		{
			return this._domNode;
		},
		
		/**
		 * Cleans the dom of the Carousel content nodes. To invoke only if Carousel no longer used.
		 */
		clean: function()
		{
			for (var i = 0; i < this._itemsList.length; i++) {
				this._itemsList[i].getDomNode().innerHTML = '';
			}
			this._domNode.innerHTML = '';
		},
		
		/**
		 * Display the selected item
		 * 
		 * @param {integer} index The index of the item we want to move to
		 */
		goToItem: function(index)
		{
			var l = this._itemsList.length;
			
			for ( var i=0; i<l; i++)
			{
				if(this.itemsAlign == this._CENTER_POSITION)
				{
					this._itemsList[i].position = ((i-index)*this._iD + (this._cD-this._iD)/2);
				} else
				{
					this._itemsList[i].position = (i-index)*this._iD;
				}
			}
			
			this.position = (this.firstItemIndex-index)*this._iD;
			
			wink.fx.apply(this._itemsNode, {
				"transition-duration": this.autoAdjustDuration + 'ms',
				"transition-timing-function": 'ease-out'
			});
			
			this._currentXY = (this.firstItemIndex-index)*this._iD;
			
			if ( this.display == this._HORIZONTAL_POSITION )
			{
				this._itemsNode.translate((this.firstItemIndex-index)*this._iD, 0);
			} else
			{
				this._itemsNode.translate(0, (this.firstItemIndex-index)*this._iD);
			}
				
			this._currentItemIndex = index;
			
			this._selectItem(this._currentItemIndex);
			
			wink.publish('/carousel/events/switch', {'carouselId': this.uId, 'currentItemIndex': this._currentItemIndex});
		},
		
		/**
		 * Refresh containerWidth, set container width, refresh min and max values
		 * 
		 * @param {integer} containerWidth The width of the carousel's container
		 */
		refreshContainerWidth: function(containerWidth)
		{	
			this._setContainerWidth(containerWidth);
			this._setMinMaxValues();
		},
		
		/**
		 * Add a new item in the Carousel
		 * 
		 * @param {string} type The type of the content ("node" or "string")
		 * @param {string|HTMLElement} content The content of the item
		 * @param {integer} index The position of the item in the carousel
		 */
		_addItem: function(type, content, index)
		{
			var node, item;
			
			if ( type == 'node' )
			{
				node = content;
			} else
			{
				node = document.createElement('div');
				node.innerHTML = content;
			}
			
			item = new wink.ui.xy.Carousel.Item({'width': this.itemsWidth, 'height': this.itemsHeight, 'node': node, 'index': (index-this.firstItemIndex)});
		
			this._itemsList.push(item);
		},
		
		/**
		 * Listen to the start events
		 * 
		 * @param {wink.ux.Event} event The start event
		 */
		_touchStart: function(event)
		{
			this._startEvent = event;
			
			if (this.display == this._HORIZONTAL_POSITION)
			{
				var _c = event.x;
			} else
			{
				var _c = event.y;
			}
			
			if (this.touchPropagation == false)
			{
				this._startEvent.stopPropagation();
			}
			
			if ( this._autoPlayInterval != null )
			{
				clearInterval(this._autoPlayInterval);
				this._autoPlayInterval = null;
			}
			
			this._beginXY = _c;
			
			wink.fx.apply(this._itemsNode, {
				"transition-duration": '',
				"transition-timing-function": ''
			});
		},
		
		/**
		 * Listen to the move events
		 * 
		 * @param {wink.ux.Event} event The move event
		 */
		_touchMove: function(event)
		{
			if (this.display == this._HORIZONTAL_POSITION)
			{
				var _c = event.x;
			} else
			{
				var _c = event.y;
			}
			
			// If the auto adjust parameter is not set, stop the movement at both ends of the carousel
			if ( (this.autoAdjust == 0) && (((this._currentXY + _c - this._beginXY) > this._minXY) || ((this._currentXY + _c - this._beginXY)< this._maxXY )))
			{
				return;
			}
			
			// Update items positions
			var l = this._itemsList.length;
			
			for ( var i=0; i<l; i++)
			{
				this._itemsList[i].position = (this._itemsList[i].beginXY + _c - this._beginXY);
			}
			
			// Update carousel position
			this.position = this._currentXY + _c - this._beginXY;
			
			if ( this.display == this._HORIZONTAL_POSITION )
			{
				this._itemsNode.translate(this.position, 0);
			} else
			{
				this._itemsNode.translate(0, this.position);
			}
		},
		
		/**
		 * Listen to the end events
		 * 
		 * @param {wink.ux.Event} event The end event
		 */
		_touchEnd: function(event)
		{
			this._endEvent = event;
			
			if (this.display == this._HORIZONTAL_POSITION)
			{
				var _sc = this._startEvent.x;
				var _ec = this._endEvent.x;
			} else
			{
				var _sc = this._startEvent.y;
				var _ec = this._endEvent.y;
			}
			
			// Check if a click event must be generated
			if ( ((this._endEvent.timestamp-this._startEvent.timestamp) < 250) && (Math.abs(_ec - _sc) < 20))
			{
				this._endEvent.dispatch(this._endEvent.target, 'click');
				return;
			}
			
			// Update items positions
			var l = this._itemsList.length;
			
			for ( var i=0; i<l; i++)
			{
				this._itemsList[i].beginXY = this._itemsList[i].position;
			}
			
			// Check which item to set as the currentItem
			var min = (this.itemsAlign == this._CENTER_POSITION)?Math.abs(this._itemsList[0].beginXY-((this._cD-this._iD)/2)):Math.abs(this._itemsList[0].beginXY);
			var minItem = 0;
			
			for ( var i=0; i<l; i++)
			{
				// If we are at the left end of the carousel, even a tiny right-to-left movement will cause the carousel to slide
				if ( this._currentItemIndex == 0 )
				{
					if ( _ec - _sc < 0 )
					{
						if ( this._itemsList.length == 1 )
						{
							minItem = 0;
						} else
						{
							minItem = 1;
						}
						break;
					} 
				}
				
				var condition = (this.itemsAlign == this._CENTER_POSITION)?Math.abs(this._itemsList[i].beginXY-((this._cD-this._iD)/2)):Math.abs(this._itemsList[i].beginXY);
				if (condition < min)
				{
					// a tiny left-to-right or right-to-left movement will cause the carousel to slide
					if ( i != this._currentItemIndex )
					{
						min = (this.itemsAlign == this._CENTER_POSITION)?Math.abs(this._itemsList[i].beginXY-((this._cD-this._iD)/2)):Math.abs(this._itemsList[i].beginXY);
						minItem = i;
					} else
					{
						// If we are at the right end of the carousel, even a tiny left-to-right movement will cause the carousel to slide
						if ( this._currentItemIndex == (l-1) )
						{
							if (_ec - _sc < 0)
							{
								minItem = i;
								break;
							}
						}
					}
				}
			}
			
			this._currentItemIndex = minItem;
			
			// Update the 'dots' indicator
			this._selectItem(this._currentItemIndex);
			
			// Fire the '/carousel/events/switch' event
			wink.publish('/carousel/events/switch', {'carouselId': this.uId, 'currentItemIndex': this._currentItemIndex});
			
			// If the autoAdjust parameter is set, move the items with a transition movement, elese don't
			if ( this.autoAdjust == 1)
			{
				wink.fx.apply(this._itemsNode, {
					"transition-duration": this.autoAdjustDuration + 'ms',
					"transition-timing-function": 'ease-out'
				});
				
				this._currentXY = (this.firstItemIndex-minItem)*this._iD;
				
				if ( this.display == this._HORIZONTAL_POSITION )
				{
					this._itemsNode.translate((this.firstItemIndex-minItem)*this._iD, 0);
				} else
				{
					this._itemsNode.translate(0, (this.firstItemIndex-minItem)*this._iD);
				}
			} else
			{
				if(!wink.isUndefined(this.position))
				{
					this._currentXY = this.position;
				}
			}
		},
		
		/**
		 * Display the selected 'dot'
		 * 
		 * @param {integer} index The index of the item in the list
		 */
		_selectItem: function(index)
		{
			var l = this._itemsList.length;
			
			for ( var i=0; i<l; i++)
			{
				this._itemsList[i].beginXY = (this.itemsAlign == this._CENTER_POSITION)?(i-index)*this._iD + (this._cD-this._iD)/2:(i-index)*this._iD;
				
				if ( i == index )
				{
					wink.addClass(this._dotsList[i], 'ca_selected');
				} else
				{
					wink.removeClass(this._dotsList[i], 'ca_selected');
				}
			}
		},
		
		/**
		 * Set the position of all the items at startup
		 */
		_positionItems: function()
		{
			var l = this._itemsList.length;
			
			for ( var i=0; i<l; i++)
			{
				this._itemsList[i].position = (this.itemsAlign == this._CENTER_POSITION)?(this._itemsList[i].index*this._iD + (this._cD-this._iD)/2):(this._itemsList[i].index*this._iD);
				this._itemsList[i].beginXY = this._itemsList[i].position;
				
				if ( this.display == this._HORIZONTAL_POSITION )
				{
					this._itemsList[i].getDomNode().translate(this._itemsList[i].position, 0);
				} else
				{
					this._itemsList[i].getDomNode().translate((this.itemsAlign == this._CENTER_POSITION)?((this.containerWidth - this.itemsWidth)/2):0, this._itemsList[i].position);
				}
			}
		},
		
		/**
		 * Update the items' positions when the orientation changes
		 */
		_updateItemsPosition: function()
		{
			if ( this._containerWidthSet == 0 )
			{
				this.containerWidth = window.innerWidth;
				
				if ( this.display == this._HORIZONTAL_POSITION )
				{
					this._cD = window.innerWidth;
				}
	
				var l = this._itemsList.length;
				
				for ( var i=0; i<l; i++)
				{
					if(this.itemsAlign == this._CENTER_POSITION)
					{
						if ( this.display == this._HORIZONTAL_POSITION )
						{
							this._itemsList[i].getDomNode().translate((this._itemsList[i].index*this._iD + (this._cD-this._iD)/2), 0);
						} else
						{
							this._itemsList[i].getDomNode().translate((this.containerWidth - this.itemsWidth)/2, (this._itemsList[i].index*this._iD + (this._cD-this._iD)/2));
						}
					} else
					{
						if ( this.display == this._HORIZONTAL_POSITION )
						{
							this._itemsList[i].getDomNode().translate(this._itemsList[i].index*this._iD, 0);
						} else
						{
							this._itemsList[i].getDomNode().translate(0, this._itemsList[i].index*this._iD);
						}
					} 
				}
			}
		},
		
		/**
		 * Slide the carousel automatically
		 */
		_startAutoPlay: function()
		{
			if ( this._currentItemIndex >= (this._itemsList.length-1) )
				this._autoPlayDirection = -1;
			
			if ( this._currentItemIndex <= 0 )
				this._autoPlayDirection = 1;
			
			
			if ( this._autoPlayDirection == 1 )
			{
				this.goToItem(this._currentItemIndex+1);
			} else
			{
				this.goToItem(this._currentItemIndex-1);
			}
		},
		
		/**
		 * Initialize the 'touch' and orientation change listeners
		 */
		_initListeners: function()
		{
			wink.ux.touch.addListener(this._itemsNode, "start", { context: this, method: "_touchStart", arguments: null }, { preventDefault: true });
			wink.ux.touch.addListener(this._itemsNode, "move", { context: this, method: "_touchMove", arguments: null }, { preventDefault: true });
			wink.ux.touch.addListener(this._itemsNode, "end", { context: this, method: "_touchEnd", arguments: null }, { preventDefault: true });
			
			window.addEventListener("orientationchange", wink.bind(function(){this._updateItemsPosition();}, this), false);
		},
		
		/**
		 * Initialize the Carousel DOM nodes
		 */
		_initDom: function()
		{
			this._domNode = document.createElement('div');
			
			if ( this.display == this._HORIZONTAL_POSITION )
			{
				this._domNode.className = 'ca_container';
			} else
			{
				this._domNode.className = 'ca_container ca_vertical';
			}
			
			this._headerNode = document.createElement('div');
			this._headerNode.className = 'ca_header';
			
			this._itemsNode = document.createElement('div');
			this._itemsNode.className = 'ca_items';
			this._itemsNode.style.height = this.itemsHeight + 'px';
			
			this._dotsNode = document.createElement('div');
			this._dotsNode.className = 'ca_dots';
			
			this._footerNode = document.createElement('div');
			this._footerNode.className = 'ca_footer';
			
			var l = this._itemsList.length;
		
			for ( var i=0; i<l; i++)
			{
				var dot = document.createElement('div');

				if ( i == this.firstItemIndex )
				{
					dot.className = 'ca_dot ca_selected';
				} else
				{
					dot.className = 'ca_dot';
				}
				
				if ( i == (l-1) )
				{
					dot.style.clear = 'both';
				}
				
				this._dotsList.push(dot);
				this._dotsNode.appendChild(dot);
				
				this._itemsNode.appendChild(this._itemsList[i].getDomNode());
			}
			
			if ( this.displayDots == 0 )
			{
				this._dotsNode.style.display = 'none';
			}
			
			this._setMinMaxValues();
			
			this._domNode.appendChild(this._headerNode);
			this._domNode.appendChild(this._itemsNode);
			this._domNode.appendChild(this._dotsNode);
			this._domNode.appendChild(this._footerNode);
			
			if ( this.autoPlay == 1 )
			{
				this._autoPlayInterval = wink.setInterval(this, '_startAutoPlay', this.autoPlayDuration);
			}
		},
	  
		/**
		 * Set containerWidth
		 * 
		 * @param {integer} containerWidth The width of the container
		 */
		_setContainerWidth: function(containerWidth)
		{	
			// Check container width
			if (!wink.isUndefined(containerWidth))
			{
				if ( !wink.isInteger(containerWidth) || containerWidth < 0 )
				{
					wink.log('[Carousel] The property containerWidth must be a positive integer');
					return false;
				}
				
				this.containerWidth = containerWidth;
				
				if ( this.display == this._HORIZONTAL_POSITION )
				{
					this._cD = containerWidth;
				}
			}	
		},
		
		/**
		 * Refresh min and max values
		 */
		_setMinMaxValues: function()
		{	
			if (this.autoAdjust == 0)
			{ 
				if(this.itemsAlign == this._CENTER_POSITION)
				{                  
					this._minXY = ((this.firstItemIndex)*this._iD)-((this._cD-this._iD)/2);
				} else
				{
					this._minXY = ((this.firstItemIndex)*this._iD);
				}
				
				if(this.itemsAlign == this._CENTER_POSITION)
				{
					this._maxXY = ((this.firstItemIndex-this._itemsList.length)*this._iD)+((this._cD+this._iD)/2);
				} else
				{
					this._maxXY = ((this.firstItemIndex-this._itemsList.length)*this._iD)+this._cD;	
				}
			}
		},
		
		/**
		 * Validate the properties of the component
		 * @returns {boolean} True if the properties are valid, false otherwise
		 */
		_validateProperties: function()
		{
			// Check Items width
			if ( !wink.isInteger(this.itemsWidth) || this.itemsWidth < 0 )
			{
				wink.log('[Carousel] The property itemsWidth must be a positive integer');
				return false;
			}
			
			// Check Items height
			
			if ( !wink.isInteger(this.itemsHeight) || this.itemsHeight < 0 )
			{
				wink.log('[Carousel] The property itemsHeight must be a positive integer');
				return false;
			}
			
			// Check the firstItem parameter
			if ( !wink.isInteger(this.firstItemIndex) || this.firstItemIndex < 0 )
			{
				wink.log('[Carousel] The property firstItemIndex must be a positive integer');
				return false;
			}
			
			// Check the dots parameter
			if ( !wink.isInteger(this.displayDots) || (this.displayDots != 0 && this.displayDots != 1) )
			{
				wink.log('[Carousel] The property displayDots must be either 0 or 1');
				return false;
			}
			
			// Check the auto adjust parameter
			if ( !wink.isInteger(this.autoAdjust) || (this.autoAdjust != 0 && this.autoAdjust != 1) )
			{
				wink.log('[Carousel] The property autoAdjust must be either 0 or 1');
				return false;
			}
			
			// Check the auto adjust duration parameter
			if ( !wink.isInteger(this.autoAdjustDuration))
			{
				wink.log('[Carousel] The property autoAdjustDuration must be an integer');
				return false;
			}
			
			// Check the auto play parameter
			if ( !wink.isInteger(this.autoPlay) || (this.autoPlay != 0 && this.autoPlay != 1) )
			{
				wink.log('[Carousel] The property autoPlay must be either 0 or 1');
				return false;
			}
			
			// Check the auto play duration parameter
			if ( !wink.isInteger(this.autoPlayDuration) )
			{
				wink.log('[Carousel] The property autoPlayDuration must be an integer');
				return false;
			}
			
			// Check items list
			if ( !wink.isArray(this.items))
			{
				wink.log('[Carousel] The items must be contained in an array');
				return false;
			}
			
			// Check items alignement
			if ( !wink.isString(this.itemsAlign) || (this.itemsAlign != this._CENTER_POSITION && this.itemsAlign != this._LEFT_POSITION))
			{
				wink.log('[Carousel] The property itemsAlign must be a positive integer');
				return false;
			}
		},
		
		/**
		 * Initialize the Carousel properties
		 */
		_initProperties: function()
		{
			// Not displaying the dots if the auto-adjust parameter is not set to 1
			if ( this.autoAdjust == 0 )
			{
				this.displayDots = 0;
			}
			
			// Check propagation
			if ( !wink.isBoolean(this.touchPropagation))
			{
				this.touchPropagation = false;
			}
			
			// Check container width
			if ( !wink.isUndefined(this.containerWidth))
			{
				this._setContainerWidth(this.containerWidth);
			}
			
			var l = this.items.length;
			
			for ( var i=0; i<l; i++)
			{
				this._addItem(this.items[i].type, this.items[i].content, i);
			}
			
			this._currentItemIndex = this.firstItemIndex;
			
			this.containerHeight = this.itemsHeight;
			
			if ( this.display == this._HORIZONTAL_POSITION )
			{
				this._iD = this.itemsWidth;
				this._cD = this.containerWidth;
			} else
			{
				this._iD = this.itemsHeight;
				this._cD = this.containerHeight;
			}
		}
	};
	
	/**
	 * @class Implements a carousel item
	 * 
	 * @param {object} properties The properties object
	 * @param {integer} properties.index The initial position of the item in the Carousel
	 * @param {integer} properties.height The height of the item
	 * @param {integer} properties.width The width of the item
	 * @param {HTMLElement} properties.node The DOM node containing the item
	 */
	wink.ui.xy.Carousel.Item = function(properties)
	{
		/**
		 * Unique identifier
		 * 
		 * @property uId
		 * @type integer
		 */
		this.uId = wink.getUId();
		
		
		/**
		 * The initial position of the item in the Carousel
		 * 
		 * @property index
		 * @type integer
		 */
		this.index = properties.index;
		
		/**
		 * The width of the item
		 * 
		 * @property width
		 * @type integer
		 */
		this.width    = properties.width;
		
		/**
		 * The height of the item
		 * 
		 * @property height
		 * @type integer
		 */
		this.height   = properties.height;
		
		/**
		 * The start position in pixels of the item in the Carousel
		 * 
		 * @property beginXY
		 * @type integer
		 */
		this.beginXY   = 0;
		
		/**
		 * The current position in pixels of the item in the Carousel
		 * 
		 * @property position
		 * @type integer
		 */
		this.position = 0;
		
		this._domNode = properties.node;
		
		this._initDom();
	};
	
	wink.ui.xy.Carousel.Item.prototype =
	{
		/**
		 * Return the dom node containing the item
		 * 
		 * @returns {HTMLElement} The main dom node
		 */
		getDomNode: function()
		{
			return this._domNode;
		},
		
		/**
		 * Initialize the Carousel DOM nodes
		 */
		_initDom: function()
		{
			wink.addClass(this._domNode, 'ca_item');
			
			wink.fx.apply(this._domNode, {
				width: this.width + 'px',
				height: this.height + 'px'
			});
		}
	};
	
	return wink.ui.xy.Carousel;
});