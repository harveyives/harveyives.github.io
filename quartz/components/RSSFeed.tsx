import { QuartzComponent, QuartzComponentConstructor, QuartzComponentProps } from "./types"
import style from "./styles/rssfeed.scss"

interface RSSFeedOptions {
  url: string
  limit?: number
}

const defaultOptions: Partial<RSSFeedOptions> = {
  limit: 5
}

export default ((userOpts?: Partial<RSSFeedOptions>) => {
  const RSSFeed: QuartzComponent = ({ displayClass, fileData }: QuartzComponentProps) => {
    const opts = { ...defaultOptions, ...userOpts }
    
    return (
      <div class={`rss-feed ${displayClass ?? ""}`}>
        <div class="rss-feed-container" data-feed-url={opts.url} data-limit={opts.limit}></div>
      </div>
    )
  }

  // Add this line to get proper typing
  RSSFeed.css = style
  
  // Add client-side script to fetch and display RSS feed
  RSSFeed.beforeDOMLoaded = `
    const fetchRSSFeed = async () => {
      const containers = document.querySelectorAll('.rss-feed-container')
      containers.forEach(async (container) => {
        const feedUrl = container.getAttribute('data-feed-url')
        const limit = parseInt(container.getAttribute('data-limit') || '5')
        
        try {
          // Use a CORS proxy since RSS feeds often don't have CORS headers
          const response = await fetch(\`https://api.allorigins.win/get?url=\${encodeURIComponent(feedUrl)}\`)
          const data = await response.json()
          const parser = new DOMParser()
          const xml = parser.parseFromString(data.contents, 'application/xml')
          const items = xml.querySelectorAll('item')
          
          const html = Array.from(items)
            .slice(0, limit)
            .map(item => {
              const title = item.querySelector('title')?.textContent
              const link = item.querySelector('link')?.textContent
              const pubDate = item.querySelector('pubDate')?.textContent
              const date = pubDate ? new Date(pubDate).toLocaleDateString() : ''
              
              return \`
                <div class="rss-item">
                  <span class="rss-date">\${date}</span>
                  <a href="\${link}" target="_blank" rel="noopener noreferrer">\${title}</a>
                </div>
              \`
            })
            .join('')
            
          container.innerHTML = html
        } catch (error) {
          console.error('Error fetching RSS feed:', error)
          container.innerHTML = '<p>Error loading RSS feed</p>'
        }
      })
    }
    
    window.addEventListener('DOMContentLoaded', fetchRSSFeed)
  `

  return RSSFeed
}) satisfies QuartzComponentConstructor