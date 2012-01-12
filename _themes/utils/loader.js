/*--------------------------------------------------------
 * Copyright (c) 2011, The Dojo Foundation
 * This software is distributed under the "Simplified BSD license",
 * the text of which is available at http://www.winktoolkit.org/licence.txt
 * or see the "license.txt" file for more details.
 *--------------------------------------------------------*/

/**
 * This script is here for the preview purposes only
 */

var theme = "default";

window.addEventListener("load", function()
{
	// Load theme
	var qstr = window.location.search.substr(1);
	
	if(qstr.length)
	{
		var qparts = qstr.split("&");
		for(var x=0; x<qparts.length; x++)
		{
			var tp = qparts[x].split("=");
	
			if (tp[0] == 'theme')
			{
				theme = tp[1];
				document.body.parentNode.className = theme;
			}
		}
	}
}, false);
