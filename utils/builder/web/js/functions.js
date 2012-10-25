/**
 * Just some custom generics helpers
 * 
 */
(function() {
    Vinke = window.Vinke || {};
    
    /**
     * Loop through an array
     * 
     * @param data
     * @param cb
     */
    Vinke.each = function(data, cb) {
        for(var k in data) {
            if (data.hasOwnProperty(k)) {
                cb(data[k], k);
            }
        }
    };
    
    /**
     * Get the dom parent node
     * 
     * @param elem
     * @param [target]
     * @return domObject or null
     */
    Vinke.getParent = function(elem, target) 
    {
        if(target == null)
            return elem.parentNode;
        
        var elem_name = target,
        attr_name = null, attr_value = null, 
        compare_type = null,
        match_val = target.match(/\[.+[^\[\]]\]$/i);
        
        if(match_val != null) 
        {
            elem_name = elem_name.replace(match_val[0], '');
            
            var expr = match_val[0].substr(1, match_val[0].length-2),
            tmp = expr.split('=');
            
            attr_name = tmp[0];
            if(tmp.length == 2) 
            {
                attr_value = tmp[1].toLowerCase();
                attr_value = attr_value.replace(/(\'|\")+/ig, '');
            
                if(attr_name.match(/\^$/))
                    compare_type = 'begin';
                else if(attr_name.match(/\*$/))
                    compare_type = 'all';
                else if(attr_name.match(/\$$/))
                    compare_type = 'end';
                else
                    compare_type = 'simple';
                
                if(compare_type != 'simple')
                    attr_name = attr_name.substr(0, attr_name.length-1);
            }
        }
        
        var parent = elem.parentNode;
        
        do 
        {
            if(parent.nodeName.toUpperCase() == elem_name.toUpperCase())
            {
                if(attr_name != null) 
                {
                    var attribute = parent.getAttribute(attr_name).toLowerCase();
                    if(attribute != null && attribute != '') 
                    {
                        if(attr_value == null)
                            return parent;
                        
                        if(compare_type == 'simple' && attribute == attr_value)
                            return parent;
                        if(compare_type == 'begin' && attribute.match(eval('/^'+attr_value+'/ig')))
                            return parent;
                        if(compare_type == 'end' && attribute.match(eval('/'+attr_value+'$/ig')))
                            return parent;
                        if(compare_type == 'all' && attribute.match(eval('/'+attr_value+'/ig')))
                            return parent;
                    }
                } else {
                    return parent;
                }
            }
            
            parent = parent.parentNode;
        } 
        while(parent != null);
        
        return null;
    };
    
    /**
     * Get all specific parents for a node 
     * 
     * @param elem
     * @param [target]
     * @return array
     */
    Vinke.getParents = function(elem, target)
    {
        var parents = [];
        
        var parent = this.getParent(elem, target);
        while(parent != null) {
            parents.push(parent);
            parent = this.getParent(parent, target);
        }
        
        return parents;
    };
    
    /**
     * Transform an object in array
     * 
     * @param object
     * @return array
     */
    Vinke.toArray = function(object) {
        if(object instanceof Array)
            return object;
        
        var arr = new Array();
        this.each(object, function(v, k) {
            arr.push(v);
        });
        return arr;
    };
    
    /**
     * Add Event to a dom node
     * 
     * @param node
     * @param type
     * @param listener
     * @return domObject
     */
    Vinke.addEvent = function(node, type, listener) {
        if(window.attachEvent) {
            node.attachEvent("on"+type, listener, false);
        } else if(window.addEventListener) {
            node.addEventListener(type, listener, false);
        }
        return node;
    };
    
    return Vinke;
})();


/**
 * Called just before that the ajax query send
 * 
 */
function onLoadingSave()
{
    var flash_node = wink.byId('flash');
    flash_node.style.display = 'block';

    wink.query('div.loader', flash_node)[0].style.display = 'block';
    wink.query('div.result', flash_node)[0].style.display = 'none';

    hide_error();

    window.location.href = "#main_content";
}

/**
 * Called on the result save
 * 
 * @param result
 */
function onSuccessSave(result)
{
    var data = wink.parseJSON(result.xhrObject.response);

    if(data.status == 'fail') {
        wink.byId('flash').style.display = 'none';
        display_error(data.result.message);
    }
    else
        display_result(data.result);
}

/**
 * Display the build result
 * 
 * @param result
 */
function display_result(result)
{
    var ul = wink.byId('source_files');
    ul.innerHTML = '';
    Vinke.each(result.filenames, function(v) {
        ul.innerHTML += '<li>'+v+'</li>';
    });

    var button_zip = wink.byId('dl');
    Vinke.addEvent(button_zip, 'click', function() {
        window.location.href = './src/procs/dl.php?id='+result.guid;
    });

    var flashNode = wink.byId('flash');
    wink.query('div[class="loader"]', flashNode)[0].style.display = 'none';
    wink.query('div[class="result"]', flashNode)[0].style.display = 'block';
}

/**
 * Build the dom level tree for the wink modules
 * 
 * @param modules
 * @param container
 */
function buildDomLevels(modules, container)
{
    var main_ul = document.createElement('ul');
    main_ul.id = 'list';
    container.innerHTML = '';
    container.appendChild(main_ul);

    // Create publish/subscribes event for call event easyli and
    // because there is a bug with firefox for get the event on the call function
    // elem.click()
    wink.subscribe('/event/check/input', _checkInput);
    wink.subscribe('/event/check/children', _checkChildren);
    wink.subscribe('/event/check/parents',  _checkParents);
    wink.subscribe('/event/check/dependencies', _checkDependencies);

    wink.subscribe('/event/uncheck/input', _uncheckInput);
    wink.subscribe('/event/uncheck/children', _uncheckChildren);
    wink.subscribe('/event/uncheck/parents',  _uncheckParents);
    wink.subscribe('/event/uncheck/dependencies', _uncheckDependencies);

    // Build the dom tree
    Vinke.each(modules, function(module) 
    {
        var ul_parent = main_ul;
        if(wink.isSet(module.parent))
            ul_parent = createParentUl(module.parent);

        createLiItem(module.name, ul_parent, modules);
    });

    // Sort the item by name
    sortItemList(main_ul);
}

/**
 * Create and return a dom object "li" for a module
 * 
 * @param name
 * @param ul_parent
 * @param modules
 * @return li
 */
function createLiItem(name, ul_parent, modules)
{
    var checkbox = document.createElement("input");    
    checkbox.type = "checkbox";
    checkbox.name = "module[]";
    checkbox.value = name;
    checkbox.onclick = function(evt) 
    {
        var e = evt||window.event;

        // Publish event
        var type = (e.target.checked) ? 'check' : 'uncheck';
        wink.publish('/event/'+type+'/input', [name, modules]);
    };

    var label = document.createElement("label");
    label.innerHTML = name;

    var li = document.createElement("li");
    li.id = 'li_'+name;
    li.className = 'checkable';
    li.appendChild(checkbox);
    li.appendChild(label);
    ul_parent.appendChild(li);

    return li;
}

/**
 * Create and return a dom object "ul" for a category module
 * @param parentName
 * @return ul
 */
function createParentUl(parentName)
{
    var ul = wink.byId("group_"+parentName);
    if(wink.isNull(ul)) {
        ul = document.createElement("ul");
        ul.id = "group_"+parentName;
    }

    var li_parent = wink.byId('li_'+parentName);
    li_parent.appendChild(ul);
    return ul;
}

/**
 * Sort an item list
 * 
 * @param ulParent
 */
function sortItemList(ulParent)
{
    var elems = ulParent.childNodes;

    for(var j=0, l2 = elems.length; j<l2; j++) {
        if(elems[j].lastChild.nodeName.toUpperCase() == 'UL') {
            sortItemList(elems[j].lastChild);
        }
    }

    elems = Vinke.toArray(elems);
    elems.sort(function (a, b) {
        if(a.id == 'li_core') // Exception the core is in the top
            return -1;
        return (a.id < b.id) ? -1 : ((a.id > b.id) || a.id == null ? 1 : 0);
    });

    ulParent.innerHTML = '';
    for(var i=0, l=elems.length; i<l; i++) {
        // test condition for bug chrome
        if(elems[i].nodeName && elems[i].nodeName.toUpperCase() != 'UL') {
            ulParent.appendChild(elems[i]);
        }
    }
}

/**
 * Lock a checkbox and create input hidden with the value
 * 
 * @param checkbox
 */
function lockItem(checkbox)
{
    // Check if input hidden existed
    if(wink.query('input[type="hidden"]', checkbox.parentNode).length > 0)
        return;
    
    checkbox.disabled = true;
    var inputHidden = document.createElement('input');
    inputHidden.type = 'hidden';
    inputHidden.name = checkbox.name;
    inputHidden.value = checkbox.value;
    checkbox.parentNode.appendChild(inputHidden);

}

/**
 * Unlock a checkbox and remove the input hidden
 * 
 * @param checkbox
 */
function unlockItem(checkbox)
{
    checkbox.disabled = false;
    var inputHidden = wink.query('input[type="hidden"]', checkbox.parentNode)[0];
    if(wink.isSet(inputHidden))
        inputHidden.parentNode.removeChild(inputHidden);
}

/**
 * Display an error message
 * @param msg
 */
function display_error(msg) {
    wink.byId('error').innerHTML = msg;
    wink.byId('error').style.display = 'block';
}

/**
* Hide the error message
*/
function hide_error() {
    wink.byId('error').innerHTML = '';
    wink.byId('error').style.display = 'none';
}

/**
 * Publish events when a module is checked
 * 
 * @param name
 * @param modules
 */
function _checkInput(name, modules)
{
    wink.publish('/event/check/children', [name]);
    wink.publish('/event/check/parents', [name]);
    wink.publish('/event/check/dependencies', [name, modules]);
}

/**
 * Publish events when a module is unchecked
 * 
 * @param name
 * @param modules
 */
function _uncheckInput(name, modules)
{
    wink.publish('/event/uncheck/children', [name]);
    wink.publish('/event/uncheck/parents', [name]);
    wink.publish('/event/uncheck/dependencies', [name, modules]);
}

/**
 * Check all children for a module
 * 
 * @param name
 */
function _checkChildren(name) {
    var li = wink.byId('li_'+name);
    var list_checkbox = wink.query('input[type="checkbox"]', li);
    Vinke.each(list_checkbox, function(checkbox) {
        if(checkbox.type == 'checkbox')
            checkbox.checked = true;
    });   
}

/**
 * Check all parents for a module
 * 
 * @param name
 */
function _checkParents(name)
{
    var li = wink.byId('li_'+name);
    var parents = Vinke.getParents(li, 'ul[id^="group_"]');
    Vinke.each(parents, function(parent) {
        var li_parent = Vinke.getParent(parent);
        list_checkbox = wink.query('input[type="checkbox"]', li_parent);
        list_checkbox[0].checked = true;
    });
}

/**
 * Check all dependencies for a module
 * 
 * @param name
 * @param modules
 */
function _checkDependencies(name, modules)
{   
    var module = modules[name],
    dependencies = module.requirements;

    if(wink.isUndefined(dependencies) 
        || dependencies.length == 0)
        return;

    Vinke.each(dependencies, function(moduleName) {
        var checkbox = wink.byId('li_'+moduleName).firstChild;
        checkbox.checked = true;
        lockItem(checkbox);

        // Recursively
        wink.publish('/event/check/children', [moduleName]);
        wink.publish('/event/check/parents', [moduleName]);
        wink.publish('/event/check/dependencies', [moduleName, modules]);
    });
}

/**
 * Uncheck all children for a module
 * 
 * @param name
 */
function _uncheckChildren(name) {
    var li = wink.byId('li_'+name);
    var list_checkbox = wink.query('input[type="checkbox"]', li);
    Vinke.each(list_checkbox, function(checkbox) {
        if(checkbox.type == 'checkbox')
            checkbox.checked = false;
    });
}

/**
 * Uncheck all parents for a module and if parents
 * have not children checked
 * 
 * @param name
 */
function _uncheckParents(name) {
    var li = wink.byId('li_'+name);
    var parents = Vinke.getParents(li, 'ul[id^="group_"]');
    Vinke.each(parents, function(parent) {
        list_checkbox = wink.query('input[type="checkbox"]', parent);

        var to_uncheck = true;
        for(var i=0, l=list_checkbox.length; i<l && to_uncheck; i++) {
            if(list_checkbox[i].checked == true)
                to_uncheck = false;
        }

        var checkbox = Vinke.getParent(parent, 'li').firstChild;
        checkbox.checked = !to_uncheck;
    });
}

/**
 * Uncheck all dependencies for a module
 * 
 * @param name
 * @param modules
 */
function _uncheckDependencies(name, modules)
{
    var module = modules[name],
    dependencies = module.requirements;

    if(wink.isUndefined(dependencies) 
        || dependencies.length == 0)
        return;

    Vinke.each(dependencies, function(moduleName) {
        var checkbox = wink.byId('li_'+moduleName).firstChild;
        unlockItem(checkbox);
    });
}

