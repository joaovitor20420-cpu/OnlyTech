/* ══════════════════════════════════════════════════════════════
   HERO - campo de particulas em malha (neon green)
   Grid regular de pontos, ondulado por soma de senos no vertex
   shader, com repulsão suave sob o cursor. Um só draw call.
   ══════════════════════════════════════════════════════════════ */

const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
const canvas  = document.getElementById('gl');

async function initField () {
  const cores = navigator.hardwareConcurrency || 4;
  const mem   = navigator.deviceMemory || 4;
  if (cores <= 2 || mem <= 1) return;

  let THREE;
  try { THREE = await import('three'); }
  catch { return; }

  let renderer;
  try {
    renderer = new THREE.WebGLRenderer({
      canvas, antialias:false, alpha:true, powerPreference:'high-performance'
    });
  } catch { return; }

  const scene  = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(42, 1, 0.1, 400);
  camera.position.set(0, -3.5, 46);
  camera.lookAt(0, 1.5, 0);

  renderer.setClearColor(0x000000, 0);

  /* ---- malha de pontos ---- */
  const narrow = innerWidth < 760;
  const COLS = narrow ? 104 : 176;
  const ROWS = narrow ?  62 : 100;
  const SPAN_X = 104, SPAN_Y = 60;

  const count = COLS * ROWS;
  const pos  = new Float32Array(count * 3);
  const rand = new Float32Array(count);

  let i = 0;
  for (let y = 0; y < ROWS; y++) {
    for (let x = 0; x < COLS; x++) {
      const jx = (Math.random() - 0.5) * (SPAN_X / COLS) * 0.55;
      const jy = (Math.random() - 0.5) * (SPAN_Y / ROWS) * 0.55;
      pos[i * 3]     = (x / (COLS - 1) - 0.5) * SPAN_X + jx;
      pos[i * 3 + 1] = (y / (ROWS - 1) - 0.5) * SPAN_Y + jy;
      pos[i * 3 + 2] = 0;
      rand[i] = Math.random();
      i++;
    }
  }

  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  geo.setAttribute('aRand',    new THREE.BufferAttribute(rand, 1));

  const uniforms = {
    uTime:     { value: 0 },
    uMouse:    { value: new THREE.Vector2(999, 999) },
    uPointer:  { value: 0 },
    uSize:     { value: narrow ? 2.0 : 2.35 },
    uDpr:      { value: 1 },
    uColor:    { value: new THREE.Color(0x00ff88) },   /* neon green */
    uHi:       { value: new THREE.Color(0x33ffaa) },   /* accent-2 */
  };

  const material = new THREE.ShaderMaterial({
    uniforms,
    transparent: true,
    depthWrite:  false,
    blending:    THREE.AdditiveBlending,
    vertexShader: /* glsl */`
      uniform float uTime, uSize, uDpr, uPointer;
      uniform vec2  uMouse;
      attribute float aRand;
      varying float vGlow, vFade;

      void main () {
        vec3 p = position;

        float w  = sin(p.x * 0.168 + uTime * 0.40) * cos(p.y * 0.205 - uTime * 0.29);
        w += 0.42 * sin(p.x * 0.355 - uTime * 0.25) * cos(p.y * 0.31 + uTime * 0.19);
        p.z += w * 2.6;

        vec2  d    = p.xy - uMouse;
        float dist = length(d);
        float infl = exp(-dist * dist / 150.0) * uPointer;
        p.xy += normalize(d + 0.0001) * infl * 5.5;
        p.z  += infl * 7.0;

        float r = length(position.xy / vec2(52.0, 30.0));
        vFade = 1.0 - smoothstep(0.55, 1.0, r);

        float lift = 0.34 + 0.66 * smoothstep(-2.8, 3.2, p.z);
        vGlow = lift * (0.62 + 0.38 * aRand) + infl * 1.3;

        vec4 mv = modelViewMatrix * vec4(p, 1.0);
        gl_Position  = projectionMatrix * mv;
        gl_PointSize = uSize * uDpr * (0.75 + vGlow * 1.1) * (46.0 / -mv.z);
      }
    `,
    fragmentShader: /* glsl */`
      uniform vec3 uColor, uHi;
      varying float vGlow, vFade;

      void main () {
        vec2  c = gl_PointCoord - 0.5;
        float d = length(c);
        if (d > 0.5) discard;

        float a = pow(smoothstep(0.5, 0.0, d), 1.9);
        vec3  col = mix(uColor, uHi, clamp(vGlow * 0.85, 0.0, 1.0));

        gl_FragColor = vec4(col, a * vFade * (0.10 + vGlow * 0.46));
      }
    `,
  });

  const field = new THREE.Points(geo, material);
  field.rotation.x = -0.42;
  scene.add(field);

  /* ---- redimensionamento ---- */
  const resize = () => {
    const w = canvas.clientWidth  || innerWidth;
    const h = canvas.clientHeight || innerHeight;
    const dpr = Math.min(devicePixelRatio || 1, 2);
    renderer.setPixelRatio(dpr);
    renderer.setSize(w, h, false);
    uniforms.uDpr.value = dpr;
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
  };
  resize();
  addEventListener('resize', resize, { passive: true });

  /* ---- cursor ---- */
  const plane   = new THREE.Plane(new THREE.Vector3(0, 0, 1), 0);
  const ray     = new THREE.Raycaster();
  const ndc     = new THREE.Vector2();
  const hit     = new THREE.Vector3();
  const target  = new THREE.Vector2(999, 999);
  let   wanted  = 0;

  const onMove = (e) => {
    const r = canvas.getBoundingClientRect();
    ndc.x =  ((e.clientX - r.left) / r.width)  * 2 - 1;
    ndc.y = -((e.clientY - r.top)  / r.height) * 2 + 1;
    ray.setFromCamera(ndc, camera);
    if (ray.ray.intersectPlane(plane, hit)) {
      field.worldToLocal(hit);
      target.set(hit.x, hit.y);
      wanted = 1;
    }
  };
  if (!reduced && matchMedia('(hover:hover) and (pointer:fine)').matches) {
    addEventListener('pointermove', onMove, { passive: true });
    addEventListener('pointerleave', () => { wanted = 0; }, { passive: true });
  }

  /* ---- loop ---- */
  let running = true, raf = 0, t0 = performance.now();

  const frame = (now) => {
    raf = requestAnimationFrame(frame);
    if (!running) return;

    uniforms.uTime.value = (now - t0) / 1000;

    const m = uniforms.uMouse.value;
    m.x += (target.x - m.x) * 0.07;
    m.y += (target.y - m.y) * 0.07;
    uniforms.uPointer.value += (wanted - uniforms.uPointer.value) * 0.06;

    renderer.render(scene, camera);
  };

  if (reduced) {
    renderer.render(scene, camera);
  } else {
    raf = requestAnimationFrame(frame);
  }

  const hero = document.getElementById('topo');
  new IntersectionObserver(
    ([e]) => { running = e.isIntersecting && !document.hidden; },
    { threshold: 0 }
  ).observe(hero);
  document.addEventListener('visibilitychange', () => {
    running = !document.hidden && hero.getBoundingClientRect().bottom > 0;
  });

  canvas.classList.add('is-ready');
}

initField();

/* ══════════════════════════════════════════════════════════════
   ENTRADA DO HERO + GSAP ScrollTrigger + Parallax
   ══════════════════════════════════════════════════════════════ */

function entradaDoHero () {
  const nav = document.getElementById('nav');
  const onScroll = () => nav.classList.toggle('is-stuck', scrollY > 12);
  onScroll();
  addEventListener('scroll', onScroll, { passive: true });

  if (reduced || !window.gsap) {
    document.documentElement.classList.remove('js');
    return;
  }

  gsap.timeline({ defaults: { ease: 'expo.out' } })
    .fromTo('.title .line > span',
      { yPercent: 112, y: 0 },
      { yPercent: 0, y: 0, duration: .55, stagger: .07 }, 0)
    .to('.eyebrow',              { opacity: 1, y: 0, duration: .8 }, .2)
    .to('.lede',                 { opacity: 1, y: 0, duration: .8 }, .34)
    .to('.hero .actions',        { opacity: 1, y: 0, duration: .8 }, .44)
    .to('.hero-foot',            { opacity: 1, duration: .85 }, .58);

  /* -- Revelação no scroll -- */
  if (window.ScrollTrigger) {
    gsap.registerPlugin(ScrollTrigger);

    ScrollTrigger.batch('[data-reveal]', {
      start: 'top 88%',
      once: true,
      onEnter: (els) => gsap.to(els, {
        opacity: 1, y: 0, duration: 1, ease: 'expo.out', stagger: .07, overwrite: true
      }),
    });

    /* -- Trilho do processo: parallax scrub -- */
    const rail = document.getElementById('railFill');
    const steps = gsap.utils.toArray('.step');
    if (rail && steps.length) {
      gsap.to(rail, {
        scaleY: 1, ease: 'none',
        scrollTrigger: {
          trigger: '.steps',
          start: 'top 62%',
          end: 'bottom 78%',
          scrub: .5,
        },
      });
      steps.forEach((step) => {
        ScrollTrigger.create({
          trigger: step, start: 'top 68%', end: 'bottom 78%',
          onToggle: (self) => step.classList.toggle('is-on', self.isActive),
        });
      });
    }

    /* -- Parallax nos cards de trabalho -- */
    gsap.utils.toArray('.case').forEach((card) => {
      gsap.to(card.querySelector('.case-shot img'), {
        yPercent: -8,
        ease: 'none',
        scrollTrigger: {
          trigger: card,
          start: 'top bottom',
          end: 'bottom top',
          scrub: true,
        },
      });
    });

    /* -- Parallax suave nas stats -- */
    gsap.utils.toArray('.stat-num').forEach((num, i) => {
      gsap.from(num, {
        y: 20 + i * 5,
        ease: 'none',
        scrollTrigger: {
          trigger: num,
          start: 'top 90%',
          end: 'top 50%',
          scrub: true,
        },
      });
    });
  }

  /* -- Link ativo no menu -- */
  const ids = ['sobre','servicos','processo','trabalho','stack'];
  const links = new Map(
    ids.map((id) => [id, document.querySelector(`.nav-links a[href="#${id}"]`)])
  );
  const spy = new IntersectionObserver((entries) => {
    const seen = entries.filter((e) => e.isIntersecting)
      .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)[0];
    if (!seen) return;
    links.forEach((el, id) => el && el.classList.toggle('is-active', id === seen.target.id));
  }, { rootMargin: '-45% 0px -50% 0px' });
  ids.forEach((id) => {
    const el = document.getElementById(id);
    if (el) spy.observe(el);
  });
}

addEventListener('DOMContentLoaded', entradaDoHero);

/* ══════════════════════════════════════════════════════════════
   CONTADORES - sobem uma vez, quando entram na tela
   ══════════════════════════════════════════════════════════════ */
{
  const nums = document.querySelectorAll('[data-count]');

  const run = (el) => {
    const target = Number(el.dataset.count);
    const suffix = el.dataset.suffix || '';
    const dur = 1500;
    let t0 = null;

    const tick = (now) => {
      if (t0 === null) t0 = now;
      const t = Math.min((now - t0) / dur, 1);
      const eased = t === 1 ? 1 : 1 - Math.pow(2, -10 * t);
      el.innerHTML = Math.round(target * eased) + (suffix ? `<sup>${suffix}</sup>` : '');
      if (t < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  };

  if (reduced) {
    nums.forEach((el) => {
      const s = el.dataset.suffix || '';
      el.innerHTML = el.dataset.count + (s ? `<sup>${s}</sup>` : '');
    });
  } else {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (!e.isIntersecting) return;
        io.unobserve(e.target);
        run(e.target);
      });
    }, { threshold: .5 });
    nums.forEach((el) => io.observe(el));
  }
}