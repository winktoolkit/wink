/*--------------------------------------------------------
 * Copyright (c) 2011, The Dojo Foundation
 * This software is distributed under the "Simplified BSD license",
 * the text of which is available at http://www.winktoolkit.org/licence.txt
 * or see the "license.txt" file for more details.
 *--------------------------------------------------------*/

/**
 * A Simple DOM manager that handle all DOM process
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
	 * Define the completion dom manager with default values
	 * 
	 * @class SimpleDomManager class
	 * 
	 * @param properties an array containing all dom manager properties
	 * @param [properties.domNode] The DOM node HTMLElement
	 * @param [properties.callbacks] The array containing all processable callbacks
	 * 		Available callbacks are :
	 * 		- "show" : Function to call before showing the completion box
	 * 		- "hide" : Function to call before hiding the completion box
	 * @param [properties.cssPrefix] The CSS prefix used for all HTMLElement
	 * @param [properties.borderSize] The CSS border size value
	 * 
	 * @returns SimpleDomManager the completion dom manager
	 */
	wink.plugins.completion.manager.dom.SimpleDomManager = function(properties, component)
	{
	    /**
	     * Type of the manager
	     * @type string
	     */
	    this._type = "dom";
	    
	    /**
	     * The current suggestion box.
	     * @type HTMLElement
	     */
	    this.domNode = null;
	    
	    /**
	     * The list of suggestions DOM node
	     * @type array
	     */
	    this._suggestionDomNodes = [];
	    
	    /**
	     * The position reference that will be saved during init DOM.
	     * @type HTMLElement
	     */
	    this._referenceDomNode = null;
	    
	    /**
	     * The callback object containing all callbacks
	     * @type object
	     */
	    this.callbacks = {};
	    /**
	     * The CSS prefix that can be apply
	     * @type string
	     */
	    this.cssPrefix = "w_completion_";
	    
	    /**
	     * The CSS border size value of the completion DOM node
	     * @type integer
	     */
	    this.borderSize = 1;
	    
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
	
	wink.plugins.completion.manager.dom.SimpleDomManager.prototype = 
	{
	    /**
	     * start the manager
	     * by checking the ready state
	     * and initializing the DOM
	     * 
	     * @returns boolean
	     */
	    start: function()
	    {
	        // Check the manager ready state
	        if (!this._ready)
	        {
	            //wink.log("[SimpleDomManager] Configuration failed");
	            return false;
	        }
	
	        // start all modules
	        if (!this._helper.startModules(this._modules))
	        {
	            //wink.log("[SimpleDomManager] Module could not be started");
	            return false;
	        }
	        
	        // Initialize the DOM
	        if (!this._initDom())
	        {
	            //wink.log("[SimpleDomManager] DOM Initialization failed");
	            return false;
	        }
	        
	        return true;
	    },
	
	    /**
	     * stop the manager
	     */
	    stop: function()
	    {
	        this.hideDomNode();
	        return true;
	    },
	    
	    /**
	     * Initalize the DOM of the completion
	     * Use directly a given completion box
	     * or create it with a parent reference
	     * 
	     */
	    _initDom: function()
	    {
	        // Destroy the position reference if already exist (we have to recreate it)
	        if (this._referenceDomNode)
	            this._referenceDomNode.parentNode.removeChild(this._referenceDomNode);
	        
	        // If the div is already given, or already existing, save it directly as attribute
	        if (this.domNode) {
	            
	            // Just add the CSS style
	            wink.addClass(this.domNode, this.cssPrefix + "box");
	            this._referenceDomNode = null;
	            
	            // Hide the div 
	            this.domNode.style.visibility = 'hidden';
	            this.domNode.style.display = 'none';
	            
	            return true;
	        }
	        
	        // Create the reference DIV with its CSS classname
	        this._referenceDomNode = document.createElement('div');
	        wink.addClass(this._referenceDomNode, this.cssPrefix + "reference");
	        
	        // Put the positionReference before the input field
	        this._component.input.parentNode.insertBefore(this._referenceDomNode, this._component.input.parentNode.firstChild);
	        
	        // Create the parent of the completion div that will be used to retrieve
	        // global size like height, width, top and left
	        var domNodeContainer = document.createElement('div');
	        wink.addClass(domNodeContainer, this.cssPrefix + "container");
	        
	        // Put the container in the reference
	        this._referenceDomNode.appendChild(domNodeContainer);
	
	        // Create the completion box
	        this.domNode = document.createElement('div');
	
	        // Force the hide of the completion DOM node
	        this.domNode.style.visibility   = 'hidden';
	        this.domNode.style.display      = 'none';
	
	        // Add the CSS style of the completion DOM node
	        wink.addClass(this.domNode, this.cssPrefix + "box");
	
	        // Then append the completion DOM node in its container
	        domNodeContainer.appendChild(this.domNode);
	        
	        // Update the size and the position of completion box
	        this.updatePositions();
	        
	        // Subscribe to orientation change update
	        wink.subscribe('/window/events/resize', { context: this, method: 'updatePositions' });
	        
	        return true;
	    },
	    
	    /**
	     * Update the size and the position 
	     * of the completion box
	     * 
	     */
	    updatePositions: function()
	    {
	    	this.domNode.style.width = (this._component.input.offsetWidth - 2 * this.borderSize) + 'px';    
	    	this.domNode.parentNode.style.top = 0;
            this.domNode.parentNode.style.left = 0;
	    	this.domNode.parentNode.style.top = (this._component.input.offsetHeight + wink.getTopPosition(this._component.input) - wink.getTopPosition(this.domNode.parentNode)) + 'px';
	        this.domNode.parentNode.style.left = (wink.getLeftPosition(this._component.input) - wink.getLeftPosition(this.domNode.parentNode)) + 'px';
	    },
	    
	    /**
	     * Return the completion DOM node
	     * 
	     * @returns HTMLElement
	     */
	    getDomNode: function()
	    {
	        return this.domNode;
	    },
	    
	    /**
	     * Show the DOM node
	     * Call the show callback if exist
	     */
	    showDomNode: function()
	    {
	        // Check the completion DOM node
	        if (!this.domNode)
	            return;
	        
	        // Check that the completion div is actually visible
	        if (this.domNode.style.visibility == "visible")
	            return;
	        
	        // Call the callback after hiding the completion
	        if (this.callbacks && this.callbacks.show && wink.isCallback(this.callbacks.show))
	            wink.call(this.callbacks.show);
	        
	        this.domNode.style.display    = "block";
	        this.domNode.style.visibility = "visible";
	    },
	
	    /**
	     * Hide the completion DOM node
	     * Call the hide callback if exist
	     */
	    hideDomNode: function()
	    {
	        // Check the completion DOM node
	        if (!this.domNode)
	            return;
	        
	        // Check that the completion div is actually visible
	        if (this.domNode.style.visibility == "hidden")
	            return;
	        
	        // Call the callback after hidding the completion
	        if (this.callbacks && this.callbacks.hide && wink.isCallback(this.callbacks.hide))
	            wink.call(this.callbacks.hide);
	        
	        this.domNode.style.display    = "none";
	        this.domNode.style.visibility = "hidden";
	    },
	    
	    
	    /**
	     * Construct the DOM content
	     * using the component suggestions
	     * 
	     */
	    buildDomNode: function()
	    {
	        // Reset the DOM node
	        this.domNode.innerHTML = "";
	        
	        // Reset the suggestion DOM nodes
	        this._suggestionDomNodes = [];
	        
	        // Process all suggestion
	        this._processDomSuggestions();
	        
	        // Display the completion node
	        this.showDomNode();
	    },
	
	    /**
	     * Loop on each suggestion
	     * and build the DOM suggestion
	     */
	    _processDomSuggestions: function()
	    {
	        for(var i = 0 ; i < this._component.getSuggestions().length ; i++)
	        {
	            // Create a new suggestion DOM node and store it
	            var currentSuggestion = this._component.getSuggestion(i),
	            currentSuggestionNode = this._suggestionDomNodes[i] = document.createElement("div");
	            
	            wink.addClass(currentSuggestionNode, this.cssPrefix + "suggestion");
	            
	            var type = currentSuggestion.type;
	            wink.addClass(currentSuggestionNode, type);
	            
	            if(currentSuggestion.fromHistory)
	            {
	            	wink.addClass(currentSuggestionNode, "history");
	            }	
	            
	            if(this._modules[type] && this._modules[type].processSuggestion)
	            {
	            	this._modules[type].processSuggestion(currentSuggestion, currentSuggestionNode);
	            }
	            else
	            {
	            	this._helper.getDefaultModule(this).processSuggestion(currentSuggestion, currentSuggestionNode);
	            }
	            
	            // Append listeners on the new suggestion DOM node
	            this._component.getManager('event').addMouseEventListenersOnNewSuggestion(i, currentSuggestionNode);
	            
	            // Finally append the suggestion
	            this.domNode.appendChild(currentSuggestionNode);
	        }
	    },
	    
	    /**
	     * Return the suggestion DOM node
	     * specified by the index
	     * 
	     * @param integer index the suggestion DOM node index
	     * 
	     * @returns HTMLElement
	     */
	    getSuggestionDomNode: function(index)
	    {
	        return this._suggestionDomNodes[index];
	    },
	    
	    /**
	     * Highlight the specified suggestion DOM node
	     * 
	     * @param integer index Index of the suggestion to highlight
	     */
	    highlight: function(index)
	    {
	        wink.addClass(this._suggestionDomNodes[index], "highlighted");
	    },
	    
	    /**
	     * Unhighlight all suggestions DOM nodes
	     */
	    unhighlight: function()
	    {
	        for (var i = 0 ; i < this._suggestionDomNodes.length ; i++)
	            wink.removeClass(this._suggestionDomNodes[i], "highlighted");
	    }
	    
	};
});