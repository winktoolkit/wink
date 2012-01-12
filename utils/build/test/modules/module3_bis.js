wink.ui.xy.Carousel = function(properties)
{
	this.uId                = wink.getUId();
	this.items              = [ "BIS" ];
};

wink.ui.xy.Carousel.prototype =
{
	_LEFT_POSITION: 'left_bis',
	_CENTER_POSITION: 'center_bis',

	/**
	 * return the dom node containing the Carousel
	 */
	getDomNode: function()
	{
		return "getDomNode BIS";
	},
	/**
	 * 
	 */
	goToItem: function(index)
	{
		this.position = index;
		var styleIE = {};
		wink.fx.apply(this._itemsNode, styleIE);
	}
};