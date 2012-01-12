/*--------------------------------------------------------
 * Copyright (c) 2011, The Dojo Foundation
 * This software is distributed under the "Simplified BSD license",
 * the text of which is available at http://www.winktoolkit.org/licence.txt
 * or see the "license.txt" file for more details.
 *--------------------------------------------------------*/

/**
 * @fileOverview Implements a customizable input field
 * 
 * @compatibility Iphone OS2, Iphone OS3, Iphone OS4, Android 1.5, Android 2.1, Android 2.2, Android 2.3, Android 3.0, Android 3.1, BlackBerry 6, BlackBerry 7, Bada 1.0, Windows Phone 7.5
 * @author Jerome GIRAUD
 */
define(['../../../../_amd/core'], function(wink)
{
	/**
	 * @class Implements a customizable input field.
	 * The Input needs properties to define its behaviour. As all other graphical components,
	 * it has a getDomNode method that should be used after the instantiation to add the input to the page.
	 * The code sample shows how to instantiate a new input and to add it into a webpage.
	 * 
	 * @param {object} properties The properties object
	 * @param {string} [properties.type=text] The type of the field : "text", "password", "number", "tel", "email", "url"
	 * @param {number} [properties.width=250] The width in pixels of the input field
	 * @param {number} [properties.eraseButton=1] Display an erase button if set to 1 
	 * @param {number} [properties.autoCorrect=1] Enables the auto correction feature if set to 1
	 * @param {number} [properties.autoCapitalize=1] Enables the auto capitalization feature if set to 1
	 * @param {string} [properties.defaultValue] The value of the input field
	 * @param {string} [properties.placeholder] The value of the placeholder	
	 * 
	 * @example
	 * 
	 * var properties =
	 * {
	 * 	type: 'tel',
	 * 	eraseButton: 1,
	 * 	autoCorrect: 0,
	 * 	autoCapitalize: 1,
	 * 	placeholder: 'type a number',
	 * 	width: 150
	 * }
	 * 
	 * input = new wink.ui.form.Input(properties);
	 * 
	 * $('output').appendChild(input.getDomNode());
	 * 
	 * @see <a href="WINK_ROOT_URL/ui/form/input/test/test_input.html" target="_blank">Test page</a>
	 */
	wink.ui.form.Input = function(properties)
	{
		/**
		 * Unique identifier
		 * 
		 * @property uId
		 * @type integer
		 */
		this.uId = wink.getUId();
		
		/**
		 * The input field node
		 * 
		 * @property inputNode
		 * @type HTMLElement
		 */
		this.inputNode = null;
		
		/**
		 * The type of the field ("text", "password", "number", "tel", "email", "url")
		 * 
		 * @property type
		 * @type string
		 * @default text
		 */
		this.type = this._TEXT;
		
		/**
		 * The width in pixels of the input field
		 * 
		 * @property width
		 * @type number
		 * @default 250
		 */
		this.width = 250;
		
		/**
		 * Display an erase button if set to 1
		 * 
		 * @property eraseButton
		 * @type integer
		 * @default 1
		 */
		this.eraseButton = 1;
		
		/**
		 * Enables the auto correction feature if set to 1
		 * 
		 * @property autoCorrect
		 * @type integer
		 * @default 1
		 */
		this.autoCorrect = 1;
		
		/**
		 * Enables the auto capitalization feature if set to 1
		 * 
		 * @property autoCapitalize
		 * @type integer
		 * @default 1
		 */
		this.autoCapitalize = 1;
		
		/**
		 * The default value of the input field
		 * 
		 * @property defaultValue
		 * @type string
		 */
		this.defaultValue = '';
		
		/**
		 * The value of the placeholder
		 * 
		 * @property placeholder
		 * @type string
		 */
		this.placeholder = '';
		
		/**
		 * A pattern to validate the input data
		 * 
		 * @property pattern
		 * @type string
		 */
		this.pattern = '';
		
		
		this._domNode       = null;
		this._eraseNode     = null;
		
		this._focusHandler  = wink.bind(this._handleFocus, this);
		this._blurHandler   = wink.bind(this._handleBlur, this);
		this._keyHandler    = wink.bind(this._handleKey, this);
		
		wink.mixin(this, properties);
		
		if  ( this._validateProperties() ===  false )return;
		
		this._initDom();
		this._initListeners();
	};
	
	wink.ui.form.Input.prototype =
	{
		_TEXT: 'text',
		_PASSWORD: 'password',
		_NUMBER: 'number',
		_TEL: 'tel',
		_EMAIL: 'email',
		_URL: 'url',
		
		/**
		 * Returns the dom node containing the input
		 * 
		 * @returns {HTMLElement} The main dom node
		 */
		getDomNode: function()
		{
			return this._domNode;
		},
		
		/**
		 * Display the erase button
		 */
		_handleFocus: function()
		{
			if ( this.inputNode.value != '' )
			{
				this._eraseNode.style.display = 'block';
			}
		},
		
		/**
		 * Hide the erase button
		 */
		_handleBlur: function()
		{
			this._eraseNode.style.display = 'none';
		},
		
		/**
		 * Display the erase button
		 */
		_handleKey: function()
		{
			if ( this.inputNode.value != '' )
			{
				this._eraseNode.style.display = 'block';
			} else
			{
				this._eraseNode.style.display = 'none';
			}
		},
		
		/**
		 * Empty the input field
		 */
		_handleTouchStart: function()
		{
			this.inputNode.value = '';
			this.inputNode.focus();
			
			this._eraseNode.style.display = 'none';
		},
		
		/**
		 * Validate the properties of the component
		 * @returns {boolean} True if the properties are valid, false otherwise
		 */
		_validateProperties: function()
		{
			// Check the type
			if ( this.type != this._TEXT && this.type != this._PASSWORD && this.type != this._NUMBER && this.type != this._TEL && this.type != this._EMAIL && this.type != this._URL )
			{
				wink.log('[Input] The type property can be "text", "password", "number", "tel", "email" or "url"');
				return false;
			}
			
			// Check width
			if ( !wink.isInteger(this.width) || this.width < 0 )
			{
				wink.log('[Input] The width property must be a positive integer');
				return false;
			}
			
			// Check the defaultValue
			if ( this.defaultValue != '' )
			{
				if ( !wink.isNumber(this.defaultValue) && !wink.isString(this.defaultValue) )
				{
					wink.log('[Input] The property defaultValue must be a string or a number');
					return false;
				}
			}
			
			// Check the eraseButton parameter
			if ( !wink.isInteger(this.eraseButton) || (this.eraseButton != 0 && this.eraseButton != 1) )
			{
				wink.log('[Input] The property eraseButton must be either 0 or 1');
				return false;
			}
			
			// Check the autoCorrect parameter
			if ( !wink.isInteger(this.autoCorrect) || (this.autoCorrect != 0 && this.autoCorrect != 1) )
			{
				wink.log('[Input] The property autoCorrect must be either 0 or 1');
				return false;
			}
			
			// Check the autoCapitalize parameter
			if ( !wink.isInteger(this.autoCapitalize) || (this.autoCapitalize != 0 && this.autoCapitalize != 1) )
			{
				wink.log('[Input] The property autoCapitalize must be either 0 or 1');
				return false;
			}
	
			// Check the placeholder
			if ( this.placeholder != '' )
			{
				if ( !wink.isNumber(this.placeholder) && !wink.isString(this.placeholder) )
				{
					wink.log('[Input] The property placeholder must be a string or a number');
					return false;
				}
			}
		},
		
		/**
		 * Initialize the 'touch' listeners
		 */
		_initListeners: function()
		{
			wink.ux.touch.addListener(this._eraseNode, 'start',  { context: this, method: "_handleTouchStart", arguments: null }, { preventDefault: true });
		},
		
		/**
		 * Initialize the input DOM nodes
		 */
		_initDom: function()
		{
			this._domNode = document.createElement('div');
			this._eraseNode = document.createElement('div');
			
			this._domNode.className = 'w_search w_border w_radius';
			this._eraseNode.className = 'in_erase';
			
			this._domNode.style.width = this.width + 'px';
			
			this.inputNode = document.createElement('input');
			this.inputNode.className = 'w_input';
			this.inputNode.type = this.type;
			this.inputNode.autocorrect = this.autoCorrect;
			this.inputNode.autocapitalize = this.autoCapitalize;
			this.inputNode.placeholder = this.placeholder;
			this.inputNode.value = this.defaultValue;
			
			
			this.inputNode.addEventListener('focus', this._focusHandler, false);
			this.inputNode.addEventListener('blur', this._blurHandler, false);
			this.inputNode.addEventListener('keyup', this._keyHandler, false);
			
			this.inputNode.style.width = (this.width - 30) + 'px';
			
			this._domNode.appendChild(this.inputNode);
			this._domNode.appendChild(this._eraseNode);
		}
	};
	
	return wink.ui.form.Input;
});