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

	raycastParams?: RaycastParams;

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
	 * @param part The part that was collided with by the projectile
	 * @param position The position of the collision with the part and the projectile
	 * @param surfaceNormal The normal of the surface that the projectile collided with
	 * @param collisionNormal The negative unit vector of the velocity of the projectile at the time of collision
	 * @returns A boolean indicating whether the projectile should be removed
	 */
	onTouch?: (part: BasePart, position: Vector3, surfaceNormal: Vector3, collisionNormal: Vector3) => boolean;
}>;
