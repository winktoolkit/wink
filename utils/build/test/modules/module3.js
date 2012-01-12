wink.ui.xy.Carousel = function(properties)
{
	this.uId                = wink.getUId();
	this.items              = [];
};

wink.ui.xy.Carousel.prototype =
{
	_LEFT_POSITION: 'left',
	_CENTER_POSITION: 'center',

	/**
	 * return the dom node containing the Carousel
	 */
	getDomNode: function()
	{
		return this._domNode;
	},
	/**
	 * 
	 */
	goToItem: function(index)
	{
		this.position = index;
		var style = {};
		wink.fx.apply(this._itemsNode, style);
	}
};