wink.ui.xy.Carousel = function(properties)
{
	this.uId                = "carousel_ie";
	this.items              = [];
};

wink.ui.xy.Carousel.prototype =
{
	_LEFT_POSITION: 'left_ie',
	_CENTER_POSITION: 'center_ie',

	/**
	 * return the dom node containing the Carousel
	 */
	getDomNode: function()
	{
		return this._domNode_ie;
	},
	/**
	 * 
	 */
	goToItem: function(index)
	{
		this.position = index;
		var style_ie = {};
		wink.fx.apply(this._itemsNode, style_ie);
	}
};