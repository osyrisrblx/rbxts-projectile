import { Workspace, RunService } from "@rbxts/services";

interface ProjectileConfig {
	position: Vector3;
	velocity: Vector3;
	acceleration: Vector3;

	bounce?: boolean;
	canCollide?: boolean;
	color?: Color3;
	life?: number;
	maxRange?: number;
	minExitVelocity?: number;
	penetration?: boolean;
	physicsIgnore?: Array<Instance>;
	resistance?: number;

	onTouch?: (part: BasePart, position: Vector3, normal: Vector3) => unknown;
}

export class Projectile {
	public static elapsedTime = 0;
	public static projectiles = new Array<Projectile>();
	public static readonly removeList = new Set<Projectile>();
	public static readonly globalPhysicsIgnore = new Array<Instance>();
	public static readonly lines = new Array<CylinderHandleAdornment>();

	public readonly lifeTime: number;
	public readonly line: CylinderHandleAdornment;

	private px: number;
	private py: number;
	private pz: number;

	private vx: number;
	private vy: number;
	private vz: number;

	private ax: number;
	private ay: number;
	private az: number;

	private distanceSq = 0;

	private bounce: boolean;
	private color: Color3;
	private canCollide: boolean;
	private maxRangeSq: number;
	private minExitVelocity: number;
	private penetration: boolean;
	private physicsIgnore: Array<Instance>;
	private resistance: number;

	private onTouch: ProjectileConfig["onTouch"];

	public constructor(config: ProjectileConfig) {
		// default values
		const {
			bounce = false,
			canCollide = true,
			color = new Color3(1, 1, 1),
			life = 2,
			maxRange = 5000,
			minExitVelocity = 100,
			physicsIgnore = [],
			penetration = false,
			resistance = 1,
		} = config;

		this.px = config.position.X;
		this.py = config.position.Y;
		this.pz = config.position.Z;

		this.vx = config.velocity.X;
		this.vy = config.velocity.Y;
		this.vz = config.velocity.Z;

		this.ax = config.acceleration.X;
		this.ay = config.acceleration.Y;
		this.az = config.acceleration.Z;

		this.bounce = bounce;
		this.canCollide = canCollide;
		this.color = color;
		this.lifeTime = Projectile.elapsedTime + life;
		this.maxRangeSq = maxRange ** 2;
		this.minExitVelocity = minExitVelocity;
		this.physicsIgnore = [...Projectile.globalPhysicsIgnore, ...physicsIgnore];
		this.penetration = penetration;
		this.resistance = resistance;

		this.onTouch = config.onTouch;

		this.line = Projectile.getLine(this.color);

		Projectile.projectiles.push(this);
	}

	public static addToPhysicsIgnore(object: Instance) {
		for (const v of Projectile.globalPhysicsIgnore) {
			if (v === object) {
				return;
			}
		}

		Projectile.globalPhysicsIgnore.push(object);

		object.GetPropertyChangedSignal("Parent").Connect(() => {
			if (!object.Parent) {
				const index = Projectile.globalPhysicsIgnore.indexOf(object);
				if (index !== -1) {
					Projectile.globalPhysicsIgnore.remove(index);
				}
			}
		});
	}

	private static getLine(color: Color3) {
		const line = this.lines.pop() || new Instance("CylinderHandleAdornment");
		line.Parent = Workspace.Terrain;
		line.Adornee = Workspace.Terrain;
		line.Color3 = color;
		line.Radius = 0.05;
		return line;
	}

	private static raycast(start: Vector3, direction: Vector3, ignore: Array<Instance>) {
		return Workspace.FindPartOnRayWithIgnoreList(new Ray(start, direction), ignore, false, true);
	}

	public step(dt: number) {
		// store original position
		const pxOrig = this.px;
		const pyOrig = this.py;
		const pzOrig = this.pz;

		// store original velocity
		const vxOrig = this.vx;
		const vyOrig = this.vy;
		const vzOrig = this.vz;

		// update velocity
		this.vx += dt * this.ax;
		this.vy += dt * this.ay;
		this.vz += dt * this.az;

		// expected delta
		let dx = (dt * (vxOrig + this.vx)) / 2;
		let dy = (dt * (vyOrig + this.vy)) / 2;
		let dz = (dt * (vzOrig + this.vz)) / 2;

		if (this.canCollide && (dx !== 0 || dy !== 0 || dz !== 0)) {
			const dir = new Vector3(dx, dy, dz);
			const startPos = new Vector3(this.px, this.py, this.pz);
			const [part, pos, norm] = Projectile.raycast(startPos, dir, this.physicsIgnore);
			if (part) {
				let didPenetrate = false;
				if (this.penetration) {
					const unitDir = dir.Unit;
					const exitDir = unitDir.mul(part.Size.Magnitude);
					const [, nextPos] = Projectile.raycast(pos, exitDir, this.physicsIgnore);
					const [, exit] = Projectile.raycast(nextPos, exitDir.mul(-1), this.physicsIgnore);
					const distance = unitDir.Dot(exit.sub(pos));
					if (distance > 0) {
						const currentVelocity = new Vector3(vxOrig, vyOrig, vzOrig).Magnitude;
						if (distance < math.log(currentVelocity / this.minExitVelocity) / this.resistance) {
							this.px = exit.X;
							this.py = exit.Y;
							this.pz = exit.Z;

							const gv = math.exp(-this.resistance * distance);
							this.vx *= gv;
							this.vy *= gv;
							this.vz *= gv;
							didPenetrate = true;
						}
					}
				}

				if (!didPenetrate) {
					this.px = pos.X;
					this.py = pos.Y;
					this.pz = pos.Z;
					if (this.bounce) {
						const vDot = -2 * (this.vx * norm.X + this.vy * norm.Y + this.vz * norm.Z);
						const RS = 0.9;
						this.vx = RS * (vDot * norm.X + this.vx);
						this.vy = RS * (vDot * norm.Y + this.vy);
						this.vz = RS * (vDot * norm.Z + this.vz);
					} else {
						this.remove();
					}
				}

				if (this.onTouch && this.onTouch(part, pos, norm) === true) {
					this.remove(true);
					return;
				}
			} else {
				this.px = pos.X;
				this.py = pos.Y;
				this.pz = pos.Z;
			}

			// actual delta
			dx = this.px - pxOrig;
			dy = this.py - pyOrig;
			dz = this.pz - pzOrig;
		} else {
			// no collision, move without raycasting
			this.px += dx;
			this.py += dy;
			this.pz += dz;
		}

		// remove if distance is too far
		this.distanceSq += dx ** 2 + dy ** 2 + dz ** 2;
		if (this.distanceSq > this.maxRangeSq) {
			this.remove();
			return;
		}

		// render
		const origPos = new Vector3(pxOrig, pyOrig, pzOrig);
		const direction = new Vector3(dx, dy, dz);
		const length = direction.Magnitude;
		this.line.Height = length;
		this.line.CFrame = new CFrame(origPos, origPos.add(direction)).mul(new CFrame(0, 0, -length / 2));
	}

	public remove(instantly = false) {
		if (instantly) {
			this.line.Adornee = undefined;
		}
		Projectile.removeList.add(this);
	}
}

const raycastIgnore = Workspace.FindFirstChild("Ignore");
if (raycastIgnore) {
	Projectile.globalPhysicsIgnore.push(raycastIgnore);
}

RunService.RenderStepped.Connect(dt => {
	Projectile.elapsedTime += dt;

	const newProjectiles = new Array<Projectile>();
	for (const p of Projectile.projectiles) {
		if (Projectile.removeList.has(p) || p.lifeTime < Projectile.elapsedTime) {
			p.line.Parent = undefined;
			Projectile.lines.push(p.line);
			Projectile.removeList.delete(p);
		} else {
			newProjectiles.push(p);
			p.step(dt);
		}
	}

	Projectile.projectiles = newProjectiles;
});
