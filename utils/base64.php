<?php
	/**
	 * Sample code : base64.php?image=../accordion/img/hide.png
	 * 
	 * To inline images:
	 * 	--> i.e: [data:image/[png/gif/jpeg];base64,[base64 encoding]]
	 * 
	 * @author:
	 * 	--> Jerome GIRAUD
	 */
	 
	$image ='no image defined';

	function data_url($file) 
	{  
		// Fetch the content 
		$contents = file_get_contents($file);
		
		// Check if the content is empty 
		if ( $contents == '' )
		{
			return 'the image cannot be found';
		}
		
		// Encode the content
		$base64 = base64_encode($contents);
		
	  	return $base64;
	}
	
	if ( isset($_GET['image']) && $_GET['image'] != '' )
	{
		$image = data_url($_GET['image']);
	}

?>
<!DOCTYPE HTML PUBLIC "-//W3C//DTD HTML 4.01 Transitional//EN" "http://www.w3.org/TR/html4/loose.dtd">

<html>
	<head>
		<title>Base64 images encoding</title>
		<meta http-equiv="content-type" content="text/html; charset=UTF-8">
	</head>
	<body>
		<div>
			<?php echo $image; ?>
		</div>
	</body>
</html>