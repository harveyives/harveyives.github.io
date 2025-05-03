import { PageLayout, SharedLayout } from "./quartz/cfg"
import * as Component from "./quartz/components"

// components shared across all pages
export const sharedPageComponents: SharedLayout = {
  head: Component.Head(),
  header: [],
  afterBody: [
    Component.ConditionalRender({
      component: Component.Comments({
        provider: 'giscus',
        options: {
          repo: 'harveyives/blog',
          repoId: 'R_kgDOOcMuBg',
          category: 'Announcements',
          categoryId: 'DIC_kwDOOcMuBs4CpQbo',
          themeUrl: 'noborder_light'
        }
      }),
      condition: (page) => page.fileData.slug !== "index",
    }),
    Component.ConditionalRender({
      component: Component.Flex({ components: [
        { Component: Component.RecentNotes() }
      ]}),
      condition: (page) => page.fileData.slug == "index",
    }),
  ],
  
  footer: Component.Footer({
    links: {
      GitHub: "https://github.com/jackyzha0/quartz",
      "Discord Community": "https://discord.gg/cRFFHYye7t",
    },
  }),
}

// components for pages that display a single page (e.g. a single note)
export const defaultContentPageLayout: PageLayout = {
  beforeBody: [
    Component.ConditionalRender({
      component: Component.Group({
        components: [
         Component.Breadcrumbs(),
          Component.ArticleTitle(),
          Component.ContentMeta(),
          Component.TagList(),
        ],
      }),
      condition: (page) => page.fileData.slug !== "index",
    }),
    Component.ConditionalRender({
      component: Component.PageTitle(),
      condition: (page) => page.fileData.slug == "index",
    }),
  ],
  left: [
    Component.ConditionalRender({
      component: Component.Group({ 
        components: [
          Component.PageTitle(),
          Component.MobileOnly(Component.Spacer()),
          Component.Flex({
            components: [
              {
                Component: Component.Search(),
                grow: true,
              },
              { Component: Component.Darkmode() },
              { Component: Component.ReaderMode() },
            ],
          }),
          Component.Explorer(),
        ]
      }),
      condition: (page) => page.fileData.slug !== "index",
    })
  ],
  right: [
    Component.ConditionalRender({
      component: Component.Group({
        components: [
          Component.Graph(),
          Component.DesktopOnly(Component.TableOfContents),
          Component.Backlinks()
        ]
      }),
      condition: (page) => page.fileData.slug !== "index",
    }),
  ],
}

// components for pages that display lists of pages  (e.g. tags or folders)
export const defaultListPageLayout: PageLayout = {
  beforeBody: [Component.Breadcrumbs(), Component.ArticleTitle(), Component.ContentMeta()],
  left: [
    Component.PageTitle(),
    Component.MobileOnly(Component.Spacer()),
    Component.Flex({
      components: [
        {
          Component: Component.Search(),
          grow: true,
        },
        { Component: Component.Darkmode() },
      ],
    }),
    Component.Explorer(),
  ],
  right: [],
}
