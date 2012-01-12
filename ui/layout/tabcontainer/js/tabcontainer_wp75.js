/*--------------------------------------------------------
 * Copyright (c) 2011, The Dojo Foundation
 * This software is distributed under the "Simplified BSD license",
 * the text of which is available at http://www.winktoolkit.org/licence.txt
 * or see the "license.txt" file for more details.
 *--------------------------------------------------------*/

/**
 * @fileOverview Windows Phone Tab container implementation
 * 
 * @see wink.ui.layout.TabContainer
 *
 * @compatibility Windows Phone 7.5
 * 
 * @author Donatien LEBARBIER
 */
define(['../../../../_amd/core'], function(wink)
{
	/**
	 * @class Windows Phone Tab container implementation
	 * @name wink.ui.layout.TabContainer-WP
	 * @see wink.ui.layout.TabContainer
	 * 
	 * @see <a href="WINK_ROOT_URL/ui/layout/tabcontainer/test/test_tabcontainer_1_ie.html" target="_blank">Test page</a>
	 * @see <a href="WINK_ROOT_URL/ui/layout/tabcontainer/test/test_tabcontainer_2_ie.html" target="_blank">Test page</a>
	 * 
	 * @borrows wink.ui.layout.TabContainer#uId as this.uId
	 * @borrows wink.ui.layout.TabContainer#displayArrows as this.displayArrows
	 * @borrows wink.ui.layout.TabContainer#firstSelectedTab as this.firstSelectedTab
	 * @borrows wink.ui.layout.TabContainer#tabs as this.tabs
	 * 
	 * @borrows wink.ui.layout.TabContainer#addTab as this.addTab
	 * @borrows wink.ui.layout.TabContainer#removeTab as this.removeTab
	 * @borrows wink.ui.layout.TabContainer#selectTab as this.selectTab
	 * @borrows wink.ui.layout.TabContainer#getDomNode as this.getDomNode
	 * 
	 */
	wink.ui.layout.TabContainer = function(properties)
	{
		this.uId                = wink.getUId();
		
		this.displayArrows     = 1;
		this.firstSelectedTab  = 0;
		
		this.tabs               = undefined;
		
		this._tabsIdsList       = [];
		this._tabsList 			= [];
		
		this._domNode           = null;
		this._tabsNode	        = null;
		this._moveableNode		= null;
		this._itemsNode			= null;
		this._leftArrowNode		= null;
		this._rightArrowNode	= null;
		
		this._visibleAreaSize	= 0;
		this._moveableAreaSize	= 0;
		this._timerResizer		= null;
		this._currentItem		= 0;
		this._currentPosition	= 0;
		
		this._selectingItem		= null;
		this._selectedItem		= null;
		
		wink.mixin(this, properties);
		
		if  ( this._validateProperties() ===  false )return;
		
		this._initDom();
		this._initControler();
		this._initProperties();
	};

	wink.ui.layout.TabContainer.prototype =
	/**
	 * @lends wink.ui.layout.TabContainer-WP
	 */
	{	
		/**
		 * Add a new tab to the tab container
		 * 
		 * @ignore
		 * @param {object} item An object containing a contentNode (containing the tab content) and a title
		 */
		addTab: function(item)
		{
			if ( item.contentNode.id == '' )
			{
				item.contentNode.id = wink.getUId();
			}
			
			var index = this._tabsList.length;
			
			var tab = new wink.ui.layout.TabContainer.Tab({'contentNode': item.contentNode, 'title': item.title});
			
			tab.index =  index;
			
			this._moveableNode.appendChild(tab.getTabNode());
			this._domNode.appendChild(tab.getContentNode());
			
			this._tabsList.push(tab);
			this._tabsIdsList.push(item.contentNode.id);
	
			//wink.ux.touch.addListener(tab.getTabNode(), "start", { context: this, method: "_handleItemClick", arguments: item.contentNode.id }, { preventDefault: true });
			tab.getTabNode().onclick = wink.bind(this._handleItemClick, this, item.contentNode.id);
			
			if (this._timerResizer == null)
			{
				this._timerResizer = wink.setTimeout(this, '_updateSizes', 100);
			}
			
			return item.contentNode.id;
		},
		
		/**
		 * Remove a tab
		 * 
		 * @ignore
		 * @param {string} id The id of the tab to remove
		 */
		removeTab: function(id)
		{	
			var l = this._tabsList.length;
			
			if ( l == 1 )
			{
				return;
			}
			
			for ( var i=0; i<l; i++ )
			{
				if ( this._tabsList[i].id == id )
				{
					this._moveableAreaSize -= this._tabsList[i].itemSize;
					
					this._moveableNode.removeChild(this._tabsList[i].getTabNode());
					this._domNode.removeChild(this._tabsList[i].getContentNode());
					
					if ( this._tabsList[i] == this._selectedItem )
					{
						if ( i == 0 )
						{
							this._displayTab(this._tabsList[i+1]);
						} else
						{
							this._displayTab(this._tabsList[i-1]);
						}
					}
					
					//wink.ux.touch.removeListener(this._tabsList[i].getTabNode(), "start", { context: this, method: "_handleItemClick", arguments: id });
					this._tabsList[i].getTabNode().onclick = null;
					
					delete this._tabsList[i].getTabNode();
					delete this._tabsList[i].getContentNode();
					
					this._tabsList.splice(i, 1);
					this._tabsIdsList.splice(i, 1);
					
					if ( this._currentItem > this._tabsList.length-1 )
					{
						this._currentItem = this._tabsList.length-1;
					}
					
					if (this._timerResizer == null)
					{
						this._timerResizer = wink.setTimeout(this, '_updateSizes', 100);
					}
					
					return;
				}
			}
		},
		
		/**
		 * Select a tab
		 * 
		 * @ignore
		 * @param {string} id The id of the tab to select
		 */
		selectTab: function(id)
		{	
			var l = this._tabsList.length;
			
			for ( var i=0; i<l; i++ )
			{
				if ( this._tabsList[i].id == id )
				{
					
					this._currentItem = i;
					var x = this._tabsList[i].position;
					this._translateTo(x);
					this._displayTab(this._tabsList[i]);
					return;
				}
			}
		},
		
		/**
		 * @ignore
		 * @returns {HTMLElement} The DOM node containing the tab container
		 */
		getDomNode: function()
		{
			return this._domNode;
		},
		
		/**
		 * Display a tab
		 * 
		 * @param {wink.ui.layout.TabContainer.Tab} item The tab to display
		 */
		_displayTab: function(item)
		{
			if (this._selectedItem != null)
			{
				this._selectedItem.deactivate();
			}
			
			this._selectedItem = item;
			this._selectedItem.activate();
		},
		
		/**
		 * The user started clicked on the left arrow
		 * 
		 * @param {wink.ux.Event} e The touchend event
		 */
		_handleLeftArrowClicked: function(e)
		{
			this._next();
		},
		
		/**
		 * The user started clicked on the right arrow
		 * 
		 * @param {wink.ux.Event} e The touchend event
		 */
		_handleRightArrowClicked: function(e)
		{
			this._previous();
		},
		
		/**
		 * translate the tab area
		 * 
		 * @param {integer} x The translation distance in pixels
		 * @param {integer} duration The duration of the translation
		 */
		_translateTo: function(x)
		{
			this._itemsNode.scrollLeft = x;
			this._currentPosition = this._itemsNode.scrollLeft;
		},
		
		/**
		 * Mark the tab being currently selected
		 * 
		 * @param {integer} id The index of the tab
		 */
		_handleItemClick: function(id)
		{
			var l = this._tabsList.length;
			for ( var i=0; i<l; i++ )
			{
				if ( this._tabsList[i].id == id )
				{
					this._selectingItem = this._tabsList[i];
					this._displayTab(this._selectingItem);
					wink.publish('/tabcontainer/events/tabselected', {'id': this._selectingItem.id});
					
					break;
				}
			}
		},
		
		/**
		 * Check if a tab is currently in the visible area
		 * 
		 * @param {integer} index The index of the tab
		 */
		_isWhollyVisible: function(index)
		{
			var start = this._tabsList[index].position;
			var end = start + this._tabsList[index].size;
			if (start >= this._currentPosition && end <= (this._currentPosition + this._visibleAreaSize))
			{
				return true;
			}
			
			return false;
		},
		
		/**
		 * Slide to the next tab
		 */
		_next: function()
		{
			if (this._currentItem >= this._tabsList.length - 1)
			{
				return;
			}
			
			if (this._isWhollyVisible(this._tabsList[this._tabsList.length - 1].index))
			{
				return;
			}
			
			this._currentItem++;
			var x = this._tabsList[this._currentItem].position;
			this._translateTo(x);
		},
		
		/**
		 * Slide to the previous tab
		 */
		_previous: function()
		{
			if (this._currentItem == 0)
			{
				return;
			}
			
			while(this._isWhollyVisible(this._currentItem))
			{
				this._currentItem--;
			}

			this._translateTo(this._tabsList[this._currentItem].position);
		},
		
		/**
		 * Update the tabs area and visible area sizes
		 */
		_updateSizes: function()
		{
			if (this._timerResizer != null)
			{
				clearTimeout(this._timerResizer);
				this._timerResizer = null;
			}
			
			this._moveableAreaSize = 0;
			this._visibleAreaSize = this._tabsNode.offsetWidth - (this._leftArrowNode.offsetWidth + this._rightArrowNode.offsetWidth);
			
			for (var i = 0; i < this._tabsList.length; i++)
			{
				this._tabsList[i].updateMaxWidth(this._visibleAreaSize-60);
				this._tabsList[i].size = this._tabsList[i].getTabNode().offsetWidth;
				this._tabsList[i].position = this._moveableAreaSize;
				
				this._moveableAreaSize += this._tabsList[i].size;
			}
			
			this._moveableNode.style.width = (this._moveableAreaSize + 1) + "px";
		},
		
		/**
		 * Validate the properties of the component
		 * @returns {boolean} True if the properties are valid, false otherwise
		 */
		_validateProperties: function()
		{
			if ( wink.isUndefined(this.tabs) )
			{
				wink.log('[TabContainer] tabs parameter must be set');
				return false;
			}
			
			if ( !wink.isInteger(this.firstSelectedTab) )
			{
				wink.log('[TabContainer] firstSelectedTab must be an integer');
				return false;
			}
			
			if ( (this.displayArrows != 0) && (this.displayArrows != 1))
			{
				wink.log('[TabContainer] the displayArrows parameter must be either 0 or 1');
				return false;
			}
				
			var l = this.tabs.length;
			
			for ( var i=0; i<l; i++)
			{
				if ( $(this.tabs[i]) == this.tabs[i])
				{
					wink.log('[TabContainer] all the parameters should be dom nodes ids');
					return false;
				}
			}
		},
		
		/**
		 * Initialize the properties
		 */
		_initProperties: function()
		{
			var l = this.tabs.length;
			
			for ( var i=0; i<l; i++)
			{
				var title = $(this.tabs[i]).getElementsByClassName('tc_title')[0];
				
				if ( wink.isUndefined(title) )
				{
					title = 'no title';
				} else
				{
					$(this.tabs[i]).removeChild(title);
					title = title.innerHTML;
				}
				
				this.addTab({'contentNode': $(this.tabs[i]), 'title': title});
			}
			
			wink.setTimeout(this, 'selectTab', 100, this.tabs[this.firstSelectedTab]);
		},
		
		/**
		 * Initialize the listeners
		 */
		_initControler: function() 
		{
			this._rightArrowNode.onclick = wink.bind(this._handleRightArrowClicked, this);
			this._leftArrowNode.onclick = wink.bind(this._handleLeftArrowClicked, this);
			
			window.addEventListener("resize", wink.bind(function(){this._translateTo(this._tabsList[this._currentItem].position);}, this), false);
		},
		
		/**
		 * Initialize the tab container node
		 */
		_initDom: function()
		{
			this._domNode = document.createElement('div');
			this._domNode.className = 'w_box w_border_bottom';
			
			this._tabsNode = document.createElement('div');
			
			this._itemsNode	= document.createElement('div');
			this._moveableNode = document.createElement('div');
			this._leftArrowNode	= document.createElement('div');
			this._leftArrow	= document.createElement('div');
			this._rightArrowNode = document.createElement('div');
			this._rightArrow = document.createElement('div');
			
			if ( this.displayArrows == 0 )
			{
				this._leftArrowNode.style.display = 'none';
				this._rightArrowNode.style.display = 'none';
				this._itemsNode.style.left = '0px';
				this._itemsNode.style.right = '0px';
			}
	
			this._leftArrowNode.appendChild(this._leftArrow);
			this._rightArrowNode.appendChild(this._rightArrow);
			
			this._itemsNode.appendChild(this._moveableNode);
			this._tabsNode.appendChild(this._leftArrowNode);
			this._tabsNode.appendChild(this._itemsNode);
			this._tabsNode.appendChild(this._rightArrowNode);
	
			this._domNode.appendChild(this._tabsNode);
	
			
			wink.addClass(this._tabsNode, 'w_tabs w_border_bottom');
			wink.addClass(this._itemsNode, 'tc_tabs_items');
			wink.fx.apply(this._itemsNode, {
				width: 'auto',
				overflowX: 'scroll'
			});
			wink.addClass(this._moveableNode, 'tc_tabs_moveable');
			wink.fx.apply(this._moveableNode, {
				position: 'static',
				width: 'auto'
			});
			wink.addClass(this._leftArrowNode, 'tc_arrow w_bg_dark');
			wink.addClass(this._leftArrow, 'w_icon w_button_previous');
			wink.addClass(this._rightArrowNode, 'tc_arrow tc_right w_bg_dark');
			wink.addClass(this._rightArrow, 'w_icon w_button_next');
		}
	};
	
	
	/**
	 * @class Windows Phone Tab implementation
	 * @name wink.ui.layout.TabContainer.Tab-WP
	 * 
	 * @param {object} properties The properties object
	 * @param {HTMLElement} properties.contentNode A DOM node corresponding to the tab content
	 * @param {string} properties.title The title of the tab 
	 * 
	 * @borrows wink.ui.layout.TabContainer.Tab#uId as this.uId
	 * @borrows wink.ui.layout.TabContainer.Tab#id as this.id
	 * @borrows wink.ui.layout.TabContainer.Tab#index as this.index
	 * @borrows wink.ui.layout.TabContainer.Tab#size as this.size
	 * @borrows wink.ui.layout.TabContainer.Tab#position as this.position
	 * 
	 * @borrows wink.ui.layout.TabContainer.Tab#getContentNode as this.getContentNode
	 * @borrows wink.ui.layout.TabContainer.Tab#getTabNode as this.getTabNode
	 * @borrows wink.ui.layout.TabContainer.Tab#activate as this.activate
	 * @borrows wink.ui.layout.TabContainer.Tab#deactivate as this.deactivate
	 * @borrows wink.ui.layout.TabContainer.Tab#updateMaxWidth as this.updateMaxWidth
	 */
	wink.ui.layout.TabContainer.Tab = function(properties)
	{
		this.uId          = wink.getUId();
		this.id           = null;
		
		this.index        = 0;
		this.size         = 0;
		this.position     = 0;
		
		this._title       = properties.title;
		
		this._contentNode = properties.contentNode;
		this._tabNode     = null;
		
		this._initProperties();
		this._initDom();
	};
	
	wink.ui.layout.TabContainer.Tab.prototype =
	/**
	 * @lends wink.ui.layout.TabContainer.Tab-WP
	 */
	{
		/**
		 * @ignore
		 * @returns {HTMLElement} The DOM node containing the content of the tab
		 */
		getContentNode: function()
		{
			return this._contentNode;
		},
		
		/**
		 * @ignore
		 * @returns {HTMLElement} the DOM node containing the tab
		 */
		getTabNode: function()
		{
			return this._tabNode;
		},
		
		/**
		 * Activate the tab
		 * 
		 * @ignore
		 */
		activate: function()
		{
			wink.removeClass(this._tabNode, 'w_bg_light');
			
			wink.addClass(this._tabNode, 'w_bg_dark');
			wink.addClass(this._tabNode, 'tc_on');
			wink.addClass(this._contentNode, 'tc_on');
		},
		
		/**
		 * Deactivate the tab
		 * 
		 * @ignore
		 */
		deactivate: function()
		{
			wink.removeClass(this._contentNode, 'tc_on');
			wink.removeClass(this._tabNode, 'tc_on');
			wink.removeClass(this._tabNode, 'w_bg_dark');
			
			wink.addClass(this._tabNode, 'w_bg_light');
		},
		
		/**
		 * Update the maximum width of the tab
		 * 
		 * @ignore
		 * @param {integer} width The maximum width in pixels
		 */
		updateMaxWidth: function(width)
		{
			//this._tabNode.style.maxWidth = width + 'px';
		},
		
		/**
		 * Initialize the tab node
		 */
		_initDom: function()
		{
			this._tabNode = document.createElement('div');
			this._tabNode.innerHTML = this._title;
			
			wink.addClass(this._contentNode, 'w_bloc tc_bloc');
			wink.addClass(this._tabNode, 'w_tab w_border w_radius_top_left w_radius_top_right w_bg_light');
		},
		
		/**
		 * Initialize the properties
		 */
		_initProperties: function()
		{
			this.id = this._contentNode.id;
		}
	};
	
	return wink.ui.layout.TabContainer;
});