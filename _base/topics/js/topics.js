/*--------------------------------------------------------
 * Copyright (c) 2011, The Dojo Foundation
 * This software is distributed under the "Simplified BSD license",
 * the text of which is available at http://www.winktoolkit.org/licence.txt
 * or see the "license.txt" file for more details.
 *--------------------------------------------------------*/

/**
 * @fileOverview Implements an event management system based on a publish/subscribe mechanism
 * 
 * @author Jerome GIRAUD
 */

define(['../../../_amd/core'], function()
{
	var _subscribed_topics = [];
	
	/**
	 * @namespace Event management system
	 * 
	 * @example
	 * 
	 * wink.subscribe('/test/events/alert1', {method: 'dummyMethod2', context: this});
	 * wink.publish('/test/events/alert1', 'value1');
	 * 
	 * @compatibility iOS2, iOS3, iOS4, iOS5, iOS6, Android 1.1, Android 1.5, Android 2.1, Android 2.2, Android 2.3, Android 3.0, Android 3.1, Android 4.0, Android 4.1.2, BlackBerry 6, BlackBerry 7, BB10, Bada 1.0, Windows Phone 7.5, Windows Phone 8
	 * 
	 * @see <a href="WINK_ROOT_URL/_base/topics/test/test_topics_1.html" target="_blank">Test page</a>
	 * @see <a href="WINK_ROOT_URL/_base/topics/test/test_topics_2.html" target="_blank">Test page (with scope)</a>
	 */
	wink.topics = {
		// for tests
		_getTopics: function() {
			return _subscribed_topics;
		}
	};
	
	/**
	 * Attach to the given topic
	 * 
	 * @function
	 * 
	 * @param {string} topic The name of the topic we want to be notified from
	 * @param {object|function} callback The callback method called when the event related to the topic is triggered. It should contain a 'method' and a 'context'.
	 */
	wink.topics.subscribe = subscribe;
	function subscribe(topic, callback)
	{	
		if (!wink.isCallback(callback))
		{
			wink.log('[topics] invalid callback argument');
			return;
		}
		var subscription = [topic.toLowerCase(), callback];
		_subscribed_topics.push(subscription);
	}
	
	/**
	 * Detach from the given topic
	 * 
	 * @function
	 * 
	 * @param {string} topic The name of the topic we don't want to be notified from anymore.
	 * @param {object|function} callback This parameter should be the same as the one passed through the subscribe method
	 */
	wink.topics.unsubscribe = unsubscribe;
	function unsubscribe(topic, callback)
	{
		var topicLower = topic.toLowerCase(),
			isFn = wink.isFunction(callback);
		var i, l = _subscribed_topics.length;
		for (i = 0; i < l; i++) 
		{
			var sti = _subscribed_topics[i];
			if (sti[0] == topicLower && ((isFn && callback == sti[1]) || (!isFn && sti[1].method == callback.method && sti[1].context == callback.context)))
			{
				_subscribed_topics.splice(i, 1);
				break;
			}
		}
	}
	
	/**
	 * Publish an event to all the subscribers
	 * 
	 * @function
	 * 
	 * @param {string} topic The name of the topic we are triggering
	 * @param {object} [value] The value to pass to the subscribers' callback methods
	 */
	wink.topics.publish = publish;
	function publish(topic, value)
	{
		_dispatch(topic.toLowerCase(), value);
	}
	
	/**
	 * Triggers all the events which are in the queue
	 * 
	 * @param {string} topic The name of the topic we are triggering
	 * @param {object} [parameters] The value to pass to the subscribers' callback methods
	 */
	var _dispatch = function(topic, parameters)
	{
		var i, l = _subscribed_topics.length;
		for (i = 0; i < l; i++) 
		{
			var sti = _subscribed_topics[i];
			if (sti && sti[0] == topic) 
			{
				if ( wink.isSet(sti[1])) 
				{
					wink.call(sti[1], parameters);
				}
			}
		}
	};
	
	/**
	 * @function
	 * @see wink.topics.publish
	 */
	wink.publish = publish;
	
	/**
	 * @function
	 * @see wink.topics.subscribe
	 */
	wink.subscribe =  subscribe;
	
	/**
	 * @function
	 * @see wink.topics.unsubscribe
	 */
	wink.unsubscribe = unsubscribe;
	
	return wink.topics;
});
