/*--------------------------------------------------------
 * Copyright (c) 2011, The Dojo Foundation
 * This software is distributed under the "Simplified BSD license",
 * the text of which is available at http://www.winktoolkit.org/licence.txt
 * or see the "license.txt" file for more details.
 *--------------------------------------------------------*/

/**
 * @fileOverview Implements an error management system
 *
 * @author Jerome GIRAUD		
 */
define(['../../../_amd/core'], function()
{
	/**
	 * @namespace Error management system
	 * 
	 * @example
	 * 
	 * wink.error.logLevel = 1;
	 * wink.log('this is a log');
	 * 
	 * @compatibility iOS2, iOS3, iOS4, iOS5, iOS6, Android 1.1, Android 1.5, Android 2.1, Android 2.2, Android 2.3, Android 3.0, Android 3.1, Android 4.0, Android 4.1.2, BlackBerry 6, BlackBerry 7, BB10, Bada 1.0, Windows Phone 7.5, Windows Phone 8
	 * 
	 * @see <a href="WINK_ROOT_URL/_base/error/test/test_error.html" target="_blank">Test page</a>
	 */
	wink.error =
	{
		/**
		 * The current log level. If set to 0, no message will be displayed. If set to 1, the log messages will be displayed.
		 * 
		 * @property logLevel
		 * @type integer
		 * @default 0
		 */
		logLevel: 0,
		
		/**
		 * Display a log message if the log level has been set to 1.
		 * If the console is defined, use the console, otherwise, alert the user
		 * 
		 * @param {string} value The content of the log
		 */
		log: function(value)
		{
			if ( this.logLevel == 1)
			{
				if ( typeof console != 'undefined' )
				{
					console.log(value);
				} else
				{
					alert(value);
				}
			}
		}
	
	};
	
	/**
	 * @function
	 * @see wink.error.log
	 */
	wink.log = wink.bind(wink.error.log, wink.error);
	
	return wink.error;
});