/* ══════════════════════════════════════════════════════════════
   HERO - Image sequence animation (GSAP + ScrollTrigger)
   ══════════════════════════════════════════════════════════════ */

const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
const canvas  = document.getElementById('hero-sequence');

function initField () {
  if (reduced || !canvas) return;

  const context = canvas.getContext('2d');
  
  // Total de frames gerados pelo ffmpeg
  const frameCount = 240;
  const currentFrame = index => (
    `images/frames/frame_${(index + 1).toString().padStart(4, '0')}.jpg`
  );

  const images = [];
  const seq = { frame: 0 };

  for (let i = 0; i < frameCount; i++) {
    const img = new Image();
    img.src = currentFrame(i);
    images.push(img);
  }

  // Ajusta resolução base do Canvas. 
  // O redimensionamento flexível e corte são feitos pelo CSS object-fit:cover
  canvas.width = 1920;
  canvas.height = 1080;

  function render() {
    if(images[seq.frame] && images[seq.frame].complete) {
      context.clearRect(0, 0, canvas.width, canvas.height);
      context.drawImage(images[seq.frame], 0, 0, canvas.width, canvas.height);
    }
  }

  images[0].onload = render;

  // Garante que o GSAP faça a animação no scroll
  if (window.gsap && window.ScrollTrigger) {
    gsap.registerPlugin(ScrollTrigger);

    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: ".hero",
        start: "top top",
        end: "+=150%", 
        pin: true,
        scrub: 0.5, 
      }
    });

    // Animação dos frames do vídeo (duração total = 1)
    tl.to(seq, {
      frame: frameCount - 1,
      snap: "frame",
      ease: "none",
      duration: 1,
      onUpdate: render
    }, 0)
    // Esconde os textos e o mockup logo no início do scroll, APENAS no desktop
    // No mobile, o texto fica fixo abaixo do vídeo, então não precisamos esconder
    const mm = gsap.matchMedia();
    
    mm.add("(min-width: 621px)", () => {
      tl.to(".hero-inner, .hero-mockup, .hero-foot", {
        opacity: 0,
        y: -40,
        ease: "power2.inOut",
        duration: 0.2
      }, 0);
    });
  }

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
    const ldr = document.getElementById('loader');
    if(ldr) ldr.style.display = 'none';
    return;
  }

  const tl = gsap.timeline({ defaults: { ease: 'expo.out' } });
  const ldr = document.getElementById('loader');

  if (ldr) {
    let dx = 0, dy = 0, sx = 1, sy = 1;
    tl.fromTo(['.loader-logo-img', '.loader-bar-track'], 
        { opacity: 0, y: 20 }, 
        { opacity: 1, y: 0, duration: 1.5, ease: 'power3.out' }
      )
      .to('.loader-bar-fill', { scaleX: 1, duration: 2.2, ease: 'power2.inOut' })
      .to('.loader-bar-track', { opacity: 0, duration: 0.4 }, "+=0.2")
      .call(() => {
        const lImg = document.querySelector('.loader-logo-img');
        const nImg = document.querySelector('.brand img');
        if(lImg && nImg) {
          const r1 = lImg.getBoundingClientRect();
          const r2 = nImg.getBoundingClientRect();
          dx = r2.left - r1.left;
          dy = r2.top - r1.top;
          sx = r2.width / r1.width;
          sy = r2.height / r1.height;
          nImg.style.opacity = '0';
        }
      })
      .to(ldr, { backgroundColor: 'rgba(6,8,10,0)', duration: 1.4, ease: 'expo.inOut' }, "+=0.1")
      .to('.loader-logo-img', {
        x: () => dx,
        y: () => dy,
        scaleX: () => sx,
        scaleY: () => sy,
        transformOrigin: 'top left',
        duration: 1.4,
        ease: 'expo.inOut'
      }, "<")
      .set('.brand img', { opacity: '' })
      .set(ldr, { display: 'none' })
      .fromTo('.title .line > span',
        { yPercent: 112, y: 0 },
        { yPercent: 0, y: 0, duration: .55, stagger: .07 }, "-=0.6")
      .to('.eyebrow',       { opacity: 1, y: 0, duration: .8 }, "-=0.4")
      .to('.lede',          { opacity: 1, y: 0, duration: .8 }, "-=0.7")
      .to('.hero .actions', { opacity: 1, y: 0, duration: .8 }, "-=0.7")
      .to('.hero-foot',     { opacity: 1, duration: .85 }, "-=0.7");
  } else {
    tl.fromTo('.title .line > span',
        { yPercent: 112, y: 0 },
        { yPercent: 0, y: 0, duration: .55, stagger: .07 }, 0)
      .to('.eyebrow',       { opacity: 1, y: 0, duration: .8 }, .2)
      .to('.lede',          { opacity: 1, y: 0, duration: .8 }, .34)
      .to('.hero .actions', { opacity: 1, y: 0, duration: .8 }, .44)
      .to('.hero-foot',     { opacity: 1, duration: .85 }, .58);
  }

  /* -- Revelação no scroll -- */
  if (window.ScrollTrigger) {
    gsap.registerPlugin(ScrollTrigger);

    /* -- Animações Específicas por Seção (Taste Skill & Mobile) -- */
    const isMobile = window.matchMedia('(max-width: 768px)').matches;

    // 1. Elementos gerais
    gsap.utils.toArray('[data-reveal]').forEach(el => {
      if (el.classList.contains('case') || el.classList.contains('service')) return; // Tratados abaixo
      
      let animProps = { opacity: 1, y: 0, scale: 1, x: 0, visibility: 'visible', duration: 1.2, ease: 'expo.out' };
      let fromProps = { opacity: 0, visibility: 'hidden' };
      let startPoint = 'top 85%';
      
      if (el.classList.contains('sec-head') || el.classList.contains('cta-title')) {
        fromProps.y = 30;
      } else if (el.classList.contains('quote') || el.classList.contains('step')) {
        fromProps.y = 20;
        animProps.duration = 1;
      } else if (el.classList.contains('stack-grid')) {
        gsap.set(el, { visibility: 'visible', opacity: 1 });
        gsap.fromTo(el.querySelectorAll('.chip'),
          { opacity: 0, scale: 0.85, y: 10 },
          {
            opacity: 1, scale: 1, y: 0, visibility: 'visible',
            duration: 0.6, ease: 'back.out(1.5)', stagger: 0.05,
            scrollTrigger: { trigger: el, start: startPoint, once: true }
          }
        );
        return; 
      } else if (el.classList.contains('stats')) {
        gsap.set(el, { visibility: 'visible', opacity: 1 });
        gsap.fromTo(el.querySelectorAll('.stat'),
          { opacity: 0, y: 20 },
          {
            opacity: 1, y: 0, visibility: 'visible',
            duration: 1, ease: 'power2.out', stagger: 0.1,
            scrollTrigger: { trigger: el, start: startPoint, once: true }
          }
        );
        return;
      } else {
        fromProps.y = 20;
      }

      gsap.fromTo(el, fromProps, {
        ...animProps,
        scrollTrigger: { trigger: el, start: startPoint, once: true }
      });
    });

    // 2. Serviços: Animação Lateral + Cima para Baixo
    gsap.utils.toArray('.service').forEach((svc, i) => {
      gsap.fromTo(svc, 
        { opacity: 0, x: isMobile ? 0 : (i % 2 === 0 ? -40 : 40), y: 30, visibility: 'hidden' }, 
        {
          opacity: 1, x: 0, y: 0, visibility: 'visible',
          duration: 1, ease: 'power3.out',
          scrollTrigger: { trigger: svc, start: 'top 85%', once: true }
        }
      );
    });

    // 3. Cases de Trabalho: Diagonal + Transição de Imagens (Cortina/Clip-Path)
    gsap.utils.toArray('.case').forEach((c, i) => {
      const img = c.querySelector('.case-shot img');
      const bodyChildren = c.querySelectorAll('.case-body > *');
      
      const tl = gsap.timeline({
        scrollTrigger: { trigger: c, start: 'top 80%', once: true }
      });
      
      // Card revela em diagonal (lateral e de baixo pra cima)
      tl.fromTo(c, 
        { opacity: 0, y: 60, x: isMobile ? 0 : (c.classList.contains('case--wide') ? -40 : 40), visibility: 'hidden' },
        { opacity: 1, y: 0, x: 0, visibility: 'visible', duration: 1, ease: 'power3.out' }
      );
      
      // Imagem faz uma transição reveladora suave
      if (img) {
        tl.fromTo(img, 
          { clipPath: 'inset(100% 0 0 0)', scale: 1.15 },
          { clipPath: 'inset(0% 0 0 0)', scale: 1, duration: 1.2, ease: 'expo.out' },
          "-=0.7" // Intercala com a animação do card
        );
      }
      
      // Conteúdo do case aparece depois
      if (bodyChildren.length) {
        tl.fromTo(bodyChildren, 
          { opacity: 0, y: 15 },
          { opacity: 1, y: 0, duration: 0.8, ease: 'power2.out', stagger: 0.1 },
          "-=1.1"
        );
      }
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

/* ══════════════════════════════════════════════════════════════
   MOBILE MENU TOGGLE
   ══════════════════════════════════════════════════════════════ */
{
  const toggle = document.getElementById('navToggle');
  const menu   = document.getElementById('mobileMenu');

  if (toggle && menu) {
    const links = menu.querySelectorAll('.mobile-menu-link, .mobile-menu-cta');

    const open = () => {
      toggle.classList.add('is-open');
      toggle.setAttribute('aria-expanded', 'true');
      menu.classList.add('is-open');
      document.body.style.overflow = 'hidden';
    };
    const close = () => {
      toggle.classList.remove('is-open');
      toggle.setAttribute('aria-expanded', 'false');
      menu.classList.remove('is-open');
      document.body.style.overflow = '';
    };

    toggle.addEventListener('click', () => {
      menu.classList.contains('is-open') ? close() : open();
    });

    links.forEach(link => link.addEventListener('click', close));

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && menu.classList.contains('is-open')) close();
    });
  }
}

/* ══════════════════════════════════════════════════════════════
   INTERAÇÕES: Glow Effect nos cards
   ══════════════════════════════════════════════════════════════ */
{
  const cards = document.querySelectorAll('.service, .case, .quote');
  
  cards.forEach(card => {
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      
      card.style.setProperty('--mouse-x', `${x}px`);
      card.style.setProperty('--mouse-y', `${y}px`);
    });
  });
}

/* ══════════════════════════════════════════════════════════════
   FAQ ACCORDION
   ══════════════════════════════════════════════════════════════ */
{
  const faqItems = document.querySelectorAll('.faq-item');
  faqItems.forEach(item => {
    const btn = item.querySelector('.faq-question');
    const answer = item.querySelector('.faq-answer');
    
    btn.addEventListener('click', () => {
      const isOpen = item.classList.contains('is-open');
      
      // Fecha todos os outros
      faqItems.forEach(other => {
        other.classList.remove('is-open');
        const otherAnswer = other.querySelector('.faq-answer');
        if (otherAnswer) otherAnswer.style.maxHeight = null;
      });
      
      // Abre se estava fechado
      if (!isOpen) {
        item.classList.add('is-open');
        answer.style.maxHeight = answer.scrollHeight + "px";
      }
    });
  });
}