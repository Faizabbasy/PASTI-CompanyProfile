<script setup lang="ts">
// /insights/:slug — one article's own page (Insights CMS only; see
// useInsightArticle). No body / not published / CMS off → 404.
const slug = useRoute().params.slug as string
const page = await resolveInsightArticle(slug)
const t = useT()
const lp = useLocalePath()

usePageSeo(page.seo, { parent: { name: t('Insights'), path: lp('/insights') }, type: 'article' })
useArticleLd({
  headline: page.article.title,
  description: page.article.page.description,
  image: page.article.image,
  author: page.author,
  date: page.date,
  section: page.article.page.topic,
  keywords: [page.article.page.category, ...(page.article.page.topics ?? [])]
})
</script>

<template>
  <InsightsArticle :page="page" />
</template>
