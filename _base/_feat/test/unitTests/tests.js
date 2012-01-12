/*--------------------------------------------------------
 * Copyright (c) 2011, The Dojo Foundation
 * This software is distributed under the "Simplified BSD license",
 * the text of which is available at http://www.winktoolkit.org/licence.txt
 * or see the "license.txt" file for more details.
 *--------------------------------------------------------*/

doh.register("wink._base._feat",
	[
	 	function testHas()
	 	{
	 		doh.is("raw-feature", wink.has.prop("raw-feature"));
			wink.has.deferProp("raw-feature", function() {
				wink.has.setProp("raw-feature", "prefixed-feature");
			});
			doh.is("prefixed-feature", wink.has.prop("raw-feature"));
			
			doh.is("raw-feature-2", wink.has.prop("raw-feature-2"));
			wink.has.inquire("raw-feature-2-detect", function() {
				wink.has.setProp("raw-feature-2", "prefixed-feature-2");
				return true;
			});
			wink.has.deferProp("raw-feature-2", "raw-feature-2-detect");
			doh.is("prefixed-feature-2", wink.has.prop("raw-feature-2"));
			doh.is(true, wink.has("raw-feature-2-detect"));
	 	},
	 	
		function checkFeatures(t)
		{
			doh.assertFalse(wink.has("unknow-feature"));
			
			var json = false;
			if (wink.has("json-parse")) {
				json = JSON.parse('{"w":"value"}');
				doh.is("value", json.w);
			} else {
				doh.assertTrue(typeof window.JSON == "undefined");
			}
			
			doh.assertTrue(typeof wink.has.prop("text-shadow") == "string");
		}
    ]
);