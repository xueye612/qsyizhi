function createFloatingPoints(count) {
  const layer = document.querySelector('.float-points');
  if (!layer) return;
  layer.innerHTML = '';
  for (let i = 0; i < count; i += 1) {
    const dot = document.createElement('i');
    dot.style.left = `${Math.random() * 100}%`;
    dot.style.animationDuration = `${6 + Math.random() * 10}s`;
    dot.style.animationDelay = `${Math.random() * 8}s`;
    dot.style.opacity = `${0.3 + Math.random() * 0.6}`;
    layer.appendChild(dot);
  }
}

function drawLineChart(canvasId, values, labels, lineColor) {
  const canvas = document.getElementById(canvasId);
  if (!canvas || !canvas.getContext) return;

  const dpr = window.devicePixelRatio || 1;
  const width = canvas.clientWidth;
  const height = canvas.clientHeight;
  canvas.width = width * dpr;
  canvas.height = height * dpr;

  const ctx = canvas.getContext('2d');
  ctx.scale(dpr, dpr);
  ctx.clearRect(0, 0, width, height);

  const padding = { top: 18, right: 14, bottom: 26, left: 34 };
  const chartW = width - padding.left - padding.right;
  const chartH = height - padding.top - padding.bottom;
  const max = Math.max(...values) * 1.1;
  const min = Math.min(...values) * 0.88;

  ctx.strokeStyle = 'rgba(184, 223, 246, 0.2)';
  ctx.lineWidth = 1;
  for (let i = 0; i < 4; i += 1) {
    const y = padding.top + (chartH / 3) * i;
    ctx.beginPath();
    ctx.moveTo(padding.left, y);
    ctx.lineTo(width - padding.right, y);
    ctx.stroke();
  }

  ctx.font = '12px Segoe UI';
  ctx.fillStyle = '#8bb5cc';

  values.forEach((v, i) => {
    const x = padding.left + (chartW / (values.length - 1)) * i;
    const y = padding.top + ((max - v) / (max - min)) * chartH;

    if (i === 0) {
      ctx.beginPath();
      ctx.moveTo(x, y);
    } else {
      ctx.lineTo(x, y);
    }

    ctx.fillText(labels[i], x - 10, height - 8);
  });

  const gradient = ctx.createLinearGradient(0, 0, width, 0);
  gradient.addColorStop(0, lineColor || '#12d8ff');
  gradient.addColorStop(1, '#31ffb6');

  ctx.strokeStyle = gradient;
  ctx.lineWidth = 3;
  ctx.stroke();

  values.forEach((v, i) => {
    const x = padding.left + (chartW / (values.length - 1)) * i;
    const y = padding.top + ((max - v) / (max - min)) * chartH;
    ctx.beginPath();
    ctx.arc(x, y, 3.5, 0, Math.PI * 2);
    ctx.fillStyle = '#e9ffff';
    ctx.fill();

    ctx.fillStyle = '#d8f4ff';
    ctx.fillText(String(v), x - 9, y - 10);
  });
}

function drawBars(canvasId, values, labels) {
  const canvas = document.getElementById(canvasId);
  if (!canvas || !canvas.getContext) return;

  const dpr = window.devicePixelRatio || 1;
  const width = canvas.clientWidth;
  const height = canvas.clientHeight;
  canvas.width = width * dpr;
  canvas.height = height * dpr;

  const ctx = canvas.getContext('2d');
  ctx.scale(dpr, dpr);
  ctx.clearRect(0, 0, width, height);

  const max = Math.max(...values) * 1.15;
  const baseY = height - 30;
  const left = 28;
  const usableW = width - 40;
  const gap = usableW / values.length;

  values.forEach((v, i) => {
    const barH = (v / max) * (height - 60);
    const x = left + i * gap;
    const y = baseY - barH;

    const grd = ctx.createLinearGradient(0, y, 0, baseY);
    grd.addColorStop(0, '#31ffb6');
    grd.addColorStop(1, '#12d8ff');

    ctx.fillStyle = grd;
    ctx.fillRect(x, y, gap * 0.55, barH);

    ctx.fillStyle = '#aad5ea';
    ctx.font = '12px Segoe UI';
    ctx.fillText(labels[i], x, height - 10);
    ctx.fillStyle = '#e2f8ff';
    ctx.fillText(String(v), x + 2, y - 6);
  });
}
