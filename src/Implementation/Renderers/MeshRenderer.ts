import { IRenderer } from "../../Interfaces/IRenderer";

/**
 * Renders a mesh object as a projectile renderer
 */
export class MeshRenderer implements IRenderer {
    public physicsIgnore: ReadonlyArray<Instance>;

    private meshPart: MeshPart;
    private offsetCFrame: CFrame;

    /**
     * Creates a new MeshRenderer with a clone of the given `MeshPart`
     * @param baseMeshPart The base mesh part to clone
     * @param offsetCFrame The offset CFrame to apply every frame - applied as following: `new CFrame(position, position.add(directionUnit)).mul(offsetCFrame)`
     */
    public constructor(baseMeshPart: MeshPart, offsetCFrame?: CFrame) {
        this.meshPart = MeshRenderer.getMeshPart(baseMeshPart);
        this.offsetCFrame = offsetCFrame || new CFrame();

        this.physicsIgnore = [this.meshPart];
    }

    public destroy() {
        this.meshPart.Destroy();
    }

    public render(position: Vector3, directionUnit: Vector3) {
        const baseCFrame = new CFrame(position, position.add(directionUnit));
        this.meshPart.CFrame = baseCFrame.mul(this.offsetCFrame);
    }

    private static getMeshPart(baseMeshPart: MeshPart) {
        const meshPart = baseMeshPart.Clone();
        meshPart.Anchored = true;
        meshPart.CanCollide = false;
        meshPart.Massless = true;

        return meshPart;
    }
}