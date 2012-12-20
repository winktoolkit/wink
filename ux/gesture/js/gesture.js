/*--------------------------------------------------------
 * Copyright (c) 2011, The Dojo Foundation
 * This software is distributed under the "Simplified BSD license",
 * the text of which is available at http://www.winktoolkit.org/licence.txt
 * or see the "license.txt" file for more details.
 *--------------------------------------------------------*/

/**
 * @fileOverview Implements a Gesture management system.
 * Determines whether some gestures (with exactly 2 fingers) are performed on the nodes and if so, 
 * inform the listeners. Gestures that can be listened are referenced in the "_knownGestures" attribute below.
 * The notifications to the listeners include parameters that depends on gesture type.
 * 
 * @author Sylvain LALANDE
 */
define(['../../../_amd/core'], function(wink)
{
    /**
     * @namespace 
     * 
     * Implements a Gesture management system.
     * Determines whether some gestures (with exactly 2 fingers) are performed on the nodes and if so, 
     * inform the listeners. Gestures that can be listened are referenced in the "_knownGestures" attribute below.
     * The notifications to the listeners include parameters that depends on gesture type.
     * <br><br>
     * The gesture object is able to determines whether some gestures (with exactly 2 fingers) 
     * are performed on the nodes and if so, inform the listeners. Gestures that can be listened 
     * are : 
     * <br>
     * - two_digits_click: on click with 2 fingers
     * <br>
     * - two_digits_press: on pressure with 2 fingers
     * <br>
     * - enlargement: A separation of the 2 fingers, as if to zoom in
     * <br>
     * - narrowing: bring 2 fingers closer, as if to zoom out
     * <br>
     * - rotation: a rotation with 2 fingers
     * <br>
     * - instant_scale: Each alignment or each spacing of 2 fingers
     * <br>
     * - instant_rotation: Each rotation of 2 fingers
     * <br>
     * - gesture_end: the end a a gesture
     * <br><br>
     * The notifications to the listeners include parameters that depends on gesture type.
     * 
     * @example
     * 
     * var node = wink.byId("nodeId");
     * wink.ux.gesture.listenTo(node, "two_digits_click", { context: window, method: "twoDigitsClick" }, { preventDefault: true });
     * 
     * @compatibility iOS2, iOS3, iOS4, iOS5, iOS6, WP7
     * 
     * @see <a href="WINK_ROOT_URL/ux/gesture/test/test_gesture_1.html" target="_blank">Test page</a>
     * @see <a href="WINK_ROOT_URL/ux/gesture/test/test_gesture_2.html" target="_blank">Test page (box)</a>
     */
    wink.ux.gesture =
    {
        _gestureElements				: [],
        _knownGestures					: [
            "two_digits_click",     // { digit1, digit2 }
            "two_digits_press",     // { digit1, digit2 }
            "enlargement",          // { digit1, digit2, scale }
            "narrowing",            // { digit1, digit2, scale }
            "rotation",             // { digit1, digit2, rotation }
            "instant_scale",        // { digit1, digit2, scale }
            "instant_rotation",     // { digit1, digit2, rotation }
            "gesture_end"           // { gestureDuration }
        ],
        
        _evtKey                     : (function() {
                                            var type = 'touch';
                                            if(wink.has('mspointer')) { type = 'pointer'; }
                                            return type;
                                        })(),
        _mappingMethods : {
            "_handleStart"          : { 'touch': "_handleStart", 'pointer': "_PointerHandleStart" },
            "_handleMove"           : { 'touch': "_handleMove",  'pointer': "_PointerHandleMove" },
            "_handleEnd"            : { 'touch': "_handleEnd",   'pointer': "_PointerHandleEnd" },
            
            "_handleGestureStart"   : { 'touch': "_handleGestureStart",  'pointer': "_handleGestureStart" },
            "_handleGestureChange"  : { 'touch': "_handleGestureChange", 'pointer': "_handleGestureChange" },
            "_handleGestureEnd"     : { 'touch': "_handleGestureEnd",    'pointer': "_handleGestureEnd" }
        },
        
        TWO_DIGITS_CLICK_MAX_DURATION   : 350,      // ms
        TWO_DIGITS_PRESS_MIN_DURATION   : 400,      // ms
        SCALE_MIN_VALUE                 : 0.2,      // ratio
        ROTATION_MIN_VALUE              : 5,        // degree
        
        /**
         * Allows to listen for a specific gesture on a dom Node
         * 
         * @param {HTMLElement} domNode the DOM node that listens to gesture
         * @param {string} gesture The gesture name to listen
         * @param {object|function} callback The callback to invoke when this gesture is done
         * @param {object} [options] The options associated to the listener
         * @param {boolean} [options.preventDefault=false] Indicates whether an automatic preventDefault must be done
         */
        listenTo: function(domNode, gesture, callback, options)
        {
            if (!this._isGestureKnown(gesture))
            {
                wink.log('[gesture] Cannot listen to this unknown gesture: ' + gesture);
                return false;
            }
            if (!wink.isCallback(callback))
            {
                wink.log('[gesture] Invalid callback: ' + callback);
                return false;
            }
            
            var opts = { preventDefault: false };
            if (wink.isSet(options))
            {
                if (options === true)
                {
                    opts.preventDefault = true; // backwards compatibility
                }
                else
                {
                    opts.preventDefault = (options.preventDefault === true);
                }
            }
            
            var gestureElement = null;
            var index = this._getGestureElementIndex(domNode);
            if (index == null) 
            {
                gestureElement = this._createGestureElement(domNode, opts.preventDefault);
                this._gestureElements.push(gestureElement);
                
                // MS pointer compatibility
                if(wink.has('mspointer')) {
                    gestureElement.boxGesture = new MSGesture();
                    gestureElement.boxGesture.target = domNode;
                }
                
                wink.ux.touch.addListener(gestureElement.domNode, "start", { context: this, method: this._getEvtKey("_handleStart"), arguments: [ gestureElement ] }, { preventDefault: gestureElement.preventDefault, tracking: false });
                wink.ux.touch.addListener(gestureElement.domNode, "gesturestart", { context: this, method: this._getEvtKey("_handleGestureStart"), arguments: [ gestureElement ] }, { preventDefault: gestureElement.preventDefault });
            }
            else
            {
                gestureElement = this._gestureElements[index];
            }
            gestureElement.addCallback(gesture, callback);
        },
        /**
         * Allows to unlisten for a specific gesture on a dom Node
         * 
         * @param {HTMLElement} domNode The DOM node that listens to gesture
         * @param {string} gesture The gesture name to unlisten
         * @param {object|function} callback The callback that was previously added (identified by { context, method })
         */
        unlistenTo: function(domNode, gesture, callback)
        {
            if (!this._isGestureKnown(gesture))
            {
                wink.log('[gesture] Cannot listen to this unknown gesture: ' + gesture);
                return false;
            }
            if (!wink.isCallback(callback))
            {
                wink.log('[gesture] Invalid callback: ' + callback);
                return false;
            }
            var gestureElement = null;
            var index = this._getGestureElementIndex(domNode);
            if (index == null)
            {
                return;
            }
            gestureElement = this._gestureElements[index];
            gestureElement.removeCallback(gesture, callback);
        },
        /**
         *
         * @param {HTMLElement} domNode The gesture element dom node
         * @param {boolean} preventDefault Indicates if an automatic preventDefault must be done
         * 
         * @returns {object} gesture element
         */
        _createGestureElement: function(domNode, preventDefault)
        {
            var gestureElement = {
                uId: wink.getUId(),
                domNode: domNode,
                preventDefault: preventDefault,
                digits: [],
                multitouch: false,
                multitouchStartTime: null,
                multitouchEndTime: null,
                scale: 1.0,
                rotation: 0,
                gestureHandlers: [], // gesture, callbacks
                getGestureHandler: function(gesture)
                {
                    for (var i = 0; i < this.gestureHandlers.length; i++)
                    {
                        if (this.gestureHandlers[i].gesture == gesture)
                        {
                            return this.gestureHandlers[i];
                        }
                    }
                    return null;
                },
                isListening: function(gesture)
                {
                    var gestureHandler = this.getGestureHandler(gesture);
                    return (gestureHandler != null);
                },
                addCallback: function(gesture, callback)
                {
                    if (this.isListening(gesture))
                    {
                        this.getGestureHandler(gesture).callbacks.push(callback);
                    }
                    else
                    {
                        this.gestureHandlers.push({
                            gesture: gesture, 
                            callbacks: [ callback ]
                        });
                    }
                },
                removeCallback: function(gesture, callback)
                {
                    if (this.isListening(gesture))
                    {
                        var isFn = wink.isFunction(callback);
                        
                        for (var i = 0; i < this.getGestureHandler(gesture).callbacks.length; i++) {
                            var callbackI = this.getGestureHandler(gesture).callbacks[i];
                            if ((isFn && callbackI == callback) || (!isFn && callbackI.context == callback.context && callbackI.method == callback.method))
                            {
                                if (this.getGestureHandler(gesture).callbacks.length == 1)
                                {
                                    for (var j = 0; j < this.gestureHandlers.length; j++)
                                    {
                                        if (this.gestureHandlers[j].gesture == gesture)
                                        {
                                            this.gestureHandlers.splice(j, 1);
                                            break;
                                        }
                                    }
                                }
                                else
                                {
                                    this.getGestureHandler(gesture).callbacks.splice(i, 1);
                                }
                                break;
                            }
                        }
                    }
                },
                reset: function()
                {
                    var _t = this;
                    _t.digits = [];
                    _t.multitouch = false;
                    _t.multitouchStartTime = null;
                    _t.multitouchEndTime = null;
                    _t.scale = 1.0;
                    _t.rotation = 0;
                }
            };
            
            // Add mspointer compatibility
            if(wink.has('mspointer')) 
            {
                gestureElement.boxGesture = null;
                
                gestureElement.addDigit = function(event) {
                    this.digits.push(event);
                };
                
                gestureElement.removeDigit = function(pointerId) {
                    for(var i=0, l=this.digits.length; i<l; i++) {
                        if(this.digits[i].pointerId == pointerId) {
                            this.digits.splice(i, 1);
                            return;
                        }
                    }
                };
            }
            
            return gestureElement;
        },
        /**
         * @param {string} gesture The gesture name to check
         */
        _isGestureKnown: function(gesture)
        {
            return (this._knownGestures.indexOf(gesture) != -1);
        },
        /**
         * @param {HTMLElement} domNode The DOM node
         */
        _getGestureElementIndex: function(domNode)
        {
            for (var i = 0; i < this._gestureElements.length; i++) 
            {
                var gestureElementI = this._gestureElements[i];
                if (gestureElementI.domNode == domNode) 
                {
                    return i;
                }
            }
            return null;
        },
        /**
         * Invoke callbacks that are concerned by the gesture on the given element.
         * 
         * @param {string} gesture The gesture name
         * @param {HTMLElement} gestureElement The gesture element
         */
        _notifyGesture: function(gesture, gestureElement, gestureInfos)
        {
            if (!gestureElement.isListening(gesture))
            {
                return;
            }
            
            var callbacks = gestureElement.getGestureHandler(gesture).callbacks;
            for (var j = 0; j < callbacks.length; j++) 
            {
                wink.call(callbacks[j], gestureInfos);
            }
        },
        /**
         * Handle touch start
         * 
         * @param {wink.ux.Event} uxEvent The Wink Event associated
         * @param {object} gestureElement The GestureElement associated
         */
        _handleStart: function(uxEvent, gestureElement)
        {
            gestureElement.reset();
            if (gestureElement.checkTimer)
            {
                clearTimeout(gestureElement.checkTimer);
            }
            
            var nbTouches = 0;
            if (wink.isSet(uxEvent.srcEvent.targetTouches))
            {
                nbTouches = uxEvent.srcEvent.targetTouches.length;
            }
            
            if (nbTouches == 2)
            {
                gestureElement.multitouch = true;
                gestureElement.multitouchStartTime = this._getTimeStamp();
                
                gestureElement.digits.push(this._getDigit(uxEvent.srcEvent.targetTouches[0], uxEvent));
                gestureElement.digits.push(this._getDigit(uxEvent.srcEvent.targetTouches[1], uxEvent));
                
                wink.ux.touch.addListener(gestureElement.domNode, "move", {context: this, method: this._getEvtKey("_handleMove"), arguments: [ gestureElement ]}, {preventDefault: gestureElement.preventDefault});
                wink.ux.touch.addListener(gestureElement.domNode, "end",  {context: this, method: this._getEvtKey("_handleEnd"),  arguments: [ gestureElement ]});
                
                gestureElement.checkTimer = wink.setTimeout(this, "_checkTwoDigitsPressed", this.TWO_DIGITS_PRESS_MIN_DURATION, gestureElement);
            }
            else
            {
                gestureElement.multitouch = false;
                wink.ux.touch.removeListener(gestureElement.domNode, "move", {context: this, method: this._getEvtKey("_handleMove"), arguments: [ gestureElement ]});
                wink.ux.touch.removeListener(gestureElement.domNode, "end", {context: this,  method: this._getEvtKey("_handleEnd"),  arguments: [ gestureElement ]});
            }
        },
        /**
         * An implementation for the mspointer
         * 
         * @see wink.ux.gesture._handleStart
         */
        _PointerHandleStart: function(uxEvent, gestureElement) {
            if (gestureElement.checkTimer)
            {
                clearTimeout(gestureElement.checkTimer);
            }
            
            gestureElement.boxGesture.addPointer(uxEvent.srcEvent.pointerId);
            gestureElement.addDigit(this._getDigit(uxEvent.srcEvent, uxEvent));
            
            var nbTouches = gestureElement.digits.length;
            if (nbTouches == 2)
            {
                gestureElement.multitouch = true;
                gestureElement.multitouchStartTime = this._getTimeStamp();
                
                wink.ux.touch.addListener(gestureElement.domNode, "move", { context: this, method: this._getEvtKey("_handleMove"), arguments: [ gestureElement ] }, { preventDefault: gestureElement.preventDefault });
                wink.ux.touch.addListener(gestureElement.domNode, "end", { context: this, method: this._getEvtKey("_handleEnd"), arguments: [ gestureElement ] });
                
                gestureElement.checkTimer = wink.setTimeout(this, "_checkTwoDigitsPressed", this.TWO_DIGITS_PRESS_MIN_DURATION, gestureElement);
            }
            else
            {
                gestureElement.multitouch = false;
                wink.ux.touch.addListener(gestureElement.domNode, "move", { context: this, method: this._getEvtKey("_handleMove"), arguments: [ gestureElement ] }, { preventDefault: gestureElement.preventDefault });
                wink.ux.touch.addListener(gestureElement.domNode, "end", { context: this, method: this._getEvtKey("_handleEnd"), arguments: [ gestureElement ] });
            }
        },
        /**
         * Handle touch move
         * 
         * @param {wink.ux.Event} uxEvent The Wink Event associated
         * @param {object} gestureElement The GestureElement associated
         */
        _handleMove: function(uxEvent, gestureElement)
        {
            var nbTouches = 0;
            if (wink.isSet(uxEvent.srcEvent.targetTouches))
            {
                nbTouches = uxEvent.srcEvent.targetTouches.length;
            }
            
            if (nbTouches == 2)
            {
                gestureElement.digits = [];
                gestureElement.digits.push(this._getDigit(uxEvent.srcEvent.targetTouches[0], uxEvent));
                gestureElement.digits.push(this._getDigit(uxEvent.srcEvent.targetTouches[1], uxEvent));
            }
        },
        /**
         * An implementation for the mspointer
         * 
         * @see wink.ux.gesture._handleMove
         */
        _PointerHandleMove: function(uxEvent, gestureElement)
        {
            var nbTouches = gestureElement.digits.length;	
            if (nbTouches == 2) {
                gestureElement.removeDigit(uxEvent.srcEvent.pointerId);
                gestureElement.addDigit(uxEvent.srcEvent);
            }
        },
        /**
         * Handle touch end
         * 
         * @param {wink.ux.Event} uxEvent The Wink Event associated
         * @param {object} gestureElement The GestureElement associated
         */
        _handleEnd: function(uxEvent, gestureElement)
        {
            if (gestureElement.multitouch == true)
            {
                var nbTouches = 0;
                if (wink.isSet(uxEvent.srcEvent.targetTouches))
                {
                    nbTouches = uxEvent.srcEvent.targetTouches.length;
                }
                if (nbTouches != 2)
                {
                    gestureElement.multitouch = false;
                }
                
                if (nbTouches == 0)
                {
                    wink.ux.touch.removeListener(gestureElement.domNode, "move", { context: this, method: this._getEvtKey("_handleMove") });
                    wink.ux.touch.removeListener(gestureElement.domNode, "end", { context: this, method: this._getEvtKey("_handleEnd") });
                    
                    gestureElement.multitouchEndTime = this._getTimeStamp();
                    var multitouchDuration = gestureElement.multitouchEndTime - gestureElement.multitouchStartTime;
                    
                    if (multitouchDuration < this.TWO_DIGITS_CLICK_MAX_DURATION)
                    {
                        var gestureInfos = {
                            digit1: gestureElement.digits[0],
                            digit2: gestureElement.digits[1]
                        };
                        this._notifyGesture("two_digits_click", gestureElement, gestureInfos);
                    }
                }
            }
        },
        /**
         * An implementation for the mspointer
         * 
         * @see wink.ux.gesture._handleEnd
         */
        _PointerHandleEnd: function(uxEvent, gestureElement)
        {
            gestureElement.removeDigit(uxEvent.srcEvent.pointerId);
            gestureElement.boxGesture.stop();
            
            if (gestureElement.multitouch == true)
            {
                var nbTouches = gestureElement.digits.length;
                if (nbTouches == 0)
                {
                    wink.ux.touch.removeListener(gestureElement.domNode, "move", { context: this, method: this._getEvtKey("_handleMove") });
                    wink.ux.touch.removeListener(gestureElement.domNode, "end", { context: this, method: this._getEvtKey("_handleEnd") });
                    
                    gestureElement.multitouchEndTime = this._getTimeStamp();
                    var multitouchDuration = gestureElement.multitouchEndTime - gestureElement.multitouchStartTime;
                    
                    if (multitouchDuration < this.TWO_DIGITS_CLICK_MAX_DURATION
                    && gestureElement.scale == 1.0)
                    {
                        var gestureInfos = {
                            digit1: gestureElement.digits[0],
                            digit2: gestureElement.digits[1]
                        };
                        this._notifyGesture("two_digits_click", gestureElement, gestureInfos);
                        clearTimeout(gestureElement.checkTimer);
                    }
                    
                    gestureElement.reset();
                }
            }
        },
        /**
         * Check if two digits are pressed on the given gesture element.
         * 
         * @param {object} gestureElement The GestureElement associated
         */
        _checkTwoDigitsPressed: function(gestureElement)
        {
            var isValid = gestureElement.multitouch == true;
            if(wink.has('mspointer')) {
                isValid = isValid && gestureElement.scale == 1;
            }
            
            if (isValid)
            {
                var gestureInfos = {
                    digit1: gestureElement.digits[0],
                    digit2: gestureElement.digits[1]
                };
                this._notifyGesture("two_digits_press", gestureElement, gestureInfos);
            }
        },
        /**
         * Handle gesture start
         * 
         * @param {wink.ux.Event} uxEvent The Wink Event associated
         * @param {object} gestureElement The GestureElement associated
         */
        _handleGestureStart: function(uxEvent, gestureElement)
        {
            wink.ux.touch.addListener(gestureElement.domNode, "gesturechange", { context: this, method: this._getEvtKey("_handleGestureChange"), arguments: [ gestureElement ] }, { preventDefault: gestureElement.preventDefault });
            wink.ux.touch.addListener(gestureElement.domNode, "gestureend", { context: this, method: this._getEvtKey("_handleGestureEnd"), arguments: [ gestureElement ] });
            
            gestureElement.gestureStartTime = this._getTimeStamp();
        },
        /**
         * Handle gesture change
         * 
         * @param {wink.ux.Event} uxEvent The Wink Event associated
         * @param {object} gestureElement The GestureElement associated
         */
        _handleGestureChange: function(uxEvent, gestureElement)
        {
            if (gestureElement.multitouch == true)
            {
                var scaleValue          = uxEvent.srcEvent.scale,
                    rotateValue         = uxEvent.srcEvent.rotation,
                    scaleAmplitude      = scaleValue,
                    rotationAmplitude   = rotateValue;
                    
                if(wink.has('touch') && !wink.has('mspointer')) {
                    scaleAmplitude      -= gestureElement.scale;
                    rotationAmplitude   -= gestureElement.rotation;
                }
                
                var scaleGestureInfos = {
                    digit1: gestureElement.digits[0],
                    digit2: gestureElement.digits[1],
                    scale: wink.math.round(scaleValue, 2)
                };
                
                var rotationGestureInfos = {
                    digit1: gestureElement.digits[0],
                    digit2: gestureElement.digits[1],
                    rotation: wink.math.round(rotateValue, 2)
                };
                
                if (Math.abs(scaleAmplitude) > this.SCALE_MIN_VALUE)
                {
                    gestureElement.scale = scaleValue;
                    
                    var currentGesture  = null;
                    if((wink.has('touch') && !wink.has('mspointer') && scaleAmplitude > 0)
                    || (wink.has('mspointer') && scaleValue >= 1))
                    {
                        currentGesture = "enlargement";
                    }
                    else
                    {
                        currentGesture = "narrowing";
                    }
                    this._notifyGesture(currentGesture, gestureElement, scaleGestureInfos);
                }
                
                if (Math.abs(rotationAmplitude) > this.ROTATION_MIN_VALUE)
                {
                    gestureElement.rotation = rotateValue;
                    this._notifyGesture("rotation", gestureElement, rotationGestureInfos);
                }
                
                this._notifyGesture("instant_scale", gestureElement, scaleGestureInfos);
                this._notifyGesture("instant_rotation", gestureElement, rotationGestureInfos);
            }
        },
        /**
         * Handle gesture end
         * 
         * @param {wink.ux.Event} uxEvent The Wink Event associated
         * @param {object} gestureElement The GestureElement associated
         */
        _handleGestureEnd: function(uxEvent, gestureElement)
        {
            wink.ux.touch.removeListener(gestureElement.domNode, "gesturechange", { context: this, method: this._getEvtKey("_handleGestureChange") });
            wink.ux.touch.removeListener(gestureElement.domNode, "gestureend", { context: this, method: this._getEvtKey("_handleGestureEnd") });
            
            gestureElement.gestureEndTime = this._getTimeStamp();
            var gestureDuration = gestureElement.gestureEndTime - gestureElement.gestureStartTime;
            
            this._notifyGesture("gesture_end", gestureElement, { gestureDuration: gestureDuration });
        },
        /**
         * 
         * @param {object} touch the touch
         * @param {wink.ux.Event} uxEvent The Wink Event
         * 
         * @returns {object} the digit information
         */
        _getDigit: function(touch, uxEvent)
        {
            var props = wink.ux.touch.getTouchProperties(touch);
            var digit = {
                x: props.x,
                y: props.y,
                timestamp: uxEvent.timestamp,
                target: props.target
            };
            
            if(wink.has('mspointer')) {
                digit.pointerId = touch.pointerId;
            }
            
            return digit;
        },
        /**
         * @returns {timestamp} the current timestamp.
         */
        _getTimeStamp: function()
        {
            return new Date().getTime();
        },
        /**
         * @param {string} eventType, the default method name
         * @returns {string} The good method according to the OS
         */
        _getEvtKey: function(eventType) {
            return this._mappingMethods[eventType][this._evtKey];
        }
    };
    
    return wink.ux.gesture;
});