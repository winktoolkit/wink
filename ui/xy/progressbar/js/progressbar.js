/*--------------------------------------------------------
 * Copyright (c) 2011, The Dojo Foundation
 * This software is distributed under the "Simplified BSD license",
 * the text of which is available at http://www.winktoolkit.org/licence.txt
 * or see the "license.txt" file for more details.
 *--------------------------------------------------------*/

/**
 * @fileOverview Implement a progress bar
 * 
 * @compatibility Iphone OS2, Iphone OS3, Iphone OS4, Android 1.1, Android 1.5, Android 2.1, Android 2.2, Android 2.3, Android 3.0, Android 3.1, BlackBerry 6, BlackBerry 7, Bada 1.0, Windows Phone 7.5
 * @author Jerome GIRAUD
 */

/**
 * The progress bar reached 100%
 * 
 * @name wink.ui.xy.ProgressBar#/progressbar/events/end

 * @event
 */
define(['../../../../_amd/core'], function(wink)
{
	/**
	 * @class Implement a progress bar.<br>
	 * When you instantiate a new progressbar, you can pass different parameters in order to configure the look and feel of the bar.
	 * Use the 'getDomNode' method to add the progress bar to the page.
	 *
	 * @param {object} properties The properties object
	 * @param {number} [properties.value=0] The initial value of the progress bar
	 * @param {number} [properties.height=5] The height in pixels of the progress bar
	 * @param {number} [properties.width=200] The width in pixels of the progress bar
	 * @param {string} [properties.borderColor] The border color of the progress bar
	 * @param {string} [properties.progressBarColor] The color of the progress bar background
	 * @param {object} [properties.progressBarImage] A background image for the progress bar 
	 * @param {string} properties.progressBarImage.image The background image of the progress bar encoded in base64 (default value is null)
	 * @param {string} properties.progressBarImage.type The type of the image (e.g.: gif, png)
	 * 
	 * @example
	 * 
	 * var properties =
	 * {
	 * 	height: 10,
	 * 	width : 250,
	 * 	borderColor: '#000',
	 * 	progressBarColor: '#ff0000'
	 * }
	 * 
	 * progressBar = new wink.ui.xy.ProgressBar(properties);
	 * 
	 * $('output').appendChild(progressBar.getDomNode());
	 * 
	 * @see <a href="WINK_ROOT_URL/ui/xy/progressbar/test/test_progressbar.html" target="_blank">Test page</a>
	 */
	wink.ui.xy.ProgressBar = function(properties)
	{
		/**
		 * Unique identifier
		 * 
		 * @property
		 * @type integer
		 */
		this.uId = wink.getUId();
		
		/**
		 * The current value of the progress bar
		 * 
		 * @property
		 * @type number
		 */
		this.value = 0;
		
		/**
		 * The border color of the progress bar
		 * 
		 * @property
		 * @type string
		 */
		this.borderColor = null;
		
		/**
		 * The color of the progress bar background
		 * 
		 * @property
		 * @type string
		 */
		this.progressBarColor = null;
		
		/**
		 * The progress bar background image
		 * 
		 * @property
		 * @type object
		 */
		this.progressBarImage = {type: undefined, image: undefined};
		
		/**
		 * The height in pixels of the progress bar
		 * 
		 * @property
		 * @type integer
		 * @default 5
		 */
		this.height = 5;
		
		/**
		 * The width in pixels of the progress bar
		 * 
		 * @property
		 * @type integer
		 * @default 200
		 */
		this.width = 200;
		
		
		this._pBNode          = null;
		this._pBContentNode   = null;
		
		wink.mixin(this, properties);
	
		if  ( this._validateProperties() ===  false )return;
		
		this._initDom();
	};
	
	wink.ui.xy.ProgressBar.prototype = 
	{
		/**
		 * Update the progress bar display
		 * 
		 * @param {number} value The value in percentage (between 0 and 100) of the progress bar
		 */
		setValue: function(value)
		{
			if ( value >= 0 && value <= 100 )
			{
				this.value = value;
				this._updateProgressView();
				
				if(!wink.has('css-transition'))
				{
					this._handleTransitionEnd();
				}
			}
		},
		
		/**
		 * Change the border color of the progress bar
		 * 
		 * @param {string} color The color of the border
		 */
		setBorderColor: function(color)
		{
			this.borderColor = color;
			this._pBNode.style.borderColor = this.borderColor;
		},
		
		/**
		 * Change the color of the progress bar background
		 * 
		 * @param {string} color The color of the background
		 */
		setProgressBarColor: function(color)
		{
			this.progressBarColor = color;
			this._pBContentNode.style.backgroundColor = this.progressBarColor;
		},
		
		/**
		 * Change the background image of the progress bar
		 * 
		 * @param {object} image A background image
		 * @param {string} image.image The background image of the progress bar encoded in base64 (default value is null)
		 * @param {string} image.type The type of the image (e.g.: gif, png)
		 */
		setProgressBarImage: function(image)
		{
			this.progressBarImage = image;
			wink.fx.apply(this._pBContentNode, {
				backgroundImage: 'url(data:image/' + this.progressBarImage.type + ';base64,' + this.progressBarImage.image + ')',
				backgroundRepeat: 'repeat-x'
			});
		},
		
		/**
		 * Returns the DOM node containing the progressbar
		 * 
		 * @returns {HTMLElement} The main dom node
		 */
		getDomNode: function()
		{
			return this._pBNode;
		},
		
		/**
		 * Update the width value of the progress bar
		 */
		_updateProgressView: function()
		{
			this._pBContentNode.style.width = this.value + '%';
		},
		
		/**
		 * Validate the properties of the component
		 * @returns {boolean} True if the properties are valid, false otherwise
		 */
		_validateProperties: function()
		{
			if ( !wink.isNumber(this.height) || this.height < 0 )
			{
				wink.log('[ProgressBar] height must be a positive value');
				return false;
			}
				
			if ( !wink.isNumber(this.width) || this.width < 0 )
			{
				wink.log('[ProgressBar] width must be a positive value');
				return false;
			}
				
			if ( !wink.isNumber(this.value) || (this.value < 0 && this.value > 100) )
			{
				wink.log('[ProgressBar] initValue must be a value between 0 and 100');
				return false;
			}
		},
		
		/**
		 * Fire an end event when the progress bar get to 100%
		 */
		_handleTransitionEnd: function()
		{
			if ( this._pBContentNode.style.width == '100%' )
			{
				wink.publish('/progressbar/events/end', null);
			}
		},
		
		/**
		 * Initialize the progress bar DOM nodes
		 */
		_initDom: function()
		{
			var pb = this._pBNode = document.createElement('div');
			var pbc = this._pBContentNode = document.createElement('div');
			
			var pBNodeSt = {
				height: this.height + 'px',
				width: this.width + 'px'
			};
			
			var pBContentNodeSt = {
				'height': this.height + 'px',
				'width': '0%',
				'transition-property': 'width',
				'transition-duration': '800ms',
				'transition-timing-function': 'linear'
			};
			
			if ( wink.isSet(this.borderColor) )
			{
				pBNodeSt.borderColor = this.borderColor;
			}
			
			if ( wink.isSet(this.progressBarColor) )
			{
				pBContentNodeSt.background = this.progressBarColor;
			}
			
			if ( wink.isSet(this.progressBarImage.type) && wink.isSet(this.progressBarImage.image) )
			{
				pBContentNodeSt.backgroundImage = 'url(data:image/' + this.progressBarImage.type + ';base64,' + this.progressBarImage.image + ')';
				pBContentNodeSt.backgroundRepeat = 'repeat-x';
			}
	
			wink.addClass(pb, 'w_bar w_radius w_border');
			wink.addClass(pbc, 'w_bar_progress w_radius');
			
			wink.fx.apply(pb, pBNodeSt);
			wink.fx.apply(pbc, pBContentNodeSt);
			
			pb.appendChild(pbc);
			
			if(wink.has('css-transition'))
			{
				wink.fx.onTransitionEnd(pbc, wink.bind(this._handleTransitionEnd, this));
			}
		}
	};
	
	return wink.ui.xy.ProgressBar;
});