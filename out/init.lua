-- Compiled with https://roblox-ts.github.io v0.2.14
-- December 7, 2019, 5:34 PM Pacific Standard Time

local TS = _G[script];
local exports = {};
local Particle;
local _0 = TS.import(script, TS.getModule(script, "services"));
local Workspace, RunService = _0.Workspace, _0.RunService;
local terrain = Workspace.Terrain;
local raycastIgnore = Workspace:FindFirstChild("Ignore");
local elapsedTime = 0;
local globalPhysicsIgnore = {};
if raycastIgnore then
	globalPhysicsIgnore[#globalPhysicsIgnore + 1] = raycastIgnore;
end;
local removeList = {};
local lines = {};
local particles = {};
local function getLine(color)
	local _1 = #lines;
	local _2 = lines[_1];
	lines[_1] = nil; -- lines.pop
	local _3 = _2;
	local line = _3 or Instance.new("CylinderHandleAdornment");
	line.Parent = terrain;
	line.Adornee = terrain;
	line.Color3 = color;
	line.Radius = 0.05;
	return line;
end;
do
	Particle = setmetatable({}, {
		__tostring = function() return "Particle" end;
	});
	Particle.__index = Particle;
	function Particle.new(...)
		local self = setmetatable({}, Particle);
		self:constructor(...);
		return self;
	end;
	function Particle:constructor(_1)
		local bounce = _1.bounce;
		if bounce == nil then bounce = false; end;
		local canCollide = _1.canCollide;
		if canCollide == nil then canCollide = false; end;
		local color = _1.color;
		if color == nil then color = Color3.new(1, 1, 1); end;
		local life = _1.life;
		if life == nil then life = 2; end;
		local maxRange = _1.maxRange;
		if maxRange == nil then maxRange = 5000; end;
		local minExitVelocity = _1.minExitVelocity;
		if minExitVelocity == nil then minExitVelocity = 100; end;
		local onTouch = _1.onTouch;
		local physicsIgnore = _1.physicsIgnore;
		if physicsIgnore == nil then physicsIgnore = {}; end;
		local penetration = _1.penetration;
		if penetration == nil then penetration = false; end;
		local resistance = _1.resistance;
		if resistance == nil then resistance = 1; end;
		self.px = 0;
		self.py = 0;
		self.pz = 0;
		self.vx = 0;
		self.vy = 0;
		self.vz = 0;
		self.ax = 0;
		self.ay = 0;
		self.az = 0;
		self.distanceSq = 0;
		self.wasRendered = true;
		self.bounce = bounce;
		self.canCollide = canCollide;
		self.color = color;
		self.lifeTime = elapsedTime + life;
		self.maxRangeSq = maxRange * maxRange;
		self.minExitVelocity = minExitVelocity;
		self.physicsIgnore = TS.array_concat(globalPhysicsIgnore, physicsIgnore);
		self.penetration = penetration;
		self.resistance = resistance;
		self.onTouch = onTouch;
		self.line = getLine(self.color);
		particles[#particles + 1] = self;
	end;
	-- static methods
	function Particle:addToPhysicsIgnore(object)
		for _1 = 1, #globalPhysicsIgnore do
			local v = globalPhysicsIgnore[_1];
			if v == object then
				return nil;
			end;
		end;
		globalPhysicsIgnore[#globalPhysicsIgnore + 1] = object;
		object:GetPropertyChangedSignal("Parent"):Connect(function()
			if not (object.Parent) then
				local index = TS.array_indexOf(globalPhysicsIgnore, object);
				if index ~= -1 then
					table.remove(globalPhysicsIgnore, index + 1);
				end;
			end;
		end);
	end;
	-- instance methods
	function Particle:step(dt)
		local physicsIgnore = self.physicsIgnore;
		local qx = self.px;
		local qy = self.py;
		local qz = self.pz;
		local ix = self.vx;
		local iy = self.vy;
		local iz = self.vz;
		self.vx = self.vx + (dt * self.ax);
		self.vy = self.vy + (dt * self.ay);
		self.vz = self.vz + (dt * self.az);
		local dx = (dt / 2) * (ix + self.vx);
		local dy = (dt / 2) * (iy + self.vy);
		local dz = (dt / 2) * (iz + self.vz);
		local dir = Vector3.new(dx, dy, dz);
		if (self.canCollide) and ((dx ~= 0) or (dy ~= 0) or (dz ~= 0)) then
			local part, pos, norm = Workspace:FindPartOnRayWithIgnoreList(Ray.new(Vector3.new(self.px, self.py, self.pz), dir), physicsIgnore, false, true);
			if part then
				if self.penetration then
					local unitDir = dir.Unit;
					dir = (unitDir * (part.Size.Magnitude));
					local _, nextPos = Workspace:FindPartOnRayWithIgnoreList(Ray.new(pos, dir), physicsIgnore, false, true);
					local _, exit = Workspace:FindPartOnRayWithIgnoreList(Ray.new(nextPos, (dir * (-1))), physicsIgnore, false, true);
					local dist = unitDir:Dot((exit - (pos)));
					if dist > 0 then
						local currentVelocity = (ix * ix + iy * iy + iz * iz) ^ 0.5;
						if dist < math.log(currentVelocity / self.minExitVelocity) / self.resistance then
							self.px = exit.X;
							self.py = exit.Y;
							self.pz = exit.Z;
							local gv = math.exp(-self.resistance * dist);
							self.vx = self.vx * (gv);
							self.vy = self.vy * (gv);
							self.vz = self.vz * (gv);
						else
							removeList[self] = true;
							self.px = pos.X;
							self.py = pos.Y;
							self.pz = pos.Z;
						end;
					else
						removeList[self] = true;
						self.px = nextPos.X;
						self.py = nextPos.Y;
						self.pz = nextPos.Z;
					end;
				else
					self.px = pos.X;
					self.py = pos.Y;
					self.pz = pos.Z;
				end;
				if self.bounce then
					local nx = norm.X;
					local ny = norm.Y;
					local nz = norm.Z;
					local vDot = -2 * (self.vx * nx + self.vy * ny + self.vz * nz);
					local RS = 0.9;
					self.vx = RS * (vDot * nx + self.vx);
					self.vy = RS * (vDot * nx + self.vy);
					self.vz = RS * (vDot * nx + self.vz);
				else
					removeList[self] = true;
				end;
				if (self.onTouch) and (self.onTouch(part, pos, norm)) then
					self.line.Adornee = nil;
					removeList[self] = true;
					return nil;
				end;
			else
				self.px = self.px + (dx);
				self.py = self.py + (dy);
				self.pz = self.pz + (dz);
			end;
			dx = self.px - qx;
			dy = self.py - qy;
			dz = self.pz - qz;
			self.distanceSq = self.distanceSq + (dx * dx + dy * dy + dz * dz);
			if self.distanceSq > self.maxRangeSq then
				removeList[self] = true;
				if self.wasRendered then
					self.wasRendered = false;
					self.line.Adornee = nil;
				end;
				return nil;
			end;
			local oldPos = Vector3.new(qx, qy, qz);
			dir = Vector3.new(dx, dy, dz);
			local length = dir.Magnitude;
			self.line.CFrame = (CFrame.new(oldPos, (oldPos + (dir))) * (CFrame.new(0, 0, -length / 2)));
			if not (self.wasRendered) then
				self.wasRendered = true;
				self.line.Adornee = terrain;
			end;
		end;
	end;
	function Particle:remove()
		removeList[self] = true;
	end;
end;
RunService.RenderStepped:Connect(function(dt)
	elapsedTime = elapsedTime + (dt);
	local j = 0;
	do
		local i = 0;
		while i < #particles do
			local p = particles[i + 1];
			table.remove(particles, i + 1);
			if (removeList[p] ~= nil) or (p.lifeTime < elapsedTime) then
				p.line.Parent = nil;
				lines[#lines + 1] = p.line;
				removeList[p] = nil;
			else
				p:step(dt);
				local _1 = j;
				j = _1 + 1;
				particles[_1 + 1] = p;
			end;
			i = i + 1;
		end;
	end;
end);
exports.Particle = Particle;
return exports;
