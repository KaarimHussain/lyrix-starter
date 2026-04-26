# **🎨 Lyrix Starter**

The official "cargo" for the Lyrix ecosystem. A high-performance, code-first Next.js boilerplate designed for developers who give a damn about aesthetics.

## **✨ Vibe Check**

* **Framework:** Next.js 15 (App Router)  
* **Style:** Tailwind CSS \+ Bento Grid logic  
* **Motion:** Framer Motion (Smooth AF)  
* **Icons:** Lucide React  
* **Theming:** Dark 

## **🚀 Quick Start**

Scaffolded via the CLI:

npx create-lyrix-app my-project

Or manual clone:

git clone \[https://github.com/your-username/lyrix-starter.git\](https://github.com/your-username/lyrix-starter.git)

## **📂 Structure**

* /src/app — App router & layouts.  
* /src/components/lyrix — The core block system.  
* /src/components/ui — Radix-based atomic components.  
* /src/lib — Lyrix engine & API bridge.

## **🔧 Config**

Connect the starter to your Lyrix web dashboard:

```bash
LYRIX_WEB_URL=http://localhost:3000
```

The `/lx-admin` login form sends the Lyrix Project ID and password to the
starter API, which verifies them against `${LYRIX_WEB_URL}/api/lx-admin/login`
and creates a local admin session.

Update lyrix.config.ts to sync with your web dashboard:

export const lyrixConfig \= {  
  projectId: "your-id",  
  apiKey: process.env.LYRIX\_API\_KEY,  
};

## **📜 Scripts**

* npm run dev — Launch dev server  
* npm run build — Production build  
* npm run start — Boot production site

Made with ❤️ for the Lyrix community.
