/*--------------------------------------------------------
 * Copyright (c) 2011, The Dojo Foundation
 * This software is distributed under the "Simplified BSD license",
 * the text of which is available at http://www.winktoolkit.org/licence.txt
 * or see the "license.txt" file for more details.
 *--------------------------------------------------------*/

/**
 * @fileOverview Enables to trigger a refresh state, using a scroller, at the top or the bottom of the content.
 *  
 * @author Sylvain LALANDE
 */

define(['../../../_amd/core'], function(wink)
{
	/**
	 * @class Enables to trigger a refresh state, using a scroller, at the top or the bottom of the content.
	 * At least one section (top or bottom) is required.
	 * 
	 * @param {object} properties The properties object
	 * @param {wink.ui.layout.Scroller} properties.scroller scroller
	 * @param {HTMLElement} properties.scrollerContent The node of the content (target of the scroller)
	 * @param {object} [properties.topsection] The top section properties (waitText, triggeredText, releasedText, spinner)
	 * @param {object} [properties.bottomsection] The bottom section properties (waitText, triggeredText, releasedText, spinner)
	 * @param {function} properties.onTopReleased Function called when the scroller is scrolled to the top
	 * @param {function} properties.onBottomReleased Function called when the scroller is scrolled to the bottom
	 * 
	 * @example
	 * 
	 * var ctx = {};
	 * 
	 * var scrollToRefresh = new wink.plugins.ScrollToRefresh(
	 * {
	 * 	scroller: new wink.ui.layout.Scroller(
	 * 	{
	 * 		target: 'scrollContent',
	 * 		direction: 'y',
	 * 		callbacks: 
	 * 		{
	 * 			scrolling: { context: ctx, method: 'onScrolling' },
	 * 			endScrolling: { context: ctx, method: 'onEndScrolling' }
	 * 		}
	 * 	}),
	 * 	scrollerContent: wink.byId('scrollContent'),
	 * 	topsection: 
	 * 	{
	 * 		waitText: 'Pull down to refresh...',
	 * 		triggeredText: 'Release to refresh...',
	 * 		releasedText: 'Loading...',
	 * 		spinner: new wink.ui.xy.Spinner({ background: "light", size: 20 })
	 * 	},
	 * 	bottomsection: 
	 * 	{
	 * 		waitText: 'Pull up to load more...',
	 * 		triggeredText: 'Release to refresh...',
	 * 		releasedText: 'Loading...',
	 * 		spinner: new wink.ui.xy.Spinner({ background: "light", size: 20 })
	 * 	},
	 * 	onTopReleased: function(callback) { // Refresh Job },
	 * 	onBottomReleased: function(callback) { // Refresh Job }
	 * }
	 * 
	 * ctx.onScrolling = wink.bind(scrollToRefresh.onScrolling, scrollToRefresh);
	 * ctx.onEndScrolling = wink.bind(scrollToRefresh.onEndScrolling, scrollToRefresh);
	 *  
	 * @requires wink.ui.layout.Scroller
	 * 
	 * @compatibility iOS3, iOS4, iOS5, iOS6, Android 1.5, Android 2.1, Android 2.2, Android 2.3, Android 3.0, Android 3.1, Android 4.0, BlackBerry 6, BlackBerry 7, Bada 1.0
	 * 
	 * @winkVersion 1.4
	 * 
	 * @see <a href="WINK_ROOT_URL/plugins/scrolltorefresh/test/test_scrolltorefresh.html" target="_blank">Test page</a>
	 */
	wink.plugins.ScrollToRefresh = function(properties)
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
		this.scroller.updateTargetSize();
	};
	
	wink.plugins.ScrollToRefresh.prototype = {
		/**
		 * Allows to notify the component that of a scroll
		 */
		onScrolling: function()
		{
			var _this = this,
				scrollerView = _this.scroller.getViewProperties(),
				y = scrollerView.y,
				ly = scrollerView.limitY;
			if (y > 0) {
				if (_this._pds) {
					if (y > _this._pdoff) {
						_changeSectionState(_this._pds, _TRIGGERED);
					} else if (_this._pds.isTriggered() && y < (_this._pdoff - 10)) {
						_changeSectionState(_this._pds, _WAITING_TRIGGER);
					}
				}
			} else {
				if (_this._pus) {
					if (y < (ly - _this._puoff)) {
						_changeSectionState(_this._pus, _TRIGGERED);
					} else if (_this._pus.isTriggered() && y < (_this._puoff - 10)) {
						_changeSectionState(_this._pus, _WAITING_TRIGGER);
					}
				}
			}
		},
		/**
		 * Allows to notify the component that of a scroll end
		 */
		onEndScrolling: function()
		{
			var _this = this;
			if (_this._pds && _this._pds.isTriggered()) {
				_changeSectionState(_this._pds, _RELEASED);
				_this.scroller.updateShiftBounds(0, _this._puoff);
				
				_this.onTopReleased(function() {
					_this._onLoaded(_this._pds);
				});
			}
			if (_this._pus && _this._pus.isTriggered()) {
				_changeSectionState(_this._pus, _RELEASED);
				_this.scroller.updateShiftBounds(_this._pdoff, 0);
				
				_this.onBottomReleased(function() {
					_this._onLoaded(_this._pus);
				});
			}
		},
		/**
		 * 
		 */
		_onLoaded: function(section)
		{
			var _this = this;
			_changeSectionState(section, _WAITING_TRIGGER);
			_this.scroller.updateTargetSize();
			_this.scroller.updateShiftBounds(_this._pdoff, _this._puoff);
		},
			
		/**
		 * Initialize the nodes
		 */
		_initDom: function()
		{
			var _this = this;
			if (_this.topsection) {
				_this._pds = getPullSection(_this.topsection, "top");
				var pdn = _this._pds.node;
				var cns = _this.scrollerContent.childNodes;
				_this.scrollerContent.insertBefore(pdn, cns.length > 0 ? cns[0] : null);
				_this._pdoff = pdn.offsetHeight;
			}
			
			if (_this.bottomsection) {
				_this._pus = getPullSection(_this.bottomsection, "bottom");
				var pun = _this._pus.node;
				_this.scrollerContent.appendChild(pun);
				_this._puoff = pun.offsetHeight;
			}
			
			_this.scroller.updateShiftBounds(_this._pdoff, _this._puoff);
		},
		
		/**
		 * Initialize the properties
		 */
		_initProperties: function()
		{
			this._pdoff = this._puoff = 0;
		},
		
		/**
		 * Validate the properties of the component
		 * @returns {boolean} True if the properties are valid, false otherwise
		 */
		_validateProperties: function()
		{
			var _this = this,
				isset = wink.isSet,
				_raisePropertyError = function(property) {
					wink.log('[ScrollToRefresh] Error: ' + property + ' missing or invalid');
				},
				_s = _this.scroller,
				_sc = _this.scrollerContent,
				_ts = _this.topsection,
				_bs = _this.bottomsection;
				
			if (!isset(_s))
			{
				_raisePropertyError('scroller');
				return false;
			}
			if (!isset(_sc))
			{
				_raisePropertyError('scrollerContent');
				return false;
			}
			if (!isset(_ts) && !isset(_bs))
			{
				_raisePropertyError('topsection or bottomsection');
				return false;
			}
			return true;
		}
	};
	
	var _WAITING_TRIGGER = "wait",
		_TRIGGERED = "triggered",
		_RELEASED = "released",
		_addClass = wink.addClass,
		_createElem = function(type) {
			return document.createElement(type);
		},
		_appendChild = function(n1, n2) {
			n1.appendChild(n2);
		};
	
	/**
	 * @ignore
	 */
	var getPullSection = function(properties, cssClass)
	{
		var section = {
			state: "",
			isTriggered: function() {
				return (this.state == _TRIGGERED);
			},
			angle: (cssClass == "top") ? 180 : 0,
			rotate: function() {
				this.angle = (this.angle == 0) ? 180 : 0;
				wink.fx.translate(this.icon, 0, 0);
				wink.fx.rotate(this.icon, this.angle);
			}
		};
		wink.mixin(section, properties);
		
		var node = _createElem('div'),
			spaceL = _createElem('div'),
			spaceR = _createElem('div'),
			text = _createElem('div'),
			icon = _createElem('div'),
			labelW = _createElem('div'),
			labelT = _createElem('div'),
			labelR = _createElem('div'),
			labelRText = _createElem('div'),
			spinnerNode = _createElem('div');
		
		_addClass(node, "str_section w_layout_box " + cssClass);
		_addClass(spaceL, "str_sp w_expand");
		_addClass(spaceR, "str_sp w_expand");
		_addClass(text, "str_text w_layout_box");
		_addClass(icon, "str_icon");
		_addClass(labelW, "str_label " + _WAITING_TRIGGER);
		_addClass(labelT, "str_label " + _TRIGGERED);
		_addClass(labelR, "str_label " + _RELEASED);
		_addClass(spinnerNode, "str_sp_box");
		
		wink.fx.applyTransformTransition(icon, "150ms", "0ms", "default");
		
		_appendChild(labelR, spinnerNode);
		_appendChild(labelR, labelRText);
		_appendChild(text, icon);
		_appendChild(text, labelW);
		_appendChild(text, labelT);
		_appendChild(text, labelR);
		_appendChild(node, spaceL);
		_appendChild(node, text);
		_appendChild(node, spaceR);
		
		labelW.innerHTML = section.waitText;
		labelT.innerHTML = section.triggeredText;
		labelRText.innerHTML = section.releasedText;
		_appendChild(spinnerNode, section.spinner.getDomNode());
		
		section.node = node;
		section.spinnerNode = spinnerNode;
		section.icon = icon;
		section.rotate();
		
		_changeSectionState(section, _WAITING_TRIGGER);
		return section;
	};
	
	/**
	 * @ignore
	 */
	var _changeSectionState = function(section, state)
	{
		if (state == _WAITING_TRIGGER && section.state == _WAITING_TRIGGER) {
			return;
		}
		if (state == _TRIGGERED && section.state != _WAITING_TRIGGER) {
			return;
		}
		if (state == _RELEASED && section.state != _TRIGGERED) {
			return;
		}
		
		wink.removeClass(section.node, section.state);
		_addClass(section.node, state);
		section.state = state;
		if (state != _RELEASED) {
			section.rotate();
		}
	};
	
	return wink.plugins.ScrollToRefresh;
});