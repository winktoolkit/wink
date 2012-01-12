/*--------------------------------------------------------
 * Copyright (c) 2011, The Dojo Foundation
 * This software is distributed under the "Simplified BSD license",
 * the text of which is available at http://www.winktoolkit.org/licence.txt
 * or see the "license.txt" file for more details.
 *--------------------------------------------------------*/

/**
 * @fileOverview Implement a semitransparent layer 
 * 
 * @compatibility Iphone OS2, Iphone OS3, Iphone OS4, Android 1.1, Android 1.5, Android 2.1, Android 2.2, Android 2.3, Android 3.0, Android 3.1, BlackBerry 6, BlackBerry 7, Bada 1.0, Windows Phone 7.5 
 * @author Jerome GIRAUD
 */

define(['../../../../_base/_base/js/base', '../../../../fx/_xy/js/2dfx'], function(wink) 
{
	var applyStyle = wink.fx.apply;
	var _container = null;
	var _sublayer = null;
	var _added = false;
	
	/**
	 * @namespace Implement a semi-transparent layer.<br>
	 * The layer is a literal so it doesn't need to be instantiated.<br>
	 * Use the 'show' and 'hide' method to display the layer or hide it.<br>
	 * The layer object is part of the core so you can either use 'wink.ui.xy.layer.show()' or directly 'wink.layer.show()'.<br>
	 * The layer object is part of the core so you can either use 'wink.ui.xy.layer.hide()' or directly 'wink.layer.hide()'.<br>
	 * You can see if the layer is displayed by checking its 'visible' attribute.<br>
	 * You can also define an 'onclick' method to the layer that will be called if the user clicks on the layer (see the test page for more details).
	 * 
	 * @example
	 * 
	 * wink.layer.show();
	 * 
	 * wink.layer.hide();
	 * 
	 * @see <a href="WINK_ROOT_URL/ui/xy/layer/test/test_layer.html" target="_blank">Test page</a>
	 */
	wink.ui.xy.layer =
	{
		/**
		 * True if the layer is displayed, false otherwise
		 * 
		 * @property visible
		 * @type boolean
		 */
		visible: false,
		/**
		 * The hexa code of the layer color
		 * 
		 * @property color
		 * @type string
		 * @default #000
		 */
		color: '#000',
		/**
		 * Opacity level of the layer
		 * 
		 * @property opacity
		 * @type number
		 * @default 0.3
		 */
		opacity: 0.3,
		/**
		 * The hierarchical level of the layer
		 * 
		 * @property zIndex
		 * @type integer
		 * @default 998
		 */
		zIndex: 998,
		
		/**
		 * Display the layer
		 */
		show: function()
		{
			if (!_added) 
			{
				this._initDom();
			}
			
			_container.onclick = function()
			{
				var onclick = wink.ui.xy.layer.onclick;
				if ( wink.isSet(onclick) )
				{
					onclick();
				}
			};
			
			if (!this.visible)
			{
				applyStyle(_sublayer, {
					height: document.body.scrollHeight + 'px'
				});
				applyStyle(_container, {
					display: 'block'
				});
				this.visible = true;
			}
		},
		
		/**
		 * Hide the layer
		 */
		hide: function()
		{
			if (_added && this.visible) 
			{
				applyStyle(_container, {
					display: 'none'
				});
				this.visible = false;
			}
		},
		
		/**
		 * Update the display. Should be called in case of a change of height in the page for instance
		 */
		refresh: function()
		{
			if (_added && this.visible) {
				applyStyle(_sublayer, {
					height: document.body.scrollHeight + 'px'
				});
			}
		},
		
		/**
		 * Update the color, opacity and zIndex of the layer. Use this method if you want to change the opacity or color or zIndex after you called the 'show' method.
		 */
		update: function()
		{
			if (!_added) 
			{
				this._initDom();
			}
	
			applyStyle(_container, {
				"z-index": this.zIndex
			});
			applyStyle(_sublayer, {
				backgroundColor: this.color,
				opacity: this.opacity
			});
		},
		
		/**
		 * Create the layer
		 */
		_initDom: function()
		{
			var doc = document;
			_container = doc.createElement('div');
			applyStyle(_container, {
				position: 'absolute',
				display: 'none',
				top: 0,
				width: '100%',
				"z-index": this.zIndex,
				"tap-highlight-color": 'rgba(0, 0, 0, 0)'
			});
	
			_sublayer = doc.createElement('div');
			applyStyle(_sublayer, {
				width: '100%',
				backgroundColor: this.color,
				opacity: this.opacity
			});
	
			_container.appendChild(_sublayer);
			doc.body.appendChild(_container);
			
			_added = true;
		}
	};
	
	/**
	 * @class
	 * @see wink.ui.xy.layer
	 */
	wink.layer = wink.ui.xy.layer;

	return wink.layer;
});