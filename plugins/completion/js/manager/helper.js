/*--------------------------------------------------------
 * Copyright (c) 2011, The Dojo Foundation
 * This software is distributed under the "Simplified BSD license",
 * the text of which is available at http://www.winktoolkit.org/licence.txt
 * or see the "license.txt" file for more details.
 *--------------------------------------------------------*/

/**
 * A Manager Helper that handle all specific manager's common process
 *  
 * @winkVersion 1.4
 *  
 * @compatibility iOS2, iOS3, iOS4, Android 1.5, Android 2.1, Android 2.2, Android 2.3, Android 3.0, Android 3.1, Android 4.0, BlackBerry 6, BlackBerry 7
 * 
 * @author Guillaume WINTZER, Mathieu FABRE
 */

define(['../../../../_amd/core'], function(wink)
{
	/**
	 * Completion Manager Helper
	 *
	 * This javascript contain a set of general function
	 * that is used by the completion managers 
	 * in order to merge common functions
	 */
	wink.plugins.completion.manager.ManagerHelper =
	{
	    /**
	     * The default key name
	     * @type string
	     */
	    _defaultKeyName: "default",
	    
	    /**
	     * Create the default module and
	     * check for additionnal modules creation
	     * in the namespace of the manager type
	     * wink.plugins.completion.module.TYPE
	     * 
	     * @param Manager manager
	     * @param string managerType The type of manager : dom, data or event
	     * 
	     * @returns boolean Status of modules initialization
	     */
	    createModules: function(manager, managerType)
	    {
	        // Set empty modules properties if not exists
	        if (!wink.isSet(manager.modules))
	            manager.modules = {};
	
	        // Loop on the other included modules
	        for(var name in wink.plugins.completion.module[managerType])
	        {
	            // Extract the module type from the classname
	            var moduleType = wink.plugins.completion.tools.lcFirst(name.replace(wink.plugins.completion.tools.ucFirst(managerType) + "Module", ""));
	            
	            // Initialize properties of the module
	            properties = {};
	            if (manager.modules[moduleType]) {
	                properties = manager.modules[moduleType];
	            }
	            
	            // Create, initialize and store the module
	            var module = new wink.plugins.completion.module[managerType][name](properties);
	            this.addModule(manager, module, moduleType);
	        }
	        
	        return true;
	    },
	    
	    /**
	     * Try to start each module if a start function exists
	     * and return false if one module fail
	     * 
	     * @param string managerModules The list of module to start
	     * 
	     * @returns boolean 
	     */
	    startModules: function(managerModules)
	    {
	        for(var name in managerModules)
	        {
	            var module = managerModules[name];
	            if (module.start && !module.start())
	                return false;
	        }
	        
	        return true;
	    },
	    
	    /**
	     * Add a new module in the module list
	     * of the specified manager
	     * 
	     *  @param Manager manager
	     *  @param Module moduleInstance
	     */
	    addModule: function(manager, moduleInstance, type)
	    {
	        manager._modules[type]              = moduleInstance;
	        manager._modules[type]._type        = type;
	        manager._modules[type]._manager     = manager;
	        manager._modules[type]._component   = manager._component;
	        manager._modules[type]._helper      = manager._helper;
	    },
	    
	    /**
	     * Return the default module
	     * of the specified manager
	     * 
	     * @returns Module
	     */
	    getDefaultModule: function(manager)
	    {
	        if (manager._modules[this._defaultKeyName])
	            return manager._modules[this._defaultKeyName];
	        
	        //wink.log("[ManagerHelper] No default module for manager " + manager.type);
	        return null;
	    },
	    
	    /**
	     * Get the type of the module
	     * 
	     * @param Module moduleInstance The module instance
	     * 
	     * @returns string
	     */
	    getModuleType: function(moduleInstance)
	    {
	        if (!moduleInstance._type)
	            return this._defaultKeyName;
	        
	        return moduleInstance._type;        
	    },
	    
	    /**
	     * Check the type of suggestion index and compare it 
	     * to the internal module type
	     * 
	     * @param Module moduleInstance The module instance
	     * @param integer suggestionIndex The suggestion index
	     * 
	     * @returns boolean
	     */
	    isModuleType: function(moduleInstance, suggestion)
	    {
	        var typeValue = suggestion.type;
	        
	        if (!typeValue)
	            typeValue = this._defaultKeyName;
	        
	        return (typeValue == moduleInstance._type);
	    }
	};
});