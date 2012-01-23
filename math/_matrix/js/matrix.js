/*--------------------------------------------------------
 * Copyright (c) 2011, The Dojo Foundation
 * This software is distributed under the "Simplified BSD license",
 * the text of which is available at http://www.winktoolkit.org/licence.txt
 * or see the "license.txt" file for more details.
 *--------------------------------------------------------*/

/**
 * @fileOverview math matrix library - a wink.math extension.
 * 
 * @compatibility Iphone OS2, Iphone OS3, Iphone OS4, Android 2.1, Android 2.2, Android 2.3, Android 3.0, Android 3.1, BlackBerry 6, BlackBerry 7, Bada 1.0
 * @author Sylvain LALANDE
 */
define(['../../../_amd/core'], function(wink)
{
	/**
	 * Creates a transformation matrix with the given css transform
	 * 
	 * @param {string|WebKitCSSMatrix} [cssTransform] The css transform which will initialize the matrix
	 * 
	 * @returns {wink.math.Matrix} The corresponding wink.math.Matrix
	 * 
	 * @example
	 * 
	 * var rotationMatrix = wink.math.createTransformMatrix();
	 * rotationMatrix.rotateAxisAngle(0, 1, 0, 45);
	 * 
	 */
	wink.math.createTransformMatrix = function(cssTransform)
	{
		var matrix = new wink.math.Matrix({});
		if (wink.isSet(cssTransform))
		{
			matrix.loadCssTransform(cssTransform);
		}
		return matrix;
	};

	/**
	 * @class Implements a matrix encapsulation object (of order 4) that is representative of a 3d transformation.
	 * 
	 * @param {object} properties The properties object
	 * @param {array} [properties.values] The matrix values as an array of 16 elements
	 */
	wink.math.Matrix = function(properties)
	{
		/**
		 * Unique identifier
		 * 
		 * @property
		 * @type integer
		 */
		this.uId = wink.getUId();
		
		
		this._properties          = properties;
		this._values              = [];
		this._cssMatrix           = null;
		this._matrixConversionBug = (wink.ua.isBlackBerry && wink.ua.browserVersion == 7 && wink.ua.browserMinorVersion == 1);
		
		if (this._validateProperties() === false) return;
		
		this._initProperties();	
	};
	
	wink.math.Matrix.prototype = 
	{
		/**
		 * Apply a scale operation to the matrix.
		 * 
		 * @param {number} x The x scale component
		 * @param {number} y The y scale component
		 * @param {number} z The z scale component
		 */
		scale: function(x, y, z)
		{
			var resultMatrix = this._cssMatrix.scale(x, y, z);
			var values = this._cssMatrixToValues(resultMatrix);
			this._load(values);
		},
		/**
		 * Apply a translate operation to the matrix.
		 * 
		 * @param {number} x The x translation component
		 * @param {number} y The y translation component
		 * @param {number} z The z translation component
		 */
		translate: function(x, y, z)
		{
			var resultMatrix = this._cssMatrix.translate(x, y, z);
			var values = this._cssMatrixToValues(resultMatrix);
			this._load(values);
		},
		/**
		 * Apply a rotation operation to the matrix.
		 * 
		 * @param {number} x The x rotation component
		 * @param {number} y The y rotation component
		 * @param {number} z The z rotation component
		 * @param {number} angleDeg The rotation angle in degree
		 */
		rotateAxisAngle: function(x, y, z, angleDeg)
		{
			var resultMatrix = this._cssMatrix.rotateAxisAngle(x, y, z, angleDeg);
			var values = this._cssMatrixToValues(resultMatrix);
			this._load(values);
		},
		/**
		 * Multiply the current matrix by an other one.
		 * 
		 * @param {wink.math.Matrix} otherWinkMatrix The other matrix
		 */
		multiply: function(otherWinkMatrix)
		{
			var m1 = otherWinkMatrix.getCssMatrix();
			var m2 = this._cssMatrix;
			if (wink.has("css-matrix-stack-inversed")) {
				var tmp = m1;
				m1 = m2;
				m2 = tmp;
			}
			var resultMatrix = m1.multiply(m2);
			var values = this._cssMatrixToValues(resultMatrix);
			this._load(values);
		},
		/**
		 * Clones the current Wink Matrix
		 * 
		 * @returns {wink.math.Matrix} The cloned matrix
		 */
		clone: function()
		{
			return new wink.math.Matrix({ values: this._values });
		},
		/**
		 * Load the given transformation
		 * 
		 * @param {string|WebKitCSSMatrix} transformation The css transform
		 */
		loadCssTransform: function(transformation)
		{
			var result = null;
			
			if (isString(transformation))
			{
				var search = "matrix3d";
				var chaine = transformation;
				var index = chaine.indexOf(search);
				if (index != -1)
				{
					var matriceS = chaine.substring((search.length + 1), (chaine.length - 1));
					var matValues = matriceS.split(", ");
					var m = [];
					for ( var i = 0; i < matValues.length; i++) {
						m[i] = matValues[i] * 1;
					}
					this._load(m);
				}
			}
			else
			{
				try {
					var values = this._cssMatrixToValues(transformation); // WebKitCSSMatrix
					this._load(values);
				} catch (e) {
					wink.log('[Matrix] Error: bad WebKitCSSMatrix');
				}
			}
		},
		/**
		 * Returns the matrix values
		 * 
		 * @returns {array} The matrix values
		 */
		getValues: function()
		{
			return this._values;
		},
		/**
		 * Return the corresponding WebKitCSSMatrix
		 * 
		 * @returns {WebkitCSSMatrix} The WebKitCSSMatrix
		 */
		getCssMatrix: function()
		{
			return this._cssMatrix;
		},
		
		/**
		 * Return the string value of the WebKitCSSMatrix
		 * 
		 * @returns {String} The value of the matrix
		 */
		toString: function()
		{
			if ( !this._matrixConversionBug )
			{
				return this._cssMatrix.toString();
			} else
			{
				return 'matrix3d(' + this._values.join(',') + ')';
			}
		},
		/**
		 * Validate the properties of the component
		 * @returns {boolean} True if the properties are valid, false otherwise
		 */
		_validateProperties: function()
		{
			if (wink.isSet(this._properties.values) && this._properties.values.length != 16)
			{
				wink.log('[Matrix] Error: values should be number 16');
				return false;
			}
			return true;
		},
		/**
		 * Initialize datas with given properties
		 */
		_initProperties: function()
		{
			if (wink.isSet(this._properties.values))
			{
				this._load(this._properties.values);
			}
			else
			{
				this._loadIdentity();
			}
		},
		/**
		 * Load the identity matrix
		 */
		_loadIdentity: function()
		{
			this._load([
				1, 0, 0, 0, 
				0, 1, 0, 0,
				0, 0, 1, 0,
				0, 0, 0, 1
			]);
		},
		/**
		 * Load the given values
		 * 
		 * @param {array} values An array of 16 matrix values
		 */
		_load: function(values)
		{
			if (!wink.isSet(values) || values.length != 16)
			{
				wink.log('[Matrix] Error: values should be number 16');
				return false;
			}
			this._values = values;
			this._cssMatrix = this._valuesToCssMatrix(this._values);
		},
		/**
		 * Returns a WebKitCSSMatrix with the given array of values
		 * 
		 * @param {array} values An array of 16 matrix values
		 * 
		 * @returns {WebkitCSSMatrix} The WebKitCSSMatrix
		 */
		_valuesToCssMatrix: function(values)
		{
			var cssMatrix = new WebKitCSSMatrix();
			
			cssMatrix.m11 = values[0];
			cssMatrix.m12 = values[1];
			cssMatrix.m13 = values[2];
			cssMatrix.m14 = values[3];
			
			cssMatrix.m21 = values[4];
			cssMatrix.m22 = values[5];
			cssMatrix.m23 = values[6];
			cssMatrix.m24 = values[7];
			
			cssMatrix.m31 = values[8];
			cssMatrix.m32 = values[9];
			cssMatrix.m33 = values[10];
			cssMatrix.m34 = values[11];
			
			cssMatrix.m41 = values[12];
			cssMatrix.m42 = values[13];
			cssMatrix.m43 = values[14];
			cssMatrix.m44 = values[15];
			
			return cssMatrix;
		},
		/**
		 * Returns an array of values with the given WebKitCSSMatrix
		 * 
		 * @param {WebkitCSSMatrix} cssMatrix The WebKitCSSMatrix
		 * 
		 * @returns {array} The value of the Matrix
		 */
		_cssMatrixToValues: function(cssMatrix)
		{
			var values = [];
			values[0] = cssMatrix.m11;
			values[1] = cssMatrix.m12;
			values[2] = cssMatrix.m13;
			values[3] = cssMatrix.m14;
			
			values[4] = cssMatrix.m21;
			values[5] = cssMatrix.m22;
			values[6] = cssMatrix.m23;
			values[7] = cssMatrix.m24;
			
			values[8] = cssMatrix.m31;
			values[9] = cssMatrix.m32;
			values[10] = cssMatrix.m33;
			values[11] = cssMatrix.m34;
			
			values[12] = cssMatrix.m41;
			values[13] = cssMatrix.m42;
			values[14] = cssMatrix.m43;
			values[15] = cssMatrix.m44;
			return values;
		}
	};
	
	return wink.math;
});