/*--------------------------------------------------------
 * Copyright (c) 2011, The Dojo Foundation
 * This software is distributed under the "Simplified BSD license",
 * the text of which is available at http://www.winktoolkit.org/licence.txt
 * or see the "license.txt" file for more details.
 *--------------------------------------------------------*/

/**
 * @fileOverview Implement an accordion container. Creates an accordion container with sliding sections
 * 
 * @compatibility Iphone OS2, Iphone OS3, Iphone OS4, Android 1.1, Android 1.5, Android 2.1, Android 2.2, Android 2.3, Android 3.0, Android 3.1, BlackBerry 6, BlackBerry 7, Bada 1.0, Windows Phone 7.5
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
	 * $('output').appendChild(accordion.getDomNode());
	 * 
	 * @see <a href="WINK_ROOT_URL/ui/accordion/layout/test/test_accordion_1.html" target="_blank">Test page</a>
	 * @see <a href="WINK_ROOT_URL/ui/accordion/layout/test/test_accordion_2.html" target="_blank">Test page (advanced)</a>
	 */
	wink.ui.layout.Accordion = function()
	{
		/**
		 * Unique identifier
		 * 
		 * @property uId
		 * @type integer
		 */
		this.uId              = wink.getUId();
		
		this._sectionsList    = [];
		this._selectedSection = 0;
		
		this._height          = 0;
		
		this._domNode         = null;
		
		this._initDom();
		this._subscribeToEvents();
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
			
			for (var i = 0; i < l; i++) 
			{
				if ( f ==1 )
				{
					this._sectionsList[i].position = i-1;
					this._sectionsList[i]._updatePosition();
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
							this.selectSection(this._sectionsList[i - 1].uId);
						} else 
						{
							this.selectSection(this._sectionsList[0].uId);
						}
					}
				}
			}
			
			this._domNode.style.height = ((this._sectionsList[0].TITLE_HEIGHT * this._sectionsList.length-1) + this._sectionsList[q].contentNode.scrollHeight) + 'px';
			
			if ( p != -1 )
			{	
				this._sectionsList.splice(p, 1);
			}
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
			
			for ( var i = 0 ; i < l ; i++)
			{
				if (this._sectionsList[i].uId == sectionId) 
				{
					
					if ( this._sectionsList[i].opened == false && ((this._sectionsList[i].TITLE_HEIGHT * this._sectionsList.length) + this._sectionsList[i].contentNode.scrollHeight > this._height) )
					{
						this._domNode.style.height = ((this._sectionsList[i].TITLE_HEIGHT * this._sectionsList.length) + this._sectionsList[i].contentNode.scrollHeight) + 'px';
					} 
					
					f = i;
					this._sectionsList[i].show();
					this._selectedSection = sectionId;
					
				} else
				{
					if ( f == -1 || (f != -1 && this._sectionsList[f].opened === false) )
					{
						this._sectionsList[i].hide(-1);
					} else
					{
						this._sectionsList[i].hide(this._sectionsList[f].contentNode.scrollHeight);
					}
				}
			}
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
			this._height = this._sectionsList[0].TITLE_HEIGHT * this._sectionsList.length;
			this._domNode.style.height = this._height + 'px';
		},
	
		/**
		 * Select a section after a '/section/events/selectsection' event has been fired
		 * 
		 * @param {object} params the object returned when a '/section/events/selectsection' event is fired
		 */
		_selectSection: function(params)
		{
			this.selectSection(params.sectionId);
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
		 * Listen to the '/section/events/selectsection' events
		 */
		_subscribeToEvents: function()
		{
			wink.subscribe('/section/events/selectsection', {context: this, method: '_selectSection'});
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
		show: function()
		{
			this.containerNode.translate(0, 0);
			this.chevronNode.rotate(0);
			
			if(wink.has('css-transition'))
			{
				wink.fx.onTransitionEnd(this.contentNode, wink.bind(this._scroll, this));
			}
			
			if ( this.opened === false )
			{
				this.contentNode.translate(0, this.contentNode.scrollHeight);
				this.chevronNode.rotate(90);
				this.opened = true;
			} else
			{
				this.contentNode.translate(0, 0);
				this.chevronNode.rotate(0);
				this.opened = false;
			}
			
			if(!wink.has('css-transition'))
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
			if ( position == -1 )
			{
				this.containerNode.translate(0, 0);
			} else 
			{
				this.containerNode.translate(0, position);
			}
			
			this.opened = false;
			this.contentNode.translate(0, 0);
			this.chevronNode.rotate(0);
		},
		
		/**
		 * Auto scroll after a section opened
		 */
		_scroll: function()
		{
			
			if ( this.opened == false )
			{
				this._accordion._height = (this.TITLE_HEIGHT * this._accordion._sectionsList.length);
			} else
			{
				this._accordion._height = (this.TITLE_HEIGHT * this._accordion._sectionsList.length) + this.contentNode.scrollHeight;
			}
			
			this._accordion._domNode.style.height = this._accordion._height + 'px';
			
			scrollTo(0, this.titleNode.getTopPosition(null, true));
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
		 * Update the section position
		 */
		_updatePosition: function()
		{
			this.containerNode.style.top = (this.position * this.TITLE_HEIGHT) + 'px';
		},
	
		/**
		 * Initialize the Accordion node
		 */
		_initDom: function()
		{
			this.containerNode = document.createElement('div');
			this.containerNode.className = 'ac_section';
			
			this.containerNode.style.zIndex = this.HIGHER_INDEX - this.position;
			this.containerNode.style.top = (this.position * this.TITLE_HEIGHT) + 'px';
			
			this.containerNode.translate(0, 0);
			
			if(wink.has('css-transition'))
			{
				wink.fx.applyTransformTransition(this.containerNode, this.DURATION + 'ms', '', 'ease-in-out');
			}
			
			this.contentNode = document.createElement('div');
			this.contentNode.className = 'w_bloc w_box w_border ac_content';
			
			this.contentNode.translate(0, 0);
			
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
			this.titleNode.translate(0, 0);
			this.titleNode.innerHTML = this.title;
			this.titleNode.className = 'w_box w_list_item w_border_bottom w_border_left w_border_right w_bg_light ac_title';
			
			this.titleNode.onclick = wink.bind(function(e)
			{
				wink.publish('/section/events/selectsection', {'sectionId': this.uId});
			}, this);
			
			this.chevronNode = document.createElement('div');
			this.chevronNode.className = 'w_icon w_chevron';
			
			this.chevronNode.rotate(0);
			
			wink.fx.applyTransformTransition(this.chevronNode, this.DURATION + 'ms', '', 'ease-in-out');
			
			this.titleNode.appendChild(this.chevronNode);
			
			this.containerNode.appendChild(this.titleNode);
			this.containerNode.appendChild(this.contentNode);
		}
	};
	
	return wink.ui.layout.Accordion;
});