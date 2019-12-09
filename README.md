# @rbxts/projectile

WIP projectile package

Creates CylinderHandleAdornment objects in Workspace.Terrain

TODO:
	- allow for models for stuff like grenades, etc.

Simple demo:
```TS
// main.client.ts

import { Players } from "@rbxts/services";
import { Projectile } from "shared/Projectile";

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
				color: Color3.fromHSV(math.random(), 1, 1),
				life: 4,
				bounce: true,
				acceleration: new Vector3(0, -50, 0),
				physicsIgnore: [character],
				penetration: true,
				minExitVelocity: 50
			});
		}
		wait(1 / 30);
	}
});

mouse.Button1Up.Connect(() => (tag = undefined));
```