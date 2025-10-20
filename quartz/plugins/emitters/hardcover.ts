import { promises as fs } from "fs"
import path from "path"



const toStars = (rating: string) => {
    const n: number = parseFloat(rating || "0")
    return n > 0 ? "★".repeat(Math.floor(n)) + (n % 1 >= 0.5 ? "½" : "") : ""
}

const htmlTemplate = (f: any) => `
<div style="border: 1px solid var (--gray, #ddd); border-radius: 0.5rem; overflow: hidden; text-align: center; transition: transform 0.2s;">
    <a href="https://hardcover.app/books/${f.book.slug}" target="_blank" style="text-decoration: none; color: inherit; display: block;">
        ${f.book.cached_image.url ? `<img src="${f.book.cached_image.url}" alt="${f.book.title}" style="width: 100%; aspect-ratio: 2/3; object-fit: cover; display: block;">` : '<div style="width: 100%; aspect-ratio: 2/3; display: flex; align-items: center; justify-content: center; background: var(--lightgray, #f5f5f5); font-size: clamp(2em, 5vw, 3rem);">?</div>'}
        <div style="padding: clamp(0.75 rem, 2vw, 1.25 rem);">
            <strong style="font-size: clamp (0.9rem, 2vw, 1rem); line-height: 1.3;">${f.book.title.split(':')[0]}</strong><br>
        </div>
    </a>
    <div style="padding: clamp(0.75 rem, 2vw, 1.25 rem);">
        <small style="font-size: clamp (0.75rem, 1.5vw, 0.875rem); color: var(--gray, #666);">
        ${f.book.release_year}${ f.book.pages ? `  •  ${f.book.pages} pages` : `` }
        </small><br>
        <span style="font-size: clamp(1rem, 2.5vw, 1.25rem); display: inline-block; margin: 0.25rem 0;">${toStars(f.book.rating)}</span>
    </div>
</div>`

export const prepareHardcoverFile = async (username: string) => {
    console.log("Preparing Hardcover content...")
    const outputPath = path.join(path.join(process.cwd(), "content"), "hardcover.md")
    try {
        const data = await fetchGraphQL().then(res => res.data.user_books);

        await fs.mkdir(path.dirname(outputPath), { recursive: true })
        await fs.writeFile(outputPath, markdownTemplate(username, data), "utf-8")
    } catch (error) {
        console.error(`Hardcover failed: ${error}`)
    }
}


async function fetchGraphQL() {
  const result = await fetch(
    "https://api.hardcover.app/v1/graphql",
    {
      method: "POST",
      headers: new Headers({
        'Authorization': `Bearer ${process.env.HARDCOVER_API_KEY}`, 
        "Content-Type": "application/json"
     }), 
      body: JSON.stringify({
        query,
      })
    }
  );

  return await result.json();
}

const query = `
{
    user_books(
          where: {
              user_id: {_eq: 50919}
          },
          distinct_on: book_id
          limit: 12
          offset: 0
    ) {
      book {
            title
            pages
            release_year
            cached_image
            rating
            slug
      }
    }
}
`;

const markdownTemplate = (username: string, books: any[]) => `---
title: "Recent Reads"
description: "My recent reads from Hardcover" 
tags: ["hardcover", "books"]
date: 2025-10-20
modified: ${new Date().toISOString().split("T")[0]}
---
*My recent reads from [Hardcover](https://hardcover.com/@${username}/)*

<div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(min(100%, 12rem), 1fr)); gap: clamp(0.75rem, 2vw, 1.5rem);"> 
    ${books.map(htmlTemplate).join("")}
</div>
`