/*--------------------------------------------------------
 * Copyright (c) 2011, The Dojo Foundation
 * This software is distributed under the "Simplified BSD license",
 * the text of which is available at http://www.winktoolkit.org/licence.txt
 * or see the "license.txt" file for more details.
 *--------------------------------------------------------*/

/**
 * @fileOverview Implements a Drag and Drop management systems.
 * It is based on a dnd object which will handle sources and targets.
 * Sources are objects that can be moved over the page. Each source MUST define its own behaviour on the user drag (e.g.: creation of an avatar)
 * Targets are objects that can react when particular sources are dropped over them (it defines its own events). A target MUST also define what will be its behaviour when a source is over it or not.
 * When a source is dropped on a target, the dnd object fires the event defined by the target.
 * 
 * @compatibility Iphone OS2, Iphone OS3, Iphone OS4, Android 1.5, Android 2.1, Android 2.2, Android 2.3, Android 3.0, Android 3.1, BlackBerry 6, BlackBerry 7, Bada 1.0
 * 
 * @author Jerome GIRAUD
 */

define(['../../../_amd/core'], function(wink)
{
	/**
	 * @class 
	 * 
	 * Implements a Drag and Drop management systems.
	 * It is based on a dnd object which will handle sources and targets.
	 * Sources are objects that can be moved over the page. Each source MUST define its own behaviour on the user drag (e.g.: creation of an avatar)
	 * Targets are objects that can react when particular sources are dropped over them (it defines its own events). A target MUST also define what will be its behaviour when a source is over it or not.
	 * When a source is dropped on a target, the dnd object fires the event defined by the target.
	 * <br><br>
	 * The dnd object can take a "zone" property to define the drag zone where to listen to touch events.
	 * <br><br>
	 * Targets must be instanciated, giving a valid DOM node id AND the event that will be fired when a source is dropped over it (see the implementation in the code sample section).
	 * <br>
	 * Targets must override the 'onSourceOver' and 'onSourceOut' methods. The first will be called when a source is over the target, the second one, when the source leaves the target (see the implementation in the code sample section).
	 * <br><br>
	 * Sources must be instanciated, giving a valid DOM node id (see the implementation in the code sample section).
	 * <br>
	 * Sources must override the 'getAvatar' method that will be called by the Dnd component when a user touches the source.
	 * <br>
	 * Sources should use the 'registerEvent' method to listen to the targets specific events.
	 * <br><br>
	 * Sources and targets must be added to the dnd object through the 'addSource' and 'addTarget' methods.
	 * <br>
	 * 
	 * @param {object} properties The properties object
	 * @param {HTMLElement} [properties.zone=document] The drag zone where to listen to touch events
	 * 
	 * @example
	 * 
	 * var dnd = new wink.ux.Dnd();
	 * // Define the dnd source and its methods
	 * 
	 * var source1 = new wink.ux.dnd.Source({'id': 'source1'});
	 * 
	 * source1.registerEvent('/dnd/events/dropIcon1', source1, 'drop1');
	 * source1.registerEvent('/dnd/events/dropIcon2', source1, 'drop2');
	 * 
	 * source1.drop1 = function(params)
	 * {
	 * 	...
	 * }
	 * 
	 * source1.drop2 = function(params)
	 * {
	 * 	...
	 * }
	 * 
	 * source1.getAvatar = function()
	 * {
	 * 	...
	 * }
	 * 
	 * // Define the dnd targets and their methods
	 * var target1 = new wink.ux.dnd.Target({'id': 'target1', 'event': '/dnd/events/dropIcon1'});
	 * var target2 = new wink.ux.dnd.Target({'id': 'target2', 'event': '/dnd/events/dropIcon2'});
	 * 
	 * wink.ux.dnd.Target.prototype.over = wink.ux.dnd.Target.prototype.onSourceOver;
	 * wink.ux.dnd.Target.prototype.out = wink.ux.dnd.Target.prototype.onSourceOut;
	 * 
	 * wink.ux.dnd.Target.prototype.onSourceOver = function()
	 * {
	 * 	if(!this._isOver)
	 * 	{
	 * 		this.over();
	 * 		$(this.id).style.border = '1px dotted #000';
	 * 	}
	 * } 
	 * 
	 * wink.ux.dnd.Target.prototype.onSourceOut = function()
	 * {
	 * 	if(this._isOver)
	 * 	{
	 * 		this.out();
	 * 		$(this.id).style.border = '1px solid #fff';
	 * 	}
	 * } 
	 * 
	 * // Add the source and the targets to the dnd component
	 * dnd.addSource(source1);
	 * dnd.addTarget(target1);
	 * dnd.addTarget(target2);
	 * 
	 * @see <a href="WINK_ROOT_URL/ux/dnd/test/test_dnd_1.html" target="_blank">Test page</a>
	 * @see <a href="WINK_ROOT_URL/ux/dnd/test/test_dnd_2.html" target="_blank">Test page (puzzle)</a>
	 * @see <a href="WINK_ROOT_URL/ux/dnd/test/test_dnd_3.html" target="_blank">Test page (puzzle offline)</a>
	 * @see <a href="WINK_ROOT_URL/ux/dnd/test/test_dnd_4.html" target="_blank">Test page (list)</a>
	 */
	wink.ux.Dnd = function(properties)
	{
		/**
		 * Unique identifier
		 * 
		 * @property uId
		 * @type integer
		 */
		this.uId            = wink.getUId();
		
		/**
		 * The drag zone where to listen to touch events
		 * 
		 * @property zone
		 * @type HTMLElement
		 */
		this.zone           = null;
		
		this._targets       = [];
		this._sources       = [];
		
		this._multitouch    = 0;
		
		this._startEvent    = null;
		this._endEvent      = null;
		
		this._currentSource = null;
		this._currentTarget = null;
		this._currentAvatar = null;
		
		this._lastX         = 0;
		this._lastY         = 0;
		
		wink.mixin(this, properties);
		
		this._initListeners();
	};
	
	wink.ux.Dnd.prototype =
	{
		/**
		 * Add a new source to the dnd object
		 * 
		 * @param {object} source The source to add
		 */
		addSource: function(source)
		{
			this._sources[this._sources.length] = 
			{
				source: source
			};
		},
		
		/**
		 * Add a new target to the dnd object
		 * 
		 * @param {object} target The target to add
		 */
		addTarget: function(target)
		{
			target.dnd = this;
			
			var x1 = $(target.id).offsetLeft;
			var y1 = $(target.id).offsetTop;
			var x2 = x1 + $(target.id).clientWidth;
			var y2 = y1 + $(target.id).clientHeight;
			
			this._targets[this._targets.length] = 
			{
				target: target, 
				X1: x1, 
				Y1: y1, 
				X2: x2, 
				Y2: y2
			};
		},
		
		/**
		 * Update the targets positions. To call if the page display changes
		 */
		updateTargets: function()
		{
			var l = this._targets.length;
			
			for (var i = 0; i<l; i++) 
			{
				if ( $(this._targets[i].target.id))
				{
					var t = $(this._targets[i].target.id);
					
					var x1 = t.offsetLeft;
					var y1 = t.offsetTop;
					var x2 = x1 + t.clientWidth;
					var y2 = y1 + t.clientHeight;
					
					this._targets[i].X1 = x1;
					this._targets[i].X2 = x2;
					this._targets[i].Y1 = y1;
					this._targets[i].Y2 = y2;
				}
			}
		},
		
		/**
		 * Reset the dnd object (empty the sources and targets lists)
		 */
		clean: function()
		{
			this._targets = [];
			this._sources = [];
		},
		
		/**
		 * Starts dragging a new avatar if the user touched a d&d capable object
		 * 
		 * @param {wink.ux.Event} event the event corresponding to the mouse/finger
		 */
		_startDrag: function(event)
		{		
			if ( event.multitouch )
			{
				this._multitouch++;
				return;
			}
			
			this._startEvent = event;
			
			if (event.target.className && event.target.className.search(/dnd_movable/i) > -1)
			{
				// See if the element being dragged is a registered source
				this._currentSource = this._getSource(event.target.id);
		        
				if (this._currentSource !== null)
				{
					this._currentSource.activate();
		
					this._currentAvatar = 
					{
		                target: this._currentSource.getAvatar(),
						beginX: event.x,
		                beginY: event.y,
		                pozX: event.target.pozXinit,
		                pozY: event.target.pozYinit
		            };
					
					document.body.appendChild(this._currentAvatar.target);
				}
				
		    }
		},
		
		/**
		 * Drags a source around
		 * 
		 * @param {wink.ux.Event} event the event corresponding to the mouse/finger
		 */
		_drag: function(event)
		{
			if ( this._multitouch > 0 )
			{
				return;
			}
			
			if (this._currentAvatar !== null)
			{
				this._currentAvatar.target.pozXinit = this._currentAvatar.pozX + event.x - this._currentAvatar.beginX;	
				this._currentAvatar.target.pozYinit = this._currentAvatar.pozY + event.y - this._currentAvatar.beginY;	
				
				this._currentAvatar.target.translate(this._currentAvatar.target.pozXinit, this._currentAvatar.target.pozYinit);
				
				// check if we are over a drop target
				this._currentTarget = this._getTarget(event.x, event.y);
				
				if ( this._currentTarget !== null )
				{
					for ( var i=0; i<this._currentSource._events.length; i++)
					{
						if ( this._currentSource._events[i].event == this._currentTarget._event )
						{
							// make the drop target react
							this._currentTarget.onSourceOver(this._currentSource);
						}
					}
				} 
				
				// Save the current position
				this.lastX = event.x;
				this.lastY = event.y;
		
				// Vertical scroll
				if ( event.y >= ( (window.innerHeight + window.scrollY)-60 ) )
				{
					scrollTo(window.scrollX, window.scrollY + 5);
				} else if ( (event.y <= (window.scrollY + 60)) && window.scrollY > 0 )
				{
					scrollTo(window.scrollX, window.scrollY - 5);
				}
				
				// Horizontal scroll
				if ( event.x >= ( (window.innerWidth + window.scrollX)-40 ) )
				{
					scrollTo(window.scrollX + 5, window.scrollY);
				} else if ( (event.x <= (window.scrollX + 40)) && window.scrollX > 0 )
				{
					scrollTo(window.scrollX - 5, window.scrollY);
				}
		    }
		},
		
		/**
		 * Stop dragging a source. React if the source has been dropped on a compliant target
		 * 
		 * @param {wink.ux.Event} event the event corresponding to the mouse/finger
		 */
		_endDrag: function(event)
		{	
			if ( this._multitouch > 0 )
			{
				this._multitouch--;
				return;
			}
			
			this._endEvent = event;
			
			// Check if a click event must be generated
			if ( ((this._endEvent.timestamp-this._startEvent.timestamp) < 250) && (Math.abs(this._endEvent.x-this._startEvent.x) < 20))
			{
				this._endEvent.dispatch(this._endEvent.target, 'click');
			}
			
			if (this._currentAvatar !== null)
			{
				
				// check if we are over a drop target
				this._currentTarget = this._getTarget(this.lastX, this.lastY);
				
				if ( this._currentTarget !== null )
				{
					// make the drop target react
					this._currentTarget._onDrop(this._currentSource);
				}
				
				// remove the avatar
				document.body.removeChild(this._currentAvatar.target);
				
				// reset the drag and drop
				this._currentSource.deactivate();
				
				this._currentSource = null;
				this._currentTarget = null;
				this._currentAvatar = null;
				
				this.lastX = 0;
				this.lastY = 0;
		
				this.updateTargets();
		    }
		},
		
		/**
		 * Get a particular Source
		 * 
		 * @param {string} id id of the source we want to retrieve
		 */
		_getSource: function(id)
		{
			if ( id !== null && id != '')
			{
				for ( var i=0; i<this._sources.length; i++)
				{
					if ( this._sources[i].source.id == id )
					{
						return (this._sources[i].source);
					}
				}
			}
			return null;
		},
		
		/**
		 * Get a particular Target
		 * 
		 * @param {integer} pageX position of the mouse/finger on the X-axis
		 * @param {integer} pageY position of the mouse/finger on the Y-axis
		 */
		_getTarget: function(pageX, pageY)
		{
			var t = null;
			var l = this._targets.length;
			
			for (var i=0; i<l; i++)
			{
				if ( this._targets[i].X1 <= pageX && pageX <= this._targets[i].X2 )
				{
					if ( this._targets[i].Y1 <= pageY && pageY <= this._targets[i].Y2 )
					{
						t = this._targets[i].target;
					} else
					{
						this._targets[i].target.onSourceOut();
					}
				} else
				{
					this._targets[i].target.onSourceOut();
				}
			}
			return t;
		},
		
		/**
		 * Adds listeners for mouse/finger events
		 */
		_initListeners: function()
		{
			wink.ux.touch.addListener(wink.isSet(this.zone)?this.zone:document, "start", { context: this, method: "_startDrag", arguments: null }, { preventDefault: true, tracking: false });
			wink.ux.touch.addListener(wink.isSet(this.zone)?this.zone:document, "move", { context: this, method: "_drag", arguments: null }, { preventDefault: true });
			wink.ux.touch.addListener(wink.isSet(this.zone)?this.zone:document, "end", { context: this, method: "_endDrag", arguments: null }, { preventDefault: true });
		}
	};
	
	/**
	 * @borrows wink.ux.dnd as this
	 */
	wink.ux.dnd = wink.ux.Dnd;
	
	/**
	 * @class Implements a drag and drop source. The source can be moved around in the page and can react when dropped on a certain target
	 * 
	 * @param {object} properties The properties object
	 * @param {string} properties.id Identifier of a DOM node representing the source
	 * 
	 */
	wink.ux.dnd.Source = function(properties)
	{
		/**
		 * Unique identifier
		 * 
		 * @property uId
		 * @type integer
		 */
		this.uId     = wink.getUId();
		
		/**
		 * The id of the DOM node representing the source
		 * 
		 * @property id
		 * @type string
		 */
		this.id      = properties.id;
		
		this._events = [];
		
		if  ( this._validateProperties() ===  false )return;
		
		this._initDom();
	};
	
	wink.ux.dnd.Source.prototype = 
	{
		/**
		 * Add a new event on which the source can react
		 * 
		 * @param {string} event The name of the event (created at the instantiation of a target) we want to listen to
		 * @param {object} context The context where to execute the callback method. It should be 'null' if the callback method is in the global scope
		 * @param {object} method Callback method. It is called when the event is fired
		 * 
		 */
		registerEvent: function(event, context, method)
		{
			this._events.push(
				{
					event: event,
					context: context,
					method: method
				}
			);
		},
		
		/**
		 * This method is called by the dnd object when the user start touching the source. It MUST be overwriten by the application AND it MUST return a DOM node corresponding to the drag avatar
		 */
		getAvatar: function()
		{
			return null;
		},
		
		/**
		 * Activate the listeners corresponding to all the registered events of the source. This method is called by the dnd object. It SHOULD only be called by the dnd object
		 */
		activate: function()
		{
			var l = this._events.length;
	
			for ( var i=0; i<l; i++)
			{
				wink.subscribe(this._events[i].event, {context: this._events[i].context, method: this._events[i].method});
			}
		},
		
		/**
		 * Deactivate the listeners corresponding to all the registered events of the source. This method is called by the dnd object. It SHOULD only be called by the dnd object
		 */
		deactivate: function()
		{
			var l = this._events.length;
			for ( var i=0; i<l; i++)
			{
				wink.unsubscribe(this._events[i].event, {context: this._events[i].context, method: this._events[i].method});
			}
		},
		
		/**
		 * Validate the properties of the component
		 * @returns {boolean} True if the properties are valid, false otherwise
		 */
		_validateProperties: function()
		{
			if ( wink.isNull($(this.id)) )
			{
				wink.log('[dnd.Source] id property must be a valid DOM Node identifier');
				return false;
			}
		},
		
		/**
		 * Initialize the Source node
		 */
		_initDom: function()
		{
			wink.addClass($(this.id), 'dnd_movable');
			
			$(this.id).pozXinit = 0;
			$(this.id).pozYinit = 0;
		}
	};
	
	/**
	 * @class Implements a drag and drop target. Sources can be dropped on it and it will react if its associated event correspond to the current source
	 * 
	 * @param {object} properties The properties object
	 * @param {string} properties.id Identifier of a DOM node representing the target
	 * @param {string} properties.event Name of the event that will be fired on a drop
	 */
	wink.ux.dnd.Target = function(properties)
	{
		/**
		 * Unique identifier
		 * 
		 * @property uId
		 * @type integer
		 */
		this.uId     = wink.getUId();
		
		/**
		 * The id of the DOM node representing the target
		 * 
		 * @property id
		 * @type string
		 */
		this.id      = properties.id;
		
		/**
		 * The manager associated to the target
		 * 
		 * @property dnd
		 * @type object
		 */
		this.dnd     = null;
		
		this._event  = properties.event;
		this._isOver = false;
		
		if  ( this._validateProperties() ===  false )return;
	};
	
	wink.ux.dnd.Target.prototype =
	{
		/**
		 * This method is called by the dnd object when a compliant source is over the target. It SHOULD be overwritten by the application
		 */
		onSourceOver: function()
		{
			if(!this._isOver)
			{
				this.dnd.updateTargets();
				this._isOver = true;
			}
		},
		
		/**
		 * This method is called by the dnd object when a compliant source is out of the target. It SHOULD be overwritten by the application
		 */
		onSourceOut: function()
		{
			if(this._isOver)
			{
				this.dnd.updateTargets();
				this._isOver = false;
			}
		},
		
		/**
		 * This method is called by the Dnd when a compliant source is dropped on the target. It fires the event associated to the target
		 * 
		 * @param {wink.ux.dnd.Source} source The dropped Source
		 */
		_onDrop: function(source)
		{
			if(this._isOver)
			{
				this.dnd.updateTargets();
				wink.publish(this._event, {'target': this, 'source' : source});
				this._isOver = false;
			}
		},
		
		/**
		 * Validate the properties of the component
		 * @returns {boolean} True if the properties are valid, false otherwise
		 */
		_validateProperties: function()
		{
			if ( wink.isNull($(this.id)) )
			{
				wink.log('[dnd.Target] id property must be a valid DOM Node identifier');
				return false;
			}
			
			if ( !wink.isSet(this._event) )
			{
				wink.log('[dnd.Target] event must not be an empty or NULL string');
				return false;
			}
		}
	};
	
	return wink.ux.Dnd;
});