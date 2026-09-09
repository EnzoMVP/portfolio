# Portfolio

Personal developer portfolio (ML Engineering), built with Next.js (App Router), Sanity (embedded Studio CMS), next-intl (PT-BR/EN), Tailwind CSS, and Framer Motion.

## Getting started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). The site works with empty sections even without Sanity configured — see below to connect the CMS.

## Connecting Sanity (required for Projects, Skills, Certifications)

1. `npx sanity login` (opens a browser to authenticate with your Sanity account).
2. `npx sanity init` — create a new project, dataset `production`. Note the generated **project ID**.
3. Copy `.env.example` to `.env.local` and fill in `NEXT_PUBLIC_SANITY_PROJECT_ID`.
4. Restart `npm run dev`, then open [http://localhost:3000/studio](http://localhost:3000/studio) to log in and add content (Site Settings, Projects, Skills, Certifications).
5. After deploying, allow the production domain to reach the API: `npx sanity cors add https://<your-domain> --credentials`.

## Content you still need to fill in

- `src/messages/en.json` / `src/messages/pt-BR.json` — replace the `about.body` and `studies.items` placeholders with your real bio and education history.
- `public/cv/cv-en.pdf` / `public/cv/cv-pt.pdf` — replace the placeholder PDFs with your real CV.
- Sanity Studio (`/studio`) — add your Projects, Skills, Certifications, and fill in Site Settings (name, tagline, email, LinkedIn, GitHub).

## Scripts

- `npm run dev` — start the dev server.
- `npm run build` — production build.
- `npm run lint` — ESLint.

## Deployment

Deploy on [Vercel](https://vercel.com/new), setting the env vars from `.env.example` in the project settings. Vercel Analytics is already wired in (`@vercel/analytics`) and activates automatically once the project is connected to Vercel.
