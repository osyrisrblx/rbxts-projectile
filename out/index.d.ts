/// <reference types="@rbxts/types" />
declare type ParticleConfig = Partial<{
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
export declare class Particle {
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
    constructor({ bounce, canCollide, color, life, maxRange, minExitVelocity, onTouch, physicsIgnore, penetration, resistance, }: ParticleConfig);
    static addToPhysicsIgnore(object: Instance): void;
    step(dt: number): void;
    remove(): void;
}
export {};
