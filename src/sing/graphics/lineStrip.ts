import * as PIXI from "pixi.js";
import lineStripVertexShaderSource from "@/sing/graphics/shaders/lineStripVertexShader.glsl?raw";
import fragmentShaderSource from "@/sing/graphics/shaders/fragmentShader.glsl?raw";

export class LineStrip {
  private readonly mesh: PIXI.Mesh<PIXI.Shader>;
  private readonly shader: PIXI.Shader;
  private readonly buffer: PIXI.Buffer;
  private readonly geometry: PIXI.Geometry;
  private readonly points: Float32Array;

  get displayObject() {
    return this.mesh as PIXI.DisplayObject;
  }

  get renderable() {
    return this.mesh.renderable;
  }
  set renderable(value: boolean) {
    this.mesh.renderable = value;
  }

  constructor(numOfPoints: number, color: number[], width: number) {
    if (numOfPoints < 2) {
      throw new Error("The number of points must be at least 2.");
    }
    this.shader = PIXI.Shader.from(
      lineStripVertexShaderSource,
      fragmentShaderSource,
      { color }
    );
    this.points = new Float32Array(numOfPoints * 2);
    this.buffer = new PIXI.Buffer(this.points, false);
    const vertices = this.generateSegmentVertices(width);
    const sizeOfFloat = 4;
    this.geometry = new PIXI.Geometry();
    this.geometry.instanced = true;
    this.geometry.instanceCount = numOfPoints - 1;
    this.geometry.addAttribute("pos", vertices.flat(), 3);
    this.geometry.addAttribute(
      "p1",
      this.buffer,
      2,
      false,
      PIXI.TYPES.FLOAT,
      sizeOfFloat * 2,
      0,
      true
    );
    this.geometry.addAttribute(
      "p2",
      this.buffer,
      2,
      false,
      PIXI.TYPES.FLOAT,
      sizeOfFloat * 2,
      sizeOfFloat * 2,
      true
    );
    this.mesh = new PIXI.Mesh(this.geometry, this.shader);
  }

  private generateSegmentVertices(width: number) {
    const halfWidth = width / 2;
    return [
      [-halfWidth, -halfWidth, 0],
      [halfWidth, -halfWidth, 1],
      [halfWidth, halfWidth, 1],
      [-halfWidth, -halfWidth, 0],
      [halfWidth, halfWidth, 1],
      [-halfWidth, halfWidth, 0],
    ];
  }

  setPoint(index: number, x: number, y: number) {
    this.points[2 * index] = x;
    this.points[2 * index + 1] = y;
  }

  update() {
    this.buffer.update(this.points);
  }

  destroy() {
    this.mesh.destroy();
    this.geometry.destroy();
    this.shader.destroy();
    this.buffer.destroy();
  }
}
