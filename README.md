# @rbxts/projectile

WIP projectile package

Create a projectile using the following options:

## **Required**

### `position: Vector3;`
The initial position

### `velocity: Vector3;`
The initial velocity

### `acceleration: Vector3;`
The constant acceleration

## **Optional**

### `bounce?: boolean;` ( Defaults to false )
Whether the projectile should bounce

### `canCollide?: boolean;` ( Defaults to true )
Whether the projectile can collide with other objects (whether it should check for collisions)

### `life?: number;` ( Defaults to 2 )
The maximum lifespan, in seconds, of the projectile

### `maxRange?: number;` ( Defaults to 5000 )
The maximum distance, in studs, that the projectile can travel

### `minExitVelocity?: number;` ( Defaults to 100 )
The minimum exit velocity of the projectile. If the calculated exit velocity in a penetration is less than this value, the projectile will be destroyed.

### `penetration?: boolean;` ( Defaults to false )
Whether the projectile can penetrate through objects in the world

### `physicsIgnore?: Array<Instance>;` ( Defaults to an empty array )
The list of Instances (and their descendants) to ignore during all physics calculations

### `resistance?: number;` ( Defaults to 1 )
The amount of resistance applied during a penetration

### `renderer?: IRenderer;` ( Defaults to a white CylinderRenderer )
The renderer for the projectile

### `onTouch?: (part: BasePart, position: Vector3, normal: Vector3) => unknown;`
An optional callback function for when the projectile collides with a part not in its physicsIgnore

Simple demo:
```TS
// main.client.ts
import { CylinderRenderer, Projectile } from "@rbxts/projectile";
import { Players } from "@rbxts/services";

const SHOT_COUNT = 3;
const MIN_SPREAD_ANGLE = math.rad(0);
const MAX_SPREAD_ANGLE = math.rad(10);

const random = new Random();

const mouse = Players.LocalPlayer.GetMouse();

let tag: object | undefined;

mouse.Button1Down.Connect(() => {
	const myTag = {};
	tag = myTag;

	while (tag === myTag) {
		const character = Players.LocalPlayer.Character;
		if (!character) break;

		const head = character.FindFirstChild("Head");
		if (!head || !head.IsA("BasePart")) break;

		const position = head.CFrame.Position;
		const endPos = mouse.Hit.Position;

		for (let i = 0; i < SHOT_COUNT; i++) {
			const velocity = new CFrame(position, endPos)
				.mul(CFrame.Angles(0, 0, random.NextNumber(0, 2 * math.pi))) // roll to a random angle
				.mul(CFrame.Angles(0, random.NextNumber(MIN_SPREAD_ANGLE, MAX_SPREAD_ANGLE), 0))
				.LookVector.mul(75);

			new Projectile({
				position,
				velocity,
				acceleration: new Vector3(0, -50, 0),

				bounce: true,
				life: 4,
				minExitVelocity: 50,
				penetration: true,
				physicsIgnore: [character],

				renderer: new CylinderRenderer(Color3.fromHSV(math.random(), 1, 1)),
			});
		}
		wait(1 / 30);
	}
});

mouse.Button1Up.Connect(() => (tag = undefined));
```