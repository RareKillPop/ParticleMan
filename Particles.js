/*
READ ME!!
Angles should be in radians ALWAYS
All vector stuff should be arrays with 2 elements
Feel free to look around and be dazzled by my delicious spaghetti code.
Imgs should be image OBJECTS, not sources btw
*/
let oldtime = performance.now();
let accumulator = 0;




function Flarp(a, b, c) {
  return Math.max(0, Math.min(255, Math.floor(a + c * (b - a))));
}
function larp(a, b, c) {
  return (a + c * (b - a))
}
function addVector(a, b) {
  return [a[0] + b[0], a[1] + b[1]]
}
function ColorInterpolate(color1, color2, progress) {
  //make hex into 3 numbers
  let r1 = parseInt(color1.substring(1, 3), 16)
  let g1 = parseInt(color1.substring(3, 5), 16)
  let b1 = parseInt(color1.substring(5, 7), 16)
  let r2 = parseInt(color2.substring(1, 3), 16)
  let g2 = parseInt(color2.substring(3, 5), 16)
  let b2 = parseInt(color2.substring(5, 7), 16)
  return "#" + Flarp(r1, r2, progress).toString(16).padStart(2, '0') + Flarp(g1, g2, progress).toString(16).padStart(2, '0') + Flarp(b1, b2, progress).toString(16).padStart(2, '0')
}
export class ParticleEngine {
  constructor(canvas, settings) {
    this.Mousex = 0;
    this.Mousey = 0;
    canvas.addEventListener('mousemove', (event) => {
      const rect = canvas.getBoundingClientRect();


      const relativeX = event.clientX - rect.left;
      const relativeY = event.clientY - rect.top;


      this.Mousex = relativeX * (canvas.width / rect.width);
      this.Mousey = relativeY * (canvas.height / rect.height);
    });
    this.fps = settings.fps
    this.canvas = canvas;
    this.pen = this.canvas.getContext('2d');
    this.ParticleArray = []
    this.ParticleEmitters = []
    this.resizeCanvas()
    window.addEventListener('resize', () => this.resizeCanvas());
  }
  resizeCanvas() {
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
  }
  updateParticles() {
    for (var i = this.ParticleArray.length - 1; i >= 0; i--) {
      var part = this.ParticleArray[i]
      if (part.update(i) == "destroyed") {
        continue;
      }
    }
  }
  renderParticles() {
    this.pen.clearRect(0, 0, this.canvas.width, this.canvas.height)
    for (var i = this.ParticleArray.length - 1; i >= 0; i--) {
      var part = this.ParticleArray[i]
      this.pen.save()
      //complex stuff :(
      this.pen.translate(part.pos[0], part.pos[1])
      this.pen.rotate(part.angle)
      this.pen.globalAlpha = part.opacity
      if (part.Img === "none") {
        this.pen.fillStyle = part.color;
        this.pen.fillRect(-(part.size[0] / 2), -(part.size[1] / 2), part.size[0], part.size[1])
      } else {
        this.pen.drawImage(part.Img, -(part.size[0] / 2), -(part.size[1] / 2), part.size[0], part.size[1])
      }
      //end of complex stuff :)
      this.pen.restore()
    }
  }
  addEmitter(config) {
    return new ParticleEmitter(config, this)
  }
  Start() {

    const loop = (timestamp) => {

      let dt = timestamp - oldtime;
      oldtime = timestamp
      accumulator += dt;

      while (accumulator >= 1000 / this.fps) {
        accumulator -= 1000 / this.fps;


        this.ParticleEmitters.forEach(part => {
          part.PreTick()
        })
        this.updateParticles();

      }
      this.renderParticles();
      requestAnimationFrame(loop);
    }
    requestAnimationFrame(loop)
  }
  AddParticle(config) {
    return new SingleParticle(config, this)
  }
}
class SingleParticle {
  constructor(Stats, Engine) {
    this.pos = [...Stats.pos];
    this.vel = [...Stats.momentum];
    this.Avel = Stats.angleMomentum;
    this.angle = Stats.StartAngle;
    this.accel = [...Stats.accel];
    this.lifetime = Stats.lifetime;
    this.timeleft = Stats.lifetime;
    this.Img = Stats.image;
    this.opacity = Stats.StartOpacity;
    this.StartO = Stats.StartOpacity;
    this.EndO = Stats.EndOpacity;
    this.size = [...Stats.StartSize];
    this.StartSize = [...Stats.StartSize];
    this.EndSize = [...Stats.EndSize];
    this.color = Stats.StartCol;
    this.StartColor = Stats.StartCol;
    this.EndColor = Stats.EndCol;
    this.engine = Engine;
    this.engine.ParticleArray.push(this);
  }
  update(index) {
    this.timeleft -= 1;
    if (this.timeleft <= 0) {
      this.destroy(index)
      return "destroyed";
    }
    this.pos = addVector(this.pos, this.vel);
    this.angle = this.angle + this.Avel;
    this.vel = addVector(this.accel, this.vel);
    this.opacity = this.StartO + (1 - this.timeleft / this.lifetime) * (this.EndO - this.StartO)
    this.color = ColorInterpolate(this.StartColor, this.EndColor, 1 - this.timeleft / this.lifetime)
    this.size = [larp(this.StartSize[0], this.EndSize[0], 1 - this.timeleft / this.lifetime), larp(this.StartSize[1], this.EndSize[1], 1 - this.timeleft / this.lifetime)]
  }
  destroy(index) {
    this.engine.ParticleArray.splice(index, 1);
  }
}
class ParticleEmitter {
  constructor(config, engine) {
    this.MinParticle = config.MinParticle;
    if (!config.MaxParticle) {
      this.MaxParticle = config.MinParticle;
    } else { this.MaxParticle = config.MaxParticle; }
    //no random images, that would be silly
    this.CurrentParticle = config.MinParticle;
    this.rate = config.rate;
    this.looper = 0;
    this.engine = engine
    this.engine.ParticleEmitters.push(this);
  }
  Tick() {
    let SafetyDance = {
      pos: [larp(this.MinParticle.pos[0], this.MaxParticle.pos[0], Math.random()), larp(this.MinParticle.pos[1], this.MaxParticle.pos[1], Math.random())], //x,y
      momentum: [larp(this.MinParticle.momentum[0], this.MaxParticle.momentum[0], Math.random()), larp(this.MinParticle.momentum[1], this.MaxParticle.momentum[1], Math.random())], //momentum
      angleMomentum: larp(this.MinParticle.angleMomentum, this.MaxParticle.angleMomentum, Math.random()), //angular velocity
      accel: [larp(this.MinParticle.accel[0], this.MaxParticle.accel[0], Math.random()), larp(this.MinParticle.accel[1], this.MaxParticle.accel[1], Math.random())], //acceleration
      lifetime: larp(this.MinParticle.lifetime, this.MaxParticle.lifetime, Math.random()), //life time
      image: this.MinParticle.image, //image (optional)
      StartOpacity: larp(this.MinParticle.StartOpacity, this.MaxParticle.StartOpacity, Math.random()), //starting opacity
      EndOpacity: larp(this.MinParticle.EndOpacity, this.MaxParticle.EndOpacity, Math.random()), //ending opacity
      StartAngle: larp(this.MinParticle.StartAngle, this.MaxParticle.StartAngle, Math.random()), //starting angle
      StartSize: [larp(this.MinParticle.StartSize[0], this.MaxParticle.StartSize[0], Math.random()), larp(this.MinParticle.StartSize[1], this.MaxParticle.StartSize[1], Math.random())], //starting size
      EndSize: [larp(this.MinParticle.EndSize[0], this.MaxParticle.EndSize[0], Math.random()), larp(this.MinParticle.EndSize[1], this.MaxParticle.EndSize[1], Math.random())], //starting size
      StartCol: ColorInterpolate(this.MinParticle.StartCol, this.MaxParticle.StartCol, Math.random()), //starting color
      EndCol: ColorInterpolate(this.MinParticle.EndCol, this.MaxParticle.EndCol, Math.random()),
    };
    this.engine.AddParticle(SafetyDance)
  }
  PreTick() {
    this.looper += 1;
    if (this.looper >= this.rate) {
      this.looper = 0;
      this.Tick()
    }
  }
  Edit(Min, Max, OnlyPosition) {
    if (OnlyPosition) {
      this.MinParticle.pos = Min;
      this.MaxParticle.pos = Max;
    } else {
      this.MaxParticle = Max;
      this.MinParticle = Min;
    }
  }
  destroy() {
    if (this.engine.ParticleEmitters.indexOf(this) !== -1) {
      this.engine.ParticleEmitters.splice(this.engine.ParticleEmitters.indexOf(this), 1);
    }
  }
}
