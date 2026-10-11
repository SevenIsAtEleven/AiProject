const canvas = document.getElementById('c');
const ctx = canvas.getContext('2d');
const $ = id => document.getElementById(id);

let strokes = [];      // finished strokes: {tool, color, size, pts:[{x,y}]}
let current = null;    // stroke being drawn
let tool = 'pen';

// --- Sizing (sharp on high-DPI screens, redraws on resize) ---
function resize() {
    const r = canvas.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    canvas.width = Math.round(r.width * dpr);
    canvas.height = Math.round(r.height * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    redraw();
}
window.addEventListener('resize', resize);

// --- Drawing ---
function drawStroke(s) {
    const pts = s.pts;
    if (!pts.length) return;
    ctx.save();
    ctx.lineCap = ctx.lineJoin = 'round';
    ctx.strokeStyle = s.tool === 'eraser' ? '#fff' : s.color;
    ctx.fillStyle = ctx.strokeStyle;
    ctx.lineWidth = s.size;
    if (pts.length === 1) {
        ctx.beginPath();
        ctx.arc(pts[0].x, pts[0].y, s.size / 2, 0, Math.PI * 2);
        ctx.fill();
    } else {
        ctx.beginPath();
        ctx.moveTo(pts[0].x, pts[0].y);
        for (let i = 1; i < pts.length - 1; i++) {
            const mx = (pts[i].x + pts[i + 1].x) / 2;
            const my = (pts[i].y + pts[i + 1].y) / 2;
            ctx.quadraticCurveTo(pts[i].x, pts[i].y, mx, my);
        }
        const last = pts[pts.length - 1];
        ctx.lineTo(last.x, last.y);
        ctx.stroke();
    }
    ctx.restore();
}

function redraw() {
    const r = canvas.getBoundingClientRect();
    ctx.fillStyle = '#fff';
    ctx.fillRect(0, 0, r.width, r.height);
    strokes.forEach(drawStroke);
    if (current) drawStroke(current);
}

// --- Pointer input (mouse, touch, and pen) ---
function pos(e) {
    const r = canvas.getBoundingClientRect();
    return { x: e.clientX - r.left, y: e.clientY - r.top };
}

canvas.addEventListener('pointerdown', e => {
    canvas.setPointerCapture(e.pointerId);
    current = { tool, color: "#1d2421", size: 4, pts: [pos(e)] };
    redraw();
});

canvas.addEventListener('pointermove', e => {
    if (!current) return;
    const events = e.getCoalescedEvents ? e.getCoalescedEvents() : [e];
    (events.length ? events : [e]).forEach(ev => current.pts.push(pos(ev)));
    redraw();
});

function endStroke() {
    if (!current) return;
    strokes.push(current);
    current = null;
    redraw();
}
canvas.addEventListener('pointerup', endStroke);
canvas.addEventListener('pointercancel', endStroke);

// --- Toolbar ---
function setTool(t) {
    tool = t;
    $('pen').classList.toggle('active', t === 'pen');
    $('eraser').classList.toggle('active', t === 'eraser');
}
$('pen').onclick = () => setTool('pen');
$('eraser').onclick = () => setTool('eraser');
//$('size').oninput = e => $('sizeOut').textContent = e.target.value;
$('clear').onclick = () => { strokes = []; redraw(); };

// --- Export (white background baked in) ---
$('save').onclick = () => {
    const out = document.createElement('canvas');
    out.width = canvas.width; out.height = canvas.height;
    const octx = out.getContext('2d');
    octx.fillStyle = '#fff';
    octx.fillRect(0, 0, out.width, out.height);
    octx.drawImage(canvas, 0, 0);
    out.toBlob(blob => {
        const a = document.createElement('a');
        a.href = URL.createObjectURL(blob);
        a.download = 'sketch.png';
        a.click();
        URL.revokeObjectURL(a.href);
    }, 'image/png');
};
resize()