/*--------------------------------------------------------
 * Copyright (c) 2011, The Dojo Foundation
 * This software is distributed under the "Simplified BSD license",
 * the text of which is available at http://www.winktoolkit.org/licence.txt
 * or see the "license.txt" file for more details.
 *--------------------------------------------------------*/

/**
 * @fileOverview Implements the window component that captures resize and scroll events and warns listeners of changes.
 * It Handles these properties: screenWidth, screenHeight, fullWidth, fullHeight, width, height, orientation
 * 
 * @author Sylvain LALANDE
 * 
 * @compatibility Iphone OS2, Iphone OS3, Iphone OS4, Android 1.1, Android 1.5, Android 2.1, Android 2.2, Android 2.3, Android 3.0, Android 3.1, BlackBerry 6, BlackBerry 7, Bada 1.0, Windows Phone 7.5
 */

/**
 * Raised when window is resized
 * 
 * @name wink.ux.window#/window/events/resize
 * @event
 * @param {object} param The parameters object
 * @param {integer} param.height The height of the visible area
 * @param {integer} param.width The width of the visible area
 * @param {string} param.orientation The orientation of the window ("horizontal" or "vertical")
 */

/**
 * Raised when orientation changed
 * 
 * @name wink.ux.window#/window/events/orientationchange
 * @event
 * @param {object} param The parameters object
 * @param {integer} param.height The height of the visible area
 * @param {integer} param.width The width of the visible area
 * @param {string} param.orientation The orientation of the window ("horizontal" or "vertical")
 */

define(['../../../_amd/core'], function(wink)
{
	/**
	 * @namespace Implements the window component that captures resize and scroll events and warns listeners of changes.
	 * It Handles these properties: screenWidth, screenHeight, fullWidth, fullHeight, width, height, orientation
	 * 
	 * @example
	 * 
	 * var handleOrientation = function(properties)
	 * {
	 *   alert("Orientation: " + properties.orientation);
	 * };
	 * wink.subscribe('/window/events/orientationchange', { context: window, method: 'handleOrientation' });
	 * 
	 * @see <a href="WINK_ROOT_URL/ux/window/test/test_window.html" target="_blank">Test page</a>
	 */
	wink.ux.window =
	{
		/**
		 * The height of the visible area
		 * 
		 * @property height
		 * @type integer
		 */
		height: null,
		
		/**
		 * The width of the visible area
		 * 
		 * @property width
		 * @type integer
		 */
		width: null,
		
		/**
		 * The height of the content
		 * 
		 * @property fullHeight
		 * @type integer
		 */
		fullHeight: null,
		
		/**
		 * The width of the content
		 * 
		 * @property fullWidth
		 * @type integer
		 */
		fullWidth: null,
		
		/**
		 * The height of the screen
		 * 
		 * @property screenHeight
		 * @type integer
		 */
		screenHeight: screen.height,
		
		/**
		 * The width of the screen
		 * 
		 * @property screenHeight
		 * @type integer
		 */
		screenWidth: screen.width,
		
		/**
		 * The orientation of the window ("horizontal" or "vertical")
		 * 
		 * @property orientation
		 * @type string
		 */
		orientation: null,
		
		/**
		 * @private
		 */
		_i: null,
		/**
		 * @private
		 */
		_V: "vertical",
		/**
		 * @private
		 */
		_H: "horizontal",
			
		/**
		 * Initialize the component
		 */
		_init: function()
		{
			var h = wink.bind(this._updateData, this);
			
			if ( "onorientationchange" in window )
			{
				window.addEventListener("orientationchange", h, true);
			} else
			{
				window.addEventListener("resize", h, true);
			}
			
			if ( wink.ua.isAndroid )
			{
				scrollTo(0, 1, 0);
				this._i = setInterval(h, 1000);
			} else
			{
				window.addEventListener("scroll", h, true);
			}
			
			h();
		},
		
		/**
		 * Watch for changes
		 */
		_updateData: function()
		{
			var w = window.innerWidth;
			var h = window.innerHeight;
			
			var b = false;
	
			if ( (this.width+2 < w || this.width-2 > w) || (this.height+2 < h || this.height-2 > h ) )
			{
				b = true;
			}
			
			this._updateSize();
			this._updateOrientation();
			
			if ( b )
			{
				wink.publish("/window/events/resize", {height: h, width: w, orientation: this.orientation});
			}
		},
		
		/**
		 * Update the window size
		 */
		_updateSize: function()
		{
			this.height = window.innerHeight;
			this.width 	= window.innerWidth;
			
			try
			{
				this.fullHeight = document.body.scrollHeight;
				this.fullWidth = document.body.scrollWidth;
			} catch(e)
			{
				// document.body does not exist
			}
		},
		
		/**
		 * Update the orientation
		 */
		_updateOrientation: function()
		{
			var o;
	
			if ( wink.isSet(window.orientation) && wink.ua.isIOS )
			{
				if ( Math.abs(window.orientation) == 90 )
				{
					o = this._H;
				} else
				{
					o = this._V;
				}
			} else
			{
				if ( this.width > this.height )
				{
					o = this._H;
				} else
				{
					o = this._V;
				}
			}
	
			if ( o != this.orientation )
			{
				this.orientation = o;
				wink.publish("/window/events/orientationchange", {height: this.height, width: this.width, orientation: o});
			}
		}
	};
	
	window.addEventListener("DOMContentLoaded", function(){wink.ux.window._init();});
	
	/**
	 * @deprecated
	 * @since 1.3.0
	 */
	wink.ux.Window = function()
	{
		wink.log('[Deprecated] use wink.ux.window instead');
		
		/**
		 * @deprecated
		 * @since 1.3.0
		 */
		this.getProperties = function()
		{
			wink.log('[Deprecated] use wink.ux.window properties instead');
			
			var p =
			{
				screenWidth: wink.ux.window.screenWidth,
				screenHeight: wink.ux.window.screenHeight,
				width: wink.ux.window.width,
				height:  wink.ux.window.height,
				orientation:  wink.ux.window.orientation
			};
			
			return p;
		};
	};
	
	return wink.ux.window;
});