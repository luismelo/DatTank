/*
 * @author ohmed
 * JSON -> bin pack convertor
*/

function convert () {

    var input = document.querySelector('#input').value;

    try {

        input = JSON.parse( input );

    } catch ( err ) {

        alert('Not valid input JSON.');
        return;

    }

    //

    var loader = new THREE.JSONLoader();
    var object = loader.parse( input );
    var geometry = object.geometry;
    var buffGeometry = new THREE.BufferGeometry().fromGeometry( object.geometry );

    //

    var packBinObject = {
        bin:        false,
        data:   {
            meta:   {
                vertices:       0,
                faces:          0,
                morphTargets:   0,
                materials:      object.materials.length
            },
            groups:     [],
            animations: []
        }
    };

    // process groups metadata

    for ( var i = 0, il = buffGeometry.groups.length; i < il; i ++ ) {

        var group = buffGeometry.groups[ i ];
        packBinObject.data.groups.push( [ group.start, group.materialIndex, group.count ] );

    }

    // process animations metadata

    if ( geometry.animations ) {

        var offset = 0;
    
        for ( var i = 0, il = geometry.animations.length; i < il; i ++ ) {

            var animation = geometry.animations[ i ];

            packBinObject.data.animations.push({
                name:       animation.name,
                duration:   animation.duration,
                start:      offset,
                end:        offset + animation.tracks.length
            });

            offset += animation.tracks.length;

        }

        packBinObject.data.meta.morphTargets = offset;

    }

    //

    var binObjLength = 0;
    var byteOffset = 0;

    packBinObject.data.meta.vertices = geometry.vertices.length;
    packBinObject.data.meta.faces = geometry.faces.length;

    for ( var attrName in buffGeometry.attributes ) {

        if ( attrName === 'color' || attrName === 'normal' ) continue;
        binObjLength += buffGeometry.attributes[ attrName ].array.length * Int16Array.BYTES_PER_ELEMENT;

    }

    if ( buffGeometry.morphAttributes.position ) {

        for ( var i = 0, il = buffGeometry.morphAttributes.position.length; i < il; i ++ ) {

            binObjLength += buffGeometry.morphAttributes.position[ i ].array.length * Int16Array.BYTES_PER_ELEMENT;

        }

    }

    packBinObject.bin = new ArrayBuffer( binObjLength );

    for ( var attrName in buffGeometry.attributes ) {

        if ( attrName === 'color' || attrName === 'normal' ) continue;

        if ( buffGeometry.attributes[ attrName ].array instanceof Float32Array ) {

            var array = new Int16Array( packBinObject.bin, byteOffset, buffGeometry.attributes[ attrName ].array.length );
            for ( var i = 0, il = buffGeometry.attributes[ attrName ].array.length; i < il; i ++ ) {

                if ( attrName === 'uv' ) {
                
                    array[ i ] = Math.round( 10000 * buffGeometry.attributes[ attrName ].array[ i ] );

                } else {

                    array[ i ] = Math.round( 1000 * buffGeometry.attributes[ attrName ].array[ i ] );

                }

            }

        }

        byteOffset += buffGeometry.attributes[ attrName ].array.length * Int16Array.BYTES_PER_ELEMENT;

    }

    if ( buffGeometry.morphAttributes.position ) {
    
        for ( var i = 0, il = buffGeometry.morphAttributes.position.length; i < il; i ++ ) {

            var array = new Int16Array( packBinObject.bin, byteOffset, buffGeometry.morphAttributes.position[ i ].array.length );

            for ( var j = 0, jl = buffGeometry.morphAttributes.position[ j ].array.length; j < jl; j ++ ) {

                array[ j ] = Math.round( 1000 * buffGeometry.morphAttributes.position[ i ].array[ j ] );

            }

            byteOffset += buffGeometry.morphAttributes.position[ i ].array.length * Int16Array.BYTES_PER_ELEMENT;

        }

    }

    //

    var title = document.getElementById('title').value || 'model';

    var a = document.createElement("a");
    document.body.appendChild( a );
    a.style = "display: none";
    var blob = new Blob( [ packBinObject.bin ], { type: "application/octet-stream" } );
    var url = window.URL.createObjectURL( blob );
    a.href = url;
    a.download = title + '.bin';
    a.click();
    window.URL.revokeObjectURL( url );

    setTimeout( function () {

        var a = document.createElement("a");
        document.body.appendChild( a );
        a.style = "display: none";
        var blob = new Blob( [ JSON.stringify( packBinObject.data ) ], { type: "text/plain" } );
        var url = window.URL.createObjectURL( blob );
        a.href = url;
        a.download = title + '.conf';
        a.click();
        window.URL.revokeObjectURL( url );

    }, 500 );

};
