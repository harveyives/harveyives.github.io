import { QuartzEmitterPlugin } from "../types"
import { promises as fs } from "fs"
import path from "path"

// TODO: add types later?
// {
//   title: 'Late Shift, 2025 - ★★★★½',
//   link: 'https://letterboxd.com/harveyives/film/late-shift-2025/',
//   guid: 'letterboxd-watch-1001260188',
//   pubDate: 'Mon, 1 Sep 2025 08:52:09 +1200',
//   watchedDate: '2025-08-31',
//   rewatch: 'No',
//   filmTitle: 'Late Shift',
//   filmYear: '2025',
//   memberRating: '4.5',
//   'tmdb:movieId': '1356670',
//   description: '<p><img src="https://a.ltrbxd.com/resized/film-poster/1/2/4/5/6/7/8/1245678-late-shift-2025-0-600-0-900-crop.jpg?v=f783fc76d2"/></p> <p>Watched on Sunday August 31, 2025.</p>',
//   'dc:creator': 'harveyives'
// }
const parseXML = (xml: string) =>
    Array.from(xml.matchAll(/<item>(.*?)<\/item>/gs), ([, content]) => {
        const item: Record<string, string> = {}
        for (const [, tag, val] of content.matchAll(/<([^>\/\s]+)[^>]*>(.*?)<\/\1>/gs)) {
            item[tag.replace("letterboxd:", "")] = val.replace(/<!\[CDATA\[(.*?)\]\]>/gs, "$1").trim()
        }
        return item
    })

const toStars = (rating: string) => {
    const n: number = parseFloat(rating || "0")
    return n > 0 ? "★".repeat(Math.floor(n)) + (n % 1 >= 0.5 ? "½" : "") : ""
}

const truncate = (text: string, max: number) => text.length > max ? text.slice(0, max) + "..." : text

const filmCard = (f: any) => `
<div style="border: 1px solid var (--gray, #ddd); border-radius: 0.5rem; overflow: hidden; text-align: center; transition: transform 0.2s;">
    <a href="${f.link}" target="_blank" style="text-decoration: none; color: inherit; display: block;">
        ${f.poster ? `<img src="${f.poster}" alt="${f.title}" style="width: 100%; aspect-ratio: 2/3; object-fit: cover; display: block;">` : '<div style="width: 100%; aspect-ratio: 2/3; display: flex; align-items: center; justify-content: center; background: var(--lightgray, #f5f5f5); font-size: clamp(2em, 5vw, 3rem);">🎬</div>'}
        <div style="padding: clamp(0.75 rem, 2vw, 1.25 rem);">
            <strong style="font-size: clamp (0.9rem, 2vw, 1rem); line-height: 1.3;">${f.title}</strong><br>
            <small style="font-size: clamp (0.75rem, 1.5vw, 0.875rem); color: var(--gray, #666);">${f.year}</small><br>
            <span style="font-size: clamp(1rem, 2.5vw, 1.25rem); display: inline-block; margin: 0.25rem 0;">${f.rating}</span>
            ${f.review ? `<br><em style="font-size: clamp(0.7rem, 1.5vw, 0.8rem); color: var(—-darkgray, #666); line-height: 1.4; display: block; margin-top: 0.5rem;">"${f.review}"</em>` : ""}
        </div>
    </a>
</div>`

export const Letterboxd: QuartzEmitterPlugin<{ username: string }> = ({ username }) => ({
    name: "LetterboxdRSS",
    async *emit(ctx) {
        const outputPath = path.join(ctx.argv.directory, "letterboxd.md")

        try {
            console.log(`Fetching Letterboxd RSS for ${username}...`);

            const rss = await fetch(`https://letterboxd.com/${username}/rss/`)
                .then(r => r.text())
            const films = parseXML(rss)
                // .filter (i => i.filmTitle && i.filmYear)
                // .slice(0, 10)
                .map(i => ({
                    title: i.filmTitle,
                    year: i.filmYear,
                    rating: toStars(i.memberRating),
                    link: i.link || "",
                    poster: i.description?.match(/src="(https:\/\/a\.ltrbxd\.com\/[^"]+)"/)?.[1] || "",
                    review: truncate(i.description?.match(/<\/p>\s*<p[^>]*>(.*?)<\/p>/)?.[1]?.replace(/<[^>]*>/g, "").trim() || "", 60)
                }))
            const markdown = `---
title: "Recent Watches"
description: "My recent film watches from Letterboxd" 
tags: ["letterboxd", "films"]
date: 2025-10-04
---
*My recent watches from [Letterboxd](https://letterboxd.com/${username}/)*

<div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(min(100%, 10rem), 1fr)); gap: clamp(0.75rem, 2vw, 1.5rem);"> 
    ${films.map(filmCard).join("")}
</div>
`
            await fs.mkdir(path.dirname(outputPath), { recursive: true })
            await fs.writeFile(outputPath, markdown)
            console.log(`Generated letterboxd md with ${films.length} films`)
        } catch (error) {
            console.error(`Letterbox RSS failed: ${error}`)
        }
    }
})