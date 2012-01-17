/*--------------------------------------------------------
 * Copyright (c) 2011, The Dojo Foundation
 * This software is distributed under the "Simplified BSD license",
 * the text of which is available at http://www.winktoolkit.org/licence.txt
 * or see the "license.txt" file for more details.
 *--------------------------------------------------------*/

/**
 * @fileOverview The 3d fx object is an extension of wink.fx (2d fx) that allows more advanced transformations (e.g.: simple or composed 3d transformations).
 * Because a change of scale followed by a translation does not give the same result if you reverse the two transformations, 
 * the main role is to simplify the implementation of composed transformations, it is made by using a user-defined order.
 * 
 * @compatibility Iphone OS2, Iphone OS3, Iphone OS4, Android 3.0, Android 3.1, BlackBerry 7
 * @author Sylvain LALANDE
 */

define(['../../../_amd/core', '../../../math/_matrix/js/matrix'], function(wink)
{
	var _nodeTransforms = [];
	
	/**
	 * Apply to the given node a 3dfx transformation
	 * 
	 * @param {HTMLElement} node The node that hosts the transformation
	 * @param {object} transformation The 3dfx transformation
	 * @param {boolean} keepCurrent True if the previous node transformation must be kept
	 * 
	 * @example
	 * 
	 * //A 3d fx transformation is defined as : 
	 * 
	 * transformation: 
	 * {
	 *    type: value in { "translate", "scale", "rotate" }
	 *    x: x transformation component
	 *    y: y transformation component
	 *    z: z transformation component
	 *    [angle: rotation angle ]
	 * }
	 * 
	 * @requires wink.math (matrix)
	 */
	wink.fx.set3dTransform = function(node, transformation, keepCurrent)
	{
		if (!_is3dfxTransformation(transformation))
		{
			wink.log('[3dfx] Invalid transformation : check type, x, y, z, angle parameters');
			return false;
		}
		var cssTransform;
		if (keepCurrent === true)
		{
			cssTransform = wink.fx.getTransform(node);
		}
		var referenceMatrix = wink.math.createTransformMatrix(cssTransform);
		var matrixTransform = _getTransformMatrix(transformation);
		referenceMatrix.multiply(matrixTransform);
		
		wink.fx.setTransform(node, referenceMatrix.toString());
	};
	/**
	 * Initialize a composed transformation to the given node
	 * 
	 * @param {HTMLElement} node The node that hosts the composed transformation
	 * @param {boolean} keepCurrent True if the previous node transformation must be kept
	 * 
	 * @requires wink.math (matrix)
	 */
	wink.fx.initComposedTransform = function(node, keepCurrent)
	{
		var cssTransform;
		if (keepCurrent === true)
		{
			cssTransform = wink.fx.getTransform(node);
		}
		var referenceMatrix = wink.math.createTransformMatrix(cssTransform);
		wink.fx.removeComposedTransform(node); // to ensure unicity
		_nodeTransforms.push({ node: node, transforms: [ referenceMatrix ] });
	};
	/**
	 * Set a composed transformation part at the given index
	 * 
	 * @param {HTMLElement} node The node that hosts the composed transformation
	 * @param {integer} index The index of the given transformation part
	 * @param {object} transformation The 3dfx transformation
	 * 
	 * @example
	 * 
	 * //A 3d fx transformation is defined as : 
	 * 
	 * transformation: 
	 * {
	 *    type: value in { "translate", "scale", "rotate" }
	 *    x: x transformation component
	 *    y: y transformation component
	 *    z: z transformation component
	 *    [angle: rotation angle ]
	 * }
	 * 
	 * var node = $("nodeId");
	 * wink.fx.initComposedTransform(node);
	 * wink.fx.setTransformPart(node, 1, { type: "scale", x: 1.2, y: 1.2, z: 1 });
	 * wink.fx.setTransformPart(node, 2, { type: "translate", x: 50, y: 50, z: 0 });
	 * wink.fx.applyComposedTransform(node);
	 * 
	 * @requires wink.math (matrix)
	 */
	wink.fx.setTransformPart = function(node, index, transformation)
	{
		if (!_is3dfxTransformation(transformation))
		{
			wink.log('[3dfx] Invalid transformation : check type, x, y, z, angle parameters');
			return false;
		}
		if (index < 1 || index > 10)
		{
			wink.log('[3dfx] Invalid transformation index : 0 is reserved, 10 is the max');
			return false;
		}
		var i, list = _nodeTransforms, l = list.length;
		for (i = 0; i < l; i++)
		{
			var item = list[i];
			if (item.node == node)
			{
				var toSet = null;
				if (wink.isSet(transformation))
				{
					toSet = _getTransformMatrix(transformation);
				}
				item.transforms[index] = toSet;
				break;
			}
		}
	};
	/**
	 * Apply a composed transformation to the node
	 * 
	 * @param {HTMLElement} node The node that hosts the composed transformation
	 * @param {boolean} store Indicates if transformation parts must be stored in only one
	 */
	wink.fx.applyComposedTransform = function(node, store)
	{
		var i, list = _nodeTransforms, l = list.length;
		for (i = 0; i < l; i++)
		{
			var item = list[i];
			if (item.node == node)
			{
				var transforms = item.transforms;
				
				var finalMatrix = transforms[0].clone();
				var j, jl = transforms.length;
				for (j = 1; j < jl; j++)
				{
					var tr = transforms[j];
					if (wink.isSet(tr))
					{
						finalMatrix.multiply(tr);
					}
				}
				
				if (store === true)
				{
					item.transforms = [ finalMatrix ];
				}
				wink.fx.setTransform(node, finalMatrix.toString());
				break;
			}
		}
	};
	/**
	 * Store all the composed transformation parts in one to enhance performance
	 * 
	 * @param {HTMLElement} node The node that hosts the composed transformation
	 */
	wink.fx.storeComposedTransform = function(node)
	{
		wink.fx.applyComposedTransform(node, true);
	};
	/**
	 * Close the composed transformation associated to the given node
	 * 
	 * @param {HTMLElement} node The node that hosts the composed transformation
	 */
	wink.fx.removeComposedTransform = function(node)
	{
		var i, list = _nodeTransforms, l = list.length;
		for (i = 0; i < l; i++)
		{
			if (list[i].node == node)
			{
				list.splice(i, 1);
				break;
			}
		}
	};
	/**
	 * Check the validity of the given 3dfx transformation
	 * 
	 * @param {object} transformation The transformation to check
	 * 
	 * @example
	 * 
	 * //A 3d fx transformation is defined as : 
	 * 
	 * transformation: 
	 * {
	 *    type: value in { "translate", "scale", "rotate" }
	 *    x: x transformation component
	 *    y: y transformation component
	 *    z: z transformation component
	 *    [angle: rotation angle ]
	 * }
	 * 
	 */
	var _is3dfxTransformation = function(transformation)
	{
		var validTransformation = true;
		var isSet = wink.isSet;
		
		if (isSet(transformation))
		{
			var knownTypes = [ "translate", "scale", "rotate" ];
			validTransformation = validTransformation && isSet(transformation.type);
			validTransformation = validTransformation && (knownTypes.indexOf(transformation.type) != -1);
			validTransformation = validTransformation && isSet(transformation.x);
			validTransformation = validTransformation && isSet(transformation.y);
			validTransformation = validTransformation && isSet(transformation.z);
			if (validTransformation && transformation.type == "rotate")
			{
				validTransformation = validTransformation && isSet(transformation.angle);
			}
		}
		return validTransformation;
	};
	/**
	 * Returns the associated matrix of the given 3dfx transformation
	 * 
	 * @param {object} transformation The 3dfx transformation
	 * 
	 * @example
	 * 
	 * //A 3d fx transformation is defined as : 
	 * 
	 * transformation: 
	 * {
	 *    type: value in { "translate", "scale", "rotate" }
	 *    x: x transformation component
	 *    y: y transformation component
	 *    z: z transformation component
	 *    [angle: rotation angle ]
	 * }
	 * 
	 * @requires wink.math (matrix)
	 */
	var _getTransformMatrix = function(transformation)
	{
		var matrix = wink.math.createTransformMatrix();
		
		switch (transformation.type)
		{
			case "translate":
				matrix.translate(transformation.x, transformation.y, transformation.z);
				break;
			case "scale":
				matrix.scale(transformation.x, transformation.y, transformation.z);
				break;
			case "rotate":
				matrix.rotateAxisAngle(transformation.x, transformation.y, transformation.z, transformation.angle);
				break;
		}
		return matrix;
	};
	
	return wink.fx;
});