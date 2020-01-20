import { IRenderer } from "../Interfaces/IRenderer";

/**
 * Defines the set of configuration values for a Projectile
 */
export type ProjectileConfig = {
	/**
	 * The initial position
	 */
	position: Vector3;

	/**
	 * The initial velocity
	 */
	velocity: Vector3;

	/**
	 * The constant acceleration
	 */
	acceleration: Vector3;
} & Partial<{

	/**
	 * Whether the projectile should bounce
	 * Defaults to false
	 */
	bounce?: boolean;

	/**
	 * Whether the projectile can collide with other objects (whether it should check for collisions)
	 * Defaults to true
	 */
	canCollide?: boolean;

	/**
	 * The maximum lifespan, in seconds, of the projectile
	 * Defaults to 2
	 */
	life?: number;

	/**
	 * The maximum distance, in studs, that the projectile can travel
	 * Defaults to 5000
	 */
	maxRange?: number;

	/**
	 * The minimum exit velocity of the projectile. If the calculated exit velocity in a penetration is less than this value, the projectile will be destroyed.
	 * Defaults to 100
	 */
	minExitVelocity?: number;
	
	/**
	 * Whether the projectile can penetrate through objects in the world
	 * Defaults to false
	 */
	penetration?: boolean;
	
	/**
	 * The list of Instances (and their descendants) to ignore during all physics calculations
	 * Defaults to an empty array
	 */
	physicsIgnore?: Array<Instance>;

	/**
	 * The amount of resistance applied during a penetration
	 * Defaults to 1
	 */
	resistance?: number;

	/**
	 * The renderer for the projectile
	 * Defaults to a white CylinderRenderer
	 */
	renderer?: IRenderer; 

	/**
	 * An optional callback function for when the projectile collides with a part not in its physicsIgnore
	 */
	onTouch?: (part: BasePart, position: Vector3, normal: Vector3) => unknown;
}>;