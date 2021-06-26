/*
 * @Author: RyanYang
 * @Date: 2020-12-26 19:11:00
 * @LastEditTime: 2021-01-08 23:55:06
 * @LastEditors: Please set LastEditors
 * @Description: 	
 * includes:
		cParticle : class for individual particles
		cParticleSystem : the controller for the particles
		Vector : a vector helper object
 * @FilePath: /particle/particle.js
 */
/* Vector Helper */
const Vector = {
  create: (x, y) => ({
    x: x || -1,
    y: y || -1,
  }),
  multiply: (vector, scaleFactor) => {
    vector.x *= scaleFactor;
    vector.y *= scaleFactor;
    return vector;
  },
  add: (vector1, vector2) => {
    vector1.x += vector2.x;
    vector1.y += vector2.y;
    return vector1;
  },
};
// Individual particle
function cParticle() {
  this.position = Vector.create();
  this.direction = Vector.create();
  this.size = 0;
  this.sizeSmall = 0;
  this.timeToLive = 0;
  this.colour = [];
  this.drawColour = "";
  this.deltaColour = [];
  this.sharpness = 0;
}

// The particle emitter.
function cParticleSystem() {
  this.maxParticles = 150;
  this.particles = [];
  this.active = true;

  // Properties
  // TODO Add controller
  this.position = Vector.create(100, 100);
  this.positionRandom = Vector.create(10, 10);
  this.size = 45;
  this.sizeRandom = 15;
  this.speed = 5;
  this.speedRandom = 1.5;
  this.lifeSpan = 9;
  this.lifeSpanRandom = 7;
  this.angle = 0;
  this.angleRandom = 360;
  this.gravity = Vector.create(0.4, 0.2);
  this.startColour = [250, 218, 68, 1];
  this.startColourRandom = [62, 60, 60, 0];
  this.endColour = [245, 35, 0, 0];
  this.endColourRandom = [60, 60, 60, 0];
  this.sharpness = 40;
  this.sharpnessRandom = 10;

  this.particleCount = 0;
  this.elapsedTime = 0;
  this.duration = -1;
  this.particleIndex = 0;

  /**
   * @description: creat a new Particle, init it and put into particle pools
   * @param {*}
   * @return {*}
   */
  this.addParticle = function () {
    //Up to max particle numbers
    if (this.particleCount == this.maxParticles) {
      return false;
    }
    // Take the next particle out of the particle pool we have created and initialize it
    const particle = new cParticle();
    this.initParticle(particle);
    this.particles[this.particleCount++] = particle;
    return true;
  };

  /**
   * @description:Init random properties of the particle
   * @param {cParticle} particle
   * @return {*}
   */
  this.initParticle = function (particle) {
    //TODO Interesting Random
    const RANDOM = () => Math.random() * 3 - 1;
    particle.position.x = this.position.x + this.positionRandom.x * RANDOM();
    particle.position.y = this.position.y + this.positionRandom.y * RANDOM();

    const newAngle =
      (this.angle + this.angleRandom * RANDOM()) * (Math.PI / 180); // convert to radians
    const vector = Vector.create(Math.cos(newAngle), Math.sin(newAngle)); // Could move to lookup for speed
    const vectorSpeed = this.speed + this.speedRandom * RANDOM();
    particle.direction = Vector.multiply(vector, vectorSpeed);

    particle.size = this.size + this.sizeRandom * RANDOM();
    //In case size is less than 0 when RANDOM return negative number
    particle.size = particle.size < 0 ? 0 : ~~particle.size;
    particle.timeToLive = this.lifeSpan + this.lifeSpanRandom * RANDOM();

    const sharpness = this.sharpness + this.sharpnessRandom * RANDOM();
    particle.sharpness = sharpness > 100 ? 100 : sharpness < 0 ? 0 : sharpness;
    // internal circle gradient size - affects the sharpness of the radial gradient
    particle.sizeSmall = ~~((particle.size / 200) * particle.sharpness); //(size/2/100)

    const start = [
      this.startColour[0] + this.startColourRandom[0] * RANDOM(),
      this.startColour[1] + this.startColourRandom[1] * RANDOM(),
      this.startColour[2] + this.startColourRandom[2] * RANDOM(),
      this.startColour[3] + this.startColourRandom[3] * RANDOM(),
    ];

    const end = [
      this.endColour[0] + this.endColourRandom[0] * RANDOM(),
      this.endColour[1] + this.endColourRandom[1] * RANDOM(),
      this.endColour[2] + this.endColourRandom[2] * RANDOM(),
      this.endColour[3] + this.endColourRandom[3] * RANDOM(),
    ];

    particle.colour = start;
    particle.deltaColour[0] = (end[0] - start[0]) / particle.timeToLive;
    particle.deltaColour[1] = (end[1] - start[1]) / particle.timeToLive;
    particle.deltaColour[2] = (end[2] - start[2]) / particle.timeToLive;
    particle.deltaColour[3] = (end[3] - start[3]) / particle.timeToLive;
  };

  this.update = function (delta) {
    //Whether to add new Particle
    if (this.active) {
      //屏幕上的粒子数永远是maxParticles
      while (this.particleCount < this.maxParticles) {
        this.addParticle();
      }
      this.elapsedTime += delta;
      if (this.duration != -1 && this.duration < this.elapsedTime) {
        this.stop();
      }
    }

    this.particleIndex = 0;
    //rbg fixed to Int[0,255]
    const rgbFixed = (x) => (x > 255 ? 255 : x < 0 ? 0 : ~~x);
    while (this.particleIndex < this.particleCount) {
      const currentParticle = this.particles[this.particleIndex];

      // If the current particle is alive then update it
      if (currentParticle.timeToLive > 0) {
        // Calculate the new direction based on gravity
        // TODO Key Move
        currentParticle.direction = Vector.add(
          currentParticle.direction,
          this.gravity
        );
        // lineVector = Vector.create(10, 0);
        currentParticle.position = Vector.add(
          currentParticle.position,
          currentParticle.direction
        );
        currentParticle.timeToLive -= delta;

        // Update colours based on delta
        const r = rgbFixed(
          (currentParticle.colour[0] += currentParticle.deltaColour[0] * delta)
        );
        let g = rgbFixed(
          (currentParticle.colour[1] += currentParticle.deltaColour[1] * delta)
        );
        let b = rgbFixed(
          (currentParticle.colour[2] += currentParticle.deltaColour[2] * delta)
        );
        let a = (currentParticle.colour[3] +=
          currentParticle.deltaColour[3] * delta);
        a = a > 1 ? 1 : a < 0 ? 0 : a.toFixed(2);
        currentParticle.drawColour = `rgba(${r},${g},${b},${a})`;
        currentParticle.drawColourTransparent = `rgba(${r},${g},${b},0)`;

        this.particleIndex++;
      } else {
        // Replace particle with the last active particle
        if (this.particleIndex != this.particleCount - 1) {
          this.particles[this.particleIndex] = this.particles[
            this.particleCount - 1
          ];
          //clear memory
          this.particles.length--;
        }
        this.particleCount--;
      }
    }
  };

  this.stop = function () {
    this.active = false;
    this.elapsedTime = 0;
    this.emitCounter = 0;
  };

  this.render = function (context) {
    for (let i = 0, j = this.particleCount; i < j; i++) {
      const particle = this.particles[i];
      const size = particle.size;
      const halfSize = size >> 1;
      const x = ~~particle.position.x;
      const y = ~~particle.position.y;

      const radgrad = context.createRadialGradient(
        x + halfSize,
        y + halfSize,
        particle.sizeSmall,
        x + halfSize,
        y + halfSize,
        halfSize
      );
      // TODO Add Colour control here
      radgrad.addColorStop(0, particle.drawColour);
      radgrad.addColorStop(1, particle.drawColourTransparent); //Super cool if you change these values (and add more colour stops)
      context.fillStyle = radgrad;
      context.fillRect(x, y, size, size);
    }
  };
}
