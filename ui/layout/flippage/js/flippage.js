/*--------------------------------------------------------
 * Copyright (c) 2011, The Dojo Foundation
 * This software is distributed under the "Simplified BSD license",
 * the text of which is available at http://www.winktoolkit.org/licence.txt
 * or see the "license.txt" file for more details.
 *--------------------------------------------------------*/

/**
 * @fileOverview Implements a flippage layout
 * Creates a Flippage display. You can navigate through pages with your finger or just use the "flipForward" and "flipTo" methods
 * 
 * @compatibility Iphone OS3, Iphone OS4, BlackBerry 7 (partial)
 * 
 * @author Jerome GIRAUD
 * 
 */
define(['../../../../_amd/core', '../../../../math/_geometric/js/geometric', '../../../../fx/_xyz/js/3dfx', '../../../../fx/_animation/js/animation'], function(wink)
{
	/**
	 * @class Implements a flippage layout
	 * You can navigate through pages with your finger or just use the "flipForward" and "flipTo" methods
	 * Create the flippage container, creates pages and handle the animation of the pages.
	 * To instantiate a flippage container, the pages (dom nodes) MUST already be present in the page and each one MUST be defined by a unique id. Use the 'getDomNode' method to add the flippage container into the page.
	 * 
	 * @param {object} properties The properties object
	 * @param {array} properties.pages An array containing the ids of the pages to add into the flippage container. The pages dom nodes MUST be present in the page at instantiation time
	 * @param {integer} [properties.duration=1500] The flip duration in milliseconds
	 * @param {boolean} [properties.shadow=false] Should we display the page shadow
	 * 
	 * @requires wink.math._geometric
	 * @requires wink.math._matrix
	 * @requires wink.fx._xyz
	 * @requires wink.fx._animation
	 * 
	 * @example
	 * 
	 * var properties = 
	 * {
	 *   'duration': 1400,
	 *   'pages': ['page1', 'page2', 'page3', 'page4', 'page5', 'page6', 'page7', 'page8']
	 * }
	 * 
	 * flipPage = new wink.ui.layout.FlipPage(properties);
	 * document.body.appendChild(flipPage.getDomNode());
	 * 
	 * @see <a href="WINK_ROOT_URL/ui/layout/flippage/test/test_flippage_1.html" target="_blank">Test page</a>
	 * @see <a href="WINK_ROOT_URL/ui/layout/flippage/test/test_flippage_2.html" target="_blank">Test page (with history)</a>
	 * @see <a href="WINK_ROOT_URL/ui/layout/flippage/test/test_flippage_3.html" target="_blank">Test page (with scroller)</a>
	 */
	wink.ui.layout.FlipPage = function(properties)
	{
		/**
		 * Unique identifier
		 * 
		 * @property uId
		 * @type integer
		 */
		this.uId                 = wink.getUId();
		
		this.Z_INDEX             = 999;
		
		/**
		 * The list of pages id of the flippage
		 * 
		 * @property pages
		 * @type array
		 */
		this.pages               = [];
		
		/**
		 * The transition duration between each page flip
		 * 
		 * @property duration
		 * @type integer
		 */
		this.duration            = 1500;
		
		/**
		 * Whether the shadow is displayed or not
		 * 
		 * @property shadow
		 * @type boolean
		 */
		this.shadow              = false;
		
		this._pagesList          = [];
		
		this._flipTimeout        = null;
		
		this._currentPage        = null;
		this._currentPageIndex   = 0;
		
		this._startX             = 0;
		this._startY             = 0;
		
		this._endX               = 0;
		this._endY               = 0;
		
		this._startTime          = 0;
		this._endTime            = 0;
		
		this._domNode            = null;
		
		this._leftShadowNode     = null;
		this._rightShadowNode    = null;
		this._shadeState         = false;
		
		wink.mixin(this, properties);
		
		if  ( this._validateProperties() ===  false )return;
		
		this._initDom();
		this._initProperties();
		this._initListeners();
	};
	
	wink.ui.layout.FlipPage.prototype =
	{
		wkArMove: ( (wink.ua.isIOS && wink.ua.osVersion == 4) || wink.ua.isIPad ),	
		
		/**
		 * Returns the DOM node containing the slidingpanels
		 * 
		 * @returns {HTMLElement} The component main dom node
		 */
		getDomNode: function()
		{
			return this._domNode;
		},
		
		/**
		 * Flip to the specified page
		 * 
		 * @param {string} id The id of the page
		 */
		flipTo: function(id)
		{	
			clearTimeout(this._flipTimeout);
			
			var l = this.pages.length;
			
			for ( var i=0; i<l; i++ )
			{
				if ( id == this.pages[i] )
				{
					if ( this._currentPageIndex < i )
					{
						this.flipForward();
						this._flipTimeout = wink.setTimeout(this, 'flipTo', 300, id);
					} else if ( this._currentPageIndex > i )
					{
						this.flipBack();
						this._flipTimeout = wink.setTimeout(this, 'flipTo', 300, id);
					} else
					{
						return;
					}
				}
			}
		},
		
		/**
		 * Flips one page forward
		 */
		flipForward: function()
		{
			if ( this._currentPageIndex < (this._pagesList.length-2))
			{
				this._currentPageIndex++;
				this._pagesList[this._currentPageIndex].setPosition(0);
				this._currentPage = this._pagesList[this._currentPageIndex];
	
				wink.publish('/flippage/events/flipstart', {'id': this.pages[this._currentPageIndex], 'direction': 1});
				
				if (this.shadow)
				{
					this._shade(this._rightShadowNode, this._leftShadowNode);
				}
			}
		},
		
		/**
		 * Flips one page backward
		 */
		flipBack: function()
		{
			if ( this._currentPageIndex != 0 )
			{			
				this._pagesList[this._currentPageIndex].setPosition(1);
				this._currentPageIndex--;
				this._currentPage = this._pagesList[this._currentPageIndex];
	
				wink.publish('/flippage/events/flipstart', {'id': this.pages[this._currentPageIndex], 'direction': -1});
				
				if (this.shadow)
				{
					this._shade(this._leftShadowNode, this._rightShadowNode);
				}
			}
		},
		
		/**
		 * Update the content of a page
		 * 
		 * @param {string} id The id of the page
		 * @param {string} content A string containg the page content
		 * 
		 */
		updateContent: function(id, content)
		{
			var l = this.pages.length;
			
			for ( var i=0; i<l; i++ )
			{
				if ( id == this.pages[i] )
				{
					this._pagesList[i].setBackContent(content);
					this._pagesList[i+1].setFrontContent(content);
				}
			}
		},
		
		/**
		 * Listen to the start events
		 * 
		 * @param {wink.ux.Event} e The Wink event
		 *
		 */
		_touchStart: function(e)
		{
			this._startX = e.x;
			this._startY = e.y;
			
			this._startTime = e.timestamp;
		},
		
		/**
		 * Listen to the move events
		 * 
		 * @param {wink.ux.Event} e The Wink event
		 */
		_touchMove: function(e)
		{
			if ( Math.abs(e.y - this._startY) < 30 )
			{
				e.preventDefault();
			}
		},
		
		/**
		 * Listen to the end events
		 * 
		 * @param {wink.ux.Event} e The Wink event
		 */
		_touchEnd: function(e)
		{
			this._endX = e.x;
			this._endY = e.y;
			
			this._endTime = e.timestamp;
			
			if ( this._endTime - this._startTime > 400 )
			{
				return
			}
			
			if ( Math.abs(this._endY - this._startY) > 30 || Math.abs(this._endX - this._startX) < 30 )
			{
				return;
			}
			
			if ( (this._endX - this._startX) > 0 )
			{
				this.flipBack();
			} else
			{
				this.flipForward();
			}
		},
		
		/**
		 * Simulates the shadow of pages
		 * 
		 * @param {HTMLElement} node1 The node that will shade
		 * @param {HTMLElement} node1 The node that will brighten
		 */
		_shade: function(node1, node2) {
			if (this._shadeState == true) {
				return;
			}
			
			var trd = this.duration;
			var d1 = wink.math.round(0.43 * trd, 0);
			var d2 = wink.math.round(0.60 * trd, 0);
			var dl2 = wink.math.round(0.2 * trd, 0);
			
			var anim = wink.fx.animate(null, { 
				property: 'background-color', 
				value: 'rgba(0, 0, 0, 0.9)', 
				duration: 0,
				delay: 0
			}, { start: false }).chain(wink.fx.animate(null, {
				property: 'background-color', 
				value: 'rgba(0, 0, 0, 0.0)', 
				duration: d1,
				delay: 1,
				func: 'default'
			}, { start: false }));
			
			var anim2 = wink.fx.animate(null, { 
				property: 'background-color', 
				value: 'rgba(0, 0, 0, 0.01)', 
				duration: 0,
				delay: 0
			}, { start: false }).chain(wink.fx.animate(null, {
				property: 'background-color', 
				value: 'rgba(0, 0, 0, 0.8)', 
				duration: d2,
				delay: dl2,
				func: 'ease-in-out'
			}, { start: false })).chain(wink.fx.animate(null, {
				property: 'background-color', 
				value: 'rgba(0, 0, 0, 0.0)', 
				duration: 0,
				delay: 0,
				func: 'ease-in-out'
			}, { start: false }));
			
			this._shadeState = true;
			var group = new wink.fx.animation.AnimationGroup();
			group.addAnimation(node1, anim);
			group.addAnimation(node2, anim2);
			group.start({ onEnd: { context: this, method: '_onShadeEnd' } });
		},
		
		/**
		 * Updates shade status
		 */
		_onShadeEnd: function() {
			this._shadeState = false;
		},
		
		/**
		 * Validate the properties of the component
		 * @returns {boolean} True if the properties are valid, false otherwise
		 */
		_validateProperties: function()
		{
	
			if ( !wink.isInteger(this.duration))
			{
				wink.log('[FlipPage] the duration parameter must be an integer');
				return false;
			}
			
			if ( !wink.isArray(this.pages) )
			{
				wink.log('[FlipPage] pages parameters must be an array');
				return false;
			}
			
			if ( !wink.isBoolean(this.shadow) )
			{
				wink.log('[FlipPage] shadow parameter must be a boolean');
				return false;
			}
				
			var l = this.pages.length;
			
			for ( var i=0; i<l; i++)
			{
				if ( $(this.pages[i]) == this.pages[i])
				{
					wink.log('[FlipPage] all the parameters should be dom nodes ids');
					return false;
				}
			}
		},
		
		/**
		 * Initialize the properties
		 */
		_initProperties: function()
		{
			var l = this.pages.length;
			
			for ( var i=0; i<=l; i++)
			{
				if ( i==0 )
				{
					var page = new wink.ui.layout.FlipPage.Page({'frontNode': null, 'backNode': $(this.pages[i]), index: i, zIndex: this.Z_INDEX-i, duration: this.duration});
					page.setPosition(0);
					this._currentPage = page;
				} else if ( i == l )
				{
					var page = new wink.ui.layout.FlipPage.Page({'frontNode': $(this.pages[i-1]), 'backNode': null, index: i, zIndex: this.Z_INDEX-i, duration: this.duration});
					page.setPosition(1);
				} else
				{
					var page = new wink.ui.layout.FlipPage.Page({'frontNode': $(this.pages[i-1]), 'backNode': $(this.pages[i]), index: i, zIndex: this.Z_INDEX-i});
					page.setPosition(1);
				}
				
				this._domNode.appendChild(page.getDomNode());
	
				wink.fx.applyTransformTransition(page.getDomNode(), this.duration + 'ms', '0ms', 'ease-in-out');
				
				this._pagesList.push(page);
			}
			
			for ( var i=0; i<l; i++)
			{
				$(this.pages[i]).parentNode.removeChild($(this.pages[i]));
			}
		
			if (this.shadow)
			{
				this._leftShadowNode = document.createElement('div');
				this._rightShadowNode = document.createElement('div');
				wink.addClass(this._leftShadowNode, 'fb_page');
				wink.addClass(this._rightShadowNode, 'fb_page');
				
				this._leftShadowNode.translate('-100%', 0);
				this._rightShadowNode.translate(0, 0);
				this._leftShadowNode.style.backgroundColor = 'rgba(0, 0, 0, 0.0)';
				this._rightShadowNode.style.backgroundColor = 'rgba(0, 0, 0, 0.0)';
				
				this._domNode.appendChild(this._leftShadowNode);
				this._domNode.appendChild(this._rightShadowNode);
			}
		},
		
		/**
		 * Initialize the 'touch' listeners
		 */
		_initListeners: function()
		{
			wink.ux.touch.addListener(this._domNode, 'start', { context: this, method: '_touchStart' });
			if (!this.wkArMove) {
				wink.ux.touch.addListener(this._domNode, 'move', { context: this, method: '_touchMove' });
			}
			wink.ux.touch.addListener(this._domNode, 'end', { context: this, method: '_touchEnd' });
		},
		
		/**
		 * Initialize the flippage node
		 */
		_initDom: function()
		{
			this._domNode = document.createElement('div');
			this._domNode.className = 'fb_container';
		}
	};
	
	/**
	 * @class Implements a flippage page
	 * Create a flippage page. Pages should only be instantiated by the flippage object
	 * 
	 * @param {object} properties The properties object
	 * @param {HTMLElement} properties.frontNode The node corresponding to the page's front cover
	 * @param {HTMLElement} properties.backNode The node corresponding to the page's back cover
	 * @param {integer} properties.index The rank of the page in the pages list
	 * @param {integer} properties.zIndex The depth of the page
	 * 
	 */
	wink.ui.layout.FlipPage.Page = function(properties)
	{
		/**
		 * Unique identifier
		 * 
		 * @property uId
		 * @type integer
		 */
		this.uId           = wink.getUId();
	
		/**
		 * The rank of the page in the pages list
		 * 
		 * @property index
		 * @type integer
		 */
		this.index         = properties.index;
		
		/**
		 * The position of the page (0: flipped ; 1: not flipped)
		 * 
		 * @property position
		 * @type integer
		 */
		this.position      = 0;
		
		/**
		 * The current depth of the page
		 * 
		 * @property zIndex
		 * @type integer
		 */
		this.zIndex        = properties.zIndex;
		
		this._frontId      = null;
		this._backId       = null;
		
		this._frontContent = properties.frontNode;
		this._backContent  = properties.backNode;
		
		this._frontNode    = null;
		this._backNode     = null;
		this._domNode      = null;
		
		this._initDom();
	};
	
	/**
	 * The event is fired when we start flipping a page
	 * 
	 * @name wink.ui.layout.FlipPage.Page#/flippage/events/flipstart
	 * @event
	 * @param {object} param The parameters object
	 * @param {string} param.id The current page id
	 * @param {integer} param.direction The flipping direction (1: forward ; -1: backward)
	 */
	
	/**
	 * The event is fired when the flipping ends
	 * 
	 * @name wink.ui.layout.FlipPage.Page#/flippage/events/flipend
	 * @event
	 * @param {object} param The parameters object
	 * @param {string} param.id The current page id
	 */
	
	wink.ui.layout.FlipPage.Page.prototype =
	{
		/**
		 * @returns {HTMLElement} The DOM node containing the Page
		 */
		getDomNode: function()
		{
			return this._domNode;
		},
		
		/**
		 * Update the content of the front cover
		 * 
		 * @param {string} content A string contaning the page content
		 */
		setFrontContent: function(content)
		{
			this._frontNode.innerHTML = '<div class="fb_content_right">' + content + '</div>';
		},
		
		/**
		 * Update the content of the back cover
		 * 
		 * @param {string} content A string contaning the page content
		 */
		setBackContent: function(content)
		{
			this._backNode.innerHTML = '<div class="fb_content_left">' + content + '</div>';
		},
		
		/**
		 * Set the current position of the page
		 * 
		 * @param {integer} position 0: page is flipped ; 1: page is not flipped
		 */
		setPosition: function(position)
		{
			this.position = position;
			
			wink.fx.initComposedTransform(this._domNode, false);
			
			if ( this.position == 0 )
			{
				wink.fx.setTransformPart(this._domNode, 1, { type: 'rotate', x: 0, y: 1, z: 0, angle: 180 });
				this._domNode.style.zIndex = 1000 - this.zIndex;
			} else
			{
				wink.fx.setTransformPart(this._domNode, 1, { type: 'rotate', x: 0, y: 1, z: 0, angle: 0 });
				this._domNode.style.zIndex = this.zIndex;
			}
			
			wink.fx.applyComposedTransform(this._domNode);
		},
		
		/**
		 * Initialize the Page node
		 */
		_initDom: function()
		{
			this._domNode = document.createElement('div');
			wink.addClass(this._domNode, 'fb_page');
			
			wink.fx.apply(this._domNode, {'transform-origin': '0 0', 'transform-style': 'preserve-3d'});
			
			this._domNode.style.zIndex = this.zIndex;
	
			this._frontNode = document.createElement('div');
			wink.isNull(this._frontContent)?this._frontNode.innerHTML = '<div class="fb_content_right"></div>':this._frontNode.innerHTML = '<div class="fb_content_right">' + this._frontContent.innerHTML + '</div>';
			this._frontNode.className= 'fb_content_front';
	
			this._backNode = document.createElement('div');
			wink.isNull(this._backContent)?this._backNode.innerHTML = '<div class="fb_content_left"></div>':this._backNode.innerHTML = '<div class="fb_content_left">' + this._backContent.innerHTML + '</div>';
			this._backNode.className= 'fb_content_back';
			
			this._domNode.appendChild(this._frontNode);
			this._domNode.appendChild(this._backNode);
			
			var onFlipEnd = wink.bind(function()
			{
				if ( this.position == 0 )
				{
					wink.publish('/flippage/events/flipend', {'id': this._backId});
				} else
				{
					wink.publish('/flippage/events/flipend', {'id': this._frontId});
				}
			}, this);
			wink.fx.onTransitionEnd(this._domNode, onFlipEnd, true);
			
			wink.isNull(this._frontContent)?this._frontId = '':this._frontId = this._frontContent.id;
			wink.isNull(this._backContent)?this._backId = '':this._backId = this._backContent.id;
		}
	};
	
	return wink.ui.layout.FlipPage;
});