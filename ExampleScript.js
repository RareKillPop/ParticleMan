import {ParticleEngine} from "./Particles.js"
const fx = new ParticleEngine(document.getElementById('particle'), { fps: 60 })
var mouseEmit = fx.addEmitter(
  {
    MinParticle: {
      pos: [250, 250],
      momentum: [0.2, -0.7],
      angleMomentum: 0.01,
      accel: [0, 0],
      lifetime: 80,
      image: "none",
      StartOpacity: 0.6,
      EndOpacity: 0.5,
      StartSize: [5, 5],
      EndSize: [2, 2],
      StartCol: "#004bfa",
      EndCol: "#fa00e1",
    },
    MaxParticle: {
      pos: [400, 350],
      momentum: [-0.2, -0.6],
      angleMomentum: 0.01,
      accel: [0, 0],
      lifetime: 120,
      image: "none",
      StartOpacity: 1,
      EndOpacity: 0,
      StartSize: [7, 7],
      EndSize: [0, 0],
      StartCol: "#4f00fa",
      EndCol: "#d000fa",
    },
    rate: 4,
  }
)
fx.Start();
