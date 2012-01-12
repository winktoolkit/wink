function initCoverflow()
{
	window.scrollTo(0,0);

	wink.error.logLevel = 1;

	var covers = 
	[
		{ image: "../../ui/xyz/coverflow/test/img/cover0.jpg", title: "", backFaceId: "backface1" },
		{ image: "../../ui/xyz/coverflow/test/img/cover1.jpg", title: "", backFaceId: "backface1" },
		{ image: "../../ui/xyz/coverflow/test/img/cover2.jpg", title: "", backFaceId: "backface1" },
		{ image: "../../ui/xyz/coverflow/test/img/cover3.jpg", title: "", backFaceId: "backface1" },
		{ image: "../../ui/xyz/coverflow/test/img/cover4.jpg", title: "", backFaceId: "backface1" },
		{ image: "../../ui/xyz/coverflow/test/img/cover5.jpg", title: "", backFaceId: "backface1" },
		{ image: "../../ui/xyz/coverflow/test/img/cover6.jpg", title: "", backFaceId: "backface1" },
		{ image: "../../ui/xyz/coverflow/test/img/cover7.jpg", title: "", backFaceId: "backface1" },
		{ image: "../../ui/xyz/coverflow/test/img/cover8.jpg", title: "", backFaceId: "backface1" },
		{ image: "../../ui/xyz/coverflow/test/img/cover9.jpg", title: "", backFaceId: "backface1" },
		{ image: "../../ui/xyz/coverflow/test/img/cover10.jpg", title: "", backFaceId: "backface1" },
		{ image: "../../ui/xyz/coverflow/test/img/cover11.jpg", title: "", backFaceId: "backface1" },
		{ image: "../../ui/xyz/coverflow/test/img/cover12.jpg", title: "", backFaceId: "backface1" },
		{ image: "../../ui/xyz/coverflow/test/img/cover13.jpg", title: "", backFaceId: "backface1" },
		{ image: "../../ui/xyz/coverflow/test/img/cover14.jpg", title: "", backFaceId: "backface1" },
		{ image: "../../ui/xyz/coverflow/test/img/cover15.jpg", title: "", backFaceId: "backface1" },
		{ image: "../../ui/xyz/coverflow/test/img/cover16.jpg", title: "", backFaceId: "backface1" },
		{ image: "../../ui/xyz/coverflow/test/img/cover17.jpg", title: "", backFaceId: "backface1" },
		{ image: "../../ui/xyz/coverflow/test/img/cover18.jpg", title: "", backFaceId: "backface1" },
		{ image: "../../ui/xyz/coverflow/test/img/cover19.jpg", title: "", backFaceId: "backface1" },
	];

	var size = wink.ua.isIPad ? 500 : 300;
	var coverSpacing = wink.ua.isIPad ? 30 : 25;
	
	var properties = {
		covers: covers,
		size: size,
		viewportWidth: document.documentElement.offsetWidth,
		reflected: true,
		displayTitle: false,
		fadeEdges: true,
		handleOrientationChange: true,
		handleGesture: true,
		backgroundColor: { r: 238, g: 238, b: 238 },
		coverSpacing: coverSpacing, // [optional]
		displayTitleDuration: 1000,	// [optional]
		borderSize: 2 				// [optional]
	};
	
	var coverflow = new wink.ui.xyz.CoverFlow(properties);
	
	$("container").appendChild(coverflow.getDomNode());
}


