/// <reference types="@rbxts/types" />
declare type ProjectileConfig = Partial<{
    position: Vector3;
    velocity: Vector3;
    acceleration: Vector3;
    bounce: boolean;
    canCollide: boolean;
    color: Color3;
    life: number;
    maxRange: number;
    minExitVelocity: number;
    penetration: boolean;
    physicsIgnore: Array<Instance>;
    resistance: number;
    onTouch: (part: BasePart, position: Vector3, normal: Vector3) => void;
}>;
export declare class Projectile {
    lifeTime: number;
    line: CylinderHandleAdornment;
    private px;
    private py;
    private pz;
    private vx;
    private vy;
    private vz;
    private ax;
    private ay;
    private az;
    private distanceSq;
    private wasRendered;
    private bounce;
    private color;
    private canCollide;
    private maxRangeSq;
    private minExitVelocity;
    private penetration;
    private physicsIgnore;
    private resistance;
    private onTouch?;
    constructor({ position, velocity, acceleration, bounce, canCollide, color, life, maxRange, minExitVelocity, physicsIgnore, penetration, resistance, onTouch, }: ProjectileConfig);
    static addToPhysicsIgnore(object: Instance): void;
    step(dt: number): void;
    remove(): void;
}
export {};
