/*--------------------------------------------------------
 * Copyright (c) 2011, The Dojo Foundation
 * This software is distributed under the "Simplified BSD license",
 * the text of which is available at http://www.winktoolkit.org/licence.txt
 * or see the "license.txt" file for more details.
 *--------------------------------------------------------*/

/**
 * @fileOverview math geometric library - a wink.math extension.
 * 
 * @author Sylvain LALANDE
 */
define(['../../../_amd/core'], function(wink)
{
	/**
	 * Converts the given radian angle in degree
	 * 
	 * @param {number} angleRad The angle in radian
	 * 
	 * @returns {number} The angle in degrees
	 * 
	 */
	wink.math.radToDeg = function(angleRad)
	{
		return angleRad * 180 / Math.PI;
	};
	/**
	 * Converts the given degree angle in radian
	 * 
	 * @param {number} angleDeg The angle in degree
	 * 
	 * @returns {number} The angle in radians
	 */
	wink.math.degToRad = function(angleDeg)
	{
		return angleDeg * Math.PI / 180;
	};
	/**
	 * Returns the angle corresponding to the distance between two points on a plane cutting a virtual sphere
	 * 
	 * @param {number} radius The radius of the virtual sphere
	 * @param {number} distance The distance between the two points
	 * 
	 * @returns {number} The calculated angle
	 * 
	 */
	wink.math.getAngle = function(radius, distance)
	{
		var d = Math.abs(distance);
		if (d > (radius * 2))
		{
			d = (radius * 2);
		}

		// Al-Kashi theorem
		var a = Math.pow(d, 2);
		var b = (Math.pow(radius, 2) + Math.pow(radius, 2));
		var c = 2 * radius * radius;
		var cosinusAngle = -((a - b) / c);
		var angleRad = Math.acos(cosinusAngle);
		if (isNaN(angleRad))
		{
			angleRad = 0;
		}
		return angleRad;
	};
	/**
	 * Returns the angle between two vectors
	 * 
	 * @param {object} u The first vector
	 * @param {object} v The second vector
	 * 
	 * @returns {number} The angle between the two vectors
	 */
	wink.math.getAngleBetweenVectors = function(u, v)
	{
		var scalar = wink.math.getScalarVector(u, v);
		var norms = wink.math.getNormVector(u) * wink.math.getNormVector(v);
		var cosAngle = scalar / norms;

		var angleRad = Math.acos(cosAngle);
		if (isNaN(angleRad)) {
			angleRad = 0;
		}
		return angleRad;
	};
	/**
	 * Returns the normalized vector from the given
	 * 
	 * @param {object} u The vector to normalize
	 * 
	 * @returns {object} The nomalized vector
	 */
	wink.math.normalizeVector = function(u)
	{
		var result = [ 0, 0, 0, 1 ];
		var norm = wink.math.getNormVector(u);
		
        if (norm <= 0)
        {
        	return result;
        }
		result[0] = u[0] / norm;
		result[1] = u[1] / norm;
		result[2] = u[2] / norm;
		return result;
	};
	/**
	 * Returns the norm of the given vector
	 * 
	 * @param {object} u The vector
	 * 
	 * @returns {number} The norm of the vector
	 */
	wink.math.getNormVector = function(u)
	{
		var result = u[0] * u[0] + u[1] * u[1] + u[2] * u[2];
		result = Math.sqrt(result);
		return result;
	};
	/**
	 * Returns the normal vector formed by these two vectors
	 * 
	 * @param {object} u The first vector
	 * @param {object} v The second vector
	 * 
	 * @returns {object} The nomal vector
	 */
	wink.math.getNormalVector = function(u, v)
	{
		var vector = [ 0, 0, 0, 1 ];
		vector[0] = (u[1] * v[2]) - (u[2] * v[1]);
		vector[1] = (u[2] * v[0]) - (u[0] * v[2]);
		vector[2] = (u[0] * v[1]) - (u[1] * v[0]);
		return vector;
	};
	/**
	 * Returns the scalar value of these two vectors
	 * 
	 * @param {object} u The first vector
	 * @param {object} v The second vector
	 * 
	 * @returns {object} The scalar vector
	 */
	wink.math.getScalarVector = function(u, v)
	{
		var scalar = 0;
		scalar = u[0] * v[0] + u[1] * v[1] + u[2] * v[2];
		return scalar;
	};
	/**
	 * Returns a vector with the given two points
	 * 
	 * @param {number} p1 The first point
	 * @param {number} p2 The second point
	 * 
	 * @returns {object} The resulting vector
	 */
	wink.math.getVector = function(p1, p2)
	{
		var vector = [ 0, 0, 0, 1 ];
		vector[0] = p2[0] - p1[0];
		vector[1] = p2[1] - p1[1];
		vector[2] = p2[2] - p1[2];
		return vector;
	};
	/**
	 * Returns the vector result of the multiplication between a matrix and a vector
	 * 
	 * @param {object} matrix The matrix
	 * @param {object} vector The vector
	 * 
	 * @returns {object} The resulting vector
	 */
	wink.math.multiplyMatrixVector = function(matrix, vector)
	{
		var result = [ 0, 0, 0, 1 ];
		if (!vector[3])
		{
			vector[3] = 1;
		}
		result[0] = vector[0] * matrix[0] + vector[1] * matrix[1] + vector[2] * matrix[2] + vector[3] * matrix[3];
		result[1] = vector[0] * matrix[4] + vector[1] * matrix[5] + vector[2] * matrix[6] + vector[3] * matrix[7];
		result[2] = vector[0] * matrix[8] + vector[1] * matrix[9] + vector[2] * matrix[10] + vector[3] * matrix[11];
		result[3] = vector[0] * matrix[12] + vector[1] * matrix[13] + vector[2] * matrix[14] + vector[3] * matrix[15];
		return result;
	};
	
	return wink.math;
});