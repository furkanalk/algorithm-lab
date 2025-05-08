<div align="center">

# 🧪 Algorithm Lab

**Interactive algorithm visualizer & mini‑lab**  
Explore, understand and *play* with classic algorithms — Path‑finding, Sorting and Decision‑Making — through animated 2‑D mini‑games.

![GitHub repo size](https://img.shields.io/github/repo-size/furkanalk/algorithm-lab)
![GitHub contributors](https://img.shields.io/github/contributors/furkanalk/algorithm-lab)
![GitHub issues](https://img.shields.io/github/issues/furkanalk/algorithm-lab)
![GitHub stars](https://img.shields.io/github/stars/furkanalk/algorithm-lab?style=social)
![GitHub forks](https://img.shields.io/github/forks/furkanalk/algorithm-lab?style=social)

</div>

---

## 🧠 What is Algorithm Lab?

A modular, web‑based sandbox for **visually experimenting** with core CS algorithms.  
*Every module is a self‑contained “mini‑game” that you can open, tweak and extend.*

Current modules

| Category | Mini‑Game / Tool | Algorithms inside | Highlight |
|----------|------------------|-------------------|-----------|
| Path‑finding | **Grid Explorer** | BFS · DFS · Dijkstra · A\* | Click to add walls, set start/end, watch step‑by‑step |
| Sorting | **Sort Studio** | Bubble · Merge · Quick · Heap (asc/desc) | Colour‑coded bars + realtime narrator + back/forward |
| Decision‑Making | **Dance Partner Matcher** | Monte‑Carlo pairing (leader↔follower) | Pixel dancers, chemistry score, rewind history |

---

## ✨ Key Features (today)

- 🎬 **Rich animations** – spritesheets, tile‑based backgrounds, smooth transitions
- 🖱 **Fully interactive** – draw obstacles, change data, scrub algorithm history
- 🌱 Responsive grass‑tile dance floor, auto‑scales with couple count
- 💃 Five dance styles (fast · slow · classic · modern · cool) with live sprite swap
- 🛠️ **Hot‑pluggable** architecture – add a new mini‑game by dropping one folder
- ⚡ Vanilla JS + Tailwind CSS, no heavy framework
- 🖥️ Lightweight Node/Express dev server (live‑reload)

---

## ✅ Roadmap / To‑Do

<details>
<summary><b>Path‑finding</b></summary>

- [x] BFS, DFS, Dijkstra, A\*  
- [ ] Greedy Best‑First Search  
- [ ] More...  
</details>

<details>
<summary><b>Sorting</b></summary>

- [x] Bubble, Merge, Quick, Heap  
- [ ] Insertion, Selection  
- [ ] Performance comparison chart
- [ ] More...
</details>

<details>
<summary><b>Decision‑Making</b></summary>

- [x] Monte‑Carlo dance matcher  
- [ ] Min‑Max & Alpha‑Beta (tic‑tac‑toe)  
- [ ] More...
</details>

<details>
<summary><b>Knowledge Base</b></summary>

- [ ] In‑app wiki page per algorithm  
- [ ] Complexity cheat‑sheets
- [ ] More...
</details>

<details>
<summary><b>UI / UX</b></summary>

- [x] Dark / light adaptive palette  
- [ ] Theme selector & animation toggle  
- [ ] Mobile touch optimisation  
</details>

---

## 🚀 Getting Started

```bash
# 1. Clone
git clone https://github.com/furkanalk/algorithm-lab.git
cd algorithm-lab

# 2. Install core dev server
npm install    # only needs live‑server & nodemon

# 3. Run locally
npm run dev    # opens http://localhost:3000
