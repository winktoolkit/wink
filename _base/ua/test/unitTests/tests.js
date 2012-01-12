/*--------------------------------------------------------
 * Copyright (c) 2011, The Dojo Foundation
 * This software is distributed under the "Simplified BSD license",
 * the text of which is available at http://www.winktoolkit.org/licence.txt
 * or see the "license.txt" file for more details.
 *--------------------------------------------------------*/

doh.register("wink._base.ua",
	[
		//Test isWebkit
		function isWebkit(t)
		{
			if (confirm("Are you running this test on a webkit based browser ?"))
			 {
				 doh.is(true, wink.ua.isWebkit);
		
				 if (confirm("Are you running this test on Safari, mobile Safari, Chrome or BlackBerry ?"))
		    	 {
		    		 doh.is(true, wink.ua.isSafari);
		         } else
		         {
		        	 doh.is(false, wink.ua.isSafari);
		         }
		     } else
		     {
		    	 doh.is(false, wink.ua.isWebkit);
		    	 
		    	 if (confirm("Are you running this test on Mozilla ?"))
		    	 {
		    		 doh.is(true, wink.ua.isMozilla);
		         } else
		         {
		        	 doh.is(false, wink.ua.isMozilla);
		         }
		     }
		},

        // Test isMobile
        function isMobile(t)
        {
			var check = function(mobile, android, ios, blackberry, bada) {
				doh.is(mobile, wink.ua.isMobile);
				doh.is(android, wink.ua.isAndroid);
				doh.is(ios, wink.ua.isIOS);
				doh.is(blackberry, wink.ua.isBlackBerry);
				doh.is(bada, wink.ua.isBada);
			};
			
			if (confirm("Are you running this test on a mobile device ?"))
			{
				if (confirm("Are you running this test on an Android device ?"))
				{
					check(true, true, false, false, false);
					return;
				}
				if (confirm("Are you running this test on iOS ?"))
				{
					check(true, false, true, false, false);
					return;
				}
				if (confirm("Are you running this test on BlackBerry ?"))
				{
					check(true, false, false, true, false);
					return;
				}
				if (confirm("Are you running this test on Bada ?"))
				{
					check(true, false, false, false, true);
					return;
				}
				return;
			}
			check(false, false, false, false, false);
        }
    ]
);