// ===== CANVAS =====
const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

canvas.width = 300;
canvas.height = 300;

// ===== PLAYER =====
let player = {
  x: 110,
  y: 135,
  size: 80
};

// ===== IMAGE =====
const princess_idle = new Image();
princess_idle.src = "princess_idle.png";

const princess_left = new Image();
princess_left.src = "princess_left.png";

const princess_right = new Image();
princess_right.src = "princess_right.png";

const princess_up = new Image();
princess_up.src = "princess_up.png";

const prince = new Image();
prince.src = "prince.png";

const castle = new Image();
castle.src = "castle.png";

const inside = new Image();
inside.src = "inside.png";

const throne = new Image();
throne.src = "throne.png";

const garden = new Image();
garden.src = "garden.png";

// 🎵 ===== BACKGROUND MUSIC =====
const bgm = new Audio("https://raw.githubusercontent.com/alfianryuma17-dev/lagu-rafita/main/andriig-happy-birthday-471211.mp3");

bgm.loop = true;
bgm.volume = 0.4;

let bgmStarted = false;

// ===== STATE =====
let scene = "outside";
let facing = "idle";
let showInteract = false;
let sceneVideo = false;
function playVideo() {
  const video = document.getElementById("endingVideo");

  if (!videoStarted) {
    video.style.display = "block";
    canvas.style.display = "none";

    video.play().catch(() => {
      console.log("Video gagal play");
    });

    videoStarted = true;
  }
}

// ===== PROLOG =====
let showProlog = true;
let prologTimer = 0;
let prologDuration = 7000;

// ===== EFFECT =====
let fadeAlpha = 0;
let isFading = false;

// ===== DIALOG =====
let showDialog = false;
let dialogPlayed = false;
let gardenDialogPlayed = false;
let speaker = "servant";

let fullText = "";
let currentText = "";
let textIndex = 0;

let dialogAlpha = 0;
let dialogTimer = 0;
let dialogDuration = 15000;

let typingSpeed = 40;
let lastTypingTime = 0;

// ===== LOVE =====
let hearts = [];

// ===== AREA =====
const servantArea = { x: 100, y: 120, width: 100, height: 100 };
const giftArea = { x: 110, y: 80, width: 80, height: 80 };
const princePos = { x: 160, y: 100 };

let pulling = false;

// ===== INPUT =====
window.addEventListener("keydown", (e) => move(e.key));

// 🎵 ===== PLAY MUSIC SAAT USER INTERAKSI =====
window.addEventListener("click", () => {
  if (!bgmStarted) {
    bgm.play();
    bgmStarted = true;
  }
}, { once: true });

// ===== MOVE =====
function move(key) {

  // 🎬 VIDEO
  if (key === "e" || key === "E") {
    if (gardenDialogPlayed && !showDialog) {
      scene = "video";
      return;
    }
  }

  if (showProlog) return;

  const speed = 10;

  // ⬆️ ATAS
  if (key === "ArrowUp" || key === "up") {
    player.y -= speed;
    facing = "up";
  }

  // ⬇️ BAWAH
  if (key === "ArrowDown" || key === "down") {
    player.y += speed;
    facing = "idle";
  }

  // ⬅️ KIRI
  if (key === "ArrowLeft" || key === "left") {
    player.x -= speed;
    facing = "left";
  }

  // ➡️ KANAN
  if (key === "ArrowRight" || key === "right") {
    player.x += speed;
    facing = "right";
  }

  if (scene === "outside" && player.y <= 120 && !isFading) {
    isFading = true;
  }

  if (scene === "inside") {
    checkServant();
    if (player.y <= 40 && !isFading) isFading = true;
  }

  if (
    scene === "throne" &&
    player.x < giftArea.x + giftArea.width &&
    player.y < giftArea.y + giftArea.height
  ) {
    pulling = true;
  }

  draw();
}

// ===== PLAYER =====
function drawPlayer() {
  let img = princess_idle;

  if (facing === "left") img = princess_left;
  if (facing === "right") img = princess_right;
  if (facing === "up") img = princess_up;

  ctx.drawImage(img, player.x, player.y, player.size, player.size);
}

// ===== LOVE =====
function createHeart(x, y) {
  hearts.push({
    x,
    y,
    size: Math.random() * 6 + 6,
    speedY: Math.random() * 0.5 + 0.3,
    alpha: 1,
    drift: Math.random() * 1 - 0.5
  });
}

function drawHeart(x, y, size) {
  ctx.beginPath();
  let top = size * 0.3;

  ctx.moveTo(x, y + top);
  ctx.bezierCurveTo(x, y, x - size / 2, y, x - size / 2, y + top);
  ctx.bezierCurveTo(x - size / 2, y + size, x, y + size, x, y + size * 1.3);
  ctx.bezierCurveTo(x, y + size, x + size / 2, y + size, x + size / 2, y + top);
  ctx.bezierCurveTo(x + size / 2, y, x, y, x, y + top);

  ctx.fill();
}

function drawHearts() {
  for (let i = hearts.length - 1; i >= 0; i--) {
    let h = hearts[i];

    h.y -= h.speedY;
    h.x += h.drift;
    h.alpha -= 0.01;

    ctx.globalAlpha = h.alpha;
    ctx.fillStyle = "#ff6b9d";

    drawHeart(h.x, h.y, h.size);

    if (h.alpha <= 0) hearts.splice(i, 1);
  }

  ctx.globalAlpha = 1;
}

// ===== DIALOG =====
function drawDialog() {
  ctx.globalAlpha = dialogAlpha;

  const x = 30;
  const y = 200;
  const width = 240;
  const padding = 12;
  const lineHeight = 16;

  ctx.font = "12px Arial";
  ctx.textAlign = "left"; // 🔥 penting

  let words = currentText.split(" ");
  let lines = [];
  let line = "";

  // ===== WRAP TEXT FIX =====
  for (let i = 0; i < words.length; i++) {
    let testLine = line + words[i] + " ";
    let testWidth = ctx.measureText(testLine).width;

    if (testWidth > (width - padding * 2)) {
      lines.push(line);
      line = words[i] + " ";
    } else {
      line = testLine;
    }
  }
  lines.push(line);

  // ===== HEIGHT =====
  let boxHeight = (lines.length * lineHeight) + padding * 2 + 10;

  // ===== WARNA =====
  let bgColor = "rgba(255,240,245,0.95)";
  let borderColor = "#ff4d88";
  let name = "Pelayan";

  if (speaker === "prince") {
    bgColor = "rgba(220,235,255,0.95)";
    borderColor = "#4a90e2";
    name = "Pangeran";
  }

  // ===== BOX =====
  ctx.fillStyle = bgColor;
  ctx.beginPath();
  ctx.roundRect(x, y, width, boxHeight, 12);
  ctx.fill();

  ctx.strokeStyle = borderColor;
  ctx.stroke();

  // ===== NAMA =====
  ctx.fillStyle = borderColor;
  ctx.font = "bold 12px Arial";
  ctx.fillText(name, x + padding, y + 16);

  // ===== TEXT =====
  ctx.fillStyle = "#333";
  ctx.font = "12px Arial";

  for (let i = 0; i < lines.length; i++) {
    ctx.fillText(
      lines[i].trim(),
      x + padding,
      y + 30 + i * lineHeight
    );
  }

  ctx.globalAlpha = 1;
}

function resetDialog() {
  currentText = "";
  textIndex = 0;
  dialogTimer = 0;
  dialogAlpha = 0;
}

// ===== PROLOG =====
function drawProlog() {
  ctx.textAlign = "center";

  // ===== BACKGROUND BOX =====
  ctx.fillStyle = "rgba(255, 245, 250, 0.75)";
  ctx.beginPath();
  ctx.roundRect(40, 12, 220, 55, 18);
  ctx.fill();

  // border tipis elegan
  ctx.strokeStyle = "rgba(212,175,55,0.8)";
  ctx.lineWidth = 2;
  ctx.stroke();

  // ===== GARIS DEKOR =====
  ctx.strokeStyle = "rgba(212,175,55,0.6)";
  ctx.lineWidth = 1.5;

  ctx.beginPath();
  ctx.moveTo(60, 40);
  ctx.lineTo(100, 40);
  ctx.stroke();

  ctx.beginPath();
  ctx.moveTo(200, 40);
  ctx.lineTo(240, 40);
  ctx.stroke();

  // ===== TEKS TANGGAL (ELEGAN) =====
  const text = "26 April 2026";
  let startX = 150 - (text.length * 5);

  ctx.font = "16px serif";

  // shadow lembut
  ctx.fillStyle = "rgba(0,0,0,0.25)";
  for (let i = 0; i < text.length; i++) {
    ctx.fillText(text[i], startX + i * 10 + 1, 44);
  }

// shadow lembut
ctx.fillStyle = "rgba(0,0,0,0.25)";
for (let i = 0; i < text.length; i++) {
  ctx.fillText(text[i], startX + i * 10 + 1, 44);
}

// text utama (hitam elegan)
ctx.fillStyle = "#222"; // bukan hitam pekat biar lebih soft
for (let i = 0; i < text.length; i++) {
  ctx.fillText(text[i], startX + i * 10, 43);
}

  // ===== BOX INSTRUKSI =====
  ctx.fillStyle = "rgba(255,240,245,0.9)";
  ctx.beginPath();
  ctx.roundRect(60, 220, 180, 45, 12);
  ctx.fill();

  ctx.strokeStyle = "#ff69b4";
  ctx.lineWidth = 1.5;
  ctx.stroke();

  // ===== TEKS INSTRUKSI =====
  ctx.fillStyle = "#444";
  ctx.font = "10px Arial";

  ctx.fillText("Gunakan tombol atau keyboard", 150, 238);
  ctx.fillText("Cobalah berjalan...", 150, 252);
}

// ===== SCENE =====
function drawOutside() {
  ctx.fillStyle = "#fff7f9";
  ctx.fillRect(0, 0, 300, 300);

  ctx.drawImage(castle, 40, 0, 220, 240);

  drawPlayer();

  if (showProlog) drawProlog();
}

function drawInside() {
  ctx.drawImage(inside, 20, 10, 260, 280);
  drawPlayer();
  if (showDialog) drawDialog();
}

function drawThrone() {
  ctx.drawImage(throne, 0, 0, 300, 300);
  drawPlayer();
}

function drawGarden() {
  ctx.drawImage(garden, 0, 0, 300, 300);

  ctx.drawImage(prince, princePos.x, princePos.y, 80, 120);

  drawPlayer();
  drawHearts();
  drawInteract();

  if (showDialog) drawDialog();
}

// ===== DETEKSI =====
function checkServant() {
  // 👉 hanya aktif di inside
  if (dialogPlayed || scene !== "inside") return;

  if (
    player.x < servantArea.x + servantArea.width &&
    player.y < servantArea.y + servantArea.height
  ) {
    showDialog = true;
    dialogPlayed = true;
    speaker = "servant";

    fullText = "Selamat datang, Putri Rafita 👑 Kami sudah menunggumu hari ini adalah hari spesial untukmu 💖";
    resetDialog();
  }
}

// ===== UPDATE =====
function update() {

  if (showProlog) {
    prologTimer += 16;
    if (prologTimer > prologDuration) showProlog = false;
  }

  let now = Date.now();

  if (showDialog && textIndex < fullText.length) {
    if (now - lastTypingTime > typingSpeed) {
      currentText += fullText[textIndex];
      textIndex++;
      lastTypingTime = now;
    }
  }

  if (showDialog && dialogAlpha < 1) dialogAlpha += 0.03;

  if (showDialog) {
    dialogTimer += 16;
    if (dialogTimer > dialogDuration) showDialog = false;
  }

 // ===== PRINCE =====
if (scene === "garden") {
  if (
    player.x < princePos.x + 80 &&
    player.x + player.size > princePos.x &&
    player.y < princePos.y + 120 &&
    player.y + player.size > princePos.y
  ) {

    if (Math.random() < 0.03) {
      createHeart(player.x + 40, player.y);
    }

    if (!gardenDialogPlayed && !showDialog) {
      showDialog = true;
      gardenDialogPlayed = true;
      speaker = "prince";

      fullText = "Akhirnya aku bertemu denganmu...\nSelamat ulang tahun, Rafita 💖";
      resetDialog();
    }
  }
}
  if (pulling) {
    player.x += (150 - player.x) * 0.05;
    player.y += (100 - player.y) * 0.05;

    if (Math.abs(player.x - 150) < 2) {
      pulling = false;
      isFading = true;
    }
  }

  if (isFading) {
    fadeAlpha += 0.05;

    if (fadeAlpha >= 1) {
      if (scene === "outside") {
        scene = "inside";
        player.x = 110;
        player.y = 200;
      } else if (scene === "inside") {
        scene = "throne";
        player.x = 40;
        player.y = 220;
      } else if (scene === "throne") {
        scene = "garden";
        player.x = 60;
        player.y = 180;
      }

      fadeAlpha = 0;
      isFading = false;
    }
  }

  draw();
  requestAnimationFrame(update);
}

function drawInteract() {

  // hanya muncul setelah dialog pangeran selesai
  if (!gardenDialogPlayed || showDialog) return;

  ctx.fillStyle = "rgba(0,0,0,0.6)";
  ctx.beginPath();
  ctx.roundRect(90, 50, 120, 30, 10);
  ctx.fill();

  ctx.fillStyle = "#fff";
  ctx.font = "12px Arial";
  ctx.textAlign = "center";
  ctx.fillText("Tekan E 💖", 150, 70);
}

// ===== DRAW =====
function draw() {

if (scene === "video") {
  const video = document.getElementById("endingVideo");

  // 🎵 STOP BGM
  bgm.pause();

  video.style.display = "block";
  canvas.style.display = "none";

  video.play().catch(() => {});
  return;
}

  ctx.clearRect(0, 0, 300, 300);

  if (scene === "outside") drawOutside();
  if (scene === "inside") drawInside();
  if (scene === "throne") drawThrone();
  if (scene === "garden") drawGarden();

  if (isFading) {
    ctx.fillStyle = `rgba(0,0,0,${fadeAlpha})`;
    ctx.fillRect(0, 0, 300, 300);
  }
}

// ===== START =====
update();
