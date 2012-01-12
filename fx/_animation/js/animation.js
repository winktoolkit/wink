/*--------------------------------------------------------
 * Copyright (c) 2011, The Dojo Foundation
 * This software is distributed under the "Simplified BSD license",
 * the text of which is available at http://www.winktoolkit.org/licence.txt
 * or see the "license.txt" file for more details.
 *--------------------------------------------------------*/

/**
 * @fileOverview The animation utilities
 * 
 * @compatibility Iphone OS2, Iphone OS3, Iphone OS4, Android 1.5, Android 2.1, Android 2.2, Android 2.3, Android 3.0, Android 3.1, BlackBerry 6, BlackBerry 7, Bada 1.0
 * @author Sylvain LALANDE
 */

define(['../../../_amd/core'], function(wink)
{
	if ( typeof wink.fx.animation == 'undefined' )
	{
		/**
		 * @namespace The animation object is an extension of wink.fx (2d fx) that allows to animate the content.
		 * A transition is the change of a property's value over time. An animation is a sequence of steps, each step corresponds to one or several transitions.
		 * In addition, there are also the AnimationGroup, which allows multiple animations to start together and then be notified when the group ends.
		 * For each animation, it is possible to specify a callback. It is also possible to chain animations.
		 * 
		 * @example
		 * 
		 * var node1 = $('nodeId1'), node2 = $('nodeId2'), node3 = $('nodeId3'), node4 = $('nodeId4'), node5 = $('nodeId5'), node6 = $('nodeId6');
		 * 
		 * wink.fx.fadeOut(node1);
		 * wink.fx.animate(node2, { property: 'background-color', value: '#000', duration: 500 });
		 * 
		 * var anim = new wink.fx.animation.Animation();
		 * anim.addStep({ property: 'opacity', value: 0.9, duration: 500, delay: 1000, func: 'linear' });
		 * anim.start(node3);
		 * anim.start(node4);
		 * 
		 * var anim2 = new wink.fx.animation.Animation();
		 * var anim3 = new wink.fx.animation.Animation();
		 * anim2.addStep({ property: 'color', value: 'green', duration: 2000, delay: 3000, func: 'default' });
		 * anim3.addStep({ property: 'color', value: 'blue', duration: 2000, delay: 3000, func: 'default' });
		 * 
		 * var animGroup = new wink.fx.animation.AnimationGroup();
		 * animGroup.addAnimation(node5, anim2);
		 * animGroup.addAnimation(node6, anim3);
		 * animGroup.start();
		 * 
		 * @see <a href="WINK_ROOT_URL/fx/_animation/test/test_animation_1.html" target="_blank">Test page</a>
		 * @see <a href="WINK_ROOT_URL/fx/_animation/test/test_animation_2.html" target="_blank">Test page (advanced)</a>
		 * @see <a href="WINK_ROOT_URL/fx/_animation/test/test_animation_3.html" target="_blank">Test page (door animation)</a>
		 * @see <a href="WINK_ROOT_URL/fx/_animation/test/test_animation_4.html" target="_blank">Test page (page flip animation)</a>
		 * @see <a href="WINK_ROOT_URL/fx/_animation/test/test_animation_5.html" target="_blank">Test page (page fly animation)</a>
		 * @see <a href="WINK_ROOT_URL/fx/_animation/test/test_animation_6.html" target="_blank">Test page (page tip animation)</a>
		 * @see <a href="WINK_ROOT_URL/fx/_animation/test/test_animation_7.html" target="_blank">Test page (page wave animation)</a>
		 * @see <a href="WINK_ROOT_URL/fx/_animation/test/test_animation_8.html" target="_blank">Test page (starwink)</a>
		 */
		wink.fx.animation = {};
	}
	
	/**
	 * Generic method to animate a node via one or several transitions
	 * 
	 * @param {HTMLElement} node The node to animate
	 * @param {object} transitions An object (or an array of objects) that constructs a transition : { property, value, duration, delay, func }. Note: the value may be a callback
	 * @param {object} [options] The animations options
	 * @param {boolean} [options.start] False to prevent the animation to start (useful when chaining animations: the sequence of animation should be started when the definition of the sequence is performed)
	 * @param {object} [options.onEnd] Callback that will be invoked at the end of the transition
	 * 
	 * @returns {wink.fx.animation.Animation} The animation
	 */
	wink.fx.animate = function(node, transitions, options)
	{
		return _animate(node, transitions, options);
	};
	/**
	 * This is a use case of 'wink.fx.animate' on opacity property that passes to 1
	 * 
	 * @param {HTMLElement} node The node to animate
	 * @param {object} [options] The animations options
	 * @param {boolean} [options.start] False to prevent the animation to start
	 * @param {object} [options.onEnd] Callback that will be invoked at the end of the transition
	 * @param {integer} [options.duration] The duration of the animation
	 * @param {integer} [options.delay] The delay before starting animation
	 * @param {string} [options.func] The transition function to apply
	 * 
	 * @returns {wink.fx.animation.Animation} The animation
	 */
	wink.fx.fadeIn = function(node, options)
	{
		return _fadeTo(node, 1, options);
	};
	/**
	 * This is a use case of 'wink.fx.animate' on opacity property that passes to 0
	 * 
	 * @param {HTMLElement} node The node to animate
	 * @param {object} [options] The animations options
	 * @param {boolean} [options.start] False to prevent the animation to start
	 * @param {object} [options.onEnd] Callback that will be invoked at the end of the transition
	 * @param {integer} [options.duration] The duration of the animation
	 * @param {integer} [options.delay] The delay before starting animation
	 * @param {string} [options.func] The transition function to apply
	 *
	 * @returns {wink.fx.animation.Animation} The animation
	 */
	wink.fx.fadeOut = function(node, options)
	{
		return _fadeTo(node, 0, options);
	};
	/**
	 * Lets have a gravitational collapse on a node. This method splits the node into multiple rectangles that are 
	 * directed toward the specified point. The source node is not changed, only its opacity goes to 0.
	 * 
	 * @param {HTMLElement} node The node to animate
	 * @param {object} options The animations options
	 * @param {integer} options.rows The number of rows
	 * @param {integer} options.cols The number of columns
	 * @param {integer} [options.duration=2000] The duration of the effect
	 * @param {number} options.x The x coordinate of the starting point of the effect
	 * @param {number} options.y The y coordinate of the starting point of the effect
	 * @param {number} options.dx The x coordinate of the destination point of the effect
	 * @param {number} options.dy The y coordinate of the destination point of the effect
	 * @param {object} [options.onEnd] The callback of the end of the effect
	 */
	wink.fx.collapse = function(node, options)
	{
		var opts = options || {};
	
		var clone = _cloneSplitted(node, opts.rows, opts.cols);
		if (clone == null) {
			return;
		}
		
		// Replacement by subparts
		node.parentNode.appendChild(clone.copy.container.node);
		wink.fx.apply(node, {
			opacity: 0
		});
		
		var animDuration = opts.duration || 2000;
		var x = opts.x - clone.source.x, y = opts.y - clone.source.y;
		_setProximityOrder(clone, { x: x, y: y });
		
		var animPartDuration = wink.math.round(animDuration / 3, 0);
		var delayPart = (animDuration - animPartDuration) / clone.copy.orderMax;
		
		var animGroup = new wink.fx.animation.AnimationGroup();
		var translator = {
			translate: function(params, x, y) {
				var n = params.node;
				n.translate(x, y);
			}
		};

		for (var i = 0; i < clone.rows; i++) {
			for (var j = 0; j < clone.cols; j++) {
				var sp = clone.copy.subparts[i][j];
				
				var nRef = Math.max(clone.rows, clone.cols);
				var zIndex = nRef - Math.ceil(sp.order);
				
				var anim = new wink.fx.animation.Animation();
				anim.addStep({
					property: 'transform',
					value: { context: translator, method: 'translate', arguments: [ opts.dx, opts.dy ] },
					duration: animPartDuration,
					delay: wink.math.round(sp.order * delayPart, 0),
					func: 'cubic-bezier(1.0, 0.0, 1.0, 1.0)'
				});
				
				wink.fx.apply(sp.node, {
					zIndex: zIndex
				});
				animGroup.addAnimation(sp.node, anim);
			}
		}
		
		var onEndCallback = wink.isCallback(opts.onEnd) ? opts.onEnd : null;
		var ctx = {
			onEnd: function() {
				node.parentNode.removeChild(clone.copy.container.node);
				if (wink.isSet(onEndCallback)) {
					wink.call(onEndCallback, {});
				}
			}
		};
		animGroup.start({ onEnd: { context: ctx, method: 'onEnd' } });
	};
	/**
	 * Returns a clone structure that identifies the copy splited into subparts.
	 * 
	 * @param {HTMLElement} node The node to split
	 * @param {integer} rows The number of rows
	 * @param {integer} cols The number of colums
	 * 
	 * @example
	 * 
	 * cloneStructure: 
	 * {
	 * 	rows, cols, source,
	 * 	copy: 
	 * 	{
	 * 		subH: null,
	 * 		subW: null,
	 * 		container: 
	 * 		{
	 * 			node: null
	 * 		},
	 * 		subparts: []
	 * 	}
	 * }
	 * 
	 * @returns {object} The clone structure
	 */
	wink.fx.split = function(node, rows, cols)
	{
		var cloneCtx = _cloneSplitted(node, rows, cols);
		return cloneCtx;
	};
	/**
	 * Generic method to animate a node via one or several transitions
	 * 
	 * @param {HTMLElement} node The node to split
	 * @param {object} transitions An object (or an array of objects) that constructs a transition : { property, value, duration, delay, func }. Note: the value may be a callback
	 * @param {object} [options] The animations options
	 * @param {boolean} options.start False to prevent the animation to start
	 * @param {object} options.onEnd Callback that will be invoked at the end of the transition 
	 * 
	 * @returns {wink.fx.animation.Animation} The animation
	 */
	var _animate = function(node, transitions, options)
	{
		var opts = options || {};
		var toStart = (opts.start !== false);
		var onEnd = opts.onEnd ? opts.onEnd : null;
		var trs = wink.isArray(transitions) ? transitions : [ transitions ];
		
		for (var i = 0; i < trs.length; i++) {
			var trI = trs[i];
			if (!wink.isSet(trI.property) || !wink.isSet(trI.value)) {
				wink.log('[fx._animate] Error: parameter transitions invalid');
				return null;
			}
			if (!wink.isSet(trI.duration)) {
				trI.duration = 1000;
			}
			if (!wink.isSet(trI.delay)) {
				trI.delay = 0;
			}
			if (!wink.isSet(trI.func)) {
				trI.func = 'linear';
			}
		}
		
		var anim = new wink.fx.animation.Animation({
			node: node,
			onEnd: onEnd
		});
		anim.addStep(trs);
		if (toStart) {
			anim.start();
		}
		return anim;
	};
	/**
	 * Fades the node to the given opacity value.
	 * 
	 * @param {HTMLElement} node The node to fade
	 * @param {number} to The targeted opacity value
	 * @param {object} [options] The animations options
	 * @param {boolean} options.start False to prevent the animation to start,
	 * @param {object} options.onEnd Callback that will be invoked at the end of the transition
	 * @param {integer} options.duration The duration of the animation
	 * @param {integer} options.delay The delay before starting animation
	 * @param {string} options.func The transition function to apply
	 *
	 * @returns {wink.fx.animation.Animation} The animation
	 */
	var _fadeTo = function(node, to, options)
	{
		var opts = options || {};
		return _animate(node, { 
			property: 'opacity', 
			value: to,
			duration: opts.duration,
			delay: opts.delay,
			func: opts.func
		}, opts);
	};
	/**
	 * Determine an order for subparts in relation to a given point.
	 * 
	 * @param {object} clone The clone structure
	 * @param {object} point The reference point
	 */
	var _setProximityOrder = function(clone, point)
	{
		var dx = Math.abs(clone.cols * clone.copy.subW);
		var dy = Math.abs(clone.rows * clone.copy.subH);
		var dMax = Math.sqrt((dx * dx) + (dy * dy));
		var nRef = Math.max(clone.rows, clone.cols);
		var dMin = Number.MAX_VALUE;
		var spMin = { i: 0, j: 0 };
		var oMax = 0;
		
		for (var i = 0; i < clone.rows; i++) {
			for (var j = 0; j < clone.cols; j++) {
				var sp = clone.copy.subparts[i][j];
				var center = {
					x: sp.x + sp.w / 2,
					y: sp.y + sp.h / 2
				};
				dx = Math.abs(center.x - point.x);
				dy = Math.abs(center.y - point.y);
				var d = Math.sqrt((dx * dx) + (dy * dy));
				sp.distance = d;
				
				if (d < dMin) {
					dMin = d;
					spMin = { i: i, j: j };
				}
				
				var order = (sp.distance * nRef) / dMax;
				sp.order = Math.max(order, 1);
				
				if (oMax < order) {
					oMax = order;
				}
			}
		}
		clone.copy.subparts[spMin.i][spMin.j].order = 0;
		clone.copy.orderMax = oMax;
	};
	/**
	 * Returns some style properties of the given node
	 * 
	 * @param {HTMLElement} node The DOM node
	 * 
	 * @returns {object} The node properties
	 */
	var _getNodeProperties = function(node)
	{
		var s = function(n, p, px) {
			var view = n.ownerDocument.defaultView || window;
			var cStyle= view.getComputedStyle(n, null);
			var style = cStyle.getPropertyValue(p);
			return px ? parseFloat(style) : style; 
		};
		
		var p = {
			x: node.getLeftPosition(),
			y: node.getTopPosition(),
			h: s(node, "height", true),
			w: s(node, "width", true),
			bh: s(node, "border-top-width", true) + s(node, "border-bottom-width", true),
			bw: s(node, "border-left-width", true) + s(node, "border-right-width", true),
			zIndex: s(node, "z-index")
		};
		return p;
	};
	/**
	 * Returns a clone structure that identifies the copy splited into subparts.
	 * 
	 * @param {HTMLElement} node The node to split
	 * @param {integer} rows The number of rows
	 * @param {integer} cols The number of colums
	 */
	var _cloneSplitted = function(node, rows, cols)
	{
		if (!wink.isSet(node) || !wink.isSet(rows) || !wink.isSet(cols)) {
			wink.log('[fx._cloneSplitted] Error: parameters missing or invalid');
			return null;
		}
	
		var cloneCtx = {
			rows: rows,
			cols: cols,
			source: _getNodeProperties(node),
			copy: {
				subH: null,
				subW: null,
				container: {
					node: null,
					style: null
				},
				subparts: []
			}
		};
		
		var subH = (cloneCtx.source.h + cloneCtx.source.bh) / cloneCtx.rows;
		var subW = (cloneCtx.source.w + cloneCtx.source.bw) / cloneCtx.cols;
		
		cloneCtx.copy.subH = subH;
		cloneCtx.copy.subW = subW;
		
		var sh = subH, sw = subW;
		var shr = wink.math.round(sh, 0);
		var swr = wink.math.round(sw, 0);
		var dh = sh - shr;
		var dw = sw - swr;
		var dht = wink.math.round(dh * cloneCtx.rows, 0);
		var dwt = wink.math.round(dw * cloneCtx.cols, 0);
		
		cloneCtx.copy.container.node = document.createElement(node.tagName);
		wink.fx.apply(cloneCtx.copy.container.node, {
			position: "absolute",
			padding: 0,
			margin: 0,
			border: "none",
			top: cloneCtx.source.y + "px",
			left: cloneCtx.source.x + "px",
			height: (cloneCtx.source.h + cloneCtx.source.bh) + "px",
			width: (cloneCtx.source.w + cloneCtx.source.bw) + "px",
			background: "none",
			overflow: "hidden",
			zIndex: cloneCtx.source.zIndex
		});
		
		for (var i = 0; i < cloneCtx.rows; i++) {
			if (!cloneCtx.copy[i]) {
				cloneCtx.copy.subparts[i] = [];
			}
			for (var j = 0; j < cloneCtx.cols; j++) {
				var spCtx = {
					i: i,
					j: j
				};

				var onEdgeX = (j == cloneCtx.cols - 1);
				var onEdgeY = (i == cloneCtx.rows - 1);
				
				spCtx.x = (j * swr);
				spCtx.y = (i * shr);
				spCtx.h = shr;
				spCtx.w = swr;
				
				if (onEdgeX) {
					spCtx.w = Math.max(spCtx.w + dwt, 0);
				}
				if (onEdgeY) {
					spCtx.h = Math.max(spCtx.h + dht, 0);
				}
				
				spCtx.node = document.createElement(node.tagName);
				wink.fx.apply(spCtx.node, {
					position: "absolute",
					padding: 0,
					margin: 0,
					border: "none",
					left: spCtx.x + "px",
					top: spCtx.y + "px",
					height: spCtx.h + "px",
					width: spCtx.w + "px",
					overflow: "hidden"
				});
				
				spCtx.inner = node.cloneNode(true);
				spCtx.inner.removeAttribute("id");
				wink.fx.apply(spCtx.inner, {
					position: "static",
					marginTop: -spCtx.y + "px",
					marginLeft: -spCtx.x + "px"
				});
				
				spCtx.node.appendChild(spCtx.inner);
				
				cloneCtx.copy.subparts[i].push(spCtx);
				cloneCtx.copy.container.node.appendChild(spCtx.node);
			}
		}
		return cloneCtx;
	};

	/**
	 * @class The Animation component: a sequence of steps, each step corresponds to one or several transitions.
	 * 
	 * @param {object} properties The properties object
	 * @param {HTMLElement} [properties.node] The default node on which the animation will be applied if none is specified with start() method
	 * @param {object} [properties.onEnd] The default callback of the animation which will be invoked if none is specified with start() method
	 */
	wink.fx.animation.Animation = function(properties) 
	{
		/**
		 * Unique identifier
		 * 
		 * @property
		 * @type integer
		 */
		this.uId	= wink.getUId();
		var props = properties || {};
		
		this._steps = [];
		this._node = props.node;
		this._onEnd = props.onEnd;
	};
	wink.fx.animation.Animation.prototype = 
	{
		/**
		 * Adds a step to the animation with one or several transitions.
		 * 
		 * @param {object} propList An object (or an array of objects) that constructs a transition : { property, value, duration, delay, func }. Note: the value may be a callback
		 */
		addStep: function(propList)
		{
			var pl = wink.isArray(propList) ? propList : [ propList ];
			
			var ps = [], ds = [], dls = [], fs = [];
			var propValues = {};
			
			for (var i = 0; i < pl.length; i++) {
				var pli = pl[i];
				var p = pli.property;
				
				var v = pli.value;
				var dt = pli.duration;
				var dl = Math.max(wink.isSet(pli.delay) ? pli.delay : 1, 1);
				var f = wink.isSet(pli.func) ? pli.func : 'default';
				
				var resolvedProp = wink.has.prop(p);
				ps.push(resolvedProp);
				ds.push(dt + "ms");
				dls.push(dl + "ms");
				fs.push(f);
				
				propValues[resolvedProp] = v;
			}
			
			this._steps.push({
				propValues: propValues,
				transition: {
					property: ps.join(","),
					duration: ds.join(","),
					delay: dls.join(","),
					func: fs.join(",")
				}
			});
		},
		/**
		 * Starts the animation on the given node. An animation may be started on multiple nodes.
		 * 
		 * @param {HTMLElement} node The node on which the animation must be applied, may be optional if one was specified at instanciation
		 * @param {object} [options] The animations options
		 * @param {object} [options.onEnd] The callback of the animation which will be invoked at the end of the animation
		 */
		start: function(node, options)
		{
			var opts = options || {};
			var n = node || this._node;
			opts.onEnd = opts.onEnd || this._onEnd;
			
			if (!wink.isSet(n)) {
				wink.log('[Animation.start] Error: node missing or invalid');
				return;
			}
	
			var animContext = {
				uId: wink.getUId(),
				node: n,
				currentStep: -1,
				iterations: opts.iterations ? opts.iterations : 1,
				currentIt: 0,
				onEnd: wink.isCallback(opts.onEnd) ? opts.onEnd : null
			};
			this._nextStep(animContext);
		},
		/**
		 * Returns the animation steps
		 * 
		 * @returns {array} The animation steps
		 */
		getSteps: function()
		{
			return this._steps;
		},
		/**
		 * This method allows to continue an animation with another one. It returns the current animation.
		 * It is recommended to use addStep() to string together steps on the same node.
		 * However, this method is useful to chain several animations on different nodes.
		 * The sequence of animations involves prevent the start on each one. 
		 * The animation should be started when the definition of the sequence is performed.
		 * 
		 * @param {wink.fx.animation.Animation} animation The animation to chain
		 * 
		 * @returns {wink.fx.animation.Animation} The current animation
		 */
		chain: function(animation)
		{
			if (!animation instanceof wink.fx.animation.Animation) {
				wink.log('[Animation.chain] Error: animation is invalid');
				return;
			}
			var steps = animation.getSteps();
			for (var i = 0; i < steps.length; i++) {
				this._steps.push(steps[i]);
			}
			return this;
		},
		/**
		 * Method invoked when the animation is finished
		 * 
		 * @param {object} animContext The animation context
		 */
		_end: function(animContext)
		{
			animContext.currentIt++;
			if (animContext.currentIt < animContext.iterations) {
				animContext.currentStep = -1;
				this._nextStep(animContext);
			} else {
				if (wink.isSet(animContext.onEnd)) {
					wink.call(animContext.onEnd, {});
				}
			}
		},
		/**
		 * Method invoked when a step is finished
		 * 
		 * @param {object} animContext The animation context
		 */
		_nextStep: function(animContext)
		{
			animContext.currentStep++;
			if (animContext.currentStep >= this._steps.length) {
				this._end(animContext);
				return;
			}
			
			var n = animContext.node;
			var step = this._steps[animContext.currentStep];
			
			animContext.transitionStates = {};
			for (var p in step.propValues) {
				animContext.transitionStates[p] = false;
			}
			var onTrEnd = wink.bind(this._transitionEnd, this, animContext);
			animContext.trEndHandler = wink.fx.onTransitionEnd(n, onTrEnd, true);
			
			animContext.timer = wink.setTimeout(this, '_startStep', 0, n, step, animContext);
		},
		/**
		 * Starts a step with a defered state for proper operation
		 * 
		 * @param {HTMLElement} node The animated node
		 * @param {object} step The step to start
		 * @param {object} animContext The animation context
		 */
		_startStep: function(node, step, animContext)
		{
			clearTimeout(animContext.timer);
			var tr = step.transition;
			wink.fx.applyTransition(node, tr.property, tr.duration, tr.delay, tr.func);
			this._setStyle(node, step.propValues);
		},
		/**
		 * Method invoked when a transition (part of a step) is finished
		 * 
		 * @param {object} animContext The animation context
		 * @param {object} transitionEvent The transition end event
		 */
		_transitionEnd: function(animContext, transitionEvent)
		{
			var prop = transitionEvent.propertyName;
			animContext.transitionStates[prop] = true;
			
			var stepFinished = true;
			for (var p in animContext.transitionStates) {
				if (animContext.transitionStates[p] == false) {
					stepFinished = false;
					break;
				}
			}
			if (stepFinished) {
				animContext.node.removeEventListener(wink.has.prop("transitionend"), animContext.trEndHandler, false);
				this._nextStep(animContext);
			}
		},
		/**
		 * Apply the style that composed the animation to the node
		 * 
		 * @param {HTMLElement} node The animated node
		 * @param {object} properties The property value pairs
		 */
		_setStyle: function(node, properties)
		{
			var stylesCount = 0;
			var styles = {};
			for (var p in properties) {
				var v = properties[p];
				if (wink.isCallback(v)) {
					wink.call(v, { node: node });
				} else {
					styles[p] = v;
					stylesCount++;
				}
			}
			if (stylesCount > 0) {
				wink.fx.apply(node, styles);
			}
		}
	};
	
	/**
	 * @class The AnimationGroup component: a set of animations
	 */
	wink.fx.animation.AnimationGroup = function(properties)
	{
		/**
		 * Unique identifier
		 * 
		 * @property
		 * @type integer
		 */
		this.uId			= wink.getUId();
		this._animations	= [];
		this._countDone		= null;
		this._onEndCallback	= null;
	};
	wink.fx.animation.AnimationGroup.prototype = 
	{
		/**
		 * Adds the given animation to the group
		 * 
		 * @param {HTMLElement} node The node associated to the animation
		 * @param {wink.fx.animation.Animation} animation The animation that will comprise the group
		 */
		addAnimation: function(node, animation)
		{
			if (!animation instanceof wink.fx.animation.Animation) {
				wink.log('[AnimationGroup.addAnimation] Error: animation is invalid');
				return;
			}
			this._animations.push({
				node: node,
				anim: animation
			});
		},
		/**
		 * Starts the animation group
		 * 
		 * @param {object} [options] The animations options
		 * @param {object} [options.onEnd] The callback of the animation group which will be invoked at the end of the animation group
		 */
		start: function(options)
		{
			var opts = options || {};
			this._countDone = 0;
			
			var handleEnd = wink.isCallback(opts.onEnd);
			this._onEndCallback = handleEnd ? opts.onEnd : null;
			var args = {
				onEnd: handleEnd ? { context: this, method: '_onAnimEnd' } : null
			};
			
			for (var i = 0; i < this._animations.length; i++) {
				var ai = this._animations[i];
				ai.anim.start(ai.node, args);
			}
		},
		/**
		 * Allows to clear the group
		 */
		clear: function()
		{
			this._animations = [];
		},
		/**
		 * Method invoked when an animation is finished
		 */
		_onAnimEnd: function()
		{
			this._countDone++;
			
			if (this._countDone == this._animations.length) {
				wink.call(this._onEndCallback, {});
			}
		}
	};
	
	return wink.fx;
});