/*--------------------------------------------------------
 * Copyright (c) 2011, The Dojo Foundation
 * This software is distributed under the "Simplified BSD license",
 * the text of which is available at http://www.winktoolkit.org/licence.txt
 * or see the "license.txt" file for more details.
 *--------------------------------------------------------*/

/**
 * @fileOverview A plugin to display a wheel that can be used to share items
 * 
 * @author Jerome GIRAUD
 */

define(['../../../_amd/core', '../../../fx/_xyz/js/3dfx', '../../../math/_geometric/js/geometric'], function(wink)
{
	/**
	 * @class A plugin to display a wheel that can be used to share items.
	 * To instantiate the wheel, just define the items and the diameter of the wheel.
	 * 
	 * @param {object} properties The properties object 
	 * @param {array} properties.shareItems The list of items in the wheel (must be an array containing the title of the item and eventually a sharing link)
	 * @param {integer} properties.height The diameter of the wheel
	 * 
	 * @example
	 * 
	 * var properties = 
	 * {
	 * 	shareItems: 
	 * 	[
	 * 		{'title': 'do not &lt;br /&gt;share'},
	 * 		{'title': 'via &lt;br /&gt;facebook', 'shareUrl' : 'http://facebook.com/...},
	 * 		{'title': 'via &lt;br /&gt;twitter', 'shareUrl' : 'http://twitter.com/intent/tweet?text...')},
	 * 		{'title': 'via &lt;br /&gt;tumblr', 'shareUrl' : 'http://www.tumblr.com/share/link?url=...')},
	 * 		{'title': 'by &lt;br /&gt;e-mail', 'shareUrl' : 'mailto:'}
	 * 	]
	 * }
	 * 
	 * share = new wink.plugins.SharingWheel(properties);
	 * 
	 * wink.byId('output').appendChild(share.getDomNode());
	 * 
	 * @requires wink.fx (3dfx)
	 * @requires wink.math (geometric)
	 * 
	 * @compatibility iOS2, iOS3, iOS4, iOS5, iOS6, Android 2.1, Android 2.2, Android 2.3, Android 3.0, Android 3.1, Android 4.0, BlackBerry 6, BlackBerry 7
	 * 
	 * @winkVersion 1.4
	 * 
	 * @see <a href="WINK_ROOT_URL/plugins/sharingwheel/test/test_sharingwheel.html" target="_blank">Test page</a>
	 */
	wink.plugins.SharingWheel = function(properties)
	{
		/**
		 * Unique identifier
		 * 
		 * @property
		 * @type integer
		 */
		this.uId = wink.getUId();
		
		/**
		 * The list of items in the wheel
		 * 
		 * @property
		 * @type array
		 */
		this.shareItems = null;
		
		/**
		 * The diameter of the wheel
		 * 
		 * @property
		 * @type integer
		 * @default 100
		 */
		this.height = 100;
		
		
		this._nbPetals     = 0;
		
		this._petalsList   = [];
		
		this._originX      = 0;
		this._originY      = 0;
		
		this._originAngle  = 0;
		this._currentAngle = 0;
		
		this._startX       = 0;
		this._startY       = 0;
		
		this._slope        = 0;
		
		this._domNode      = null;
		this._petalsNode   = null;
		this._linkNode     = null;
		
		wink.mixin(this, properties);
		
		if (this._validateProperties() === false) return;

		this._initProperties();
		this._initDom();
		this._initListeners();
	};
	
	wink.plugins.SharingWheel.prototype =
	{
		/**
		 * Return the dom node containing the wheel
		 * 
		 * @returns {HTMLElement} The main dom node
		 */
		getDomNode: function()
		{
			return this._domNode;
		},
		
		/**
		 * Initialize the nodes
		 */
		_initDom: function()
		{
			this._domNode = document.createElement('div');
			this._domNode.className = 'sh_wheel w_border w_bg_dark';
			
			wink.fx.apply(this._domNode, {'height': this.height + 'px ', 'width': this.height + 'px ', 'border-radius': (this.height/2) + 'px'});
			
			this._petalsNode = document.createElement('div');
			this._petalsNode.className = 'sh_petals';
			
			this._linkNode = document.createElement('a');
			this._linkNode.target = '_blank';
			
			
			for ( var i=0; i<this._nbPetals; i++)
			{
				var petal = document.createElement('div');
				
				if ( i == 0 )
				{
					petal.className = 'sh_petal selected';
				} else
				{
					petal.className = 'sh_petal';
				}
				
				var petalStyle = {
					height: (this.height/2) + 'px ',
					width: (this.height/2) + 'px ',
					'transform-origin': (this.height/2 +1) + 'px ' +  (this.height/2) + 'px'
				};
				if ( wink.has('preserve3d') )
				{
					petalStyle['transform-style'] = 'preserve-3d';
				}
				wink.fx.apply(petal, petalStyle);

				wink.fx.rotate(petal, (i*( 360 / this._nbPetals)) + (180 / this._nbPetals));
				
				var content = document.createElement('div');
				content.className = 'sh_content';
				content.innerHTML = this.shareItems[i].title;
				
				var width = Math.sqrt((2*Math.pow((this.height/2), 2))*(1 - Math.cos(wink.math.degToRad((360 / this._nbPetals)))));
				var offset = Math.sqrt((Math.pow((this.height/2), 2) - Math.pow((width/2), 2)));
				
				wink.fx.apply(content, {'transform-origin': '100% 0', 'width': width + 'px'});
				
				wink.fx.initComposedTransform(content);
				wink.fx.setTransformPart(content, 1, { type: 'translate', x: 0, y: offset-(this.height/2), z: 0});
				wink.fx.setTransformPart(content, 2, { type: 'rotate', x: 0, y: 0, z: 1, angle: -180 / this._nbPetals});
				wink.fx.applyComposedTransform(content);
				
				petal.appendChild(content);
				
				this._petalsNode.appendChild(petal);
				
				if ( i == 0 )
				{
					this._petalsList.push({'petal': petal, 'start': 360 - ( 180 / this._nbPetals), 'stop': (180 / this._nbPetals) });
				} else
				{
					this._petalsList.push({'petal': petal, 'start': i*( 360 / this._nbPetals) - (180 / this._nbPetals), 'stop': i*( 360 / this._nbPetals) + (180 / this._nbPetals)});
				}
				
			}
			
			this._domNode.appendChild(this._petalsNode);
		},
		
		/**
		 * Initialize the touch listeners
		 */
		_initListeners: function()
		{
			wink.ux.touch.addListener(this._domNode, 'start', { context: this, method: '_touchStart', arguments: null }, { preventDefault: true, touchAction: "double-tap-zoom" });
			wink.ux.touch.addListener(this._domNode, 'move', { context: this, method: '_touchMove', arguments: null }, { preventDefault: true });
			wink.ux.touch.addListener(this._domNode, 'end', { context: this, method: '_touchEnd', arguments: null }, { preventDefault: true });
		},
		
		/**
		 * Listen to the start events
		 * 
		 * @param {wink.ux.Event} event The start event
		 */
		_touchStart: function(e)
		{
			this._originX = (wink.getLeftPosition(this._petalsNode, null, true)) + (this.height/2);
			this._originY = (wink.getTopPosition(this._petalsNode, null, true)) + (this.height/2);
			
			this._startX = e.x;
			this._startY = e.y;
			
			this._slope = (this._originY - this._startY) / (this._startX - this._originX);
			
			wink.fx.rotate(this._petalsNode, this._originAngle);
		},
		
		/**
		 * Listen to the move events
		 * 
		 * @param {wink.ux.Event} event The move event
		 */
		_touchMove: function(e)
		{
			var _currentX = e.x;
			var _currentY = e.y;
			
			var a = Math.sqrt( Math.pow((this._startY - this._originY), 2) + Math.pow((this._startX - this._originX), 2) );
			var b = Math.sqrt( Math.pow((_currentY - this._originY), 2) + Math.pow((_currentX - this._originX), 2) );
			var c = Math.sqrt( Math.pow((_currentY - this._startY), 2) + Math.pow((_currentX - this._startX), 2) );
			
			var d = ((a*a + b*b) - c*c)/(2*a*b);
			
			this._currentAngle = wink.math.radToDeg(Math.acos(d));
			
			if ( this._startX < this._originX )
			{
				this._currentAngle =  -this._currentAngle;
			}

			if( ( _currentX - this._originX ) * this._slope < (this._originY - _currentY))
			{
				this._currentAngle =  -this._currentAngle;
			}

			wink.fx.rotate(this._petalsNode, this._originAngle + this._currentAngle);
			
			this._selectPetal();
		},
		
		/**
		 * Listen to the end events
		 * 
		 * @param {wink.ux.Event} event The end event
		 */
		_touchEnd: function(e)
		{
			this._originAngle += this._currentAngle;
			
			if ( this._originAngle > 180 )
			{
				this._originAngle -= 360;
			}
			
			if ( this._originAngle < -180 )
			{
				this._originAngle += 360;
			}
			
			this._getSelectedPetal();
		},
		
		/**
		 * Check which petal is currently selected
		 */
		_selectPetal: function()
		{
			var _a = this._originAngle + this._currentAngle;
			
			if ( _a > 180 )
			{
				_a -= 360;
			}
			
			if ( _a < -180 )
			{
				_a += 360;
			}
			
			if ( _a < 0 )
			{
				_a = 360 + _a;
			}
			
			_a = 360 - _a;
			
			
			if ( _a >= 360 - ( 180 / this._nbPetals) || _a < (180 / this._nbPetals))
			{
				wink.addClass(this._petalsList[0].petal, 'selected');
				this._petalsList[0].selected = true;
			} else
			{
				wink.removeClass(this._petalsList[0].petal, 'selected');
				this._petalsList[0].selected = false;
			}
			
			for ( var i=1; i<this._petalsList.length; i++ )
			{
				if ( _a >= this._petalsList[i].start && _a < this._petalsList[i].stop )
				{
					wink.addClass(this._petalsList[i].petal, 'selected');
					this._petalsList[i].selected = true;
				} else
				{
					wink.removeClass(this._petalsList[i].petal, 'selected');
					this._petalsList[i].selected = false;
				}
			}
			
		},
		
		/**
		 * Get the selected petal
		 */
		_getSelectedPetal: function()
		{
			var _a = this._originAngle;
			
			for ( var i=0; i<this._petalsList.length; i++ )
			{
				if ( this._petalsList[i].selected == true )
				{
					wink.publish('/share/events/select', {'itemId': i});
					
					if ( !wink.isUndefined(this.shareItems[i].shareUrl) && this.shareItems[i].shareUrl != '' )
					{
						this._linkNode.href = this.shareItems[i].shareUrl;
					
						var event = document.createEvent('MouseEvents');
						event.initEvent('click', true, true);
	
						this._linkNode.dispatchEvent(event);
					}
					
					return;
				}
			}
		},
		
		/**
		 * Initialize the properties
		 */
		_initProperties: function()
		{
			this._nbPetals = this.shareItems.length;
		},
		
		/**
		 * Validate the properties of the component
		 * @returns {boolean} True if the properties are valid, false otherwise
		 */
		_validateProperties: function()
		{
			if ( !wink.isArray(this.shareItems) )
			{
				wink.log('[Share] share items must be set in an array');
				return false;
			}
			
			if ( !wink.isUndefined(this.height) && !wink.isNumber(this.height) )
			{
				wink.log('[Share] height must be a number');
				return false;
			}
		}
	};
	
	return wink.plugins.SharingWheel;
});