let sheets = {};          // словник з різними анімаціями
let currentAnim = "idle"; // поточна анімація
let frameIndex = 0;
let animFps = 6;          // FPS для idle
let facing = 1;
let scaleK = 3;
let x, y, speed = 160;

let flipBtn, scaleSlider;
let btnIdle, btnWalk, btnRun;

const FW = 32, FH = 32;
const FRAMES = 6;

function setup() {
  createCanvas(720, 420);
  textFont('Verdana'); textSize(14);

  // Генеруємо три спрайтшити: idle, walk, run, jump
  sheets.idle = makeSheet(color(100, 180, 255), FRAMES, "idle");
  sheets.walk = makeSheet(color(60, 220, 120), FRAMES, "walk");
  sheets.run  = makeSheet(color(255, 120, 80), FRAMES, "run");
  sheets.jump = makeSheet(color(200, 200, 60), FRAMES, "jump");

  x = width/2; y = height/2;

  flipBtn = createButton('Flip (F)');
  flipBtn.position(10, 10);
  flipBtn.mousePressed(() => facing *= -1);

  scaleSlider = createSlider(1, 5, 3, 0.5);
  scaleSlider.position(100, 10);

  btnIdle = createButton('1 - Idle');
  btnIdle.position(10, 40);
  btnIdle.mousePressed(() => setAnim("idle", 6));

  btnWalk = createButton('2 - Walk');
  btnWalk.position(100, 40);
  btnWalk.mousePressed(() => setAnim("walk", 11));

  btnRun = createButton('3 - Run');
  btnRun.position(200, 40);
  btnRun.mousePressed(() => setAnim("run", 15));
}

function makeSheet(baseColor, frames, type) {
  let g = createGraphics(frames * FW, FH);
  g.noStroke();
  for (let f = 0; f < frames; f++) {
    g.push();
    g.translate(f*FW, 0);
    g.fill(red(baseColor), green(baseColor) - f*10, blue(baseColor) - f*5);
    g.rect(0, 0, FW, FH, 6);

    // руки/ноги різні для типів
    g.push();
    g.translate(FW/2, FH/2);
    g.stroke(255); g.strokeWeight(3);
    let arm = sin(f * TWO_PI / frames) * (type==="run"?12:type==="walk"?8:4);
    g.line(-8, 0, -8, arm);
    g.line(8, 0, 8, -arm);
    g.pop();

    // очі
    g.noStroke(); g.fill(0);
    g.circle(FW/2 - 6, FH/2 - 6, 4);
    g.circle(FW/2 + 6, FH/2 - 6, 4);

    g.pop();
  }
  return g;
}

function setAnim(name, fps) {
  currentAnim = name;
  animFps = fps;
  frameIndex = 0;
}

function draw() {
  background(240);

  // Оновлення кадру
  if (frameCount % int(60 / animFps) === 0) {
    frameIndex = (frameIndex + 1) % FRAMES;
  }

  // Рух
  const dt = deltaTime / 1000;
  let dx = 0, dy = 0;
  if (keyIsDown(LEFT_ARROW))  { dx -= 1; facing = -1; }
  if (keyIsDown(RIGHT_ARROW)) { dx += 1; facing =  1; }
  if (keyIsDown(UP_ARROW))    { dy -= 1; }
  if (keyIsDown(DOWN_ARROW))  { dy += 1; }

  if (dx || dy) {
    const l = Math.hypot(dx, dy); dx /= l || 1; dy /= l || 1;
    x += dx * speed * dt; y += dy * speed * dt;
  }
  x = constrain(x, 0, width); y = constrain(y, 0, height);

  scaleK = scaleSlider.value();

  // Малюємо кадр
  const sx = frameIndex * FW, sy = 0;
  const sw = FW, sh = FH;
  const dw = FW * scaleK, dh = FH * scaleK;

  push();
  translate(x, y);
  scale(facing, 1);
  image(sheets[currentAnim], -dw/2, -dh/2, dw, dh, sx, sy, sw, sh);
  pop();

  // Hitbox
  const hitR = 10 * scaleK;
  noFill(); stroke(200, 0, 0); circle(x, y, hitR*2);

  noStroke(); fill(20);
  text(`Anim: ${currentAnim} | Frame: ${frameIndex+1}/${FRAMES} | FPS: ${animFps}`, 10, height-24);
}

function keyPressed() {
  if (key === 'f' || key === 'F') facing *= -1;
  if (key === '1') setAnim("idle", 6);
  if (key === '2') setAnim("walk", 11);
  if (key === '3') setAnim("run", 15);
  if (key === ' ') setAnim("jump", 12); // пробіл = стрибок
}