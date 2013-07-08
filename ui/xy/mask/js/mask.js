/*--------------------------------------------------------
 * Copyright (c) 2011, The Dojo Foundation
 * This software is distributed under the "Simplified BSD license",
 * the text of which is available at http://www.winktoolkit.org/licence.txt
 * or see the "license.txt" file for more details.
 *--------------------------------------------------------*/

/**
 * @fileOverview Implements a mask (a layer above a given element)
 * 
 * @author Jerome GIRAUD
 */
define(['../../../../_amd/core'], function(wink)
{
	/**
	 * @class Implements a mask
	 * <br>
	 * Same behaviour as wink.ui.xy.layer but you can specify a parent DOM node within the "show" method which will
	 * make the mask appear only in the given element.
	 * 
	 * @example
	 * 
	 * mask = new wink.ui.xy.Mask();
	 * mask.show(wink.byId('myDOMElement'));
	 * 
	 * @compatibility iOS2, iOS3, iOS4, iOS5, iOS6, Android 1.5, Android 2.1, Android 2.2, Android 2.3, Android 3.0, Android 3.1, Android 4.0, Android 4.1.2, BlackBerry 6, BlackBerry 7, BB10, Bada 1.0, Windows Phone 8
	 * 
	 * @see <a href="WINK_ROOT_URL/ui/xy/mask/test/test_mask.html" target="_blank">Test page</a>
	 * @see <a href="WINK_ROOT_URL/ui/xy/mask/test/test_mask_2.html" target="_blank">Test page (Mask in a Tab Container)</a>
	 */
	wink.ui.xy.Mask = function()
	{
		/**
		 * Unique identifier
		 * 
		 * @property uId
		 * @type integer
		 */
		this.uId = wink.getUId();
		/**
		 * True if the mask has been added to the DOM
		 * 
		 * @property added
		 * @type boolean
		 */
		this.added = false;
		/**
		 * True if the mask is displayed, false otherwise
		 * 
		 * @property visible
		 * @type boolean
		 */
		this.visible = false;
		/**
		 * The hexa code of the mask color
		 * 
		 * @property color
		 * @type string
		 * @default #000
		 */
		this.color = '#000';
		/**
		 * Opacity level of the mask
		 * 
		 * @property opacity
		 * @type number
		 * @default 0.3
		 */
		this.opacity = 0.3;
		/**
		 * The hierarchical level of the mask
		 * 
		 * @property zIndex
		 * @type integer
		 * @default 998
		 */
		this.zIndex = 998;
		
		this._element = '';
		this._position = '';
		
		this._initDom();
	};
	
	wink.ui.xy.Mask.prototype =
	{
		/**
		 * Display the mask
		 * 
		 * @param {HTMLElement} el The parent DOM element
		 */
		show: function(el)
		{
			if ( !wink.isSet(el) )
			{
				el = document.body;
			}
			
			if ( el !== this._element )
			{
				if ( wink.isSet(this._element) && this.added )
				{
					this.hide();
				}
				
				if ( !this.added )
				{
					this._element = el;
					this._position = getComputedStyle(el)['position'];
					
					if (this._position == 'static' )
					{
						el.style.position = 'relative';
					}
					
					el.appendChild(this._containerNode);
					
					this.added = true;
				}
			}
			
			this._containerNode.onclick = wink.bind(this._handleClick, this);
			
			if (!this.visible)
			{
				wink.fx.apply(this._sublayerNode, {
					height: el.clientHeight + 'px'
				});
				
				wink.fx.apply(this._containerNode, {
					display: 'block'
				});

				this.visible = true;
			}
		},
		
		/**
		 * Hide the mask
		 */
		hide: function()
		{
			if (this.visible) 
			{
				this._element.removeChild(this._containerNode);
				this._element.style.position = this._position;

				this.added = false;
				this.visible = false;
				
				this._element = null;
			}
		},
		
		/**
		 * Update the display. Should be called in case of a change of height in the parent element for instance
		 */
		refresh: function()
		{
			if (this.visible) 
			{
				wink.fx.apply(this._sublayerNode, {
					height: this._element.clientHeight + 'px'
				});
			}
		},
		
		/**
		 * Update the color, opacity and zIndex of the layer. Use this method if you want to change the opacity or color or zIndex after you called the 'show' method.
		 */
		update: function()
		{
			wink.fx.apply(_container, {
				"z-index": this.zIndex
			});
			wink.fx.apply(_sublayer, {
				backgroundColor: this.color,
				opacity: this.opacity
			});
		},
		
		/**
		 * Handle clicks events on the mask layer
		 */
		_handleClick: function()
		{
			var onclick = this.onclick;

			if ( wink.isSet(onclick) )
			{
				onclick();
			}
		},
		
		/**
		 * Create the mask
		 */
		_initDom: function()
		{
			this._containerNode = document.createElement('div');
			
			wink.fx.apply(this._containerNode, {
				position: 'absolute',
				display: 'none',
				top: 0,
				left: 0,
				width: '100%',
				"z-index": this.zIndex,
				"tap-highlight-color": 'rgba(0, 0, 0, 0)'
			});
	
			this._sublayerNode = document.createElement('div');
			
			wink.fx.apply(this._sublayerNode, {
				width: '100%',
				backgroundColor: this.color,
				opacity: this.opacity
			});
	
			this._containerNode.appendChild(this._sublayerNode);
		}
	} 
	
	return wink.ui.xy.Mask;
});