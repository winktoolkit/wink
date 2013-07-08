/*--------------------------------------------------------
 * Copyright (c) 2011, The Dojo Foundation
 * This software is distributed under the "Simplified BSD license",
 * the text of which is available at http://www.winktoolkit.org/licence.txt
 * or see the "license.txt" file for more details.
 *--------------------------------------------------------*/

/**
 * @fileOverview Implements an image opener. Creates an "image opener" with a 3D rendering
 * 
 * @author Jerome GIRAUD
 */

/**
 * The event is fired when someone clicks on the image
 * 
 * @name wink.ui.xyz.Opener#/opener/events/click
 * @event
 * @param {object} param The parameters object
 * @param {integer} param.openerId uId of the opener
 */

define(['../../../../_amd/core', '../../../../math/_geometric/js/geometric', '../../../../fx/_xyz/js/3dfx'], function(wink)
{
	/**
	 * @class Implements an image opener. Creates an "image opener" with a 3D rendering.
	 * Define the image you want to see as the opener's background. Use the "getDomNode" method to insert the opener into the page.
	 * 
	 * @param {object} properties The properties object
	 * @param {string} properties.image The URL of the image to display
	 * @param {integer} properties.height The height of the opener (should be the same as the image height)
	 * @param {integer} properties.width The width of the opener (should be the same as the image width)
	 * @param {integer} [properties.panelHeight=20] The height of each panel. The image is divided into X panels
	 * @param {integer} [properties.panelsAngle=140] The winding angle of the opener
	 * @param {integer} [properties.openerXAngle=10] The angle between the opener and the page on the X-axis
	 * @param {integer} [properties.openerYAngle=15] The angle between the opener and the page on the Y-axis
	 * @param {integer} [properties.duration=500] The opening duration in milliseconds
	 * 
	 * @requires wink.math._geometric
	 * @requires wink.math._matrix
	 * @requires wink.fx._xyz
	 * 
	 * @example
	 * 
	 * var properties = 
	 * {
	 *   'image': './img/wink.png',
	 *   'height': 185,
	 *   'width': 185,
	 *   'panelsAngle': 200,
	 *   'panelHeight': 5,
	 *   'openerXAngle': 5,
	 *   'openerYAngle': -50,
	 *   'duration': 300
	 * }
	 * 
	 * opener = new wink.ui.xyz.Opener(properties);
	 * wink.byId('content').appendChild(opener.getDomNode());
	 * 
	 * @compatibility iOS2, iOS3, iOS4, iOS5, iOS6, Android 3.0, Android 3.1, Android 4.0, Android 4.1.2, BlackBerry 7, BB10
	 * 
	 * @see <a href="WINK_ROOT_URL/ui/xyz/opener/test/test_opener_1.html" target="_blank">Test page</a>
	 * @see <a href="WINK_ROOT_URL/ui/xyz/opener/test/test_opener_2.html" target="_blank">Test page</a>
	 */
	wink.ui.xyz.Opener = function(properties) 
	{
		/**
		 * Unique identifier
		 * 
		 * @property uId
		 * @type integer
		 */
		this.uId           = wink.getUId();
		
		/**
		 * True if the image is "opened", false otherwise
		 * 
		 * @property opened
		 * @type boolean
		 */
		this.opened        = false;
		
		/**
		 * The URL of the opener image
		 * 
		 * @property image
		 * @type string
		 */
		this.image         = null;
		
		/**
		 * The height of the opener
		 * 
		 * @property height
		 * @type integer
		 */
		this.height        = 0;
		
		/**
		 * The width of the opener
		 * 
		 * @property width
		 * @type integer
		 */
		this.width         = 0;
		
		/**
		 * The height of each panel
		 * 
		 * @property panelHeight
		 * @type integer
		 */
		this.panelHeight   = 20;
		
		/**
		 * The winding angle of the opener
		 * 
		 * @property panelsAngle
		 * @type integer
		 */
		this.panelsAngle   = 140;
		
		/**
		 * The angle between the opener and the page on the X-axis
		 * 
		 * @property openerXAngle
		 * @type integer
		 */
		this.openerXAngle  = 10;
		
		/**
		 * The angle between the opener and the page on the Y-axis
		 * 
		 * @property the angle between the opener and the page on the Y-axis
		 * @type integer
		 */
		this.openerYAngle  = 15;
		
		/**
		 * the opening duration in milliseconds
		 * 
		 * @property duration
		 * @type integer
		 */
		this.duration      = 500;
		
		this._nbPanels     = 0;
		this._panelAngle   = 0;
		
		this._panelsList   = [];
		
		this._domNode      = null;
		this._panelsNode   = null;
		this._contentNode  = null;
		
		wink.mixin(this, properties);
		
		if  ( this._validateProperties() ===  false )return;
		
		this._initProperties();
		this._initDom();
		this._initListeners();
	};
	
	wink.ui.xyz.Opener.prototype =
	{
		/**
		 * @returns {HTMLElement} The dom node containing the Opener
		 */
		getDomNode: function()
		{
			return this._domNode;
		},
		
		/**
		 * Opens the image
		 */
		open: function()
		{
			wink.fx.initComposedTransform(this._panelsNode, false);
			wink.fx.setTransformPart(this._panelsNode, 1, { type: 'rotate', x: 0, y: 1, z: 0, angle: this.openerYAngle });
			wink.fx.setTransformPart(this._panelsNode, 2, { type: 'rotate', x: 1, y: 0, z: 0, angle: this.openerXAngle });
			wink.fx.applyComposedTransform(this._panelsNode); 
			
			this._domNode.style['height'] = '0px';
			
			var l = this._panelsList.length;
			
			for ( var i = l-1; i > 0; i-- )
			{
				this._panelsList[i].open();
			}
			
			this.opened = true;
		},
		
		/**
		 * Closes the image
		 */
		close: function()
		{
			wink.fx.setTransformPart(this._panelsNode, 1, { type: 'rotate', x: 0, y: 1, z: 0, angle: 0 });
			wink.fx.setTransformPart(this._panelsNode, 2, { type: 'rotate', x: 1, y: 0, z: 0, angle: 0 });
			wink.fx.applyComposedTransform(this._panelsNode);
			
			this._domNode.style['height'] = 'auto';
			
			var l = this._panelsList.length;
			
			for ( var i = l-1; i > 0; i-- )
			{
				this._panelsList[i].close();
			}
			
			this.opened = false;
		},
		
		/**
		 * Toggles the image display
		 */
		toggle: function()
		{
			if ( this.opened )
			{
				this.close();
			} else
			{
				this.open();
			}
		},
		
		/**
		 * Handles the click events
		 */
		_handleClick: function()
		{
			this.toggle();
			wink.publish('/opener/events/click', {'openerId': this.uId});	
		},
		
		/**
		 * Validate the properties of the component
		 * @returns {boolean} True if the properties are valid, false otherwise
		 */
		_validateProperties: function()
		{
			// Check duration
			if ( !wink.isInteger(this.duration) )
			{
				wink.log('[Opener] The property duration must be an integer');
				return false;
			}
			
			// Check opener X angle
			if ( !wink.isInteger(this.openerXAngle) )
			{
				wink.log('[Opener] The property openerXAngle must be an integer');
				return false;
			}
			
			// Check opener Y angle
			if ( !wink.isInteger(this.openerYAngle) )
			{
				wink.log('[Opener] The property openerYAngle must be an integer');
				return false;
			}
			
			// Check panel angle
			if ( !wink.isInteger(this.panelsAngle) )
			{
				wink.log('[Opener] The property panelsAngle must be an integer');
				return false;
			}
			
			// Check panelHeight
			if ( !wink.isInteger(this.panelHeight) )
			{
				wink.log('[Opener] The property panelHeight must be an integer');
				return false;
			}
			
			// Check height
			if ( !wink.isInteger(this.height) )
			{
				wink.log('[Opener] The property height must be an integer');
				return false;
			}
			
			// Check width
			if ( !wink.isInteger(this.width) )
			{
				wink.log('[Opener] The property width must be an integer');
				return false;
			}
			
			// Check image
			if ( !wink.isSet(this.image) )
			{
				wink.log('[Opener] The property image must be set');
				return false;
			}
			
			return true;
		},
		
		/**
		 * Initialize the 'click' listener
		 */
		_initListeners: function()
		{
			wink.subscribe('/opener_panel/events/click', {context: this, method: '_handleClick'});			
		},
		
		/**
		 * Initialize the Opener properties
		 */
		_initProperties: function()
		{
			this._nbPanels = Math.ceil(this.height / this.panelHeight);
			this._panelAngle = this.panelsAngle / this._nbPanels;
		},
		
		/**
		 * Initialize the Opener DOM nodes
		 */
		_initDom: function()
		{
			this._domNode = document.createElement('div');
			this._domNode.className = 'op_container';
					
			wink.fx.apply(this._domNode, {
				height: this.height + 'px',
				width: this.width + 'px'
			});
			
			this._panelsNode = document.createElement('div');
			this._panelsNode.className = 'op_panels';
			
			wink.fx.apply(this._panelsNode, {'transform-origin': '100% 0', 'transform-style': 'preserve-3d'});
			
			for ( var i=0; i<this._nbPanels; i++ )
			{
				var panel = new wink.ui.xyz.Opener.Panel({index: i, image: this.image, height: this.panelHeight, angle: this._panelAngle});
				
				this._panelsList.push(panel);
				this._panelsNode.appendChild(panel.getDomNode());
				
				wink.fx.applyTransformTransition(panel.getDomNode(), this.duration + 'ms', '0ms', 'linear');
			}
			
			this._domNode.appendChild(this._panelsNode);
			
			wink.fx.applyTransformTransition(this._panelsNode, this.duration + 'ms', '0ms', 'linear');
		}
	};
	
	/**
	 * @class Implements an image opener panel. Should only be instantiated by the Opener itself
	 * 
	 * @param {object} properties The properties object
	 * @param {integer} properties.index The position of the panel in the panels list
	 * @param {string} properties.image The URL of the image to display
	 * @param {integer} properties.height The height of the panel
	 * @param {integer} properties.angle The opening angle of the panel
	 * 
	 */
	wink.ui.xyz.Opener.Panel = function(properties) 
	{
		/**
		 * Unique identifier
		 * 
		 * @property uId
		 * @type integer
		 */
		this.uId         = wink.getUId();
		
		/**
		 * The position of the panel
		 * 
		 * @property index
		 * @type integer
		 */
		this.index       = null;
		
		/**
		 * The URL of the image to display
		 * 
		 * @property image
		 * @type string
		 */
		this.image       = null;
		
		/**
		 * The height of the panel
		 * 
		 * @property height
		 * @type integer
		 */
		this.height      = 0;
		
		/**
		 * The opening angle of the panel
		 * 
		 * @property angle
		 * @type integer
		 */
		this.angle       = 0;
		
		this._y          = 0;
		this._z          = 0;
		
		this._domNode    = null;
		
		wink.mixin(this, properties);
		
		this._initProperties();
		this._initDom();
	};
	
	/**
	 * The event is fired when someone clicks on the panel
	 * 
	 * @name wink.ui.xyz.Opener#/opener_panel/events/click
	 * @event
	 * @param {object} param The parameters object
	 * @param {integer} param.panelId uId of the panel
	 */
	
	wink.ui.xyz.Opener.Panel.prototype =
	{
		/**
		 * @returns {HTMLElement} The component main dom node
		 */
		getDomNode: function()
		{
			return this._domNode;
		},
		
		/**
		 * Opens the image
		 */
		open: function()
		{
			wink.fx.initComposedTransform(this._domNode, false);
			
			wink.fx.setTransformPart(this._domNode, 1, { type: 'rotate', x: 1, y: 0, z: 0, angle: (this.angle*(this.index)) });
			wink.fx.setTransformPart(this._domNode, 2, { type: 'translate', x: 0, y: this._y, z: this._z });
			
			wink.fx.applyComposedTransform(this._domNode);
		},
		
		/**
		 * Closes the image
		 */
		close: function()
		{
			wink.fx.setTransformPart(this._domNode, 1, { type: 'rotate', x: 1, y: 0, z: 0, angle: 0 });
			wink.fx.setTransformPart(this._domNode, 2, { type: 'translate', x: 0, y: (this.index * this.height), z: 0 });
			
			wink.fx.applyComposedTransform(this._domNode); 
		},
		
		/**
		 * Initialize the Panel properties
		 */
		_initProperties: function()
		{
			for ( var i=0; i<this.index; i++ )
			{
				this._y += Math.cos(wink.math.degToRad(this.angle*i))*this.height;
				this._z += Math.sin(wink.math.degToRad(this.angle*i))*this.height;
			}
		},
		
		/**
		 * Initialize the Panel DOM node
		 */
		_initDom: function()
		{
			this._domNode = document.createElement('div');
			
			this._domNode.className = 'op_panel';
			
			wink.fx.apply(this._domNode, {
				height: (this.height + 2) + 'px',
				'transform-origin': '0 0',
				backgroundImage: 'url(' + this.image + ')',
				backgroundRepeat: 'no-repeat',
				backgroundPositionX: '0',
				backgroundPositionY: -this.index*this.height + 'px'
			});
			
			this._domNode.onclick = function()
			{
				wink.publish('/opener_panel/events/click', {'panelId': this.uId});
			};
			
			wink.fx.translate(this._domNode, 0, this.index*this.height);
		}
	};
	
	return wink.ui.xyz.Opener;
});