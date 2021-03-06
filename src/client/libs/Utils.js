/*
 * @author ohmed
 * DatTank utils functions
*/

var Utils = {};

//

Utils.getDistance = function ( v1, v2 ) {

    return Math.sqrt( Math.pow( v1.x - v2.x, 2 ) + Math.pow( v1.z - v2.z, 2 ) );

};

Utils.getScreenPos = (function () {

    var point = false;
    var result = false;

    return function ( x, y, z, camera ) {

        point = point || new THREE.Vector3();
        result = result || new THREE.Vector2();

        point.set( x, y, z );

        var widthHalf = view.screenWidth / 2;
        var heightHalf = view.screenHeight / 2;
        var vector = point.project( camera );

        result.x = ( vector.x * widthHalf ) + widthHalf,
        result.y = - ( vector.y * heightHalf ) + heightHalf

        return result;

    };

}) ();

Utils.addAngle = function ( a1, a2 ) {

    return Utils.formatAngle( a1 + a2 );

};
