import { IRenderer } from "../../Interfaces/IRenderer";

const Workspace = game.GetService("Workspace");

const DEFAULT_RADIUS = 0.05;

const recyclables = new Array<CylinderHandleAdornment>();

/**
 * A lightweight renderer that uses CylinderHandleAdornments to render the movement of projectiles frame by frame
 * Unless you _need_ a more specific renderer, this is highly encouraged!
 */
export class CylinderRenderer implements IRenderer {
	public readonly physicsIgnore: ReadonlyArray<Instance> = [];

	private cylinderHandleAdornment: CylinderHandleAdornment;
	private previousPosition?: Vector3;

	public constructor(color: Color3, radius?: number) {
		this.cylinderHandleAdornment = CylinderRenderer.createCylinderAdornment(color, radius);
	}

	private static createCylinderAdornment(color: Color3, radius?: number) {
		const line = recyclables.pop() || new Instance("CylinderHandleAdornment");
		line.Parent = Workspace.Terrain;
		line.Adornee = Workspace.Terrain;
		line.Color3 = color;
		line.Radius = radius !== undefined ? radius : DEFAULT_RADIUS;
		return line;
	}

	public destroy() {
		this.cylinderHandleAdornment.Adornee = undefined;
		recyclables.push(this.cylinderHandleAdornment);
	}

	public render(position: Vector3, directionUnit: Vector3) {
		if (this.previousPosition !== undefined) {
			const length = position.sub(this.previousPosition).Magnitude;

			this.cylinderHandleAdornment.Height = length;
			this.cylinderHandleAdornment.CFrame = new CFrame(position, position.add(directionUnit)).mul(
				new CFrame(0, 0, -length / 2),
			);
		}
		this.previousPosition = position;
	}
}
