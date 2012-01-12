/*--------------------------------------------------------
 * Copyright (c) 2011, The Dojo Foundation
 * This software is distributed under the "Simplified BSD license",
 * the text of which is available at http://www.winktoolkit.org/licence.txt
 * or see the "license.txt" file for more details.
 *--------------------------------------------------------*/

/**
 * @fileOverview The Search object allows you to process searches in an HTML document and browse search results. 
 * 
 * @compatibility Iphone OS2, Iphone OS3, Iphone OS4, Android 1.1, Android 1.5, Android 2.1, Android 2.2, Android 2.3, Android 3.0, Android 3.1, BlackBerry 6, BlackBerry 7, Bada 1.0, Windows Phone 7.5
 * 
 * @author Frédéric MOULIS
 */

define(['../../../_amd/core'], function(wink)
{
	/**
	 * @class The Search object allows you to process searches in an HTML document and browse search results. 
	 * To instantiate the search component, you need to provide the DOM node where the search should be performed, the results classname and a classname for the selected results
	 * 
	 * @param {object} properties The properties object
	 * @param {HTMLElement} properties.textNode DOM node containing the text to search in
	 * @param {string} properties.resultClassName CSS class to apply to search results. This class has to be defined by the developer
	 * @param {string} properties.resultSelectClassName CSS class to apply to the currently selected search result. This class has to be defined by the developer
	 * 
	 * @example
	 * 
	 * var searchProperties = 
	 * {
	 *  textNode: $("moveable"),
	 *  resultClassName: "surligne",
	 *  resultSelectClassName: "surligneSelect"
	 * }
	 * search = new wink.ux.Search(searchProperties);
	 * 
	 * @see <a href="WINK_ROOT_URL/ux/search/test/test_search.html" target="_blank">Test page</a>
	 */
	wink.ux.Search = function(properties)
	{
		/**
		 * Unique identifier
		 * 
		 * @property uId
		 * @type integer
		 */
		this.uId                = wink.getUId();
		
		/**
		 * Number of search results
		 * 
		 * @property totalResults
		 * @type integer
		 */
		this.totalResults       = 0;
		
		/**
		 * Index of the currently selected result (from 1 to totalResults)
		 * 
		 * @property currentResult
		 * @type integer
		 */
		this.currentResult      = 0;
		
		this._properties        = properties;
		this._originalText      = '';
		this._resultSpanBegin   = '';
		this._resultSpanBetween = '';
		this._resultSpanEnd     = '';
		
		if (this._validateProperties() === false)
		{
			return;
		}
		
		this._initProperties();
	};
	
	wink.ux.Search.prototype =
	{
		/**
		 * processes a search in the considered HTML node.
		 * Applies the adequate CSS class to results (by encapsulating each result in a SPAN node) and selects first result
		 * Number of search results and current result index can be accessed through totalResults and currentResult public attributes
		 * 
		 * @param {string} s The text to search in textNode
		 * 
		 * @returns {HTMLElement} the first result SPAN node or null
		 */
		search: function(s)
		{
			var resultText = this._originalText;
			var lowerCaseText = resultText.toLowerCase();
			var searchfinished = false;
			var sLowerCase = s.toLowerCase();
			
			var idxSearch = 0;
			var idxResults = [];
			var lastIdx = lowerCaseText.lastIndexOf(sLowerCase);
			
			if(lastIdx == -1)
			{
				searchfinished = true;
			}
			while(true)
			{
				var idxResult = lowerCaseText.indexOf(sLowerCase, idxSearch);
				if(idxResult==-1)
				{
					break;
				}
				var before = lowerCaseText.substr(0, idxResult);
				var lastLT = before.lastIndexOf('<');
				var lastGT = before.lastIndexOf('>');
				if(lastLT==-1 || (lastGT!=-1 && lastLT < lastGT))
				{
					idxResults.push(idxResult);
				}
				idxSearch = idxResult+sLowerCase.length;					
			}
			var i=0;
			this.totalResults = idxResults.length;
			var correctOffset = 0;
			
			for(i=0;i<this.totalResults;i++)
			{
				var idxR = idxResults[i];
				var correctedIdxR = idxR + correctOffset;
				var before = resultText.substr(0,correctedIdxR);
				var searched = resultText.substr(correctedIdxR,sLowerCase.length);
				var after = resultText.substr(correctedIdxR+sLowerCase.length);
				var idx = i+1;
				resultText = before + this._resultSpanBegin+idx+this._resultSpanBetween + searched + this._resultSpanEnd + after;
				correctOffset += this._resultSpanBegin.length+this._resultSpanBetween.length+this._resultSpanEnd.length+ (''+idx).length;
			}
			this._properties.textNode.innerHTML=resultText;
			if (this.totalResults > 0)
			{
				this.currentResult = 1;
				if(wink.isSet(this._properties.resultSelectClassName))
				{
					$('search_1').className = this._properties.resultSelectClassName;
				} else
				{
					$('search_1').className = "";
				}
				return $('search_1');
			} else
			{
				this.currentResult = 0;
				return null;
			}
		},
		
		/**
		 * Resets the considered HTML node (replaces its content by the original content)
		 */
		reset: function()
		{
			this.totalResults = 0;
			this._properties.textNode.innerHTML = this._originalText;
		},
		
		/**
		 * Selects next result
		 * @returns {HTMLElement} the current result SPAN node or null
		 */
		next: function()
		{
			this._unselect(this.currentResult);
			if(this.currentResult < this.totalResults)
			{
				this.currentResult++;
				this._select(this.currentResult);
				return $('search_'+this.currentResult);
			} else
			{
				if(this.totalResults > 0)
				{
					this.currentResult = 1;
					this._select(this.currentResult);
					return $('search_'+this.currentResult);
				} else
				{
					this.currentResult = 0;
					return null;
				}
			}
		},
		
		/**
		 * Selects previous result 
		 * @returns {HTMLElement} the current result SPAN node or null
		 */
		previous: function()
		{
			this._unselect(this.currentResult);
			if(this.currentResult > 1)
			{
				this.currentResult--;
				this._select(this.currentResult);
				return $('search_'+this.currentResult);
			} else
			{
				if(this.totalResults > 0)
				{
					this.currentResult = this.totalResults;
					this._select(this.currentResult);
					return $('search_'+this.currentResult);
				} else {
					this.currentResult = 0;
					return null;
				}
			}
		},
		
		/**
		 * Validate the properties of the component
		 * @returns {boolean} True if the properties are valid, false otherwise
		 */
		_validateProperties: function()
		{
			if(!wink.isSet(this._properties.textNode) || !wink.isSet(this._properties.textNode.innerHTML))
			{
				wink.log('[Search] textNode property must be DOM node');
				return false;
			}
			if(wink.isSet(this._properties.resultClassName) && (!wink.isString(this._properties.resultClassName) || this._properties.resultClassName == ""))
			{
				wink.log('[Search] resultClassName property must be a string and cannot be empty');
				return false;
			}
			if(wink.isSet(this._properties.resultSelectClassName) && (!wink.isString(this._properties.resultSelectClassName) || this._properties.resultSelectClassName == ""))
			{
				wink.log('[Search] resultClassName property must be a string and cannot be empty');
				return false;
			}
			return true;
		},
		
		/**
		 * Initialize the search properties
		 */
		_initProperties: function()
		{
			this._originalText = this._properties.textNode.innerHTML;
			this._resultSpanBegin = '<span';
			if(wink.isSet(this._properties.resultClassName))
			{
				this._resultSpanBegin += ' class="' + this._properties.resultClassName + '"';
			} 
			this._resultSpanBegin += ' id="search_';
			this._resultSpanBetween = '">';
			this._resultSpanEnd = '</span>';
		},	
		
		/**
		 * Deselect a search result (CSS classname change)
		 * 
		 * @param {integer} i The index of the search item
		 */
		_unselect: function(i)
		{
			if(wink.isSet(this._properties.resultClassName))
			{
				$('search_'+i).className = this._properties.resultClassName;
			} else {
				$('search_'+i).className = "";
			}
		},
		
		/**
		 * Select a search result (CSS classname change)
		 * 
		 * @param {integer} i The index of the search item
		 */
		_select: function(i)
		{
			if(wink.isSet(this._properties.resultSelectClassName))
			{
				$('search_'+i).className = this._properties.resultSelectClassName;
			} else {
				$('search_'+i).className = "";
			}
		}
	};
	
	return wink.ux.Search;
});