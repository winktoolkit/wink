define = function() {};

if(typeof wink == 'undefined')
{
	wink = {};
}

wink.version = 'test é',
	
wink.api = {} 		
;
wink.fx = {};
wink.math = {};
wink.mm = {} ;
wink.net = {};
wink.ui = 
{
	form: {},
	layout: {},
	xy: {},
	xyz: {}
};
wink["ux"] = {};

wink.byId = function(id)
{
	if (wink.isString(id)) 
	{
		return document.getElementById(id);
	} else 
	{
		return id;
	}
};

wink.isUndefined = function(object) 
{
	return (object === undefined);
};

wink.connect = function(modifiedParam)
{
	modifiedParam.property = "a";
	if (wink.has("touch")) {
		modifiedParam.property = "b";
	}
	if (wink.has("gesture")) {
		modifiedParam.property = "c";
	}
	if (wink.has("unknown")) {
		modifiedParam.property = "d";
	}
};

define(['../dependency'], function(w) {
	w.ua = 
	{
		isWebkit 	: true,
		isMobile 	: false
	};
});

define("mod-name", ['../dependency'],  function(w) {
	w.a = function(a1) {
		
	};
});

define(function(wink) {
	wink.b = function(b1) {
		
	};
});

(function(w) {
	w.c = function(c1) {
		
	};
	w.d = function(d1) {
		
	};
	w.e = function(e1) {
		
	};
})(wink);

(function(wink) {
	wink.ui.other = {
		f1: function() {
		
		},
		f2: function() {
			
		},
		f3: function() {
			
		},
		f4: function() {
			
		},
		f5: function() {
			
		},
		f6: function() {
			
		},
		i18n: {
			
		},
		_validateProperties: function() {
			if (this.properties.a == 1) {
				return false;
			} else if (this.properties.b == 2) {
				return false;
			}
			return true;
		}
	}
})(wink);

wink.ui.other.f7 = function() {
	
};

var anonymousother = function() {
	wink.ui.other2 = {
		
	}
};
anonymousother();
wink.ui.other2.f1 = function() {
	
};
