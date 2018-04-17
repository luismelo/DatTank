/*
 * @author ohmed
 * DatTank Tree decoration
*/

import { DecorationCore } from "./../../../core/objects/Decoration.Core";

//

class Tree5Decoration extends DecorationCore {

    static title: string = 'Tree5';

    //

    constructor ( params ) {

        super( params );
        this.title = Tree5Decoration.title;

    };

};

//

export { Tree5Decoration };