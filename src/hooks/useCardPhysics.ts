import { useState, useEffect, useRef } from "react";

export interface PhysicsBody {
	id: string;
	tool: any;
	x: number;
	y: number;
	ox: number;
	oy: number;
	width: number;
	height: number;
	owidth: number;
	oheight: number;
	vx: number;
	vy: number;
	angle: number;
	angularVelocity: number;
	isReady: boolean;
	isTeased: boolean;
	targetSize?: number;
	targetX?: number;
	targetY?: number;
	morphProgress?: number;
}

export function useCardPhysics(
	filteredTools: any[],
	activeCategory: string,
	visibleCount: number,
	isLocal: boolean,
	hasOllama: boolean
) {
	const gridContainerRef = useRef<HTMLDivElement>(null);
	const [isPhysicsActive, setIsPhysicsActive] = useState(false);
	const [isSnappingBack, setIsSnappingBack] = useState(false);
	const [physicsBodies, setPhysicsBodies] = useState<PhysicsBody[]>([]);
	const [physicsContainerHeight, setPhysicsContainerHeight] = useState<number | null>(null);
	const [draggingId, setDraggingId] = useState<string | null>(null);

	const dragOffsetRef = useRef({ x: 0, y: 0 });
	const pointerPosRef = useRef({ x: 0, y: 0 });
	const bodiesRef = useRef<PhysicsBody[]>([]);

	// Update bodiesRef whenever physicsBodies state changes to prevent animation loop closures
	useEffect(() => {
		bodiesRef.current = physicsBodies;
	}, [physicsBodies]);

	// Mouse/Touch move handlers relative to container
	const handlePointerMove = (e: React.PointerEvent) => {
		if (!draggingId || !gridContainerRef.current) return;
		const rect = gridContainerRef.current.getBoundingClientRect();
		const clientX = e.clientX - rect.left;
		const clientY = e.clientY - rect.top;
		pointerPosRef.current = { x: clientX, y: clientY };
	};

	const handlePointerUp = () => {
		setDraggingId(null);
	};

	const togglePhysicsMode = () => {
		if (isSnappingBack) return;

		if (isPhysicsActive) {
			setIsSnappingBack(true);
		} else {
			if (!gridContainerRef.current) return;

			const currentHeight = gridContainerRef.current.offsetHeight;
			setPhysicsContainerHeight(currentHeight);

			const cardElements = gridContainerRef.current.querySelectorAll(".glass-card");
			const newBodies: PhysicsBody[] = [];
			const currentTools = filteredTools.slice(0, activeCategory === "all" ? visibleCount : undefined);

			currentTools.forEach((tool, index) => {
				const el = cardElements[index] as HTMLElement;
				if (el) {
					const ox = el.offsetLeft;
					const oy = el.offsetTop;
					const width = el.offsetWidth;
					const height = el.offsetHeight;

					// Define size of the cubes (larger cubes as requested by the user!)
					const isMobile = window.innerWidth < 640;
					const size = isMobile ? 100 : 120;

					// Center the physics body (cube) on the grid card position
					const px = ox + (width - size) / 2;
					const py = oy + (height - size) / 2;

					newBodies.push({
						id: tool.id,
						tool,
						// Start exactly at the grid coordinates and dimensions
						x: ox,
						y: oy,
						ox,
						oy,
						width,
						height,
						owidth: width,
						oheight: height,
						targetSize: size,
						targetX: px,
						targetY: py,
						vx: 0,
						vy: 0,
						angle: 0,
						angularVelocity: 0,
						isReady: tool.status === "functional",
						isTeased: (tool.requiresOllama ||
							tool.categories[0] === "ai" ||
							tool.categories[0] === "investigation") &&
							(!isLocal || !hasOllama),
						morphProgress: 0, // start at 0 (animates from grid cards to cubes)
					});
				}
			});

			if (newBodies.length > 0) {
				setPhysicsBodies(newBodies);
				setIsPhysicsActive(true);
			}
		}
	};

	useEffect(() => {
		if (!isPhysicsActive && !isSnappingBack) return;

		let animationFrameId: number;
		const gravity = 0.5;
		const friction = 0.985;
		const bounce = 0.6;
		const padding = 4;

		const tick = () => {
			if (!gridContainerRef.current) return;
			const containerWidth = gridContainerRef.current.clientWidth;
			const containerHeight = physicsContainerHeight || gridContainerRef.current.clientHeight;

			let allSnapped = true;

			const updatedBodies = bodiesRef.current.map((body) => {
				const nextBody = { ...body };

				if (isSnappingBack) {
					const dx = nextBody.ox - nextBody.x;
					const dy = nextBody.oy - nextBody.y;
					const dAngle = 0 - nextBody.angle;
					const dWidth = nextBody.owidth - nextBody.width;
					const dHeight = nextBody.oheight - nextBody.height;

					nextBody.x += dx * 0.15;
					nextBody.y += dy * 0.15;
					nextBody.angle += dAngle * 0.15;
					nextBody.width += dWidth * 0.15;
					nextBody.height += dHeight * 0.15;
					nextBody.vx = 0;
					nextBody.vy = 0;
					nextBody.angularVelocity = 0;

					if (
						Math.abs(dx) > 0.5 ||
						Math.abs(dy) > 0.5 ||
						Math.abs(dAngle) > 0.01 ||
						Math.abs(dWidth) > 1 ||
						Math.abs(dHeight) > 1
					) {
						allSnapped = false;
					} else {
						nextBody.x = nextBody.ox;
						nextBody.y = nextBody.oy;
						nextBody.angle = 0;
						nextBody.width = nextBody.owidth;
						nextBody.height = nextBody.oheight;
					}
				} else {
					allSnapped = false;

					if (nextBody.morphProgress !== undefined && nextBody.morphProgress < 1) {
						nextBody.morphProgress += 0.08; // morph takes ~12 frames
						if (nextBody.morphProgress >= 1) {
							nextBody.morphProgress = 1;
							// Finished morphing in place! Trigger initial physics scatter and drop!
							nextBody.x = nextBody.targetX!;
							nextBody.y = nextBody.targetY!;
							nextBody.width = nextBody.targetSize!;
							nextBody.height = nextBody.targetSize!;
							nextBody.vx = (Math.random() - 0.5) * 8;
							nextBody.vy = -Math.random() * 5 - 2; // scatter slightly upwards
							nextBody.angle = (Math.random() - 0.5) * 0.5; // slight starting rotation
							nextBody.angularVelocity = (Math.random() - 0.5) * 0.15;
						} else {
							// Interpolate size and coordinates using cubic easing
							const p = nextBody.morphProgress;
							const easedP = p * p * (3 - 2 * p);
							nextBody.width = nextBody.owidth + (nextBody.targetSize! - nextBody.owidth) * easedP;
							nextBody.height = nextBody.oheight + (nextBody.targetSize! - nextBody.oheight) * easedP;
							nextBody.x = nextBody.ox + (nextBody.targetX! - nextBody.ox) * easedP;
							nextBody.y = nextBody.oy + (nextBody.targetY! - nextBody.oy) * easedP;
						}
					} else {
						// Run normal physics calculations
						if (nextBody.id === draggingId) {
							const targetX = pointerPosRef.current.x - dragOffsetRef.current.x;
							const targetY = pointerPosRef.current.y - dragOffsetRef.current.y;

							nextBody.vx = (targetX - nextBody.x) * 0.35;
							nextBody.vy = (targetY - nextBody.y) * 0.35;

							nextBody.x = targetX;
							nextBody.y = targetY;
							nextBody.angle += nextBody.vx * 0.005;
							nextBody.angularVelocity = nextBody.vx * 0.05;
						} else {
							nextBody.vy += gravity;
							nextBody.vx *= friction;
							nextBody.vy *= friction;
							nextBody.angularVelocity *= 0.95;

							nextBody.x += nextBody.vx;
							nextBody.y += nextBody.vy;
							nextBody.angle += nextBody.angularVelocity;

							if (nextBody.x < padding) {
								nextBody.x = padding;
								nextBody.vx = -nextBody.vx * bounce;
								nextBody.angularVelocity += nextBody.vy * 0.01;
							} else if (nextBody.x + nextBody.width > containerWidth - padding) {
								nextBody.x = containerWidth - nextBody.width - padding;
								nextBody.vx = -nextBody.vx * bounce;
								nextBody.angularVelocity -= nextBody.vy * 0.01;
							}

							if (nextBody.y < padding) {
								nextBody.y = padding;
								nextBody.vy = -nextBody.vy * bounce;
							} else if (nextBody.y + nextBody.height > containerHeight - padding) {
								nextBody.y = containerHeight - nextBody.height - padding;
								nextBody.vy = -nextBody.vy * bounce;
								nextBody.vx *= 0.85;
								nextBody.angularVelocity *= 0.85;
							}
						}
					}
				}

				return nextBody;
			});

			if (!isSnappingBack) {
				for (let i = 0; i < updatedBodies.length; i++) {
					const b1 = updatedBodies[i];
					for (let j = i + 1; j < updatedBodies.length; j++) {
						const b2 = updatedBodies[j];

						const overlapX = Math.min(b1.x + b1.width, b2.x + b2.width) - Math.max(b1.x, b2.x);
						const overlapY = Math.min(b1.y + b1.height, b2.y + b2.height) - Math.max(b1.y, b2.y);

						if (overlapX > 0 && overlapY > 0) {
							if (overlapX < overlapY) {
								const push = overlapX / 2;
								const direction = b1.x < b2.x ? -1 : 1;

								if (b1.id !== draggingId) {
									b1.x += push * direction;
									b1.vx = -b1.vx * bounce + (b2.vx * 0.2);
									b1.angularVelocity += b1.vx * 0.001;
								}
								if (b2.id !== draggingId) {
									b2.x -= push * direction;
									b2.vx = -b2.vx * bounce + (b1.vx * 0.2);
									b2.angularVelocity -= b2.vx * 0.001;
								}
							} else {
								const push = overlapY / 2;
								const direction = b1.y < b2.y ? -1 : 1;

								if (b1.id !== draggingId) {
									b1.y += push * direction;
									b1.vy = -b1.vy * bounce + (b2.vy * 0.2);
								}
								if (b2.id !== draggingId) {
									b2.y -= push * direction;
									b2.vy = -b2.vy * bounce + (b1.vy * 0.2);
								}
							}
						}
					}
				}
			}

			setPhysicsBodies(updatedBodies);

			if (isSnappingBack && allSnapped) {
				setIsPhysicsActive(false);
				setIsSnappingBack(false);
				setPhysicsContainerHeight(null);
			} else {
				animationFrameId = requestAnimationFrame(tick);
			}
		};

		animationFrameId = requestAnimationFrame(tick);
		return () => cancelAnimationFrame(animationFrameId);
	}, [isPhysicsActive, isSnappingBack, physicsContainerHeight, draggingId]);

	return {
		gridContainerRef,
		isPhysicsActive,
		isSnappingBack,
		physicsBodies,
		physicsContainerHeight,
		draggingId,
		dragOffsetRef,
		pointerPosRef,
		togglePhysicsMode,
		handlePointerMove,
		handlePointerUp,
		setDraggingId,
	};
}
