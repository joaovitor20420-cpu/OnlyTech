# Only Tech - Soluções Digitais sob Medida

![Design Aesthetics](https://img.shields.io/badge/Design-Premium%20Dark%20Neon-00ff88?style=for-the-badge)
![HTML5](https://img.shields.io/badge/HTML5-E34F26?style=for-the-badge&logo=html5&logoColor=white)
![CSS3](https://img.shields.io/badge/CSS3-1572B6?style=for-the-badge&logo=css3&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)
![GSAP](https://img.shields.io/badge/GSAP-88CE02?style=for-the-badge&logo=greensock&logoColor=white)
![Three.js](https://img.shields.io/badge/Three.js-000000?style=for-the-badge&logo=threedotjs&logoColor=white)

Um site institucional de altíssima conversão criado para a **Only Tech**. Focado na oferta de serviços de desenvolvimento e design, o projeto alia uma estética rigorosa e moderna (anti-slop) a um desempenho ultrarrápido utilizando tecnologias nativas e animações avançadas.

## 🚀 Sobre o Projeto

A **Only Tech** é uma agência especializada na construção de soluções digitais:
- Landing Pages de alta conversão
- Sites institucionais 
- Redesign focado em conversão e usabilidade
- Suporte e manutenção contínua

O site foi desenhado respeitando regras estritas de design premium, utilizando uma paleta de cores "Dark Neon Green" (`#06080a` / `#00ff88`), tipografia de alto contraste (`Sora` e `JetBrains Mono`), e evitando padrões repetitivos e interfaces saturadas.

## ✨ Destaques Visuais e Técnicos

* **Hero Interativo em WebGL:** Um campo de partículas processado diretamente na GPU via `Three.js`. A malha reage de forma orgânica à posição do cursor do mouse.
* **Animações Fluidas:** Utilização de `GSAP` e `ScrollTrigger` para revelar seções e parágrafos de forma sutil conforme o usuário explora a página, incluindo efeitos de "parallax" dinâmico.
* **Floating Pill Navbar:** Uma barra de navegação moderna, flutuante, que emprega o conceito de "glassmorphism" (fundo desfocado translúcido) e se retrai suavemente durante o scroll.
* **Performance e Acessibilidade:** Sem frameworks pesados ou bibliotecas de renderização desnecessárias. O CSS é nativo e altamente otimizado (`CSS Variables` e `Clamp` para responsividade perfeita).
* **Anti-Slop Design:** A interface foi moldada via protocolo de gosto de design premium (`design-taste-frontend`), garantindo que a página tenha cara de um produto digital de alto valor (SaaS/Tech) e não apenas mais um template genérico.

## 📂 Estrutura de Arquivos

O projeto foi refatorado em uma estrutura clássica e limpa:

```text
📦 Only Tech
 ┣ 📂 images/            # Assets de imagem (Logo, Favicon, Cases de Portfólio)
 ┣ 📜 index.html         # Marcação e estruturação da página principal
 ┣ 📜 styles.css         # Tokens, tipografia, reset global e classes estilizadas
 ┣ 📜 scripts.js         # Lógica WebGL, ScrollTrigger, Listeners e interatividade
 ┗ 📜 README.md          # Documentação do projeto
```

## 🛠️ Como Executar

Por ser um projeto focado no ecossistema "Vanilla" (HTML, CSS e JS nativos), não há necessidade de instalação de dependências locais (`node_modules`) ou build steps complexos.

Para visualizar o projeto localmente:
1. Clone o repositório.
2. Dê um duplo-clique no arquivo `index.html` ou abra a pasta em uma extensão como o *Live Server* (VSCode).
3. E é isso! O site estará rodando perfeitamente.

---
*Construído e planejado para a Only Tech. Especialistas em gerar resultados.*