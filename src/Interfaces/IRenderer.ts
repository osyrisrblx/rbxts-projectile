export interface IRenderer {
    readonly physicsIgnore: ReadonlyArray<Instance>;

    /**
     * Destroys the renderer
     */
    destroy(): void;
    
    /**
     * Renders the projectile
     * @param position The position to render at
     * @param directionUnit The unit vector describing the current direction of the projectile
     */
    render(position: Vector3, directionUnit: Vector3): void;
}