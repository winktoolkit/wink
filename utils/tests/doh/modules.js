tests.modules = new Array();
tests.groups = new Array();

// Modules
tests.modules["wink._base.ua"] = "../../_base/ua/test/unitTests/tests.js";
tests.modules["wink._base._base"] = "../../_base/_base/test/unitTests/tests.js";
tests.modules["wink._base._dom"] = "../../_base/_dom/test/unitTests/tests.js";
tests.modules["wink._base._feat"] = "../../_base/_feat/test/unitTests/tests.js";
tests.modules["wink._base.json"] = "../../_base/json/test/unitTests/tests.js";
tests.modules["wink._base.topics"] = "../../_base/topics/test/unitTests/tests.js";

tests.modules["wink._cache"] = "../../_cache/test/unitTests/tests.js";

tests.modules["wink.fx._xy"] = "../../fx/_xy/test/unitTests/tests.js";

tests.modules["wink.math._basics"] = "../../math/_basics/test/unitTests/tests.js";
tests.modules["wink.math._geometric"] = "../../math/_geometric/test/unitTests/tests.js";

tests.modules["wink.net.xhr"] = "../../net/xhr/test/unitTests/tests.js";
tests.modules["wink.net.imagesloader"] = "../../net/imagesloader/test/unitTests/tests.js";
tests.modules["wink.net.jsloader"] = "../../net/jsloader/test/unitTests/tests.js";
tests.modules["wink.net.cssloader"] = "../../net/cssloader/test/unitTests/tests.js";

tests.modules["wink.ui.xy.layer"] = "../../ui/xy/layer/test/unitTests/tests.js";

tests.modules["wink.ux.touch"] = "../../ux/touch/test/unitTests/tests.js";

// Wink core
tests.groups["wink.core"] = 
[
	tests.modules["wink._base.ua"],
	tests.modules["wink._base._base"],
	tests.modules["wink._base._feat"],
	tests.modules["wink._base.json"],
	tests.modules["wink._base.topics"],
	tests.modules["wink.net.xhr"],
	tests.modules["wink.math._basics"],
	tests.modules["wink.ui.xy.layer"],
	tests.modules["wink._base._dom"],
	tests.modules["wink.fx._xy"],
	tests.modules["wink.ux.touch"],
];

//Wink cache
tests.groups["wink.cache"] = 
[
	tests.modules["wink._cache"]
];

//Wink math
tests.groups["wink.math"] = 
[
	tests.modules["wink.math._basics"],
	tests.modules["wink.math._geometric"],
];

//Wink net
tests.groups["wink.net"] = 
[
	tests.modules["wink.net.xhr"],
	tests.modules["wink.net.jsloader"],
	tests.modules["wink.net.cssloader"],
	tests.modules["wink.net.imagesloader"]
];
 