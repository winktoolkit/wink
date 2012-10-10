/*--------------------------------------------------------
 * Copyright (c) 2011, The Dojo Foundation
 * This software is distributed under the "Simplified BSD license",
 * the text of which is available at http://www.winktoolkit.org/licence.txt
 * or see the "license.txt" file for more details.
 *--------------------------------------------------------*/

/**
 * @fileOverview A plugin to asynchroneously load contents with the sliding panels
 *  
 * @author Jerome GIRAUD
 */

define(['../../../_amd/core', '../../../ui/layout/slidingpanels/js/slidingpanels', '../../../ui/xy/spinner/js/spinner'], function(wink)
{
	/**
	 * @class A plugin to asynchroneously load contents with the sliding panels.
	 * Create a sliding panels container with which you can navigate through pages (which can be loaded synchroneously or asynchroneously) with an Iphone like UX.
	 * 
	 * @param {object} properties The properties object
	 * @param {integer} [properties.duration=800] The transition duration in ms or s	
	 * @param {string} [properties.transitionType='default'] The type of the transition between pages ('default', 'cover' or 'reveal')
	 * @param {array} properties.pages The list of pages to add to the slidingpanels (must be an array of either strings representing actual dom nodes ids or objects containing an id, an url and optionally a method and parameters)
	 * 
	 * @example
	 * 
	 * var properties = 
	 * {
	 * 	duration: 500,
	 * 	transitionType: 'default',
	 * 	pages:
	 * 	[
	 * 		'page1',
	 * 		{id: 'page2', url: './data.php'},
	 * 		{id: 'page3', url: './data.php', method: 'GET', parameters: [{name: 'parameter1', value: 'test1'}], onload: function(){alert('loaded')}},
	 * 		{id: 'page4', url: './data.php', method: 'POST', parameters: [{name: 'parameter1', value: 'test1'}]},
	 * 	]
	 * }
	 * 
	 * asyncPanels = new wink.plugins.AsyncPanels(properties);
	 * 
	 * document.body.appendChild(asyncPanels.getDomNode());
	 * 
	 * @requires wink.ui.layout.SlidingPanels
	 * @requires wink.ui.xy.Spinner
	 * 
	 * @compatibility iOS2, iOS3, iOS4, iOS5, iOS6, Android 1.5, Android 2.1, Android 2.2, Android 2.3, Android 3.0, Android 3.1, Android 4.0, BlackBerry 6, BlackBerry 7, Bada 1.0
	 * 
	 * @winkVersion 1.4
	 * 
	 * @see <a href="WINK_ROOT_URL/plugins/asyncpanels/test/test_asyncpanels.html" target="_blank">Test page</a>
	 */
	wink.plugins.AsyncPanels = function(properties)
	{
		/**
		 * Unique identifier
		 * 
		 * @property
		 * @type integer
		 */
		this.uId = wink.getUId();
		
		/**
		 * The list of pages
		 * 
		 * @property
		 * @type array
		 */
		this.pages = null;
		
		/**
		 * The type of the transition between pages
		 * 
		 * @property
		 * @type string
		 * @default default
		 */
		this.transitionType = 'default';
		
		/**
		 * The slide duration
		 * 
		 * @property
		 * @type integer
		 * @default 800
		 */
		this.duration = 800;
		
		/**
		 * The list of translations
		 * 
		 * @property
		 * @type object
		 */
		this.i18n =
		{
			en_EN:
			{
				loading: 'loading...'	
			},
			fr_FR:
			{
				loading: 'chargement...'	
			}
		};
		
		this._sp            = null;
		this._spPages       = [];
		
		this._loaderNode    = null;
		this._spinnerNode   = null;
		this._textNode      = null;
		
		this._xhr           = null;
		
		wink.mixin(this, properties);
		
		if (this._validateProperties() === false) return;
		
		this._initProperties();
		this._initDom();
	};
	
	wink.plugins.AsyncPanels.prototype =
	{	
		/**
		 * move to the selected page
		 * 
		 * @param {string} id The id of the page to display
		 */
		slideTo: function(id)
		{
			var l = this.pages.length;

			for ( var i=0; i<l; i++ )
			{
				if ( (wink.isString(this.pages[i]) &&  this.pages[i] == id) || (!wink.isString(this.pages[i]) && this.pages[i].id == id && this.pages[i].loaded == true) )
				{
					this._sp.slideTo(id);
				} else if ( !wink.isString(this.pages[i]) && this.pages[i].id == id && !wink.isSet(this.pages[i].loaded) )
				{
					this._xhr = new wink.Xhr({'id': id, index: i, onLoad: this.pages[i].onLoad});
					
					wink.layer.show();
					
					var _h = window.getComputedStyle(this._loaderNode)['height'];
					var _w = window.getComputedStyle(this._loaderNode)['width'];

					this._loaderNode.style.top = ((window.innerHeight - _h.substring(0, _h.length-2)) / 2) + window.pageYOffset + 'px';
					this._loaderNode.style.left = (window.innerWidth - _w.substring(0, _w.length-2))/2 + 'px';
					
					this._loaderNode.style.visibility = "visible";
					this._xhr.sendData(this.pages[i].url, wink.isSet(this.pages[i].parameters)?this.pages[i].parameters:null, wink.isSet(this.pages[i].method)?this.pages[i].method:'GET', {method: '_onSuccess', context: this}, {method: '_onFailure', context: this}, null);
				}
			}
		},
		
		/**
		 * Slide back to the previous page
		 */
		slideBack: function()
		{
			this._sp.slideBack();
		},
		
		/**
		 * Returns the DOM node containing the slidingpanels
		 * 
		 * @returns {HTMLElement} The main dom node
		 */
		getDomNode: function()
		{
			return this._sp.getDomNode();
		},
		
		/**
		 * XHR success callback
		 * 
		 * @param {object} result The result of the XHR request
		 */
		_onSuccess: function(result)
		{
			wink.byId(result.params.id).innerHTML = result.xhrObject.responseText;

			if ( wink.isSet(result.params.onLoad) )
			{
				wink.call(result.params.onLoad);
			}
			
			this._loaderNode.style.visibility = "hidden";
			wink.layer.hide();
			
			this.pages[result.params.index].loaded = true;
			
			this._sp.slideTo(result.params.id);
		},
		
		/**
		 * XHR failure callback
		 * 
		 * @param {object} result: the result of the XHR request
		 */
		_onFailure: function(result)
		{
			wink.log("[WARNING]: content cannot be loaded");
			
			this._loaderNode.style.visibility = "hidden";
			wink.layer.hide();
			
			this._sp.slideTo(result.params.id);
		},
		
		/**
		 * Initialize the slidingpanels node
		 */
		_initDom: function()
		{
			this._sp = new wink.ui.layout.SlidingPanels(
			{
				'duration': this.duration,
				'transitionType': this.transitionType,
				'pages': this._spPages
			});
			
			this._loaderNode = document.createElement('div');
			this._textNode = document.createElement('div');

			this._loaderNode.className = "w_window w_border w_radius w_bg_dark asp_loader";
			this._textNode.className = "asp_text";
			
			this._textNode.innerHTML = wink.translate("loading", this);
			
			this._spinnerNode = new wink.ui.xy.Spinner({background: "dark", size: 20}).getDomNode();
			
			this._loaderNode.appendChild(this._spinnerNode);
			this._loaderNode.appendChild(this._textNode);
			
			document.body.appendChild(this._loaderNode);
		},
		
		/**
		 * Initialize the properties
		 */
		_initProperties: function()
		{
			
			var l = this.pages.length;
			
			for ( var i=0; i<l; i++ )
			{
				if ( !wink.isString(this.pages[i]) )
				{
					this._spPages[i] = this.pages[i].id;
				} else
				{
					this._spPages[i] = this.pages[i];
				}
			}
		},
		
		/**
		 * Validate the properties of the component
		 * @returns {boolean} True if the properties are valid, false otherwise
		 */
		_validateProperties: function()
		{
			if ( !wink.isArray(this.pages) )
			{
				wink.log('[AsyncPanels] pages parameters must be an array');
				return false;
			}
				
			var l = this.pages.length;
			
			for ( var i=0; i<l; i++)
			{
				if ( !wink.isString(this.pages[i]) )
				{
					if ( !wink.isSet(this.pages[i].id) )
					{
						wink.log('[AsyncPanels] the object must contain a valid id');
						return false;
					}
					
					if ( !wink.isSet(this.pages[i].url) )
					{
						wink.log('[AsyncPanels] the object must contain a valid url');
						return false;
					}
				}
			}
		}
	};
	
	return wink.plugins.AsyncPanels;
});