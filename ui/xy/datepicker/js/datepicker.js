/*--------------------------------------------------------
 * Copyright (c) 2011, The Dojo Foundation
 * This software is distributed under the "Simplified BSD license",
 * the text of which is available at http://www.winktoolkit.org/licence.txt
 * or see the "license.txt" file for more details.
 *--------------------------------------------------------*/

/**
 * @fileOverview Implement a datepicker
 * 
 * @compatibility Iphone OS2, Iphone OS3, Iphone OS4, Android 1.1, Android 1.5, Android 2.1, Android 2.2, Android 2.3, Android 3.0, Android 3.1, BlackBerry 6, BlackBerry 7, Bada 1.0, Windows Phone 7.5
 * @author Jerome GIRAUD
 */

/**
 * The user clicked on a date
 * 
 * @name wink.ui.xy.DatePicker#/datepicker/events/pickdate

 * @event
 * 
 * @param {object} param The parameters object
 * @param {date} param.date The date currently selected
 */
define(['../../../../_amd/core'], function(wink)
{
	/**
	 * @class Implement a datepicker.
	 * Displays a calendar. The user can select a date by clicking on a day.
	 * 
	 * @example
	 * 
	 * datepicker = new wink.ui.xy.DatePicker();
	 * datepicker.show();
	 * 
	 * @see <a href="WINK_ROOT_URL/ui/xy/datepicker/test/test_datepicker.html" target="_blank">Test page</a>
	 */
	wink.ui.xy.DatePicker = function()
	{
		if (wink.isUndefined(wink.ui.xy.DatePicker.singleton))
		{
			/**
			 * Unique identifier
			 * 
			 * @property
			 * @type integer
			 */
			this.uId = 1;
			
			
			this._HEIGHT          = 316;
			this._WIDTH           = 280;
	
			this._template        = '';
			this._domNode         = null;
			this._firstDayOfMonth = new Date();
			this._firstDayOfWeek  = _('firstDayOfWeek', this);
			this._week            = [ 'sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday' ];
	
			this._initDom();
			this._updateTemplate();
	
			wink.ui.xy.DatePicker.singleton = this;
		} else
		{
			return wink.ui.xy.DatePicker.singleton;
		}
	};
	
	wink.ui.xy.DatePicker.prototype =
	{
		i18n: {},
		
		/**
		 * Display the DatePicker
		 */
		show: function()
		{
			wink.layer.show();
			
			wink.fx.apply(this._domNode, {
				display: 'block'
			});
			this.updatePosition();
		},
		
		/**
		 * Hide the DatePicker
		 */
		hide: function()
		{
			wink.layer.hide();
			this._domNode.style.display = 'none';
		},
		
		/**
		 * Update the position of the date picker and places it at the center of the page
		 */
		updatePosition: function()
		{
			wink.fx.apply(this._domNode, {
				top: (window.innerHeight > this._HEIGHT)?(((window.innerHeight-this._HEIGHT)/2)+window.pageYOffset)+'px':window.pageYOffset+'px',
				left: (document.documentElement.offsetWidth > this._WIDTH)?(((document.documentElement.offsetWidth-this._WIDTH)/2)+window.pageXOffset)+'px':window.pageXOffset+'px'
			});
		},
		
		/**
		 * Update the calendar display to show a particular month
		 */
		_updateTemplate: function()
		{
			this._template = '';
		
			var today = new Date();
			var currentDay = new Date();
		
			currentDay.setDate(1);
			this._firstDayOfMonth.setDate(1);
		
			this._template += '<div>';
			this._template += '<div class="dp_navigation"><div class="w_icon w_button_previous dp_previous" onclick="(new wink.ui.xy.DatePicker())._goToPreviousMonth()"></div><div class="dp_month">' + this._getMonthName(this._firstDayOfMonth.getMonth()) + ' ' + this._firstDayOfMonth.getFullYear() + '</div><div class="w_icon w_button_next dp_next" onclick="(new wink.ui.xy.DatePicker())._goToNextMonth()"></div><div class="w_icon w_float w_button_close" onClick="(new wink.ui.xy.DatePicker()).hide()"></div></div>';
			this._template += '<div class="dp_days_container"><div class="dp_days">' + _(this._week[this._firstDayOfWeek], this) + '</div><div class="dp_days">' + _(this._week[(this._firstDayOfWeek + 1) % 7], this) + '</div><div class="dp_days">' + _(this._week[(this._firstDayOfWeek + 2) % 7], this) + '</div><div class="dp_days">' + _(this._week[(this._firstDayOfWeek + 3) % 7], this) + '</div><div class="dp_days">' + _(this._week[(this._firstDayOfWeek + 4) % 7], this) + '</div><div class="dp_days">' + _(this._week[(this._firstDayOfWeek + 5) % 7], this) + '</div><div class="dp_days">' + _(this._week[(this._firstDayOfWeek + 6) % 7], this) + '</div></div>';
			this._template += '<div class="dp_dates_container w_border_bottom">';
		
			if (this._firstDayOfMonth.getDay() == this._firstDayOfWeek)
			{
				for ( var i = 0; i < 7; i++)
				{
					currentDay.setTime(this._firstDayOfMonth.getTime() - (7 - i) * (24 * 3600 * 1000));
					this._template += '<a href="#" class="dp_date dp_finished w_border_bottom w_border_right" onClick="(new wink.ui.xy.DatePicker())._selectDate(' + currentDay.getTime() + ')">' + currentDay.getDate() + '</a>';
				}
			} else if (this._firstDayOfMonth.getDay() == ((this._firstDayOfWeek + 6) % 7))
			{
				for ( var i = 0; i < 6; i++)
				{
					currentDay.setTime(this._firstDayOfMonth.getTime() - (6 - i) * (24 * 3600 * 1000));
					this._template += '<a href="#" class="dp_date dp_finished w_border_bottom w_border_right" onClick="(new wink.ui.xy.DatePicker())._selectDate(' + currentDay.getTime() + ')">' + currentDay.getDate() + '</a>';
				}
		
				currentDay.setTime(this._firstDayOfMonth.getTime());
				
				if (currentDay.getMonth() == today.getMonth() && currentDay.getYear() == today.getYear())
				{
					if (currentDay.getDate() == today.getDate())
					{
						this._template += '<a href="#" class="dp_date dp_today w_border_bottom w_border_right" onClick="(new wink.ui.xy.DatePicker())._selectDate(' + this._firstDayOfMonth.getTime() + ')">' + this._firstDayOfMonth.getDate() + '</a>';
					} else
					{
						this._template += '<a href="#" class="dp_date w_border_bottom w_border_right" onClick="(new wink.ui.xy.DatePicker())._selectDate(' + this._firstDayOfMonth.getTime() + ')">' + this._firstDayOfMonth.getDate() + '</a>';
					}
		
				} else
				{
					if (currentDay.getMonth() == this._firstDayOfMonth.getMonth() && currentDay.getYear() == this._firstDayOfMonth.getYear())
					{
						this._template += '<a href="#" class="dp_date w_border_bottom w_border_right" onClick="(new wink.ui.xy.DatePicker())._selectDate(' + currentDay.getTime() + ')">' + currentDay.getDate() + '</a>';
					} else
					{
						this._template += '<a href="#" class="dp_date dp_finished w_border_bottom w_border_right" onClick="(new wink.ui.xy.DatePicker())._selectDate(' + currentDay.getTime() + ')">' + currentDay.getDate() + '</a>';
					}
				}
			} else
			{
				for ( var i = this._firstDayOfWeek; i < this._firstDayOfMonth.getDay(); i++)
				{
					currentDay.setTime(this._firstDayOfMonth.getTime() - (this._firstDayOfMonth.getDay() - i) * (24 * 3600 * 1000));
					this._template += '<a href="#" class="dp_date dp_finished w_border_bottom w_border_right" onClick="(new wink.ui.xy.DatePicker())._selectDate(' + currentDay.getTime() + ')">' + currentDay.getDate() + '</a>';
				}
		
				currentDay.setTime(this._firstDayOfMonth.getTime());
		
				if (currentDay.getMonth() == today.getMonth() && currentDay.getYear() == today.getYear())
				{
					if (currentDay.getDate() == today.getDate())
					{
						this._template += '<a href="#" class="dp_date dp_today w_border_bottom w_border_right" onClick="(new wink.ui.xy.DatePicker())._selectDate(' + this._firstDayOfMonth.getTime() + ')">' + this._firstDayOfMonth.getDate() + '</a>';
					} else
					{
						this._template += '<a href="#" class="dp_date w_border_bottom w_border_right" onClick="(new wink.ui.xy.DatePicker())._selectDate(' + this._firstDayOfMonth.getTime() + ')">' + this._firstDayOfMonth.getDate() + '</a>';
					}
				} else
				{
					if (currentDay.getMonth() == this._firstDayOfMonth.getMonth() && currentDay.getYear() == this._firstDayOfMonth.getYear())
					{
						this._template += '<a href="#" class="dp_date w_border_bottom w_border_right" onClick="(new wink.ui.xy.DatePicker())._selectDate(' + currentDay.getTime() + ')">' + currentDay.getDate() + '</a>';
					} else
					{
						this._template += '<a href="#" class="dp_date dp_finished w_border_bottom w_border_right" onClick="(new wink.ui.xy.DatePicker())._selectDate(' + currentDay.getTime() + ')">' + currentDay.getDate() + '</a>';
					}
				}
		
				for ( var i = 1; i < (7 + this._firstDayOfWeek - (this._firstDayOfMonth.getDay())); i++)
				{
					currentDay.setTime(this._firstDayOfMonth.getTime() + i * (24 * 3600 * 1000));
					
					if (currentDay.getMonth() == today.getMonth() && currentDay.getYear() == today.getYear())
					{
						if (currentDay.getDate() == today.getDate())
						{
							this._template += '<a href="#" class="dp_date dp_today w_border_bottom w_border_right" onClick="(new wink.ui.xy.DatePicker())._selectDate(' + currentDay.getTime() + ')">' + currentDay.getDate() + '</a>';
						} else
						{
							this._template += '<a href="#" class="dp_date w_border_bottom w_border_right" onClick="(new wink.ui.xy.DatePicker())._selectDate(' + currentDay.getTime() + ')">' + currentDay.getDate() + '</a>';
						}
					} else
					{
						if (currentDay.getMonth() == this._firstDayOfMonth.getMonth() && currentDay.getYear() == this._firstDayOfMonth.getYear())
						{
							this._template += '<a href="#" class="dp_date w_border_bottom w_border_right" onClick="(new wink.ui.xy.DatePicker())._selectDate(' + currentDay.getTime() + ')">' + currentDay.getDate() + '</a>';
						} else
						{
							this._template += '<a href="#" class="dp_date dp_finished w_border_bottom w_border_right" onClick="(new wink.ui.xy.DatePicker())._selectDate(' + currentDay.getTime() + ')">' + currentDay.getDate() + '</a>';
						}
					}
				}
			}
			this._template += '</div>';
		
			for ( var j = 0; j < 5; j++)
			{
				this._template += '<div class="dp_dates_container">';
				for ( var i = 1; i < 8; i++)
				{
					currentDay.setTime(currentDay.getTime() + (24 * 3600 * 1000));
					
					if (currentDay.getMonth() != today.getMonth() || currentDay.getYear() != today.getYear())
					{
						if (currentDay.getMonth() == this._firstDayOfMonth.getMonth() && currentDay.getYear() == this._firstDayOfMonth.getYear())
						{
							this._template += '<a href="#" class="dp_date w_border_bottom w_border_right" onClick="(new wink.ui.xy.DatePicker())._selectDate(' + currentDay.getTime() + ')">' + currentDay.getDate() + '</a>';
						} else
						{
							this._template += '<a href="#" class="dp_date dp_finished w_border_bottom w_border_right" onClick="(new wink.ui.xy.DatePicker())._selectDate(' + currentDay.getTime() + ')">' + currentDay.getDate() + '</a>';
						}
					} else
					{
						if (currentDay.getDate() == today.getDate())
						{
							this._template += '<a href="#" class="dp_date dp_today w_border_bottom w_border_right" onClick="(new wink.ui.xy.DatePicker())._selectDate(' + currentDay.getTime() + ')">' + currentDay.getDate() + '</a>';
						} else
						{
							this._template += '<a href="#" class="dp_date w_border_bottom w_border_right" onClick="(new wink.ui.xy.DatePicker())._selectDate(' + currentDay.getTime() + ')">' + currentDay.getDate() + '</a>';
						}
					}
				}
				this._template += '</div>';
			}
			this._template += '</div>';
			
			this._domNode.innerHTML = this._template;
		},
		
		/**
		 * Fires a 'pickdate' event
		 * 
		 * @param {Date} The date that has been clicked
		 */
		_selectDate: function(date)
		{
			var result = new Date();
			result.setTime(date);
		
			wink.publish('/datepicker/events/pickdate', {date: result});
			
			this.hide();
		},
		
		/**
		 * Display the next month of the calendar
		 */
		_goToNextMonth: function()
		{
			this._firstDayOfMonth.setMonth(this._firstDayOfMonth.getMonth() + 1);
			this._updateTemplate();
		},
		
		/**
		 * Display the previous month of the calendar
		 */
		_goToPreviousMonth: function()
		{
			this._firstDayOfMonth.setMonth(this._firstDayOfMonth.getMonth() - 1);
			this._updateTemplate();
		},
		
		/**
		 * Returns the translated name of a month
		 * 
		 * @param {integer} month The number representing the current month
		 * 
		 * @returns {string} The name of the month
		 */
		_getMonthName: function(month)
		{
			switch (month)
			{
				case 0:
					return _('january', this);
				case 1:
					return _('february', this);
				case 2:
					return _('march', this);
				case 3:
					return _('april', this);
				case 4:
					return _('may', this);
				case 5:
					return _('june', this);
				case 6:
					return _('july', this);
				case 7:
					return _('august', this);
				case 8:
					return _('september', this);
				case 9:
					return _('october', this);
				case 10:
					return _('november', this);
				case 11:
					return _('december', this);
				default:
					return '';
			}
		},
		
		/**
		 * Initialize the DOM Node of the datepicker
		 */
		_initDom: function()
		{
			this._domNode = document.createElement('div');
		
			this._domNode.className = 'w_bloc w_window dp_datepicker w_border w_radius w_bg_dark';
			this._domNode.style.display = 'none';
		
			wink.fx.apply(this._domNode, {
				display : 'none',
				width : this._WIDTH+'px',
				height : this._HEIGHT+'px'
			});
			
			this._domNode.innerHTML = this._template;
		
			document.body.appendChild(this._domNode);
		}
	};
	
	return wink.ui.xy.DatePicker;
});