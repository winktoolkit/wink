var handleTagSelection = function(param)
{
	alert("Tag Rating: " + param.tag.rating);
};
			
function initTagCloud()
{
	window.scrollTo(0,0);

	wink.error.logLevel = 1;

	var tags = [
		{ id: "tag0", 	rating: 56.6 },
		{ id: "tag1", 	rating: 93.4 },
		{ id: "tag2", 	rating: 53.8 },
		{ id: "tag3", 	rating: 76.9 },
		{ id: "tag4", 	rating: 38.1 },
		{ id: "tag5", 	rating: 68.8 },
		{ id: "tag6", 	rating: 39.0 },
		{ id: "tag7", 	rating: 94.6 },
		{ id: "tag8", 	rating: 14.7 },
		{ id: "tag9", 	rating: 31.8 },
		{ id: "tag10", 	rating: 47.9 },
		{ id: "tag11", 	rating: 98.1 },
		{ id: "tag12", 	rating: 68.2 },
		{ id: "tag13", 	rating: 81.5 },
		{ id: "tag14", 	rating: 42.9 },
		{ id: "tag15", 	rating: 75.6 },
		{ id: "tag16", 	rating: 24.3 },
		{ id: "tag17", 	rating: 37.8 },
		{ id: "tag18", 	rating: 97.1 },
		{ id: "tag19", 	rating: 35.2 },
		{ id: "tag20", 	rating: 14.0 },
		{ id: "tag21", 	rating: 93.1 }
	];

	var properties = {
		tags: tags,
		size: 130, 										// radius size in pixel
		textColor: { r: 0, g: 0, b: 0 },			// optional
		selectedTextColor: { r: 181, g: 26, b: 26 },	// optional
		scaleFactors : {								// optional
			ratioDepth: 0.6, 
			ratioRating: 0.8
		},
		canMove: true,									// optional
		canSelect: true,								// optional
		axis: "xy"										// optional
	};
	var tagcloud = new wink.ui.xyz.TagCloud(properties);
	$("container").appendChild(tagcloud.getDomNode());

	wink.subscribe('/tagcloud/events/selection', { context: window, method: 'handleTagSelection' });
}


