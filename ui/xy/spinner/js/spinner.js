/*--------------------------------------------------------
 * Copyright (c) 2011, The Dojo Foundation
 * This software is distributed under the "Simplified BSD license",
 * the text of which is available at http://www.winktoolkit.org/licence.txt
 * or see the "license.txt" file for more details.
 *--------------------------------------------------------*/

/**
 * @fileOverview Implement a spinner
 * 
 * @compatibility Iphone OS2, Iphone OS3, Iphone OS4, Android 1.5, Android 2.1, Android 2.2, Android 2.3, Android 3.0, Android 3.1, BlackBerry 6, BlackBerry 7, Bada 1.0
 * @author Frederic MOULIS
 */

define(['../../../../_amd/core'], function(wink)
{
	/**
	 * @class Implement a spinner.<br>
	 * As spinner images (dark background and light background) are base 64 encoded and included in this class as _DARK_BG_IMAGE
	 * and _LIGHT_BG_IMAGE, you should remove the one you don't need.
	 * <br><br>
	 * To instantiate the spinner, you should specify the image you want to see.<br>
	 * It can be "light","dark" or "personal".<br>
	 * If you choose "personal", you must specify the image yourself in the properties (adding a "backgroundImage" to the properties). In this case, the background image should be of that form: "data:image/[gif/png/jpeg];base64,[base64 image content]"<br>
	 * Use the 'getDomNode' method to add it to your page.
	 * 
	 * @param {object} properties The properties object
	 * @param {string} properties.background The type of background (either "dark", "light" or "personal")
	 * @param {string} [properties.backgroundImage] The spinner image (in case the background was declared as "personal")
	 * 
	 * @example
	 * 
	 * var properties = 
	 * {
	 * 	background: "light"
	 * }
	 * 
	 * var spinner = new wink.ui.xy.Spinner(properties);
	 * 
	 * $('output').appendChild(spinner.getDomNode());
	 * 
	 * @see <a href="WINK_ROOT_URL/ui/xy/spinner/test/test_spinner.html" target="_blank">Test page</a>
	 */
	wink.ui.xy.Spinner = function(properties)
	{
		/**
		 * Unique identifier
		 * 
		 * @property
		 * @type integer
		 */
		this.uId = wink.getUId();
		
		/**
		 * The size of the spinner (in pixels)
		 * 
		 * @property
		 * @type integer
		 */
		this.size = null;
		
		/**
		 * The type of background (either "dark", "light" or "personal")
		 * 
		 * @property
		 * @type string
		 */
		this.background = null;
		
		/**
		 * The spinner image (in case the background was declared as "personal")
		 * 
		 * @property
		 * @type string
		 */
		this.backgroundImage = null;
		
		
		this._domNode = null;
			
		wink.mixin(this, properties);
			
		if (this._validateProperties() === false)return;
		
		this._initDom();
	};
	
	wink.ui.xy.Spinner.prototype = 
	{
		_DARK_BG: 'dark',
		_LIGHT_BG: 'light',
		_PERSONAL_BG: 'personal',
		
		_DARK_BG_IMAGE: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADIAAAAyCAYAAAAeP4ixAAAAAXNSR0IArs4c6QAABRZJREFUaN7dmU1sVUUYhp+3lD9pSoGCJbSEnxsBYUFkY0ATiL8LF5q4wYQoG7eGlSvjgp0bdUFiwqIadwZNjCwwsiCICCZIiVghQrmBmlap/NSKhbZ5XTA3np7OuX+co8iX3OSemTNn5p33e7+Z+QYKNNu9/sd6+T+a7e2eaS8W1V9LgVi2R8o23xdAbHfbPmp7wHaf7cdzZHCB7fW2N9pea3t2kYy8AXSH/+3AB7bbcwAxC+gBZoWiecCyIoF0p57bgd05ELIkAaJihTJyIsaS7e57YGM2sDRSdatIIL3AYKT8rXtgY0WkbAL4vTAgkkaBvZGqZyLCL9cjcGBBpGpI0lSh4VfSV8DJSNU7jQLJYONPSX/8W+tIjJVu27sb0MaSDEEP3/M6YrvL9pu237X9mu22DFb6gU8zhF8tHJcT4TYm8BuSxrNCdBhfyfZK23OmjSn18n6glJqdfZKORT7cDhwNIXgaW5J6ba8CLqXqVksqBza6UnVTwM8xbdheGNwwOfi/JJ3Pcq1S6rkL2BsYKkWE/35k8tpDfRl4CTgSfjtCGZE1A+BqGoTt+aHf1SkQAPOrMfIF0FbFNQ4FhsYSbQ4CjybeeUXSiTqi1apE0biki6mVfgWwuMpnpiT9kAVkcxByNTBjwEeSDiRcrCLyk7VARELvVNDGVChfGjxhVjUQwGVJN6NAwofagJeBV2uM5QKwJ8lODvutUtplMqLaDDdsiUSkMUkfAjuBviofLAXAednSGiDGgH5Jw7GA0FJl4RuWtAfY02xsz8nuABckXZB0p+kFUVKfpJ3AvjArSevLccBjER38Iqm/HvdVg37cBjwfgkGfpDyBVL7fFkBca3S/9UCYwkxsAFZm7ESnbeiAU5JGCk5czA0L69w6Xh+VNCrbrwNPNtjXe5JOFQRiMfBIg82utjQBAuC5AgnpaiZ0tzwoGmkBvm6i3ZcFjmmwiTZXk2LfUEeD+1HstyRde7DCbwMzNQ/YEvZEA5IGcmaiA+gAJoFhSZO5A7G9DXiau1nAiu3PC0wAkcwNTwJlSXVpprWODtaEXe6iSPUaIC9WOiJjK4Xk3zlJN5oCYnsR8ELq9Pdf2Dxgs+2RsAserwtI0METwFM1OhgCjuUcdjurnE47gU7bZWAwrR9F3GhXSgdpGwcOS/omESq3hLorkq7UqYnOMDiAi5ImQnl3OM9Xc/tJ4GzS3dJA3q4B4hRwMEmv7V1MvwL4pBaYAGJbouimpCOJ+tZwAq22XZlMpqlaI/4Ys4EAYCg1oK3MvMfoAa6E+p6ExvoTADtTbRbaXlvJpAS3OWd7MADqqCWL1ojfL088Xw8A+jNW38cyXK9ySNqRKH/Y9mfhtDcRabfO9uWKi1XyB0BfYLCUmuixakA+DiJfBFySdLgKtTsiW4jbwI+VgUfa9AA/AZeBdUzP/c4GNgGnI8ftEWAkZC87wmSVM4FIug4cqEOoy4CNkarjkm6H/7HoMyf0M2H7fBh40lbaHkjmq1LjKzedfMiw7Rknte/r3lLc1UPsVmpTs9v4RrcSpeAiaTvURP+nY+uF7eWFA0kJmEbXj4jvD+XBSqP37FuZeY3QLBsVOxspe8j2+iIZid3efhuuGNJ2p05WbgHnI1VLigQyGgm3WdmU6w1892JkbSn0evo48FsCxOeJcNv86e7uIvhdAszNDJbyOSE2qKcu4NlU8RlJZ4rKovyb9muR6aBikgHScPB9Elv1wq4n/gZGzjH4jnexGwAAAABJRU5ErkJggg==',
		_LIGHT_BG_IMAGE: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADIAAAAyCAYAAAAeP4ixAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAABSxJREFUeNrcWUtoVFcYnplofUTiaBJjMbFpM5gqglI39VHI0JcLKYhFaEGqm+JOXLnqypVubAVByEJB6KpCS10oFRT6sgU1oWlUMDaaQKxJNUljmEwM7ffrd+F4/M+de+/ck5b88HNmzus/3/86j5vNeKS2V1pPodjLv6f77vbv8yUr6xFEB4pLVvVOgPnah7ycR4N0KHUbfQmbF1PLzSi+BEs5Dt4PDV9JyYK1KFrANeAS+B7mnvZlkQMEIVQHPokF1KUAosYAIbQQvMKnazVb/wVEGgFcb4AIaL5PIJobHaDLJbWGLLhRaZr0CUTS6aBS/1kV1lil1Els/OUNCIJPAvyw0vQuNPumVdcfMcBrlaYhyJrxmn4h4DsUvyhNR+MCcVjjMWT8PVv7iGaVZmh4X4zYqHcE9P2q9xFMvhLFJ2Apu8FfQTsTilV60fcsfu5SAv8sXVCjfiPdagE+irGlkBQtY5aAywIYfcsui4imt3MHFkCdmGBbiFXGlXS8K8S1LrPMK+l2xmUNrGEpinYqWIAsB78a5loF678MPIyJjoELSuB/ocitY7sA2cnFCxdZl1FACA3bAQ6ZiyhXFv2S1X+R89CIQd8SsYvOg0+Y7oYx51CsM/p8XOnYwmzValSVMKbPcqNV1LyLZjDmt4ymmeX5/A0U2xT0psU+QL/pR2OjvRwjQKaYyY5HOXth7DTGTXK/kAx1H3X/EEQjLVAbBkLOYhgz5TzGYyKxyIeMkTC6DT6oJYMqzlsF22UcWe0FN6xRtFUGd0FjFzjxSseEYnaxTFcaQCCvCcWykC6isNsAMBZYL9IxHgME+UFoSjLYoRBAvqnMI/1EVfcRTCAa/wiAAnczk0FXigue0NIx5A+nftVl/GwnmC6CTPN6vIRzC4iHcc9bc4Ky1MRaFKsrpLynBzrwVWhqxPPrywJurAsidB+XzTmLQZ/iz1sxZX2OwVc9gZBsuCbmsOFcAhBC73s0SJLs2JibKzEiQL5PMO6CxzUNJhgzbAb72ggD/o/BPon1PJxb6TeGpuThbBMPdnegiTspWyLPS9cT7upPUgcCIVtRvJN59goYUGdaYAjCfBsWEP2YP1LMzIsg4DUe67WTqbSlZZW8srYCH/9uAtBoIiCYQBa+w7r9/RckHrAR6xnhMb4UCQjjQG6Jb1cQMAT+IeW02xBy1Za2BqxP7v2DdvxkFTfaY8WBTaKRi5joRyNVbmLbAOoHIsZEAxf39LYQfEKgK7VWcHsB0WO6m72zVwIh56sjAQjSbvBm8m4spCUiiK184mnn7+D+I5a5UuGhTkCuD3MtFwgJ6HMQMmQtaEvmxe8YAmSA7S1GjPUa1mqwxixF37bgJYVucxN1g7xu5yuFRU7x++eu8OAzmLhTASEu9YbD9YJLUhHcRC6yLsPXE5va+YnBvJ1O8PLWE8zrulHaFjnDIJeM9QcmuRhi3qJyhJDnmd/5u0kZIxaSJ6d7dClz4fPpLteV67ZkrBEAbaV1SvZLZqKvuphwBePJpksQeo19NqDYYLV3o72b7W22n5Muy0tJktNvEupw3NSuRZ2A8aB9lVqf9Bgf1xoFuohN5xPIv67tF5Dx8mxYpKjURd4/FN8fSsMquZjW2MJ7QhrWCKhHqVsMWa/7tIj29fZnx4edckSrSJzcUprqfQIZV9Kt6zXlURwvU/YWr5+nfwI/MEB8A41OVXta5DnrVwPMmMNK6dwQY8aTPOu859pHfLyizCb96fM5yAvxs0SfWcU6L/SvAAMAnAHvLIvCmF4AAAAASUVORK5CYII=',
		
		/**
		 * Returns the main DOM node of the Spinner
		 * 
		 * @returns {HTMLElement} The main dom node
		 */
		getDomNode: function()
		{
			return this._domNode;
		},
		
		/**
		 * Validate the properties of the component
		 * @returns {boolean} True if the properties are valid, false otherwise
		 */
		_validateProperties: function()
		{
			if(!wink.isSet(this.background))
			{
				wink.log('[Spinner] background property should be set');
				return false;
			}
			if(this.background != this._DARK_BG && this.background != this._LIGHT_BG && this.background != this._PERSONAL_BG)
			{
				wink.log('[Spinner] background property should be equal to "dark" or "light" or "personal"');
				return false;
			}
			if(this.background == this._PERSONAL_BG && !wink.isSet(this.backgroundImage))
			{
				wink.log('[Spinner] if you specify your own image you must also pass a backgroundImage property');
				return false;
			}		
			if(wink.isSet(this.size) && !wink.isInteger(this.size))
			{
				wink.log('[Spinner] size property must be an integer (size in px)');
				return false;
			}
			return true;
		},
		
		/**
		 * Initialize the Spinner DOM node
		 */
		_initDom: function()
		{
			this._domNode = document.createElement('img');
			this._domNode.className = 'sp_spinner';
			
			if(wink.isSet(this.size))
			{
				wink.fx.apply(this._domNode, {
					width: this.size + 'px',
					height: this.size + 'px'
				});
			}
			
			if ( this.background == this._DARK_BG )
			{
				this._domNode.src= this._DARK_BG_IMAGE;
			} else if ( this.background == this._LIGHT_BG )
			{
				this._domNode.src= this._LIGHT_BG_IMAGE;
			} else if ( this.background == this._PERSONAL_BG )
			{
				this._domNode.src= this.backgroundImage;
			}
		}
	};
	
	return wink.ui.xy.Spinner;
});