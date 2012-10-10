/*--------------------------------------------------------
 * Copyright (c) 2011, The Dojo Foundation
 * This software is distributed under the "Simplified BSD license",
 * the text of which is available at http://www.winktoolkit.org/licence.txt
 * or see the "license.txt" file for more details.
 *--------------------------------------------------------*/

/**
 * Set of general function that is used by the completion component
 *  
 * @winkVersion 1.4
 *  
 * @compatibility iOS2, iOS3, iOS4, Android 1.5, Android 2.1, Android 2.2, Android 2.3, Android 3.0, Android 3.1, Android 4.0, BlackBerry 6, BlackBerry 7
 * 
 * @author Guillaume WINTZER, Mathieu FABRE
 */

define(['../../../_amd/core'], function(wink)
{
	/**
	 * @namespace Completion Toolbox 
	 *
	 * This javascript contain a set of general function
	 * that is used by the completion component and can 
	 * be used by other code
	 *
	 */
	wink.plugins.completion.searchTools = 
	{	    
	    /**
	     * Remove all accent and replace them by normal letter
	     * First do a UTF8 parse
	     * Then do a ASCII parse
	     * 
	     * @param str initial string with accents
	     * 
	     * @returns string without accents
	     */
	    stripAccents: function(str)
	    {
	        // Replace UTF8 accent char with non-accent char
	        // Replace é è ê ë with e
	        str = str.replace("/\xC3\xA9/g", "e");
	        str = str.replace("/\xC3\xA8/g", "e");
	        str = str.replace("/\xC3\xAA/g", "e");
	        str = str.replace("/\xC3\xAB/g", "e");
	        
	        // Replace à â ä with a
	        str = str.replace("/\xC3\xA0/g", "a");
	        str = str.replace("/\xC3\xA2/g", "a");
	        str = str.replace("/\xC3\xA4/g", "a");
	        
	        // Replace ì î ï with i
	        str = str.replace("/\xC3\xAC/g", "i");
	        str = str.replace("/\xC3\xAE/g", "i");
	        str = str.replace("/\xC3\xAF/g", "i");
	        
	        // Replace ô ö ò with o
	        str = str.replace("/\xC3\xB4/g", "o");
	        str = str.replace("/\xC3\xB6/g", "o");
	        str = str.replace("/\xC3\xB2/g", "o");
	        
	        // Replace û ü ù with u
	        str = str.replace("/\xC3\xBB/g", "u");
	        str = str.replace("/\xC3\xBC/g", "u");
	        str = str.replace("/\xC3\xB9/g", "u");
	        
	        // Replace ç with c
	        str = str.replace("/\xC3\xA7/g", "c");  
	        
	        // Replace ñ with n
	        str = str.replace("/\xC3\xB1/g", "n");
	        
	        // Replace ÿ with y
	        str = str.replace("/\xC3\xBF/g", "y");
	        
	        // Replace ASCII accent char with non-char without accent
	        var a = "\xE0\xE2\xE4\xE1\xC0\xC1\xC4\xC2\xEB\xE8\xE9\xEA\xCA\xC9\xC8\xCB\xEF\xEE\xED\xEC\xCC\xCD\xCE\xCF\xF2\xF3\xF4\xF6\xD2\xD3\xD4\xD6\xFC\xF9\xFB\xFA\xDA\xD9\xDB\xDC\xE3\xF5\xF1\xC3\xD5\xD1\xE7";
	        var b = "aaaaAAAAeeeeEEEEiiiiIIIIooooOOOOuuuuUUUUaonAONc";
	        
	        for(var i = 0 ; i < a.length ; i++)
	            str = str.split(a.charAt(i)).join(b.charAt(i));
	        
	        return str;
	    },
	    
	    /**
	     * Remove separator chars
	     * 
	     * @param string str the string
	     * 
	     * @returns string
	     */
	    stripSeparatorChars: function(str)
	    {
	        // replace separator chars by space
	        return str.replace(/[-._']/g, ' ');
	    },
	    
	    /**
	     * Trim left and right and remove
	     * multiple space on the string
	     * 
	     * @param string the string to clear
	     * 
	     * @returns string
	     */
	    clearSpace: function(str)
	    {
	        return str.toLowerCase().replace(/[ ]+/g,' ').replace(/^ /,'').replace(/ $/,'');
	    },
	    
	    /**
	     * Invert bold a string with the specified pattern
	     * The str is considered accent cleared and special char cleared
	     * if requiered - We dont have to clear it
	     * 
	     * @param str the string
	     * @param patt the pattern
	     * @param clearAccents if we have to clear accent
	     * @param clearSeparatorChars if we have to clear separator chars
	     * 
	     * @returns string the revert bolded string
	     */
	    getBoldInv: function(str, pattern, clearAccents, clearSeparatorChars)
	    {
	        var resultStr = "";
	
	        // Always clear space at the beginning
	        pattern = this.clearSpace(pattern);
	        
	        // Comparison is always between 2 cleared strings
	        var clearedPattern = this.stripAccents(this.stripSeparatorChars(pattern)); 
	        var clearedStr     = this.stripAccents(this.stripSeparatorChars(str));
	                
	        // Save the current str to display according to the clearAccents and clearSeparatorChars parameters
	        if (clearSeparatorChars && clearAccents)
	            str = this.stripAccents(this.stripSeparatorChars(str));
	        else if (clearSeparatorChars)
	            str = this.stripSeparatorChars(str);
	        else if (clearAccents)
	            str = this.stripAccents(str);
	        
	        // Search the pattern in the string (accent cleared)
	        var i = clearedStr.toLowerCase().indexOf(clearedPattern.toLowerCase());
	        
	        if (i == -1)
	        {
	            // The pattern has not been found, bold everything
	            resultStr += "<b>" + str + "</b>";
	        }
	        else
	        {
	            // The accentClearedPattern has been found in accentClearedStr, bold the invert
	            if (i > 0) 
	                resultStr += "<b>" + str.substring(0, i) + "</b>";
	            
	            // Move to the end of the pattern        
	            var deb = i + clearedPattern.length;
	            
	            // Add pattern part
	            resultStr += str.substring(i, deb);        
	            
	            // Check if we are at the end of the string
	            if (deb < str.length)
	            {
	                resultStr += "<b>" + str.substring(deb) + "</b>";
	            }
	        }
	        
	        return resultStr;
	    }
	};
});