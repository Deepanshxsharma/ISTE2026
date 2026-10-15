# Deepansh Sharma — Beyond the Screen

An interactive 3D room that works as my portfolio, built with React, React Three Fiber and Three.js.

> Building applications, intelligent systems, and interactive experiences.

## Run it

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # production build in dist/
npm run preview  # serve the build
```

## What's in the room

| Object      | Opens                                                                          | Key |
| ----------- | ------------------------------------------------------------------------------ | --- |
| Photo frame | About me, education, what I'm building now                                     | 1   |
| Computer    | DS//OS — project explorer with categories and detail views, stack, contact     | 2   |
| Pin board   | Work wall — featured project, secondary projects and experiments               | 3   |
| Phone       | Contact card, room lights, radio, quick jumps                                  | 4   |
| Laptop      | Radio — original synthesized tracks                                            | 5   |
| TV          | Neon Breaker — an original arcade game                                         | 6   |
| Floor light | Cycles the lighting: Sunlit, Midnight, Overdrive                                |     |

`Esc` goes back to the room. Drag to orbit, scroll to zoom, right-drag to pan.

## Editing the content

All personal content lives in **`src/config/profile.js`**: name, headline, about text, education, projects, skills
and contact links. Nothing personal is hard-coded in components.

-   Text in `[square brackets]` is a placeholder. It is highlighted in `npm run dev` and hidden in production builds.
-   Links with an empty `url` are not rendered. Only add URLs you have checked.
-   Each skill is marked `used` (shipped in a project) or `explored` (still learning).

Still to fill in: GitHub, LinkedIn and project repository URLs, campus and years, the "Next" item, and the IoT
project.

## Credits

-   **Design and code:** Deepansh Sharma — interface, DS//OS, Work wall, About panel, phone remote, Neon Breaker,
    synthesized audio, lighting moods and all project artwork.
-   **3D room model and baked lighting:** [Room Portfolio](https://github.com/AT010303/Room_Portfolio) by Ashutosh
    Tripathi, which this project started from.
-   **Fonts:** Space Grotesk, JetBrains Mono and VT323 via Fontsource (SIL Open Font License).
