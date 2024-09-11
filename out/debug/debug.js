'use strict';
import { Mulberry32 } from '../../node_modules/natlib/prng/Mulberry32.js';
import { randomUint32LessThan } from '../../node_modules/natlib/prng/prng.js';

import { Particle } from '../verlet/Particle.js';
import { ParticleBody } from '../verlet/ParticleBody.js';
import { scene } from '../prelude.js';
export let collection;
export const createParticles = () => {
    scene.vertices = []
    scene.constraints = []
    scene.bodies = []

    const prng = new Mulberry32(9);
    collection = new ParticleBody(scene);
    // for (let n = 0; n < 13; ++n) {
    //     const x = randomUint32LessThan(prng, 960 /* Settings.screenWidth */);
    //     const y = randomUint32LessThan(prng, 540 /* Settings.screenHeight */);
    //     new Particle(collection, x, y, 22, 1, 1);
    // }

    const x0 = 0.5 * 960 - 2
    const y0 = 0.5 * 540 + 50
    const jitter = () => randomUint32LessThan(prng, 5) - 2
    let n = 0

    new Particle(collection, x0 + jitter() - 44, y0 + 0.94 * (jitter() - 88), 22, 1, 1).index = n++
    new Particle(collection, x0 + jitter() - 44, y0 + 0.94 * (jitter() - 44), 22, 1, 1).index = n++
    new Particle(collection, x0 + jitter() - 44, y0 + 0.94 * jitter(), 22, 1, 1).index = n++
    new Particle(collection, x0 + jitter() - 44, y0 + 0.94 * (jitter() + 44), 22, 1, 1).index = n++
    new Particle(collection, x0 + jitter() - 44, y0 + 0.94 * (jitter() + 88), 22, 1, 1).index = n++
    new Particle(collection, x0 + jitter() - 80, y0 + 0.94 * (jitter() - 70), 22, 1, 1).index = n++

    new Particle(collection, x0 + jitter() + 44, y0 + 0.94 * (jitter() - 88), 22, 1, 1).index = n++
    new Particle(collection, x0 + jitter() + 77, y0 + 0.94 * (jitter() - 66), 22, 1, 1).index = n++
    new Particle(collection, x0 + jitter() + 77, y0 + 0.94 * (jitter() - 22), 22, 1, 1).index = n++
    new Particle(collection, x0 + jitter() + 44, y0 + 0.94 * jitter(), 22, 1, 1).index = n++
    new Particle(collection, x0 + jitter() + 77, y0 + 0.94 * (jitter() + 22), 22, 1, 1).index = n++
    new Particle(collection, x0 + jitter() + 77, y0 + 0.94 * (jitter() + 66), 22, 1, 1).index = n++
    new Particle(collection, x0 + jitter() + 44, y0 + 0.94 * (jitter() + 88), 22, 1, 1).index = n++
}
