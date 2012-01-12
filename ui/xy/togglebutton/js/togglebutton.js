/*--------------------------------------------------------
 * Copyright (c) 2011, The Dojo Foundation
 * This software is distributed under the "Simplified BSD license",
 * the text of which is available at http://www.winktoolkit.org/licence.txt
 * or see the "license.txt" file for more details.
 *--------------------------------------------------------*/

/**
 * @fileOverview Implements a toggle button
 * 
 * @compatibility Iphone OS2, Iphone OS3, Iphone OS4, Android 1.5, Android 2.1, Android 2.2, Android 2.3, Android 3.0, Android 3.1, BlackBerry 6, BlackBerry 7, Bada 1.0, Windows Phone 7.5
 * @author Frédéric MOULIS
 */

/**
 * The event is fired when the toggle button position is changed
 * 
 * @name wink.ui.xy.ToggleButton#/togglebutton/events/switch

 * @event
 * 
 * @param {object} param The parameters object
 * @param {integer} param.uId The uId of the toggle button
 * @param {integer} param.position The current position of the toggle button
 */
define(['../../../../_amd/core'], function(wink)
{
	/**
	 * @class Implements a toggle button component that has the "iPhone-like" behaviour. The toggle button follows the finger/mouse.<br>
	 * The button switches when the finger/mouse is up, unless it is in its initial position
	 * The background of the toggle button has to be defined via the cssClass property (in constructor)
	 * <br><br>
	 * To instanciate the toggle button, you have to specify a className associated to your toggle button (representing its background), and the position on which the toggle button will be at startup.
	 * Use the getDomNode method to add the toggle button to your page.
	 * 
	 * @param {object} properties The properties object
	 * @param {string} properties.cssClass The custom className to apply to the toggle button Node. this class has to be defined in a custom CSS file in order to define the toggle button background image (e.g on/off, etc...). the default value is none
	 * @param {string} properties.position "left" if you want the button to be on the left at initialisation. "right" if you want the button to be on the right at initialisation. The default value is "left"
	 * 
	 * @example
	 * 
	 * var properties = 
	 * {
	 * 	cssClass: 'myClass',
	 * 	position: 'left' 
	 * }
	 * 
	 * var toggle = new wink.ui.xy.ToggleButton(properties);
	 * 
	 * document.body.appendChild(toggle.getDomNode());
	 * 
	 * @see <a href="WINK_ROOT_URL/ui/xy/togglebutton/test/test_togglebutton.html" target="_blank">Test page</a>
	 */
	wink.ui.xy.ToggleButton = function(properties)
	{
		/**
		 * Unique identifier
		 * 
		 * @property
		 * @type integer
		 */
		this.uId = wink.getUId();
		
		/**
		 * The custom className of the toggle button
		 * 
		 * @property
		 * @type string
		 */
		this.cssClass = null;
		
		/**
		 * The position of the toggle button
		 * 
		 * @property
		 * @type string
		 */
		this.position = null;
		
		
		this._domNode	    = null;
		this._switchBtnNode = null;
		
		this._coordinates   = 
		{
			beginX   : 0,
	        pozX     : 0,
			dist     : 0,
			hasMoved :false
		};
		
		wink.mixin(this, properties);	
	
		if ( this._validateProperties() ===  false )return;
		
		this._initProperties();	
		this._initDom();
		this._initListeners();
	};
	
	wink.ui.xy.ToggleButton.prototype = 
	{
		_POSITION_LEFT: 'left',
		_POSITION_RIGHT: 'right',
		
		_LEFT: 1,
		_RIGHT: 0,
		
		/**
		 * Return the main DOM node of the toggle button
		 * 
		 * @returns {HTMLElement} The main dom node
		 */
		getDomNode: function()
		{
			return this._domNode;
		},
		
		/**
		 * Validate the properties of the component
		 * @returns {boolean} True if the properties are valid, false otherwise
		 */
		_validateProperties: function()
		{
			if ( wink.isSet(this.cssClass) && !wink.isString(this.cssClass)) 
			{
				wink.log('[ToggleButton] cssClass property must be a string if defined');
				return false;
			}
			
			if( wink.isSet(this.position) && (this.position !== this._POSITION_LEFT && this.position !==this._POSITION_RIGHT) )
			{
				wink.log('[ToggleButton] position property must be "left" or "right"');
				return false;
			}
			
			return true;
		},
		
		/**
		 * Initialize the ToggleButton properties
		 */
		_initProperties: function()
		{
			if(wink.isSet(this.position))
			{
				if ( this.position == this._POSITION_LEFT)
				{
					this.position = this._LEFT;
				} else
				{
					this.position = this._RIGHT;
				}				
			} else
			{
				this.position = this._LEFT;
			}
		},	
		
		/**
		 * Initialize the ToggleButton DOM node
		 */
		_initDom: function()
		{
			this._domNode = document.createElement('div');
			this._domNode.className = "to_toggle";
			
			if(wink.isSet(this.cssClass) )
			{
				wink.addClass(this._domNode, this.cssClass);
			}
			
			this._switchBtnNode = document.createElement('div');
			this._switchBtnNode.className = "to_toggle_btn";
			
			this._domNode.appendChild(this._switchBtnNode);
			
			this._translateButton((0 - this.position) * 44);
		},
		
		/**
		 * Initialize the 'touch' listeners
		 */
		_initListeners: function()
		{
			wink.ux.touch.addListener(this._domNode, "start", { context: this, method: "_startdrag" }, { preventDefault: true });
			wink.ux.touch.addListener(this._domNode, "move", { context: this, method: "_drag" }, { preventDefault: true });
			wink.ux.touch.addListener(this._domNode, "end", { context: this, method: "_enddrag" }, { preventDefault: true });
		},
		
		/**
		 * Translates the button.
		 * 
		 * @param {integer} value The translation value
		 */
		_translateButton: function(value)
		{
			this._switchBtnNode.translate(value, 0);
		},
		
		/**
		 * Makes the ToggleButton
		 */
		_onSwitch: function()
		{
			this.position = 1 - this.position;
			
			wink.fx.applyTransformTransition(this._switchBtnNode, "500ms", "0ms", "default");
			
			this._translateButton(((0 - this.position) * 44));
			
			if ( this.position == this._LEFT )
			{
				wink.publish('/togglebutton/events/switch', {uId: this.uId, position: this._POSITION_LEFT});
			} else
			{
				wink.publish('/togglebutton/events/switch', {uId: this.uId, position: this._POSITION_RIGHT});
			}
		},
		
		/**
		 * Called when the user starts touching the toggle button
		 * 
		 * @param {wink.ux.Event} uxEvent The start event
		 */
		_startdrag: function(uxEvent)
		{
			this._coordinates.beginX = uxEvent.x;
			this._coordinates.pozX = uxEvent.x;
			this._coordinates.dist = 0;
			this._coordinates.hasMoved = false;
			
			wink.fx.applyTransformTransition(this._switchBtnNode, "0s", "0s", "default");
		},
		
		/**
		 * Called when the user touches the toggle button
		 * 
		 * @param {wink.ux.Event} uxEvent The move event
		 */
		_drag: function(uxEvent)
		{
			this._coordinates.hasMoved = true;
			
			this._coordinates.pozX = uxEvent.x;
			
			var curDist = this._coordinates.pozX - this._coordinates.beginX;
			
			if ((this.position==this._RIGHT && curDist > 0) || (this.position==this._LEFT && curDist < 0))
			{
				curDist = 0;
			}
			
			if ((this.position==this._RIGHT && curDist<=0 && curDist>=-44) || (this.position==this._LEFT && curDist>=0 && curDist<=44)) 
			{
				if(this.position==this._LEFT)
				{
					curDist-=44;
				}
				
				this._coordinates.dist = curDist;
				this._translateButton(this._coordinates.dist);
			}
		},
		
		/**
		 * Called when the user stops touching the toggle button
		 * 
		 * @param {wink.ux.Event} uxEvent The end event
		 */
		_enddrag: function(uxEvent)
		{
			if(this._coordinates.hasMoved == false || (this.position == this._RIGHT && this._coordinates.dist !=0) || (this.position == this._LEFT && this._coordinates.dist !=-44))
			{
				this._onSwitch();
			}
			
			this._coordinates.dist = 0;
			this._coordinates.beginX = 0;
		    this._coordinates.pozX = 0;
			this._coordinates.hasMoved = false;
		}
	};
	
	return wink.ui.xy.ToggleButton;
});