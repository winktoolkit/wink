/*--------------------------------------------------------
 * Copyright (c) 2011, The Dojo Foundation
 * This software is distributed under the "Simplified BSD license",
 * the text of which is available at http://www.winktoolkit.org/licence.txt
 * or see the "license.txt" file for more details.
 *--------------------------------------------------------*/

/**
 * @fileOverview Windows Phone Fixed layout implementation.
 * 
 * @compatibility Windows Phone 7.5
 * 
 * @author Donatien LEBARBIER
 */
define(['../../../../_amd/core', '../../../../ux/window/js/window'], function(wink)
{
	/**
	 * @class Windows Phone Fixed layout implementation
	 * @name wink.ui.layout.FixedLayout-FixedLayoutWP
	 * 
	 * @see <a href="WINK_ROOT_URL/ui/layout/fixedlayout/test/test_fixedlayout_1_ie.html" target="_blank">Test page</a>
	 */
	wink.ui.layout.FixedLayout = function(properties) 
	{
		wink.mixin(this, 
			/**
			 * @lends wink.ui.layout.FixedLayout-FixedLayoutWP
			 */
			{
				/**
				 * Unique identifier
				 * 
				 * @property uId
				 * @type integer
				 */
				uId: wink.getUId()
			}
		);

		this._header 		= null;
		this._footer 		= null;
		this._target 		= null;
		
		this.paddingTop		= null;
		this.paddingBottom	= null;
		
		wink.mixin(this, properties);
		
		if  ( this._validateProperties() ===  false )return;
		
		this._initListeners();
		this._initProperties();
	};
	
	wink.ui.layout.FixedLayout.prototype =
	/**
	 * @lends wink.ui.layout.FixedLayout-FixedLayoutWP
	 */
	{
		/**
		 * Validate the properties of the component
		 * @returns {boolean} True if the properties are valid, false otherwise
		 */
		_validateProperties: function() 
		{
			if (wink.isUndefined(this.target) || wink.isNull($(this.target)))
			{
				this._raisePropertyError('target');
				return false;
			}
			if (wink.isSet(this.header) && wink.isNull($(this.header))) 
			{
				this._raisePropertyError('header');
				return false;
			}
			if (wink.isSet(this.footer) && wink.isNull($(this.footer))) 
			{
				this._raisePropertyError('footer');
				return false;
			}
			if (wink.isSet(this.paddingTop) && !wink.isInteger(this.paddingTop)) 
			{
				this._raisePropertyError('paddingTop');
				return false;
			}
			if (wink.isSet(this.paddingBottom) && !wink.isInteger(this.paddingBottom)) 
			{
				this._raisePropertyError('paddingBottom');
				return false;
			}
			return true;
		},
			
		/**
		 * Raise the property error
		 */
		_raisePropertyError: function(property)
		{
			wink.log('[FixedLayout] Error: ' + property + ' missing or invalid');
		},
		
		/**
		 * Initialize listeners
		 */
		_initListeners: function() 
		{
			window.addEventListener("resize", wink.bind(function(){this._updateTargetSize()}, this), false);
		},
		
		/**
		 * Initialize datas with given properties
		 */
		_initProperties: function()
		{
			this._target = $(this.target);
			wink.fx.apply(this._target, {
				overflowY: 'scroll'
			});
			
			if (wink.isSet(this.header)) 
			{
				this._header = $(this.header);
			}
			if (wink.isSet(this.footer)) 
			{
				this._footer = $(this.footer);
			}
			
			delete this.target, this.header, this.footer;
			
			this._updateTargetSize();
		},
		
		/**
		 * Update the target height
		 */
		_updateTargetSize: function()
		{
			var height = window.innerHeight;
			if(!wink.isNull(this.paddingTop))
			{
				height -= this.paddingTop;
			} 
			else if(!wink.isNull(this._header))
			{
				height -= this._header.offsetHeight;
			}
			if(!wink.isNull(this.paddingBottom))
			{
				height -= this.paddingBottom;
			}
			else if(!wink.isNull(this._footer))
			{
				height -= this._footer.offsetHeight;
			}
			
			wink.fx.apply(this._target, {
				height: height+'px'
			});
		},
		
		/**
		 * @ignore
		 */
		enable: function() {},
		
		/**
		 * @ignore
		 */
		disable: function() {},
		
		/**
		 * @ignore
		 * 
		 * @returns {integer} the current y position
		 */
		getPosition: function() 
		{
			return this._target.scrollTop;
		},
		
		/**
		 * Refresh the view. This can be useful after a change of view.
		 * 
		 * @ignore
		 */
		refreshView: function() 
		{
			this._updateTargetSize();
		},
		
		/**
		 * Scroll explicitly to the given position
		 * 
		 * @ignore
		 */
		scrollTo: function(y)
		{
			this._target.scrollTop = y;
		}
	};
	
	return wink.ui.layout.FixedLayout;
});