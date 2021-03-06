/*
 * @author ohmed
 * DatTank Math Vector3
*/

export class Vec3 {

    public x: number = 0;
    public y: number = 0;
    public z: number = 0;

    //

    public static dist ( v1: Vec3, v2: Vec3 ) : number {

        return Math.sqrt( Math.pow( v1.x - v2.x, 2 ) + Math.pow( v1.z - v2.z, 2 ) );

    };

    public set ( x: number, y: number, z: number ) : void {

        this.x = x;
        this.y = y;
        this.z = z;

    };

    public length () : number {

        return Math.sqrt( this.x * this.x + this.y * this.y + this.z * this.z );

    };

    public sum ( vec: Vec3 ) : Vec3 {

        return new Vec3( this.x + vec.x, this.y + vec.y, this.z + vec.z );

    };

    public distanceTo ( point: Vec3 ) : number {

        const dx = this.x - point.x;
        const dy = this.y - point.y;
        const dz = this.z - point.z;

        return Math.sqrt( dx * dx + dy * dy + dz * dz );

    };

    public copy ( point: Vec3 ) : void {

        this.x = point.x;
        this.y = point.y;
        this.z = point.z;

    };

    public clone () : Vec3 {

        return new Vec3( this.x, this.y, this.z );

    };

    public toJSON () : any {

        return {
            x:  this.x,
            y:  this.y,
            z:  this.z,
        };

    };

    //

    constructor ( x?: number, y?: number, z?: number ) {

        this.x = x || 0;
        this.y = y || 0;
        this.z = z || 0;

    };

};
