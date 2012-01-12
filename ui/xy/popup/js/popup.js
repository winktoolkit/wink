/*--------------------------------------------------------
 * Copyright (c) 2011, The Dojo Foundation
 * This software is distributed under the "Simplified BSD license",
 * the text of which is available at http://www.winktoolkit.org/licence.txt
 * or see the "license.txt" file for more details.
 *--------------------------------------------------------*/

/**
 * @fileOverview Implements a popup component
 * 
 * @compatibility Iphone OS2, Iphone OS3, Iphone OS4, Android 1.1, Android 1.5, Android 2.1, Android 2.2, Android 2.3, Android 3.0, Android 3.1, BlackBerry 6, BlackBerry 7, Bada 1.0, Windows Phone 7.5
 * @author Frédéric MOULIS, JF CUNAT, Sylvain LALANDE
 */

define(['../../../../_amd/core'], function(wink)
{
	/**
	 * @class Popup is a singleton that allows to open a popup window with one (alert) or two buttons (confirm) or with a fully customizable content
	 * Options are available for each type of popup style
	 * 
	 * @example
	 * 
	 * var popup = new wink.ui.xy.Popup();
	 * 
	 * document.body.appendChild(popup.getDomNode());
	 * 
	 * popup.confirm(
	 * {
	 * 	msg: "Do you confirm ?",
	 * 	callbackOk: { context: window, method: 'confirmOk' },
	 * 	callbackCancel: { context: window, method: 'confirmCancel' }
	 * });
	 * 
	 * @see <a href="WINK_ROOT_URL/ui/xy/popup/test/test_popup_1.html" target="_blank">Test page</a>
	 * @see <a href="WINK_ROOT_URL/ui/xy/popup/test/test_popup_2.html" target="_blank">Test page (add to homescreen)</a>
	 */
	wink.ui.xy.Popup = function()
	{
		if (wink.isUndefined(wink.ui.xy.Popup.singleton))
		{
			/**
			 * Unique identifier
			 * 
			 * @property
			 * @type integer
			 */
			this.uId = 1;
			
			/**
			 * Indicates whether the Popup is displayed
			 * 
			 * @property
			 * @type boolean
			 */
			this.displayed = false;
			
			
			this._domNode		= null;
			this._contentNode 	= null;
			this._btnsNode 		= null;
			this._arrowNode		= null;
			this._absolutePos	= false;
			this._followScrollY = false;
			this._scrollHandler = null;
			this._popupClasses	= "";
			this._inTransition	= false;
			this._transitions	= {};
	
			this._initDom();
			this._initListeners();
			
			wink.ui.xy.Popup.singleton = this;
		} 
		else 
		{
			return wink.ui.xy.Popup.singleton;
		}
	};
	
	wink.ui.xy.Popup.prototype = 
	{
		i18n: {},
		_DEFAULT_ARROW: "none",
		
		/**
		 * Returns the Popup dom node
		 * 
		 * @returns {HTMLElement} The main dom node
		 */
		getDomNode: function()
		{
			return this._domNode;
		},
		/**
		 * Hides the Popup
		 */
		hide: function()
		{
			this._hide();
		},
		/**
		 * @deprecated This method is no longer needed
		 * @since 1.2.0
		 */
		preloadContent: function()
		{
			wink.log('[Popup] preloadContent is deprecated : this method is no longer needed');
			return;
		},
		/**
		 * Opens a 1-button popup with a message. calls a callback function if asked when the button is clicked
		 * 
		 * @param {object} options The options object
		 * @param {string} options.msg The message to display
		 * @param {string} options.btn The text to display in the button. If nothing specified, the default translation is used
		 * @param {object} options.callback The callback to invoke when the user clicks on the button
		 * @param {boolean} options.borderRadius Indicates whether the popup must be displayed with border-radius style
		 * @param {integer} options.duration The duration of the display transition
		 * @param {boolean} options.followScrollY Allows to follow the scroll on y-axis
		 */
		alert: function(options)
		{
			if (this.displayed == true) {
				return;
			}
			var opt = options || {};
			this._initTemplate(this._DEFAULT_ARROW, opt.msg);
	
			var btnNode = document.createElement('div');
			wink.addClass(btnNode, "w_button w_radius pp_popup_btn pp_popup_alert w_bg_light");
			var btnNodeValue = _('alertOk', this);
			if (wink.isSet(opt.btn))
			{
				btnNodeValue = opt.btn;
			}
			btnNode.innerHTML = btnNodeValue;
	
			if (wink.isSet(opt.callback)) {
				btnNode.onclick = wink.bind(function(e) {
					this._invokeCallback(opt.callback);
				}, this);
			}
			this._btnsNode.appendChild(btnNode);
			
			this._setPopupStyle("pp_type_alert", opt);
			this._show();
		},
		/**
		 * Opens a 2-buttons popup with a message. calls a callback function if asked, depending on the clicked button
		 * 
		 * @param {object} options The options object
		 * @param {string} options.msg The message to display
		 * @param {string} options.btnCancel The text to display in the "cancel" button. If nothing specified, the default translation is used
		 * @param {object} options.callbackCancel The callback to invoke when the user clicks on the 'cancel' button { context, method }
		 * @param {string} options.btnOk The text to display in the "ok" button. If nothing specified, the default translation is used
		 * @param {callback} options.callbackOk The callback to invoke when the user clicks on the 'ok' button { context, method }
		 * @param {boolean} options.borderRadius Indicates whether the popup must be displayed with border-radius style
		 * @param {integer} options.duration The duration of the display transition
		 * @param {boolean} options.followScrollY Allows to follow the scroll on y-axis
		 */
		confirm: function(options)
		{
			if (this.displayed == true) {
				return;
			}
			var opt = options || {};
			this._initTemplate(this._DEFAULT_ARROW, opt.msg);
			
			var btnCancelNode = document.createElement('div');
			var btnOkNode = document.createElement('div');
			wink.addClass(btnCancelNode, "w_button w_radius pp_popup_btn pp_popup_confirm w_bg_light");
			wink.addClass(btnOkNode, "w_button w_radius pp_popup_btn pp_popup_confirm w_bg_light");
			
			var btnCancelValue = _('confirmCancel', this);
			if (wink.isSet(opt.btnCancel))
			{
				btnCancelValue = opt.btnCancel;
			}
			var btnOkValue = _('confirmOk', this);
			if (wink.isSet(opt.btnOk))
			{
				btnOkValue = opt.btnOk;
			}
			
			btnCancelNode.innerHTML = btnCancelValue;
			btnOkNode.innerHTML = btnOkValue;
			
			if (wink.isSet(opt.callbackCancel)) {
				btnCancelNode.onclick = wink.bind(function(e) {
					this._invokeCallback(opt.callbackCancel);
				}, this);
			}
			if (wink.isSet(opt.callbackOk)) {
				btnOkNode.onclick = wink.bind(function(e) {
					this._invokeCallback(opt.callbackOk);
				}, this);
			}
			this._btnsNode.appendChild(btnCancelNode);
			this._btnsNode.appendChild(btnOkNode);
			
			this._setPopupStyle("pp_type_confirm", opt);
			this._show();
		},
		/**
		 * Opens a fully customizable popup
		 * 
		 * @param {object} options The options object
		 * @param {string} options.content The HTML code of the content
		 * @param {string} options.arrow The position of the arrow, if needed, values: "top", "bottom", "none" (default value)
		 * @param {integer|string} options.top The top position of the window
		 * @param {HTMLElement} options.targetNode The node pointed by the arrow (top is then ignored)
		 * @param {integer|string} options.arrowLeftPos The left-position of the arrow
		 * @param {boolean} options.borderRadius Indicates whether the popup must be displayed with border-radius style
		 * @param {integer} options.duration The duration of the display transition
		 * @param {boolean} options.followScrollY Allows to follow the scroll on y-axis
		 * @param {object} options.layerCallback The callback invoked when the user click on the layer, if not specified the default action is the popup hiding
		 */
		popup: function(options)
		{
			if (this.displayed == true) {
				return;
			}
			var opt = options || {};
			var arrowValue = this._DEFAULT_ARROW;
			var arrowLeftPos = "50px";
			
			if (wink.isSet(opt.arrowLeftPos)) {
				if (wink.isInteger(opt.arrowLeftPos)) {
					arrowLeftPos = opt.arrowLeftPos + "px";
				} else {
					arrowLeftPos = opt.arrowLeftPos;
				}
			}
			
			if (wink.isSet(opt.arrow)) {
				arrowValue 	= opt.arrow;
			}
			if (arrowValue != 'top' && arrowValue != 'bottom' && arrowValue != this._DEFAULT_ARROW) {
				wink.log('[Popup] popup() : bad arrow value (expected "top", "bottom" or "none")');
				return;
			}
			
			this._initTemplate(arrowValue, opt.content, arrowLeftPos);
			
			var topValue = "0px";
			if (wink.isSet(opt.targetNode)) {
				this._absolutePos = true;			
				if (arrowValue == "bottom") {
					topValue = opt.targetNode.getTopPosition() - this._domNode.offsetHeight - 10 + "px";
				} else if (arrowValue == "top") {
					topValue = opt.targetNode.getTopPosition() + opt.targetNode.offsetHeight + 10 + "px";
				}
			} else if (wink.isSet(opt.top)) {
				this._absolutePos = true;
				if (wink.isInteger(opt.top)) {
					topValue = opt.top + "px";
				} else {
					topValue = opt.top;
				}
			}
			this._domNode.style.top = topValue;
			
			this._setPopupStyle("pp_type_popup", opt);
			
			// for browsers that do not support css gradient
			if(!wink.has('css-gradient'))
			{
				this._arrowNode.style['border'+((arrowValue == 'top') ? 'Bottom' : 'Top')+'Color'] = window.getComputedStyle(this._domNode)['background-color'];
			}
			
			this._show();
			
			if (wink.isSet(opt.layerCallback)) {
				wink.layer.onclick = function() {
					if (!this._inTransition) {
						wink.call(opt.layerCallback);
					}
				};
			} else {
				wink.layer.onclick = this._layerHandler;
			}
		},
		/**
		 * Initialize the popup template
		 * 
		 * @param {string} arrowType The arrow type ("top", "bottom" or "none")
		 * @param {string} content The content
		 * @param {string} arrowLeftPos The left-position of the arrow
		 */
		_initTemplate: function(arrowType, content, arrowLeftPos)
		{
			this._absolutePos = false;
			this._followScrollY = false;
			this._popupClasses = "w_box w_window pp_popup pp_hidden w_bg_dark";
			this._contentNode.innerHTML = content;
			this._btnsNode.innerHTML = "";
			this._arrowNode.className = "pp_popup_arrow pp_" + arrowType;
			this._arrowNode.style.left = arrowLeftPos;
			this._domNode.style.top = "0px";
		},
		/**
		 * Set the popup style
		 * 
		 * @param {string} style The css class of the popup
		 * @param {object} opt The options
		 */
		_setPopupStyle: function(style, opt)
		{
			this._popupClasses += " " + style;
			if (opt.borderRadius !== false) {
				this._popupClasses += " w_radius";
			}
			this._domNode.className = this._popupClasses;
	
			if (wink.isSet(opt.followScrollY) && opt.followScrollY === true) {
				this._followScrollY = true;
			}
			
			this._updatePosition();
			
			var newOpDur = (opt.duration >= 0) ? opt.duration : 400;
			this._updateTransition(newOpDur, 0);
		},
		/**
		 * Updates the popup transitions
		 * 
		 * @param {integer} opacityDuration The opacity duration
		 * @param {integer} topDuration The top duration
		 */
		_updateTransition: function(opacityDuration, topDuration)
		{
			var trsChanged = false;
			if (wink.isInteger(opacityDuration) && this._transitions.opacity != opacityDuration) {
				this._transitions.opacity = opacityDuration;
				trsChanged = true;
			}
			if (wink.isInteger(topDuration) && this._transitions.top != topDuration) {
				this._transitions.top = topDuration;
				trsChanged = true;
			}
			
			if (trsChanged) {
				var dr = this._transitions.opacity + "ms," + this._transitions.top + 'ms';
				wink.fx.applyTransition(this._domNode, 'opacity, transform', dr, '1ms,1ms', 'default,default');
				// WORKAROUND : the second delay must be 1ms instead of 0ms for iOS2
			}
		},
		/**
		 * Updates the popup position
		 */
		_updatePosition: function()
		{
			var y = 0;
			if (this._absolutePos == false) {
				y += ((window.innerHeight - this._domNode.offsetHeight) / 2) + window.pageYOffset;
			} else if (this._followScrollY) {
				y += window.pageYOffset;
			}
			this._domNode.translate(0, y);
		},
		/**
		 * Initialize the DOM nodes
		 */
		_initDom: function()
		{
			this._domNode = document.createElement('div');
			this._contentNode = document.createElement('div');
			this._btnsNode = document.createElement('div');
			this._arrowNode	= document.createElement('div');
	
			wink.addClass(this._domNode, "pp_popup pp_hidden");
			wink.addClass(this._contentNode, "w_bloc");
			wink.addClass(this._arrowNode, "pp_popup_arrow none");
			
			this._domNode.appendChild(this._contentNode);
			this._domNode.appendChild(this._btnsNode);
			this._domNode.appendChild(this._arrowNode);
			
			this._domNode.style.opacity = 0;
			this._transitions.opacity = 0;
			this._transitions.top = 0;
		},
		/**
		 * Initialize listeners
		 */
		_initListeners: function() 
		{
			this._scrollHandler = wink.bind(this._updatePosition, this);
			this._postShowHandler = wink.bind(this._postShow, this);
			this._postHideHandler = wink.bind(this._postHide, this);
			this._layerHandler = wink.bind(this._hide, this);
		},
		/**
		 * Shows the popup
		 */
		_show: function()
		{
			if (this.displayed == true || this._inTransition == true) {
				return;
			}
			this._inTransition = true;
			
			if (this._followScrollY == true) {
				window.addEventListener("scroll", this._scrollHandler, false);
			}
			wink.removeClass(this._domNode, "pp_hidden");
			
			wink.layer.update();
			wink.layer.show();
			
			if(wink.has('css-transition'))
			{
				wink.fx.onTransitionEnd(this._domNode, this._postShowHandler);
			} else
			{
				this._postShowHandler();
			}
			this._domNode.style.opacity = 1;
		},
		/**
		 * Post show management
		 */
		_postShow: function()
		{
			if (this._followScrollY == true) {
				this._updateTransition(this._transitions.opacity, 200);
			}
			this.displayed = true;
			this._inTransition = false;
		},
		/**
		 * Hides the popup
		 */
		_hide: function()
		{
			if (this.displayed == false || this._inTransition == true) {
				return;
			}
			this._inTransition = true;
			
			if (this._followScrollY == true) {
				window.removeEventListener("scroll", this._scrollHandler, false);
			}
			
			wink.layer.hide();
			wink.layer.onclick = null;
			
			
			if(wink.has('css-transition'))
			{
				wink.fx.onTransitionEnd(this._domNode, this._postHideHandler);
			} else
			{
				this._postHideHandler();
			}
			this._domNode.style.opacity = 0;
		},
		/**
		 * Post hide management
		 */
		_postHide: function()
		{
			wink.addClass(this._domNode, "pp_hidden");
			
			this._contentNode.innerHTML = "";
			
			this.displayed = false;
			this._inTransition = false;
		},
		/**
		 * Invokes the given callback
		 * 
		 * @param {object} cb The callback to invoke
		 */
		_invokeCallback: function(cb)
		{
			if (this._inTransition == true || !wink.isSet(cb)) {
				return;
			}
			this._hide();
			wink.call(cb);
		}
	};
	
	return wink.ui.xy.Popup;
});
