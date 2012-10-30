/*--------------------------------------------------------
 * Copyright (c) 2011, The Dojo Foundation
 * This software is distributed under the "Simplified BSD license",
 * the text of which is available at http://www.winktoolkit.org/licence.txt
 * or see the "license.txt" file for more details.
 *--------------------------------------------------------*/

/**
 * A Simple Event manager that handle all event process
 *  
 * @winkVersion 1.4
 *  
 * @compatibility iOS2, iOS3, iOS4, Android 1.5, Android 2.1, Android 2.2, Android 2.3, Android 3.0, Android 3.1, Android 4.0, BlackBerry 6, BlackBerry 7
 * 
 * @author Guillaume WINTZER, Mathieu FABRE
 */

define(['../../../../../_amd/core'], function(wink)
{
	/**
	 * Define the completion event manager with default values
	 * 
	 * @class SimpleEventManager class
	 * 
	 * @param properties an array containing all event manager properties
	 * @param [properties.closeOnBlur] Boolean that indicate if we have to close the completion on blur event
	 * @param [properties.callbacks] The array containing all processable callbacks
	 * 		Available callbacks are :
	 * 		- "selection" : Function to call when a suggestion is selected
	 * @returns SimpleEventManager the completion event manager
	 */
	wink.plugins.completion.manager.event.SimpleEventManager = function(properties, component)
	{
	    /**
	     * Type of the manager
	     * @type string
	     */
	    this._type = "event";
	    
	    /**
	     * Keep a reference to the functions 
	     * used as listeners
	     */
	    this._listeners = {};
	    
	    /**
	     * The callback object containing all callbacks
	     * @type object
	     */
	    this.callbacks = {};
	    
	    /**
	     * Indicate if the completion box must be closed on input blur
	     * @type boolean
	     */
	    this.closeOnBlur = false;
	    
	    /**
	     * The module object containing all modules
	     * @type object
	     */
	    this._modules = {};
	    
	    /**
	     * The component reference
	     * @type Component
	     */
	    this._component = component;
	    
	    /**
	     * The manager helper
	     * @type ManagerHelper
	     */
	    this._helper = component._helper;
	    
	    /**
	     * The ready state of the manager
	     * @type boolean
	     */
	    this._ready = false;
	    
	    // Save properties
	    wink.mixin(this, properties);    
	    
	    // Create manager modules
	    if (!this._helper.createModules(this, this._type))
	        return;
	    
	    // Finally set the ready state to true
	    this._ready = true;
	};
	
	wink.plugins.completion.manager.event.SimpleEventManager.prototype = 
	{
	    /**
	     * Start the manager
	     */
	    start: function()
	    {
	        // Check the manager ready state
	        if (!this._ready)
	        {
	            //wink.log("[SimpleEventManager] Configuration failed");
	            return false;
	        }
	        
	        // start all modules if needed (modules has no mandatory start function
	        if (!this._helper.startModules(this._modules))
	        {
	            //wink.log("[SimpleEventManager] Module could not be started");
	            return false;
	        }
	
	        this._initListeners();
	        
	        return true;
	    },
	    
	    /**
	     * Stop the manager
	     */
	    stop: function()
	    {   
	        this._removeListeners();
	        return true;
	    },
	    
	    /**
	     * Initialize Listeners in the completion component
	     * Listen on the keyup, keydown of keyboard,
	     * blur of the input
	     *
	     */
	    _initListeners: function()
	    {
	        var eventManager = this;
	        
	        this._listeners.inputKeyDown = function(event) { 
	            eventManager.onInputKeyDown(event); 
	        };
	        this._component.input.addEventListener("keydown", this._listeners.inputKeyDown, false);
	        
	        this._listeners.inputKeyUp = function(event) {
	            eventManager.onInputKeyUp(event);
	        };
	        this._component.input.addEventListener("keyup", this._listeners.inputKeyUp, false);
	        
	        this._listeners.inputBlur = function(event) {
	            eventManager.onInputBlur(event);
	        };
	        this._component.input.addEventListener("blur", this._listeners.inputBlur, false);
	        
	        this._listeners.inputFocus = function(event) {
	            eventManager._onInputFocus(event);
	        };
	        this._component.input.addEventListener("focus", this._listeners.inputFocus, false);
	    },
	    
	    /**
	     * Remove listeners in the completion component,
	     * on the keyup, keydown of keyboard,
	     * blur of input
	     * Finally reset the listener array
	     */
	    _removeListeners: function()
	    {        
	        this._component.input.removeEventListener("keydown", this._listeners.inputKeyDown, false);
	        this._component.input.removeEventListener("keyup", this._listeners.inputKeyUp, false);
	        this._component.input.removeEventListener("blur", this._listeners.inputBlur, false);
	        this._component.input.removeEventListener("focus", this._listeners.inputFocus, false);
	        
	        this._listeners = {};
	    },
	    
	    /**
	     * Manage the onKeyUp event.
	     * 
	     * WARNING Assume that the highlighted index
	     * has been updated via the module onKeyDown
	     * method
	     * 
	     * @param Event event the key event
	     */
	    onInputKeyUp: function(event)
	    {
	        // Check if event come from window
	        if (!event && window.event)
	            event = window.event;
	        
	        // Check event
	        if (!event)
	            return false;
	
	        this._component.processOnInputRelease();
	    },
	    
	    /**
	     * Manage the onKeyDown event.
	     * 
	     * @param Event event the key event
	     */
	    onInputKeyDown: function(event)
	    {
	        // Check if event come from window
	        if (!event && window.event)
	            event = window.event;
	        
	        // Check event
	        if (!event)
	            return false;
	        
	        this._component.processOnInputPress();
	    },
	    
	    /**
	     * Manage the onBlur event.
	     * This function is called when the input field lost the focus. 
	     * Directly return if the closeOnBlur property is false
	     * 
	     * @param Event event the key event
	     */
	    onInputBlur: function(event)
	    {
	        if (!this.closeOnBlur)
	            return; 
	        
	        this._component.processOnInputBlur();
	    },
	    
	    /**
	     * Manage the onFocus event.
	     * This function is called when the input field get the focus. 
	     * 
	     * @param Event event the key event
	     */
	    _onInputFocus: function(event)
	    {
	    	if (!wink.isNull(this._component._domManager._referenceDomNode)) {
	    		this._component._domManager.updatePositions();
	    	}
	    },
	    
	    /**
	     * Set the basic mouse event listeners
	     * on a new suggestion
	     * 
	     * Add all mouse listeners
	     * 
	     * @param integer index the index of the current suggestion
	     * @param HTMLElement domNode the domNode suggestion
	     */
	    addMouseEventListenersOnNewSuggestion: function(index, domNode)
	    {
	        var suggestionType = this._component.getSuggestion(index).type ? this._component.getSuggestion(index).type : 'default';
	        var mouseDownModule = (this._modules[suggestionType] && this._modules[suggestionType].onMouseDown) ? this._modules[suggestionType] : this._helper.getDefaultModule(this);
	        var clickModule = (this._modules[suggestionType] && this._modules[suggestionType].onClick) ? this._modules[suggestionType] : this._helper.getDefaultModule(this);

	        domNode.addEventListener("click", function(event) {
	            clickModule.onClick(event, index);
	        }, false);
	        
	        wink.ux.touch.addListener(domNode, 'start', {context: mouseDownModule, method: 'onMouseDown', arguments: index}, { preventDefault: false })
	        
	        wink.ux.touch.addListener(domNode, 'start', {context: this, method: '_onTouchSuggestion'}, { preventDefault: true })
	        wink.ux.touch.addListener(domNode, 'end', {context: this, method: '_onTouchSuggestion'}, { preventDefault: true })
	    },
	    
	    _onTouchSuggestion: function(uxEvent) 
		{
			if (uxEvent.type == 'start') 
			{
				_startSuggestionEvent = uxEvent;
				uxEvent.preventDefault();
			}
			else 
			{
				_endSuggestionEvent = uxEvent;

				if (((_endSuggestionEvent.timestamp - _startSuggestionEvent.timestamp) < 250) && (Math.abs(_endSuggestionEvent.x - _startSuggestionEvent.x) < 20) && (Math.abs(_endSuggestionEvent.y - _startSuggestionEvent.y) < 20)) 
				{
					_endSuggestionEvent.dispatch(_endSuggestionEvent.target, 'click');
				}
			}
		},
	    
	    /**
	     * Return the selection callback if defined
	     */
	    getSelectionCallback: function() {
	    	return ((this.callbacks && this.callbacks.selection && wink.isCallback(this.callbacks.selection)) ? this.callbacks.selection : null);
	    }
	};
});