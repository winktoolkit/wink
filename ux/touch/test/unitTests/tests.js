/*--------------------------------------------------------
 * Copyright (c) 2011, The Dojo Foundation
 * This software is distributed under the "Simplified BSD license",
 * the text of which is available at http://www.winktoolkit.org/licence.txt
 * or see the "license.txt" file for more details.
 *--------------------------------------------------------*/

doh.register("wink.ux.touch",
	[
	 	// addListener: Listen to Touch start and touch end
	 	{
	 		name: "touch",
            timeout: 5000,
            
            setUp: function()
	 		{
	 			alert("After this message disappears, you will have 5 seconds to touch the yellow square");
	 		},
	 		
	 		handleTouchStart: function(params)
	 		{
	 			clearTimeout(doh.timer);
	 			
	 			$('test').style.backgroundColor = 'red';
	 			
	 			if ( !wink.isInteger(params.x) || !wink.isInteger(params.y) || wink.isUndefined(params.target) )
	 			{
	 				this.d.errback(new Error("Event: wrong position parameters"));
	 			}
	 		},
	 		
	 		handleTouchEnd: function(params)
	 		{
	 			$('test').style.backgroundColor = 'yellow';
	 			
	 			if ( !wink.isInteger(params.x) || !wink.isInteger(params.y) || wink.isUndefined(params.target) )
	 			{
	 				this.d.errback(new Error("Event: wrong position parameters"));
	 			}
	 			
	 			this.d.callback(true);
	 		},
            
            runTest: function(t)
			{
	 			this.d = new doh.Deferred();
	 			
	 			wink.ux.touch.addListener($('test'), "start", { context: this, method: "handleTouchStart", arguments: null }, { preventDefault: true });
	 			wink.ux.touch.addListener($('test'), "end", { context: this, method: "handleTouchEnd", arguments: null }, { preventDefault: true });
	 			
	 			return this.d;
			},
			
			tearDown: function()
	 		{
				wink.ux.touch.removeListener($('test'), "start", { context: this, method: "handleTouchStart", arguments: null });
	 			wink.ux.touch.removeListener($('test'), "end", { context: this, method: "handleTouchEnd", arguments: null });
	 		}
	 	},
	 	
	 	// addListener: Listen to Touch move
	 	{
	 		name: "move",
            timeout: 5000,
            
            points: [],
            
            setUp: function()
	 		{
	 			alert("After this message disappears, you will have 5 seconds to move your finger over the grey rectangle");
	 		},
	 		
	 		handleTouchStart: function()
	 		{
	 			clearTimeout(doh.timer);
	 		},
	 		
	 		handleTouchMove: function(params)
	 		{
	 			if ( !wink.isInteger(params.x) || !wink.isInteger(params.y) || wink.isUndefined(params.target) )
	 			{
	 				this.d.errback(new Error("Event: wrong position parameters"));
	 			}
	 			
	 			var point = document.createElement('div');
	 			
	 			point.style.height = "3px";
	 			point.style.width = "3px";
	 			
	 			point.style.backgroundColor = "red";
	 			
	 			point.style.position = 'absolute';
	 			
	 			point.style.left = params.x + 'px';
	 			point.style.top = (params.y - $('sandbox').winkGetTopPosition()) + 'px';
	 			
	 			$('sandbox').appendChild(point);
	 			
	 			this.points.push(point);
	 		},
	 		
	 		handleTouchEnd: function(params)
	 		{
	 			this.d.callback(true);
	 		},
            
            runTest: function(t)
			{
	 			this.d = new doh.Deferred();
	 			
	 			wink.ux.touch.addListener($('sandbox'), "start", { context: this, method: "handleTouchStart", arguments: null }, { preventDefault: true });
	 			wink.ux.touch.addListener($('sandbox'), "move", { context: this, method: "handleTouchMove", arguments: null }, { preventDefault: true });
	 			wink.ux.touch.addListener($('sandbox'), "end", { context: this, method: "handleTouchEnd", arguments: null }, { preventDefault: true });
	 			
	 			return this.d;
			},
			
			tearDown: function()
	 		{
				wink.ux.touch.removeListener($('sandbox'), "start", { context: this, method: "handleTouchStart", arguments: null });
				wink.ux.touch.removeListener($('sandbox'), "move", { context: this, method: "handleTouchMove", arguments: null });
	 			wink.ux.touch.removeListener($('sandbox'), "end", { context: this, method: "handleTouchEnd", arguments: null });

	 			for ( var i=0; i<this.points.length; i++ )
	 			{
	 				$('sandbox').removeChild(this.points[i]);
	 			}
	 		}
	 	},
	 	
	 	// addListener: Listen to gestures
	 	{
	 		name: "gesture",
            timeout: 5000,
            
            setUp: function()
	 		{
	 			alert("After this message disappears, you will have 5 seconds to try to rotate the yellow square");
	 			
	 			$('test').style.height = '200px';
	 			$('test').style.width = '200px';
	 		},
	 		
	 		handleGestureStart: function()
	 		{
	 			clearTimeout(doh.timer);
	 		},
	 		
	 		handleGestureChange: function(params)
	 		{
	 			if ( !wink.isNumber(params.srcEvent.rotation) )
	 			{
	 				this.d.errback(new Error("Event: wrong rotation parameters"));
	 			}
	 			
	 			$('test').winkRotate(params.srcEvent.rotation);
	 		},
	 		
	 		handleGestureEnd: function(params)
	 		{
	 			this.d.callback(true);
	 		},
            
            runTest: function(t)
			{
	 			this.d = new doh.Deferred();
	 			
	 			wink.ux.touch.addListener($('test'), "gesturestart", { context: this, method: "handleGestureStart", arguments: null }, { preventDefault: true });
	 			wink.ux.touch.addListener($('test'), "gesturechange", { context: this, method: "handleGestureChange", arguments: null }, { preventDefault: true });
	 			wink.ux.touch.addListener($('test'), "gestureend", { context: this, method: "handleGestureEnd", arguments: null }, { preventDefault: true });
	 			
	 			return this.d;
			},
			
			tearDown: function()
	 		{
				wink.ux.touch.removeListener($('test'), "gesturestart", { context: this, method: "handleGestureStart", arguments: null });
	 			wink.ux.touch.removeListener($('test'), "gesturechange", { context: this, method: "handleGestureChange", arguments: null });
	 			wink.ux.touch.removeListener($('test'), "gestureend", { context: this, method: "handleGestureEnd", arguments: null });
	 			
	 			wink.fx.apply($('test'), {
	 				height: '50px',
	 				width: '50px',
	 				transform: ''
	 			});
	 		}
	 	}
    ]
);