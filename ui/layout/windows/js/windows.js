/*--------------------------------------------------------
 * Copyright (c) 2011, The Dojo Foundation
 * This software is distributed under the "Simplified BSD license",
 * the text of which is available at http://www.winktoolkit.org/licence.txt
 * or see the "license.txt" file for more details.
 *--------------------------------------------------------*/

/**
 * @fileOverview Implement a windows container
 * Create a windows container container with which you can navigate through pages
 *
 * @compatibility Iphone OS3, Iphone OS4, Android 3.0, Android 3.1, BlackBerry 7
 * 
 * @author Jerome GIRAUD
 */

/**
 * Fired when a slide starts
 * 
 * @name wink.ui.layout.Windows#/windows/events/slidestart
 * @event
 * @param {object} param The parameters object
 * @param {string} param.id The id of the front page
 */

/**
 * Fired when a slide ends
 * 
 * @name wink.ui.layout.Windows#/windows/events/slideend
 * @event
 * @param {object} param The parameters object
 * @param {string} param.id The id of the front page
 */
define(['../../../../_amd/core', '../../../../math/_geometric/js/geometric', '../../../../fx/_xyz/js/3dfx', '../../../../fx/_animation/js/animation'], function(wink)
{
	/**
	 * @class Implement a windows container<br>
	 * Create a windows container container with which you can navigate through pages<br>
	 * To instantiate a windows container, the pages (dom nodes) MUST already be present in the page and each one MUST be defined by a unique id. Use the 'getDomNode' method to add the windows container into the page
	 * 
	 * @param {object} properties The properties object
	 * @param {array} properties.pages An array containing the ids of the pages to add into the windows container. The pages dom nodes MUST be present in the page at instantiation time
	 * @param {integer} [properties.duration=800] The slide duration in milliseconds
	 * 
	 * @requires wink.math._geometric
	 * @requires wink.math._matrix
	 * @requires wink.fx._xyz
	 * @requires wink.fx.animation
	 * 
	 * @example
	 * 
	 * var properties = 
	 * {
	 * 	'duration': 800,
	 * 	'pages': ['page1', 'page2', 'page3', 'page4']
	 * }
	 * windows = new wink.ui.layout.Windows(properties);
	 * document.body.appendChild(windows.getDomNode());
	 * 
	 * @see <a href="WINK_ROOT_URL/ui/layout/windows/test/test_windows.html" target="_blank">Test page</a>
	 * 
	 */
	wink.ui.layout.Windows = function(properties)
	{
		/**
		 * Unique identifier
		 * 
		 * @property uId
		 * @type integer
		 */
		this.uId                    = wink.getUId();
		
		/**
		 * The list of pages ids of the windows container
		 * 
		 * @property pages
		 * @type array
		 */
		this.pages					= null;
		
		/**
		 * The slide duration
		 * 
		 * @property duration
		 * @type integer
		 */
		this.duration	            = 800;
		
		this._domNode				= null;
		
		this._pagesList				= [];
		this._firstPage				= null;
		
		wink.mixin(this, properties);
		
		if (this._validateProperties() === false) return;
			
		this._initDom();
		this._initProperties();
	};
	
	wink.ui.layout.Windows.prototype =
	{
		/**
		 * @returns {HTMLElement} The DOM node containing the window container
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
			var fp = this._firstPage,
				cp = this._getPageById(id);
	
			if (cp == null || cp == fp )
			{
				return;
			}
			
			var animGroup = new wink.fx.animation.AnimationGroup();
			
			var anim1 = new wink.fx.animation.Animation();
			var anim2 = new wink.fx.animation.Animation();
			
			var offwidth = document.documentElement.offsetWidth,
				x = -40*fp.position,
				y = -x,
				a = -20,
				z = -50+(fp.position * 15),
				z2 = -50+(cp.position * 15);
			
			var transformations11 = 
			[
				{ type: "translate", x: offwidth + 100, y: 0, z: z },
				{ type: "rotate", x: 0, y: 1, z: 0, angle: a }
			];
			
			var transformations12 = 
			[
				{ type: "translate", x: x, y: y, z: z },
				{ type: "rotate", x: 0, y: 1, z: 0, angle: a }
			];
			
			var transformations21 = 
			[
				{ type: "translate", x: -offwidth - 100, y: 40*cp.position, z: z2 },
				{ type: "rotate", x: 0, y: 1, z: 0, angle: a }
			];
			
			var transformations22 = 
			[
				{ type: "translate", x: 0, y: 0, z: 1 },
				{ type: "rotate", x: 0, y: 1, z: 0, angle: 0 }
			];
			
			anim1.addStep({
				property: 'transform',
				value: { context: this, method: '_transform', arguments: [ transformations11 ] },
				duration: this.duration,
				delay: 0,
				func: 'default'
			});
			
			anim1.addStep({
				property: 'transform',
				value: { context: this, method: '_transform', arguments: [ transformations12 ] },
				duration: this.duration,
				delay: 0,
				func: 'default'
			});
			
			anim2.addStep({
				property: 'transform',
				value: { context: this, method: '_transform', arguments: [ transformations21 ] },
				duration: this.duration,
				delay: 0,
				func: 'default'
			});
			
			anim2.addStep({
				property: 'transform',
				value: { context: this, method: '_transform', arguments: [ transformations22 ] },
				duration: this.duration,
				delay: 0,
				func: 'default'
			});
			
			animGroup.addAnimation(fp.getDomNode(), anim1);
			animGroup.addAnimation(cp.getDomNode(), anim2);
			
			animGroup.start(
			{
				onEnd:
				{ 
					context: this, 
					method: '_slideEnd'
				} 
			});
			
			this._firstPage = cp;
			
			wink.publish('/windows/events/slidestart', { 'id': cp.id });
		},
		
		/**
		 * Apply transforms to a node
		 * 
		 * @param {object} params Parameters
		 * @param {HTMLElement} params.node The node to transform
		 * @param {array} transformations The details of the transformations
		 */
		_transform: function(params, transformations) 
		{
			var node = params.node;
			
			wink.fx.initComposedTransform(node);
			
			for (var i = 0; i < transformations.length; i++) 
			{
				wink.fx.setTransformPart(node, (i + 1), transformations[i]);
			}
			
			wink.fx.applyComposedTransform(node);
		},
		
		/**
		 * Publish the slide end event
		 */
		_slideEnd: function()
		{
			wink.publish('/windows/events/slideend', { 'id': this._firstPage.id });
		},
		
		/**
		 * Get a page
		 * 
		 * @param {string} id The id of the page to return
		 * @returns {wink.ui.layout.Windows.Page} The page
		 */
		_getPageById: function(id)
		{
			var i, pl = this._pagesList, l = pl.length;
			for (i = 0; i < l; i++)
			{
				var page = pl[i];
				
				if (page.id == id)
				{
					return page;
				}
			}
			return null;
		},
		
		/**
		 * Validate the properties of the component
		 * @returns {boolean} True if the properties are valid, false otherwise
		 */
		_validateProperties: function()
		{
			if ( !wink.isArray(this.pages) )
			{
				wink.log('[Windows] pages parameters must be an array');
				return false;
			}
			
			if ( !wink.isInteger(this.duration) )
			{
				wink.log('[Windows] duration parameter must be an integer');
				return false;
			}
				
			var l = this.pages.length;
			
			for ( var i=0; i<l; i++)
			{
				if ( $(this.pages[i]) == this.pages[i])
				{
					wink.log('[Windows] all the parameters should be dom nodes ids');
					return false;
				}
			}
		},
		
		/**
		 * Initialize the properties
		 */
		_initProperties: function()
		{
			var i, pgs = this.pages, l = pgs.length;
			
			for (i = 0; i < l; i++)
			{
				if (i == 0)
				{
					var page = new wink.ui.layout.Windows.Page({ 'node': $(pgs[i]), 'position': l-1-i, 'front': true });
					this._firstPage = page;
				} else
				{
					var page = new wink.ui.layout.Windows.Page({ 'node': $(pgs[i]), 'position': l-1-i});
				}
				
				var pn = page.getDomNode();
				
				pn.parentNode.removeChild(pn);
				
				this._domNode.appendChild(pn);
				this._pagesList.push(page);
			}
		},
		
		/**
		 * Initialize the windows container node
		 */
		_initDom: function()
		{
			this._domNode = document.createElement('div');
			
			wink.addClass(this._domNode, 'wi_container');
			
			wink.fx.apply(this._domNode, {'perspective': '1000', 'transform-style': 'preserve-3d'});
		}
	};
	
	
	/**
	 * @class Implement a page to be added to the windows
	 * Create a page. Pages should only be instantiated by the windows object
	 * 
	 * @param {object} properties The properties object
	 * @param {HTMLElement} properties.node The DOM node corresponding to the page
	 * @param {integer} properties.position The position of the page in the list of pages
	 */
	wink.ui.layout.Windows.Page = function(properties)
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
		 * The dom node
		 * 
		 * @property node
		 * @type HTMLElement
		 */
		this.node           = null;
		
		/**
		 * The position of the page in the list of pages
		 * 
		 * @property position
		 * @type integer
		 */
		this.position		= 0;
		
		wink.mixin(this, properties);
		
		this._initProperties();
		this._initDom();
	};
	
	wink.ui.layout.Windows.Page.prototype =
	{	
		/**
		 * @returns {HTMLElement} The DOM node containing the Page
		 */
		getDomNode: function()
		{
			return this.node;
		},
		
		/**
		 * Initialize the Page node
		 */
		_initDom: function()
		{
			wink.addClass(this.node, 'wi_page');
			
			wink.fx.apply(this.node, {'transform-origin': '300% 100%'});
			
			var x = -40*this.position,
				y = -x,
				z = -50+(this.position * 15),
				n = this.node;
			
			wink.fx.initComposedTransform(n);
			if ( !this.front )
			{
				wink.fx.setTransformPart(n, 1, { type: "translate", x: x, y: y, z: z });
				wink.fx.setTransformPart(n, 2, { type: "rotate", x: 0, y: 1, z: 0, angle: -20 });
			}
			else
			{
				wink.fx.setTransformPart(n, 1, { type: "translate", x: 0, y: 0, z: 1 });
			}
			wink.fx.applyComposedTransform(n);
		},
		
		/**
		 * Initialize the properties
		 */
		_initProperties: function()
		{
			this.id = this.node.id;
		}
	};
	
	return wink.ui.layout.Windows;
});