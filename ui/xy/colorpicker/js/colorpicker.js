/*--------------------------------------------------------
 * Copyright (c) 2011, The Dojo Foundation
 * This software is distributed under the "Simplified BSD license",
 * the text of which is available at http://www.winktoolkit.org/licence.txt
 * or see the "license.txt" file for more details.
 *--------------------------------------------------------*/

/**
 * @fileOverview Implement a colorpicker.
 * 
 * @compatibility Iphone OS2, Iphone OS3, Iphone OS4, Android 1.1, Android 1.5, Android 2.1, Android 2.2, Android 2.3, Android 3.0, Android 3.1, BlackBerry 6, BlackBerry 7, Bada 1.0, Windows Phone 7.5
 * @author Jerome GIRAUD
 */

/**
 * The user clicked on a color
 * 
 * @name wink.ui.xy.ColorPicker#/colorpicker/events/pickcolor

 * @event
 * 
 * @param {object} param The parameters object
 * @param {string} param.color The color currently selected
 */
define(['../../../../_amd/core'], function(wink)
{
	/**
	 * @class Implement a colorpicker.
	 * Displays a color panel where user can choose betwwen 30 different colors. An event is fired when the user selects a color.
	 * <br>
	 * The ColorPicker is a singleton, it needs to be instantiated only once. No parameter is needed. To display the color picker, call the 'show' method.
	 * To be informed of a color pick, the application must listen to the '/colorpicker/events/pickcolor' event.
	 * 
	 * @example
	 * 
	 * colorpicker = new wink.ui.xy.ColorPicker();
	 * colorpicker.show();
	 * 
	 * @see <a href="WINK_ROOT_URL/ui/xy/colorpicker/test/test_colorpicker.html" target="_blank">Test page</a>
	 */
	wink.ui.xy.ColorPicker = function()
	{
		if (wink.isUndefined(wink.ui.xy.ColorPicker.singleton)) 
		{
			/**
			 * Unique identifier
			 * 
			 * @property
			 * @type integer
			 */
			this.uId              = 1;
			
			this._HEIGHT          = 276;
			this._WIDTH           = 230;
			
			this._template        = '';
			this._domNode         = null;
			
			this._colors = 
			[
				'#000', 
				'#9F3F0F', 
				'#0F3F0F',
				'#0F3F6F',
				'#0E0E85',
				'#3F4F3F',
				'#870F0F',
				'#87870F',
				'#0F870F',
				'#0F8787',
				'#0F0FFF',
				'#6F6F9F',
				'#FF0000',
				'#FF9F0F',
				'#9FC000',
				'#3FCFCF',
				'#3F6FFF',
				'#9F9F9F',
				'#FF0FFF',
				'#FFCF0F',
				'#FFFF00',
				'#0FFF0F',
				'#0FFFFF',
				'#0FCFFF',
				'#9F3F6F',
				'#FF9FCF',
				'#FFCF9F',
				'#FFFF9F',
				'#CF9FFF',
				'#FFF'
			];
			
			this._createTemplate();
			this._initDom();
			
			wink.ui.xy.ColorPicker.singleton = this;
		} else 
		{
			return wink.ui.xy.ColorPicker.singleton;
		}
	};
	
	wink.ui.xy.ColorPicker.prototype =
	{
		/**
		 * Display the ColorPicker
		 */
		show: function()
		{
			wink.layer.show();
			
			wink.fx.apply(this._domNode, {
				display: 'block'
			});
			this.updatePosition();
		},
		
		/**
		 * Hide the ColorPicker
		 */
		hide: function()
		{
			wink.layer.hide();
			this._domNode.style.display = 'none';
		},
		
		/**
		 * Update the position of the ColorPicker
		 */
		updatePosition: function()
		{
			wink.fx.apply(this._domNode, {
				top: (window.innerHeight > this._HEIGHT)?(((window.innerHeight-this._HEIGHT)/2)+window.pageYOffset)+'px':window.pageYOffset+'px',
				left: (document.documentElement.offsetWidth > this._WIDTH)?(((document.documentElement.offsetWidth-this._WIDTH)/2)+window.pageXOffset)+'px':window.pageXOffset+'px'
			});
		},
		
		/**
		 * Create the color picker template
		 */
		_createTemplate: function()
		{
			var j = 0;
			var l = this._colors.length;
			
			this._template += '<div><div class="w_icon w_float w_button_close" onClick="(new wink.ui.xy.ColorPicker()).hide()"></div>';
			
			for ( var i=0; i<l; i++)
			{
				if ( j==0 )
				{
					this._template += '<div class="cp_separator">';
				}
				
				this._template += '<div class="cp_color" style="background-color: ' + this._colors[i] + '" onClick="(new wink.ui.xy.ColorPicker())._selectColor(\'' + this._colors[i] + '\')"></div>';
				
				if ( j==4 )
				{
					this._template += '</div>';
					j = 0;
				}else
				{
					j++;
				}
			}
			
			this._template += '</div>';
		},
		
		/**
		 * Fires a 'pickcolor' event
		 * 
		 * @param {string} color The selected color
		 */
		_selectColor: function(color)
		{
			wink.publish('/colorpicker/events/pickcolor',
			{
				color: color
			});
			
			this.hide();
		},
		
		/**
		 * Initialize the DOM Node of the ColorPicker
		 */
		_initDom: function()
		{
			this._domNode = document.createElement('div');
		
			this._domNode.className = 'w_bloc w_window cp_colorpicker w_border w_radius w_bg_dark';
			this._domNode.style.display = 'none';
		
			this._domNode.innerHTML = this._template;
		
			document.body.appendChild(this._domNode);
		}
	};
	
	return wink.ui.xy.ColorPicker;
});