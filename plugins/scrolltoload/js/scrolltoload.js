/*--------------------------------------------------------
 * Copyright (c) 2011, The Dojo Foundation
 * This software is distributed under the "Simplified BSD license",
 * the text of which is available at http://www.winktoolkit.org/licence.txt
 * or see the "license.txt" file for more details.
 *--------------------------------------------------------*/

/**
 * @fileOverview A plugin that allows to manage the expansion of the content during the scroll.
 * 
 * @author Sylvain LALANDE
 */

define(['../../../_amd/core'], function(wink)
{
	/**
	 * @class A plugin that allows to manage the expansion of the content during the scroll.
	 * The user may calibrate the wanted behavior by adjusting the pageSize property. The scroller is optional.
	 * 
	 * @param {object} properties The properties object
	 * @param {wink.ui.layout.Scroller} [properties.scroller] An optional scroller used
	 * @param {HTMLElement} properties.content The content node
	 * @param {string} properties.waitText The wait text
	 * @param {string} properties.loadingText The loading text
	 * @param {wink.ui.xy.Spinner} properties.spinner The spinner
	 * @param {integer} [properties.pageSize=viewport_height] The page size used to compute paging
	 * @param {function} properties.onPageChanged The callback called when the current page changed
	 * @param {function} properties.onLoadMore The callback called when the action to load more is raised
	 *
	 * @example
	 * 
	 * var ctx = {};
	 * 
	 * var scrollToLoad = new wink.plugins.ScrollToLoad(
	 * {
	 * 	scroller: new wink.ui.layout.Scroller(
	 * 	{
	 * 		target: 'scrollContent',
	 * 		direction: 'y',
	 * 		callbacks: 
	 *		{
	 *			stopSliding: { context: ctx, method: 'onScroll' },
	 *			endScrolling: { context: ctx, method: 'onScroll' }
	 *		}
	 *	}),
	 *	content: wink.byId('scrollContent'),
	 *	waitText: 'Click here to load more',
	 *	loadingText: 'Loading...',
	 *	spinner: new wink.ui.xy.Spinner({ background: "light", size: 20 }),
	 *	pageSize: 600,
	 *	onPageChanged: function(pageindex, pagecount, onLoading, onEnd) 
	 *	{
	 *		onLoading();
	 *		// load more or not depending on pageindex
	 *		onEnd();
	 *	},
	 *	onLoadMore: function(onLoading, onEnd)
	 *	{
	 *		onLoading();
	 *		// load more or not depending on pageindex
	 *		onEnd();
	 *	}
	 * });
	 * 
	 * ctx.onScroll = wink.bind(scrollToLoad.onScroll, scrollToLoad);
	 * 
	 * @compatibility iOS3, iOS4, iOS5, iOS6, Android 1.5, Android 2.1, Android 2.2, Android 2.3, Android 3.0, Android 3.1, Android 4.0, BlackBerry 6, BlackBerry 7, Bada 1.0, Windows Phone 7.5
	 * 
	 * @winkVersion 1.4
	 * 
	 * @see <a href="WINK_ROOT_URL/plugins/scrolltoload/test/test_scrolltoload_1.html" target="_blank">Test page</a>
	 * @see <a href="WINK_ROOT_URL/plugins/scrolltoload/test/test_scrolltoload_2.html" target="_blank">Test page (with scroller)</a>
	 */
	wink.plugins.ScrollToLoad = function(properties)
	{
		/**
		 * Unique identifier
		 * 
		 * @property uId
		 * @type integer
		 */
		this.uId = wink.getUId();

		wink.mixin(this, properties);
		
		if (this._validateProperties() === false) return;

		this._initProperties();
		this._initDom();
		this._initListeners();
		
		this._status = this._LOADING_STATUS;
		this._toggleStatus();
		this._currentPage = 0;
		this._pageCount = 0;
		this._contentHeight = 0;
		this._updatePage();
	};
	
	wink.plugins.ScrollToLoad.prototype = {
		_WAIT_STATUS: "wait",
		_LOADING_STATUS: "loading",
		
		/**
		 * method called when a scroll occurs
		 */
		onScroll: function()
		{
			var _this = this;
			
			if (this._status == this._LOADING_STATUS) {
				return;
			}
			
			var previousPage = _this._currentPage,
				previousContentHeight = _this._contentHeight;
			
			_this._updatePage();

			if (previousPage != _this._currentPage || previousContentHeight != _this._contentHeight) {
				_this.onPageChanged(_this._currentPage, _this._pageCount, wink.bind(_this._loadMore, _this), wink.bind(_this._wait, _this));
			}
		},
		
		/**
		 * method called when a click occurs
		 */
		onClick: function()
		{
			var _this = this;
			_this.onLoadMore(wink.bind(_this._loadMore, _this), wink.bind(_this._wait, _this));
		},
		
		/**
		 * 
		 */
		_loadMore: function()
		{
			this._toggleStatus();
		},
		
		/**
		 * 
		 */
		_wait: function()
		{
			this._toggleStatus();
			this.content.appendChild(this.loadingNode);
			if (this.scroller) {
				this.scroller.updateTargetSize();
			}
		},
		
		/**
		 * 
		 */
		_updatePage: function()
		{
			if (this.scroller) {
				var scrollerView = this.scroller.getViewProperties(),
					height = scrollerView.sizeY,
					clientHeight = scrollerView.viewportSizeY,
					pos = -scrollerView.y;
			} else {
				var height = document.documentElement.scrollHeight,
					clientHeight = window.innerHeight,
					pos = window.pageYOffset;
			}
			
			var psize = this.pageSize || clientHeight,
				pcraw = height / psize,
				rem = pcraw - Math.floor(pcraw);
			
			var psize = this.pageSize || clientHeight,
				pcraw = height / psize,
				bottom = (pos + clientHeight),
				cpraw = bottom / psize,
				pc = Math.max(Math.ceil(pcraw), 1),
				cp = Math.floor(cpraw);
			
			if (bottom >= (height - 6)) {
				cp = pc;
			}
			
			this._pageCount = pc;
			this._currentPage = cp;
			this._contentHeight = height;
		},
		
		/**
		 * 
		 */
		_toggleStatus: function()
		{
			wink.removeClass(this.loadingNode, this._status);
			this._status = (this._status == this._LOADING_STATUS ? this._WAIT_STATUS : this._LOADING_STATUS);
			wink.addClass(this.loadingNode, this._status);
		},
		
		/**
		 * Initialize the nodes
		 */
		_initDom: function()
		{
			var ln = document.createElement('div'),
				icon = document.createElement('div'),
				labelW = document.createElement('div'),
				labelL = document.createElement('div'),
				text = document.createElement('div'),
				spaceL = document.createElement('div'),
				spaceR = document.createElement('div');
			
			wink.addClass(ln, "stl_section w_layout_box");
			wink.addClass(spaceL, "stl_sp w_expand");
			wink.addClass(spaceR, "stl_sp w_expand");
			wink.addClass(text, "stl_text w_layout_box");
			wink.addClass(icon, "stl_sp_box");
			wink.addClass(labelW, "stl_label " + this._WAIT_STATUS);
			wink.addClass(labelL, "stl_label " + this._LOADING_STATUS);
			
			text.appendChild(icon);
			text.appendChild(labelW);
			text.appendChild(labelL);
			ln.appendChild(spaceL);
			ln.appendChild(text);
			ln.appendChild(spaceR);
			icon.appendChild(this.spinner.getDomNode());
			
			labelW.innerHTML = this.waitText;
			labelL.innerHTML = this.loadingText;
			
			this.loadingNode = ln;
			
			this.content.appendChild(ln);
			
			if (this.scroller) {
				this.scroller.updateTargetSize();
			}
		},
		
		/**
		 * 
		 */
		_initListeners: function()
		{
			if (!this.scroller) {
				window.addEventListener('scroll', wink.bind(this.onScroll, this), false);
			}
			this.loadingNode.addEventListener('click', wink.bind(this.onClick, this), false);
		},
		
		/**
		 * Initialize the properties
		 */
		_initProperties: function()
		{
			
		},
		
		/**
		 * Validate the properties of the component
		 * @returns {boolean} True if the properties are valid, false otherwise
		 */
		_validateProperties: function()
		{
			return true;
		}
	};
	
	return wink.plugins.ScrollToLoad;
});