/*--------------------------------------------------------
 * Copyright (c) 2011, The Dojo Foundation
 * This software is distributed under the "Simplified BSD license",
 * the text of which is available at http://www.winktoolkit.org/licence.txt
 * or see the "license.txt" file for more details.
 *--------------------------------------------------------*/

/**
 * @fileOverview Carousel implementation for Windows Phone
 * 
 * @see wink.ui.xy.Carousel
 * 
 * @compatibility Windows Phone 7.5
 * @author Jerome GIRAUD
 */

define(['../../../../_amd/core'], function(wink)
{
	/**
	 * @class Carousel implementation for Windows Phone
	 * @name wink.ui.xy.Carousel-WP
	 * @see wink.ui.xy.Carousel
	 * 
	 * @see <a href="WINK_ROOT_URL/ui/xy/carousel/test/test_carousel_1_ie.html" target="_blank">Test page</a>
	 * @see <a href="WINK_ROOT_URL/ui/xy/carousel/test/test_carousel_2_ie.html" target="_blank">Test page (vertical)</a>
	 * 
	 * @borrows wink.ui.xy.Carousel#uId as this.uId
	 * @borrows wink.ui.xy.Carousel#items as this.items
	 * @borrows wink.ui.xy.Carousel#firstItemIndex as this.firstItemIndex
	 * @borrows wink.ui.xy.Carousel#itemsWidth as this.itemsWidth
	 * @borrows wink.ui.xy.Carousel#itemsHeight as this.itemsHeight
	 * @borrows wink.ui.xy.Carousel#display as this.display
	 * @borrows wink.ui.xy.Carousel#containerWidth as this.containerWidth
	 * @borrows wink.ui.xy.Carousel#containerHeight as this.containerHeight
	 * @borrows wink.ui.xy.Carousel#displayDots as this.displayDots
	 * @borrows wink.ui.xy.Carousel#autoAdjust as this.autoAdjust
	 * @borrows wink.ui.xy.Carousel#autoAdjustDuration as this.autoAdjustDuration
	 * @borrows wink.ui.xy.Carousel#autoPlay as this.autoPlay
	 * @borrows wink.ui.xy.Carousel#autoPlayDuration as this.autoPlayDuration
	 * @borrows wink.ui.xy.Carousel#itemsAlign as this.itemsAlign
	 * @borrows wink.ui.xy.Carousel#touchPropagation as this.touchPropagation
	 * 
	 * @borrows wink.ui.xy.Carousel#getDomNode as this.getDomNode
	 * @borrows wink.ui.xy.Carousel#clean as this.clean
	 * @borrows wink.ui.xy.Carousel#goToItem as this.goToItem
	 * @borrows wink.ui.xy.Carousel#refreshContainerWidth as this.refreshContainerWidth
	 * 
	 */
	wink.ui.xy.Carousel = function(properties)
	{
		this.uId                = wink.getUId();
		
		this.items              = [];
		
		this.firstItemIndex     = 1;
		
		this.itemsWidth         = 250;
		this.itemsHeight        = 100;
		
		this.display            = this._HORIZONTAL_POSITION;
		
		this.displayDots        = 1;
		this.autoAdjust         = 1;
		this.autoPlay           = 0;
		this.autoPlayDuration   = 3000;
		this.itemsAlign         = this._CENTER_POSITION;
		
		this._currentItemIndex  = 0;
		
		this._autoPlayInterval  = null;
		this._autoPlayDirection = 1;
		
		this._itemsList         = [];
		this._dotsList          = [];
		
		this._domNode           = null;
		this._headerNode        = null;
		this._itemsContainer	= null;
		this._itemsNode         = null;
		this._dotsNode          = null;
		this._footerNode        = null;
		
		this._scrollTestInterval = null;
		this._scroll			= null;
		this._scrollForced		= false;
		
		wink.mixin(this, properties);
		
		if ( this._validateProperties() ===  false )return;
		
		this._initProperties();
		this._initDom();
		this._initListeners();
	};
	
	wink.ui.xy.Carousel.prototype =
	/**
	 * @lends wink.ui.xy.Carousel-WP
	 */
	{
		_LEFT_POSITION: 'left',
		_CENTER_POSITION: 'center',
		_VERTICAL_POSITION: 'vertical',
		_HORIZONTAL_POSITION: 'horizontal',
		
		/**
		 * Returns the dom node containing the Carousel
		 * 
		 * @ignore
		 * @returns {HTMLElement} The main dom node
		 */
		getDomNode: function()
		{
			return this._domNode;
		},
		
		/**
		 * Cleans the dom of the Carousel content nodes. To invoke only if Carousel no longer used.
		 * 
		 * @ignore
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
		 * @ignore
		 * @param {integer} index The index of the item we want to move to
		 */
		goToItem: function(index)
		{
			this._scrollForced = true;
			
			switch(this.display)
			{
				case this._VERTICAL_POSITION :
					this._itemsContainer.scrollTop = (index * this.itemsHeight);
					break;
				case this._HORIZONTAL_POSITION :
					this._itemsContainer.scrollLeft = (index * this.itemsWidth);
					break;
			}
			wink.setTimeout(this, '_stopScrollForced', 1);
			
			var l = this._itemsList.length;
			
			for ( var i=0; i<l; i++)
			{
				if ( i == index )
				{
					wink.addClass(this._dotsList[i], 'ca_selected');
				} else
				{
					wink.removeClass(this._dotsList[i], 'ca_selected');
				}
			}
			
			this._currentItemIndex  = index;
			
			wink.publish('/carousel/events/switch', {'carouselId': this.uId, 'currentItemIndex': this._currentItemIndex});
		},
		
		/**
		 * Indicate end of forced scroll
		 */
		_stopScrollForced: function()
		{
			this._scrollForced = false;
		},
		
		/**
		 * Refresh containerWidth, set container width, refresh min and max values
		 * 
		 * @param {integer} containerWidth The width of the carousel's container
		 */
		refreshContainerWidth: function(containerWidth)
		{	
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
		 * Update the items nodes properties
		 */
		_updateItemsNodeProperties: function()
		{
			var width, height, padding = 0;
			switch(this.display)
			{
				case this._VERTICAL_POSITION :
					width = this.itemsWidth + 'px';
					height = (this.itemsHeight * this._itemsList.length) + 'px';
					break;
				case this._HORIZONTAL_POSITION :
					width = (this.itemsWidth * this._itemsList.length) + 'px';
					height = 'auto';
					if(this.autoAdjust == 1)
					{
						switch(this.itemsAlign)
						{
							case this._LEFT_POSITION :
								padding = '0 ' + (window.innerWidth - this.itemsWidth) + 'px 0 0';
								break;
							case this._CENTER_POSITION :
								padding = '0 ' + ((window.innerWidth - this.itemsWidth) / 2) + 'px';
								break;
						}
					}
					break;
			}

			wink.fx.apply(this._itemsNode, {
				width: width,
				height: height,
				padding: padding
			});
		},
		
		/**
		 * Return the itmes conatiner properties
		 */
		_getItemsContainerProperties: function()
		{
			var overflowX, overflowY;
			switch(this.display)
			{
				case this._VERTICAL_POSITION :
					overflowX = 'hidden';
					overflowY = 'scroll';
					break;
				case this._HORIZONTAL_POSITION :
					overflowX = 'scroll';
					overflowY = 'hidden';
					break;
			}
			
			return {
				height: this.itemsHeight + 'px',
				overflowX: overflowX,
				overflowY: overflowY,
				textAlign: 'center'
			};
		},
		
		/**
		 * The user starts scrolling
		 */
		_handleScrollStart: function() {
			if(!this._scrollForced)
			{
				if(this._autoPlayInterval != null)
				{
					clearInterval(this._autoPlayInterval);
					this._autoPlayInterval = null;
				}
				if((this.autoAdjust == 1) && wink.isNull(this._scrollTestInterval))
				{
					this._scrollTestInterval = wink.setInterval(this, '_scrollTest', 500);
				}
			}
		},

		/**
		 * Test if the user is still scrolling
		 */
		_scrollTest: function()
		{
			var current_scroll;
			switch(this.display)
			{
				case this._VERTICAL_POSITION :
					current_scroll = this._itemsContainer.scrollTop;
					break;
				case this._HORIZONTAL_POSITION :
					current_scroll = this._itemsContainer.scrollLeft;
					break;
			}
			if(this._scroll != this._itemsContainer.scrollLeft)
			{
				this._scroll = this._itemsContainer.scrollLeft;
			}
			else
			{
				this._handleScrollStop();
			}
		},
		
		/**
		 * The user stops scrolling
		 */
		_handleScrollStop: function()
		{
			clearInterval(this._scrollTestInterval);
			this._scrollTestInterval = null;
			
			var index;
			switch(this.display)
			{
				case this._VERTICAL_POSITION :
					index = Math.ceil((this._itemsContainer.scrollTop - (this.itemsHeight/2)) / this.itemsHeight);
					break;
				case this._HORIZONTAL_POSITION :
					index = Math.ceil((this._itemsContainer.scrollLeft - (this.itemsWidth/2)) / this.itemsWidth);
					break;
			}
			
			this.goToItem(index);
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
		 * Initialize the 'scroll' and orientation change listeners
		 */
		_initListeners: function()
		{
			this._itemsContainer.addEventListener('scroll', wink.bind(function(){this._handleScrollStart();}, this), false);
			
			window.addEventListener("resize", wink.bind(function(){this._updateItemsNodeProperties();}, this), false);
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
			
			this._itemsContainer = document.createElement('div');
			wink.fx.apply(this._itemsContainer, this._getItemsContainerProperties());
			
			this._itemsNode = document.createElement('div');
			this._itemsNode.style.height = this.itemsHeight + 'px';
			this._itemsContainer.appendChild(this._itemsNode);
			this._updateItemsNodeProperties();
			
			this._dotsNode = document.createElement('div');
			this._dotsNode.className = 'ca_dots';
			
			this._footerNode = document.createElement('div');
			this._footerNode.className = 'ca_footer';
			
			var l = this._itemsList.length;
		
			for ( var i=0; i<l; i++)
			{
				var dot = document.createElement('img');
				dot.src = 'data:image/gif;base64,R0lGODlhAQABAIAAAP///wAAACH5BAEAAAAALAAAAAABAAEAAAICRAEAOw==';
				
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
			
			this._domNode.appendChild(this._headerNode);
			this._domNode.appendChild(this._itemsContainer);
			this._domNode.appendChild(this._dotsNode);
			this._domNode.appendChild(this._footerNode);
			
			wink.setTimeout(this, 'goToItem', 1, this.firstItemIndex);
			
			if ( this.autoPlay == 1 )
			{
				this._autoPlayInterval = wink.setInterval(this, '_startAutoPlay', this.autoPlayDuration);
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
			
			var l = this.items.length;
			
			for ( var i=0; i<l; i++)
			{
				this._addItem(this.items[i].type, this.items[i].content, i);
			}
			
			this._currentItemIndex = this.firstItemIndex;
		}
	};
	
	/**
	 * @class Windows Phone Carousel Item implementation
	 * @name wink.ui.xy.Carousel.Item-WP
	 * 
	 * @param {object} properties The properties object
	 * @param {integer} properties.index The initial position of the item in the Carousel
	 * @param {integer} properties.height The height of the item
	 * @param {integer} properties.width The width of the item
	 * @param {HTMLElement} properties.node The DOM node containing the item
	 * 
	 * @borrows wink.ui.xy.Carousel.Item#uId as this.uId
	 * @borrows wink.ui.xy.Carousel.Item#index as this.index
	 * @borrows wink.ui.xy.Carousel.Item#width as this.width
	 * @borrows wink.ui.xy.Carousel.Item#height as this.height
	 * @borrows wink.ui.xy.Carousel.Item#beginXY as this.beginXY
	 * @borrows wink.ui.xy.Carousel.Item#position as this.position
	 * 
	 * @borrows wink.ui.xy.Carousel.Item#getDomNode as this.getDomNode
	 */
	wink.ui.xy.Carousel.Item = function(properties)
	{
		this.uId      = wink.getUId();
		this.index    = properties.index;
		this.width    = properties.width;
		this.height   = properties.height;
		this.beginXY   = 0;
		this.position = 0;
		
		this._domNode = properties.node;
		
		this._initDom();
	};
	
	wink.ui.xy.Carousel.Item.prototype =
	/**
	 * @lends wink.ui.xy.Carousel.Item-WP
	 */
	{
		/**
		 * Return the dom node containing the item
		 * 
		 * @ignore
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
			wink.fx.apply(this._domNode, {
				display: 'inline-block',
				width: this.width + 'px',
				height: this.height + 'px'
			});
		}
	};
	
	return wink.ui.xy.Carousel;
});