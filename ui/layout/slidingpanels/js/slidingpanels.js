/*--------------------------------------------------------
 * Copyright (c) 2011, The Dojo Foundation
 * This software is distributed under the "Simplified BSD license",
 * the text of which is available at http://www.winktoolkit.org/licence.txt
 * or see the "license.txt" file for more details.
 *--------------------------------------------------------*/

/**
 * @fileOverview Implement a sliding container
 * Create a sliding panels container container with which you can navigate through pages with an Iphone like UX
 *
 * @compatibility Iphone OS2, Iphone OS3, Iphone OS4, Android 1.5, Android 2.1, Android 2.2, Android 2.3, Android 3.0, Android 3.1, BlackBerry 6, BlackBerry 7, Bada 1.0
 * 
 * @author Jerome GIRAUD
 */

/**
 * slide just started
 * 
 * @name wink.ui.layout.SlidingPanels#/slidingpanels/events/slidestart
 * @event
 * @param {object} param The parameters object
 * @param {string} param.id the current first page
 */

/**
 * slide just ended
 * 
 * @name wink.ui.layout.SlidingPanels#/slidingpanels/events/slideend
 * @event
 * @param {object} param The parameters object
 * @param {string} param.id the current first page
 */

define(['../../../../_amd/core'], function(wink)
{
	/**
	 * @class Implement a sliding container
	 * Create a sliding panels container container with which you can navigate through pages with an Iphone like UX
	 * To instantiate a sliding panels container, the pages (dom nodes) MUST already be present in the page and each one MUST be defined by a unique id. Use the 'getDomNode' method to add the sliding panels container into the page.
	 * 
	 * @param {object} properties The properties object
	 * @param {integer} [properties.duration=800] The slide duration in milliseconds
	 * @param {string} [properties.transitionType="default"] The type of the transition between pages ('default', 'cover' or 'reveal'). If you use the 'cover' or 'reveal' option, all your pages should have the same height
	 * @param {array} properties.pages An array containing the ids of the pages to add into the sliding panels container. The pages dom nodes MUST be present in the page at instantiation time
	 * 
	 * @example
	 * 
	 * var properties = 
	 * {
	 *   'duration': 500,
	 *   'transitionType': 'default',
	 *   'pages': ['page1', 'page2', 'page3', 'page4', 'page5', 'page6', 'page7', 'page8']
	 * }
	 * 
	 * slidingPanels = new wink.ui.layout.SlidingPanels(properties);
	 * document.body.appendChild(slidingPanels.getDomNode());
	 * 
	 * @see <a href="WINK_ROOT_URL/ui/layout/slidingpanels/test/test_slidingpanels_1.html" target="_blank">Test page</a>
	 * @see <a href="WINK_ROOT_URL/ui/layout/slidingpanels/test/test_slidingpanels_2.html" target="_blank">Test page (cover)</a>
	 * @see <a href="WINK_ROOT_URL/ui/layout/slidingpanels/test/test_slidingpanels_3.html" target="_blank">Test page (reveal)</a>
	 * @see <a href="WINK_ROOT_URL/ui/layout/slidingpanels/test/test_slidingpanels_4.html" target="_blank">Test page (with history)</a>
	 */
	wink.ui.layout.SlidingPanels = function(properties)
	{
		/**
		 * Unique identifier
		 * 
		 * @property uId
		 * @type integer
		 */
		this.uId                    = wink.getUId();
		
		/**
		 * The list of pages ids of the slidingpanels
		 * 
		 * @property pages
		 * @type array
		 */
		this.pages					= null;
		
		/**
		 * The type of the transition between pages
		 * 
		 * @property transitionType
		 * @type string
		 */
		this.transitionType		    = 'default';
		
		/**
		 * The slide duration in milliseconds. The default value is 800
		 * 
		 * @property duration
		 * @type integer
		 */
		this.duration	            = 800;
		
		this.HIGHER_INDEX			= 100;
		this.LOWER_INDEX			= 99;
		
		this._domNode				= null;
		this._queue					= [];
		this._pagesList				= [];
		this._firstPage				= null;
		this._currentPage			= null;
		this._isSliding				= false;
		
		wink.mixin(this, properties);
		
		if (this._validateProperties() === false) return;
			
		this._initDom();
		this._initProperties();
	};
	
	wink.ui.layout.SlidingPanels.prototype =
	{
		_TRANSITION_DEFAULT: 'default',
		_TRANSITION_REVEAL: 'reveal',
		_TRANSITION_COVER: 'cover',
		
		/**
		 * @returns {HTMLElement} The DOM node containing the slidingpanels
		 */
		getDomNode: function()
		{
			return this._domNode;
		},
		
		/**
		 * Move to the selected page
		 * 
		 * @param {string} id The id of the page to display
		 */
		slideTo: function(id)
		{	
			if (this._isSliding)
			{
				return;
			}
	
			var queueIdx = this._getQueueIndex(id);
			
			if (queueIdx !== false)
			{
				if ( queueIdx == this._queue.length - 1 )
				{
					this.slideBack();
					return;
				}
				
				this._silentSlideBack(id);
				return;
			}
	
			var fp = this._firstPage,
				cp = this._getPageById(id),
				tt = this.transitionType,
				td = this.duration,
				isReveal = (tt == this._TRANSITION_REVEAL),
				isCover = (tt == this._TRANSITION_COVER);
			
			if (cp == null)
			{
				return;
			}
	
			var context = 
			{
				firstPage: fp,
				currentPage: cp,
				firstPageDuration: isCover ? '' : td,
				currentPageDuration: isReveal ? '' : td,
				pageToListen: isReveal ? fp : cp,
				slideEndHandler: wink.bind(this._onSlideEnd, this, -1),
				firstPageTranslation: isCover ? 0 : '-100%',
				firstPageZIndex: isCover ? this.LOWER_INDEX : undefined,
				currentPageZIndex: isCover ? this.HIGHER_INDEX : undefined
			};
	
			this._slideStart(context);
		},
		
		/**
		 * Come back to the previous page
		 */
		slideBack: function()
		{
			if (this._isSliding)
			{
				return;
			}
			
			var fp = this._firstPage,
				cp = this._queue.pop(),
				tt = this.transitionType,
				td = this.duration,
				isReveal = (tt == this._TRANSITION_REVEAL),
				isCover = (tt == this._TRANSITION_COVER);
			
			var context = 
			{
				firstPage: fp,
				currentPage: cp,
				firstPageDuration: isReveal ? '' : td,
				currentPageDuration: isCover ? '' : td,
				pageToListen: isReveal ? cp : fp,
				slideEndHandler: wink.bind(this._onSlideEnd, this, 1),
				firstPageTranslation: isReveal ? 0 : '100%',
				firstPageZIndex: isReveal ? this.LOWER_INDEX : undefined,
				currentPageZIndex: isReveal ? this.HIGHER_INDEX : undefined
			};
			
			this._slideStart(context);
		},
		
		/**
		 * Slide back without transitions
		 * 
		 * @param {string} id The id of the page to display
		 */
		_silentSlideBack: function(id)
		{		
			var position = this._getQueueIndex(id);
			var skip = this._queue.slice(position + 1, this._queue.length);
			this._queue.splice(position + 1, skip.length);
			
			var i, l = skip.length;
			
			for (i = 0; i < l; i++)
			{
				var p = skip[i];
				p.setTranslateDuration(0);
				p.translate('100%');
				p.setPosition(1);
				if (this.transitionType != this._TRANSITION_DEFAULT)
				{
					p.setZIndex(this.LOWER_INDEX);
				}
			}
			
			this._firstPage = this._currentPage;
			this.slideBack();
		},
		
		/**
		 * Start sliding the pages
		 * 
		 * @param {object} ctx The current context
		 */
		_slideStart: function(ctx)
		{
			this._isSliding = true;
			wink.publish('/slidingpanels/events/slidestart', { 'id': ctx.currentPage.id });
			this._currentPage = ctx.currentPage;
			
			if (ctx.firstPageZIndex)
			{
				ctx.firstPage.setZIndex(this.LOWER_INDEX);
			}
			
			if (ctx.currentPageZIndex)
			{
				ctx.currentPage.setZIndex(this.HIGHER_INDEX);
			}
			ctx.currentPage.display();
			ctx.firstPage.setTranslateDuration(ctx.firstPageDuration);
			ctx.currentPage.setTranslateDuration(ctx.currentPageDuration);
			wink.fx.onTransitionEnd(ctx.pageToListen.getDomNode(), ctx.slideEndHandler);
			ctx.firstPage.translate(ctx.firstPageTranslation, 0);
			ctx.currentPage.translate(0);
		},
		
		/**
		 * Handle the slide end
		 * 
		 * @param {integer} value The direction of the slide
		 */
		_onSlideEnd: function(value)
		{
			var fp = this._firstPage,
				cp = this._currentPage;
			
			if (this.transitionType != this._TRANSITION_DEFAULT)
			{
				fp.setZIndex(this.LOWER_INDEX);
				cp.setZIndex(this.HIGHER_INDEX);
			}
			
			fp.setPosition(value);
			cp.setPosition(0);
			
			if (value == -1)
			{
				this._queue.push(fp);
			}
			
			this._firstPage = this._currentPage;
			this._isSliding = false;
			
			wink.publish('/slidingpanels/events/slideend', { 'id': cp.id });
		},
		
		/**
		 * Get a page
		 * 
		 * @param {string} id The id of the page to return
		 */
		_getPageById: function(id)
		{
			var i, pl = this._pagesList, l = pl.length;
			for (i = 0; i < l; i++)
			{
				var page = pl[i];
				if (page.id == id && page.position == 1)
				{
					return page;
				}
			}
			return null;
		},
		
		/**
		 * Get a page position in the queue
		 * 
		 * @param {string} id The id of the page to return
		 */
		_getQueueIndex: function(id)
		{
			var i, q = this._queue, l = q.length;
			for (i = 0; i < l; i++)
			{
				if (q[i].id == id)
				{
					return i;
				}
			}
			return false;
		},
		
		/**
		 * Validate the properties of the component
		 * @returns {boolean} True if the properties are valid, false otherwise
		 */
		_validateProperties: function()
		{
			if ( !wink.isArray(this.pages) )
			{
				wink.log('[SlidingPanels] pages parameters must be an array');
				return false;
			}
				
			var l = this.pages.length;
			
			for ( var i=0; i<l; i++)
			{
				if ( $(this.pages[i]) == this.pages[i])
				{
					wink.log('[SlidingPanels] all the parameters should be dom nodes ids');
					return false;
				}
			}
			
			if ( (this.transitionType != this._TRANSITION_DEFAULT) && (this.transitionType != this._TRANSITION_REVEAL) && (this.transitionType != this._TRANSITION_COVER))
			{
				wink.log('[SlidingPanels] the transition type must be "default", "cover" or "reveal"');
				return false;
			}
		},
		
		/**
		 * Initialize the properties
		 */
		_initProperties: function()
		{
			var tt = this.transitionType;
	
			var i, pgs = this.pages, l = pgs.length;
			
			for (i = 0; i < l; i++)
			{
				var page = new wink.ui.layout.SlidingPanels.Page({ 'node': $(pgs[i]) });
		
				if (i == 0)
				{
					page.translate(0);
					page.setPosition(0);
					this._firstPage = page;
				} else
				{
					var xPos = '100%';
					if (tt == this._TRANSITION_REVEAL)
					{
						xPos = 0;
					}
					page.translate(xPos);
					page.setPosition(1);
				}
				
				if (tt != this._TRANSITION_DEFAULT)
				{
					if (i == 0)
					{
						page.setZIndex(this.HIGHER_INDEX);
					} else
					{
						page.setZIndex(this.LOWER_INDEX);
					}
				}
				
				var pn = page.getDomNode();
				pn.parentNode.removeChild(pn);
				this._domNode.appendChild(pn);
				this._pagesList.push(page);
			}
			
			if ( wink.isInteger(this.duration))
			{
				this.duration += 'ms';
			}
			
		},
		
		/**
		 * Initialize the slidingpanels node
		 */
		_initDom: function()
		{
			this._domNode = document.createElement('div');
			wink.addClass(this._domNode, 'sl_container');
		}
	};
	
	
	/**
	 * @class Implement a page to be added to the slidingpanels
	 * 
	 * @param {object} properties The properties object
	 * @param {HTMLElement} properties.node The DOM node corresponding to the page
	 */
	wink.ui.layout.SlidingPanels.Page = function(properties)
	{
		/**
		 * Unique identifier
		 * 
		 * @property uId
		 * @type integer
		 */
		this.uId			= wink.getUId();
		/**
		 * The dom node id of the page
		 * 
		 * @property id
		 * @type string
		 */
		this.id				= null;
		/**
		 * Position of the page (-1: page is on the left ; 0: page is displayed ; 1: page is on the right)
		 * 
		 * @property position
		 * @type integer
		 */
		this.position		= 0;
		
		this._properties	= properties;
		this._domNode		= null;
		this._isDisplayed	= false;
		this._toDefer		= false;
		
		this._initProperties();
		this._initDom();
	};
	
	wink.ui.layout.SlidingPanels.Page.prototype =
	{
		wkArOldIOS: (wink.ua.isIOS && wink.ua.osVersion <= 2),
		
		/**
		 * @returns {HTMLElement} The DOM node containing the Page
		 */
		getDomNode: function()
		{
			return this._domNode;
		},
		
		/**
		 * Set the current position of the page
		 * 
		 * @param {integer} position -1: page is on the left ; 0: page is displayed ; 1: page is on the right
		 */
		setPosition: function(position)
		{
			this.position = position;
			
			if (this.position != 0)
			{
				if (!this.wkArOldIOS)
				{
					this._domNode.style.display = 'none';
					this._isDisplayed = false;
				}
			} else
			{
				wink.fx.apply(this._domNode, {'transform': 'none'});
			}
		},
		
		/**
		 * Display the page
		 */
		display: function()
		{
			this._domNode.style.display = 'block';
			if (this._isDisplayed == false)
			{
				this._isDisplayed = true;
				this._toDefer = true;
			}
		},
		
		/**
		 * Translate the page
		 * 
		 * @param {string|integer} x the translate distance
		 */
		translate: function(x)
		{
			var t, ctx = {
				defered: wink.bind(function() {
					if (t) {
						clearTimeout(t);
					}
					this._domNode.translate(x, null);
				}, this)	
			};
			
			if (this._toDefer)
			{
				t = wink.setTimeout(ctx, 'defered', 0);
				this._toDefer = false;
			} else
			{
				ctx.defered();
			}
		},
		
		/**
		 * Set the z-index of the page
		 * 
		 * @param {integer} z the index to set
		 */
		setZIndex: function(z)
		{
			this._domNode.style.zIndex = z;
		},
		
		/**
		 * Set the translation duration of the page
		 * 
		 * @param {string} d the duration
		 */
		setTranslateDuration: function(d)
		{
			wink.fx.applyTransformTransition(this._domNode, d, '1ms', 'default');
		},
		
		/**
		 * Initialize the Page node
		 */
		_initDom: function()
		{
			wink.addClass(this._domNode, 'sl_page');
		},
		
		/**
		 * Initialize the properties
		 */
		_initProperties: function()
		{
			this._domNode = this._properties.node;
			this.id = this._domNode.id;
		}
	};
	
	return wink.ui.layout.SlidingPanels;
});