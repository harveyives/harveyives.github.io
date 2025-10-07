import { pathToRoot } from "../util/path"
import { QuartzComponent, QuartzComponentConstructor, QuartzComponentProps } from "./types"
import { classNames } from "../util/lang"
import { i18n } from "../i18n"
import style from "./styles/pageTitle.scss"

const PageTitle: QuartzComponent = ({ fileData, cfg, displayClass }: QuartzComponentProps) => {
  const title = cfg?.pageTitle ?? i18n(cfg.locale).propertyDefaults.title
  console.log(fileData.slug)
  const shortTitle = (fileData.slug! == "index") ? cfg?.pageTitle : (cfg?.pageTitleShort ?? title)
  const baseDir = pathToRoot(fileData.slug!)
  return (
    <h2 class={classNames(displayClass, "page-title")}>
      <a href={baseDir}>
        <span class="title-full">{title}</span>
        <span class="title-short">{shortTitle}</span>
      </a>
    </h2>
  )
}

PageTitle.css = style
export default (() => PageTitle) satisfies QuartzComponentConstructor
