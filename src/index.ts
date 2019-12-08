import { Workspace, RunService } from "@rbxts/services";

const terrain = Workspace.Terrain;

const raycastIgnore = Workspace.FindFirstChild("Ignore");

type ProjectileConfig = Partial<{
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

let elapsedTime = 0;
const globalPhysicsIgnore = new Array<Instance>();
if (raycastIgnore) {
	globalPhysicsIgnore.push(raycastIgnore);
}
const removeList = new Set<Projectile>();
const lines = new Array<CylinderHandleAdornment>();
const particles = new Array<Projectile>();

function getLine(color: Color3) {
	const line = lines.pop() || new Instance("CylinderHandleAdornment");
	line.Parent = terrain;
	line.Adornee = terrain;
	line.Color3 = color;
	line.Radius = 0.05;
	return line;
}

export class Projectile {
	public lifeTime: number;
	public line: CylinderHandleAdornment;

	private px = 0;
	private py = 0;
	private pz = 0;

	private vx = 0;
	private vy = 0;
	private vz = 0;

	private ax = 0;
	private ay = 0;
	private az = 0;

	private distanceSq = 0;
	private wasRendered = true;

	private bounce: boolean;
	private color: Color3;
	private canCollide: boolean;
	private maxRangeSq: number;
	private minExitVelocity: number;
	private penetration: boolean;
	private physicsIgnore: Array<Instance>;
	private resistance: number;

	private onTouch?: (part: BasePart, position: Vector3, normal: Vector3) => void;

	public constructor({
		bounce = false,
		canCollide = false,
		color = new Color3(1, 1, 1),
		life = 2,
		maxRange = 5000,
		minExitVelocity = 100,
		onTouch,
		physicsIgnore = [],
		penetration = false,
		resistance = 1,
	}: ProjectileConfig) {
		this.bounce = bounce;
		this.canCollide = canCollide;
		this.color = color;
		this.lifeTime = elapsedTime + life;
		this.maxRangeSq = maxRange * maxRange;
		this.minExitVelocity = minExitVelocity;
		this.physicsIgnore = [...globalPhysicsIgnore, ...physicsIgnore];
		this.penetration = penetration;
		this.resistance = resistance;

		this.onTouch = onTouch;

		this.line = getLine(this.color);

		particles.push(this);
	}

	public static addToPhysicsIgnore(object: Instance) {
		for (const v of globalPhysicsIgnore) {
			if (v === object) {
				return;
			}
		}

		globalPhysicsIgnore.push(object);

		object.GetPropertyChangedSignal("Parent").Connect(() => {
			if (!object.Parent) {
				const index = globalPhysicsIgnore.indexOf(object);
				if (index !== -1) {
					globalPhysicsIgnore.remove(index);
				}
			}
		});
	}

	public step(dt: number) {
		const physicsIgnore = this.physicsIgnore;

		const qx = this.px;
		const qy = this.py;
		const qz = this.pz;

		const ix = this.vx;
		const iy = this.vy;
		const iz = this.vz;

		this.vx += dt * this.ax;
		this.vy += dt * this.ay;
		this.vz += dt * this.az;

		let dx = (dt / 2) * (ix + this.vx);
		let dy = (dt / 2) * (iy + this.vy);
		let dz = (dt / 2) * (iz + this.vz);

		let dir = new Vector3(dx, dy, dz);

		if (this.canCollide && (dx !== 0 || dy !== 0 || dz !== 0)) {
			const [part, pos, norm] = Workspace.FindPartOnRayWithIgnoreList(
				new Ray(new Vector3(this.px, this.py, this.pz), dir),
				physicsIgnore,
				false,
				true,
			);
			if (part) {
				if (this.penetration) {
					const unitDir = dir.Unit;
					dir = unitDir.mul(part.Size.Magnitude);
					const [, nextPos] = Workspace.FindPartOnRayWithIgnoreList(
						new Ray(pos, dir),
						physicsIgnore,
						false,
						true,
					);
					const [, exit] = Workspace.FindPartOnRayWithIgnoreList(
						new Ray(nextPos, dir.mul(-1)),
						physicsIgnore,
						false,
						true,
					);
					const dist = unitDir.Dot(exit.sub(pos));
					if (dist > 0) {
						const currentVelocity = (ix * ix + iy * iy + iz * iz) ** 0.5;
						if (dist < math.log(currentVelocity / this.minExitVelocity) / this.resistance) {
							this.px = exit.X;
							this.py = exit.Y;
							this.pz = exit.Z;
							const gv = math.exp(-this.resistance * dist);
							this.vx *= gv;
							this.vy *= gv;
							this.vz *= gv;
						} else {
							removeList.add(this);
							this.px = pos.X;
							this.py = pos.Y;
							this.pz = pos.Z;
						}
					} else {
						removeList.add(this);
						this.px = nextPos.X;
						this.py = nextPos.Y;
						this.pz = nextPos.Z;
					}
				} else {
					this.px = pos.X;
					this.py = pos.Y;
					this.pz = pos.Z;
				}

				if (this.bounce) {
					const nx = norm.X;
					const ny = norm.Y;
					const nz = norm.Z;
					const vDot = -2 * (this.vx * nx + this.vy * ny + this.vz * nz);
					const RS = 0.9;
					this.vx = RS * (vDot * nx + this.vx);
					this.vy = RS * (vDot * nx + this.vy);
					this.vz = RS * (vDot * nx + this.vz);
				} else {
					removeList.add(this);
				}

				if (this.onTouch && this.onTouch(part, pos, norm)) {
					this.line.Adornee = undefined;
					removeList.add(this);
					return;
				}
			} else {
				this.px += dx;
				this.py += dy;
				this.pz += dz;
			}

			dx = this.px - qx;
			dy = this.py - qy;
			dz = this.pz - qz;

			this.distanceSq += dx * dx + dy * dy + dz * dz;
			if (this.distanceSq > this.maxRangeSq) {
				removeList.add(this);
				if (this.wasRendered) {
					this.wasRendered = false;
					this.line.Adornee = undefined;
				}
				return;
			}

			const oldPos = new Vector3(qx, qy, qz);
			dir = new Vector3(dx, dy, dz);

			const length = dir.Magnitude;
			this.line.CFrame = new CFrame(oldPos, oldPos.add(dir)).mul(new CFrame(0, 0, -length / 2));

			if (!this.wasRendered) {
				this.wasRendered = true;
				this.line.Adornee = terrain;
			}
		}
	}

	public remove() {
		removeList.add(this);
	}
}

RunService.RenderStepped.Connect(dt => {
	elapsedTime += dt;
	let j = 0;
	for (let i = 0; i < particles.size(); i++) {
		const p = particles[i];
		particles.remove(i);
		if (removeList.has(p) || p.lifeTime < elapsedTime) {
			p.line.Parent = undefined;
			lines.push(p.line);
			removeList.delete(p);
		} else {
			particles[j++] = p;
			p.step(dt);
		}
	}
});
