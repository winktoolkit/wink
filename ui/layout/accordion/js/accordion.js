/*--------------------------------------------------------
 * Copyright (c) 2011, The Dojo Foundation
 * This software is distributed under the "Simplified BSD license",
 * the text of which is available at http://www.winktoolkit.org/licence.txt
 * or see the "license.txt" file for more details.
 *--------------------------------------------------------*/

/**
 * @fileOverview Implement an accordion container. Creates an accordion container with sliding sections
 * 
 * @author Jerome GIRAUD
 */
define(['../../../../_amd/core'], function(wink)
{
	/**
	 * @class Implement an accordion container. Creates an accordion container with sliding sections.
	 * The Accordion is instantiated without parameters. Use the 'getDomNode' method to add it to the page. Use the 'addSection' method to add a new section to the Accordion
	 * 
	 * @example 
	 * 
	 * accordion = new wink.ui.layout.Accordion();
	 * 
	 * section1 = accordion.addSection('id1', '&lt;b&gt;section1&lt;/b&gt;');
	 * section2 = accordion.addSection('id2', '&lt;b&gt;section2&lt;/b&gt;');
	 * section3 = accordion.addSection('id3', '&lt;b&gt;section3&lt;/b&gt;');
	 * 
	 * wink.byId('output').appendChild(accordion.getDomNode());
	 * 
	 * @compatibility Iphone OS2, Iphone OS3, Iphone OS4, Android 1.1, Android 1.5, Android 2.1, Android 2.2, Android 2.3, Android 3.0, Android 3.1, Android 4.0, BlackBerry 6, BlackBerry 7, Bada 1.0, Windows Phone 7.5
	 * 
	 * @see <a href="WINK_ROOT_URL/ui/layout/accordion/layout/test/test_accordion_1.html" target="_blank">Test page</a>
	 * @see <a href="WINK_ROOT_URL/ui/layout/accordion/layout/test/test_accordion_2.html" target="_blank">Test page (advanced)</a>
	 */
	wink.ui.layout.Accordion = function(properties)
	{
		/**
		 * Unique identifier
		 * 
		 * @property uId
		 * @type integer
		 */
		this.uId                  = wink.getUId();
		
		/**
		 * Display one or more panels at the same time
		 * 
		 * @property openMultipleSections
		 * @type boolean
		 */
		this.openMultipleSections = false;  
		
		/**
		 * Scroll automatically one a section is being opened
		 * 
		 * @property autoScroll
		 * @type boolean
		 */
		this.autoScroll           = true;
		
		this._sectionsList        = [];
		
		this._selectedSection     = 0;
		this._height              = 0;
		this._visibleContent      = 0;
		
		this._animated            = false;
		
		this._domNode             = null;

		wink.mixin(this, properties);
		
		if (this._validateProperties() === false) return;
		
		this._initDom();
	};
	
	wink.ui.layout.Accordion.prototype = 
	{
		DURATION: 500,
		
		/**
		 * Add a new section to the accordion and return the uId of the created section
		 * 
		 * @param {string} title The title of the section
		 * @param {string|HTMLElement} content The content of the section. It can be either a string or a DOM node
		 * 
		 * @returns {integer} added section id
		 */
		addSection: function(title, content)
		{
			var section = new wink.ui.layout.Accordion.Section({'title': title, 'content': content, 'position': this._sectionsList.length, 'accordion': this});
			
			this._sectionsList.push(section);
			
			this._domNode.appendChild(section.containerNode);
			
			this._updateHeight();

			return section.uId;
		},
	
		/**
		 * Removes an existing section of the accordion
		 * 
		 * @param {integer} sectionId The uId of the section object to remove
		 */
		deleteSection: function(sectionId)
		{
			var f = -1;
			var p = -1;
			var q = -1;
			var l = this._sectionsList.length;
			var uid;
			
			for (var i = 0; i < l; i++) 
			{
				if ( f ==1 )
				{
					this._sectionsList[i].position = i-1;
				}
				
				if ( this._sectionsList[i].uId == this._selectedSection )
				{
					q = i;
				}
	
				if ( this._sectionsList[i].uId == sectionId )
				{
					f = 1;
					p = i;
	
					this._domNode.removeChild(this._sectionsList[i].containerNode);
					
					if (this._sectionsList[i].uId == this._selectedSection)
					{ 
						if (i > 0) 
						{
							uid = this._sectionsList[i - 1].uId;
						} else 
						{
							uid = this._sectionsList[0].uId;
						}
					}
				}
			}
			
			if ( p != -1 )
			{	
				this._sectionsList.splice(p, 1);
			}
			
			this._updateHeight();
			
			this.selectSection(uid);
		},
	
		/**
		 * Display the selected section
		 * 
		 * @param {integer} sectionId The uId of the section to select
		 */
		selectSection: function(sectionId)
		{
			var l = this._sectionsList.length;
			var f = -1;
			this._visibleContent = 0;
			
			for ( var i = 0 ; i < l ; i++)
			{
				if (this._sectionsList[i].uId == sectionId) 
				{
					f = i;
					
					this._sectionsList[i].show(this._visibleContent);
					this._selectedSection = sectionId;
					
					if ( this._sectionsList[i].opened == true )
					{
						this._visibleContent += this._sectionsList[i].contentNode.scrollHeight; 
					}
					
				} else
				{
					this._sectionsList[i].hide(this._visibleContent);
					
					if ( this.openMultipleSections && this._sectionsList[i].opened == true )
					{
						this._visibleContent += this._sectionsList[i].contentNode.scrollHeight; 
					}
				}
			}

			if ( !this._animated )
			{
				wink.fx.applyTransition(this._domNode, 'height', this.DURATION + 'ms', '', 'ease-in-out');
				this._animated = true;
			}
			
			this._updateHeight();
		},
		
		/**
		 * Refreshes the section content height
		 */
		refreshContentHeight: function()
		{
			this.selectSection(this._selectedSection);
		},
	
		/**
		 * Returns the DOM node containing the accordion
		 */
		getDomNode: function()
		{
			return this._domNode;
		},
		
		/**
		 * Returns the sections
		 */
		getSections: function()
		{
			return this._sectionsList;
		},
		
		/**
		 * Update the accordion's height
		 */
		_updateHeight: function()
		{
			var h = 0;
			var l = this._sectionsList.length;
			
			for ( var i=0; i<l; i++ )
			{
				if ( this._sectionsList[i].contentNode.offsetHeight != 0 )
				{
					h += this._sectionsList[i].titleNode.offsetHeight;
				} else
				{
					h += this._sectionsList[i].TITLE_HEIGHT;
				}
			}
			
			this._height = h + this._visibleContent;
			this._domNode.style.height = this._height + 'px';
		},
	
		/**
		 * Select a section
		 * 
		 * @param {integer} id the id of the selected section
		 */
		_selectSection: function(id)
		{
			this.selectSection(id);
		},
	
		/**
		 * Initialize the Accordion node
		 */
		_initDom: function()
		{
			this._domNode = document.createElement('div');
			this._domNode.className = 'w_list w_border_top ac_accordion';
		},
		
		/**
		 * Validate the properties of the component
		 * @returns {boolean} True if the properties are valid, false otherwise
		 */
		_validateProperties: function()
		{
			if ( !wink.isBoolean(this.openMultipleSections) )
			{
				wink.log('[Accordion] openMultipleSections parameter must be a boolean');
				return false;
			}
			
			if ( !wink.isBoolean(this.autoScroll) )
			{
				wink.log('[Accordion] autoScroll parameter must be a boolean');
				return false;
			}
		}
	};
	
	/**
	 * @class Implement a section of an Accordion
	 * Represents a section of the accordion. Handle the clicks on its title node. Should only be instantiated by the Accordion itself
	 * 
	 * @param {object} properties The properties object
	 * @param {string} properties.title Title of the section
	 * @param {string|HTMLElement} properties.content Content of the section. It can be either a string or a DOM node
	 * @param {integer} properties.position The position of the section
	 * @param {wink.ui.layout.Accordion} properties.accordion The parent accordion
	 */
	wink.ui.layout.Accordion.Section = function(properties)
	{
		/**
		 * Unique identifier
		 * 
		 * @property uId
		 * @type integer
		 */
		this.uId           = wink.getUId();
		
		/**
		 * The title of the section
		 * 
		 * @property title
		 * @type string
		 */
		this.title         = properties.title;
		
		/**
		 * The content of the section
		 * 
		 * @property content
		 * @type string|HTMLElement
		 */
		this.content       = properties.content;
		
		/**
		 * The position of the section in the list of sections
		 * 
		 * @property position
		 * @type integer
		 */
		this.position      = properties.position;
		
		/**
		 * Indicates whether the section is opened or closed
		 * 
		 * @property opened
		 * @type boolean
		 */
		this.opened        = false;
		
		this.DURATION      = 500;
		this.HIGHER_INDEX  = 999;
		this.TITLE_HEIGHT  = 44;
		
		/**
		 * Unique identifier
		 * 
		 * @property titleNode
		 * @type integer
		 */
		this.titleNode     = null;
		
		/**
		 * The DOM node where the chevron is set
		 * 
		 * @property chevronNode
		 * @type HTMLElement
		 */
		this.chevronNode   = null;
		
		/**
		 * The DOM node where the content is set
		 * 
		 * @property contentNode
		 * @type HTMLElement
		 */
		this.contentNode   = null;
		
		/**
		 * The main DOM node of the section
		 * 
		 * @property containerNode
		 * @type HTMLElement
		 */
		this.containerNode = null;
		
		this._accordion    = properties.accordion;
		
		
		if  ( this._validateProperties() ===  false )return;
		
		this._initDom();
	};
	
	/**
	 * The event is fired when we click on a section title node
	 * 
	 * @name wink.ui.layout.Accordion.Section#/section/events/selectsection
	 * @event
	 * @param {object} param The parameters object
	 * @param {integer} param.sectionId uId of the selected section
	 */
	
	wink.ui.layout.Accordion.Section.prototype =
	{	
		/**
		 * Display the section
		 */
		show: function(position)
		{
			wink.fx.translate(this.containerNode, 0, position);
			wink.fx.rotate(this.chevronNode, 0);
			
			if(wink.has('css-transition') && this._accordion.autoScroll)
			{
				wink.fx.onTransitionEnd(this.contentNode, wink.bind(this._scroll, this));
			}
			
			if ( this.opened === false )
			{
				wink.fx.translate(this.contentNode, 0, this.contentNode.scrollHeight);
				wink.fx.rotate(this.chevronNode, 90);
				this.opened = true;
			} else
			{
				wink.fx.translate(this.contentNode, 0, 0);
				wink.fx.rotate(this.chevronNode, 0);
				this.opened = false;
			}
			
			if(!wink.has('css-transition') && this._accordion.autoScroll)
			{
				this._scroll();
			}
		},
	
		/**
		 * Hide the section
		 * 
		 * @param {integer} position The position
		 */
		hide: function(position)
		{
			wink.fx.translate(this.containerNode, 0, position);
			
			if ( !this._accordion.openMultipleSections )
			{
				this.opened = false;
				wink.fx.translate(this.contentNode, 0, 0);
				wink.fx.rotate(this.chevronNode, 0);
			}
		},
		
		/**
		 * Auto scroll after a section opened
		 */
		_scroll: function()
		{
			this._accordion._updateHeight();
			
			scrollTo(0, wink.getTopPosition(this.titleNode, null, true));
		},
		
		/**
		 * Validate the properties of the component
		 * @returns {boolean} True if the properties are valid, false otherwise
		 */
		_validateProperties: function()
		{
			if ( this.title == '' || wink.isUndefined(this.title) || !wink.isString(this.title) )
			{
				wink.log('[Accordion] The title must be a string and must not be empty');
				return false;
			}
		},
	
		/**
		 * Initialize the Accordion node
		 */
		_initDom: function()
		{
			this.containerNode = document.createElement('div');
			this.containerNode.className = 'ac_section';
			
			this.containerNode.style.zIndex = this.HIGHER_INDEX - this.position;
			
			wink.fx.translate(this.containerNode, 0, 0);
			
			if(wink.has('css-transition'))
			{
				wink.fx.applyTransformTransition(this.containerNode, this.DURATION + 'ms', '', 'ease-in-out');
			}
			
			this.contentNode = document.createElement('div');
			this.contentNode.className = 'w_bloc w_box w_border ac_content';
			
			wink.fx.translate(this.contentNode, 0, 0);
			
			if(wink.has('css-transition'))
			{
				wink.fx.applyTransformTransition(this.contentNode, this.DURATION + 'ms', '', 'ease-in-out');
			}
			
			if ( wink.isString(this.content) )
			{
				this.contentNode.innerHTML = this.content;
			} else
			{
				this.contentNode.innerHTML = '';
				this.contentNode.appendChild(this.content);
			}
			
			this.titleNode = document.createElement('div');
			wink.fx.translate(this.titleNode, 0, 0);
			this.titleNode.innerHTML = this.title;
			this.titleNode.className = 'w_box w_list_item w_no_wrap w_border_bottom w_border_left w_border_right w_bg_light ac_title';
			
			this.titleNode.onclick = wink.bind(function()
			{
				this._accordion._selectSection(this.uId);
				
				wink.publish('/section/events/selectsection', {sectionId: this.uId, accordionId: this._accordion.uId});
			}, this);
			
			this.chevronNode = document.createElement('div');
			this.chevronNode.className = 'w_icon w_chevron';
			
			wink.fx.rotate(this.chevronNode, 0);
			
			wink.fx.applyTransformTransition(this.chevronNode, this.DURATION + 'ms', '', 'ease-in-out');
			
			this.titleNode.appendChild(this.chevronNode);
			
			this.containerNode.appendChild(this.titleNode);
			this.containerNode.appendChild(this.contentNode);
		}
	};
	
	return wink.ui.layout.Accordion;
});