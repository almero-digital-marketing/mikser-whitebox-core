<template>
  <div>
    <h1>WhiteBox Core</h1> 
    {{ $collections.projects?.length }}
    <nav><router-link to="/">Home</router-link></nav>
    <nav><router-link :to="$href('/web/projects').link">Projects</router-link></nav>
    <router-view v-slot="{ Component }">
			<component :is="Component" />
		</router-view>
    {{ $href('/web/translation') }}
    {{ $storage('/storage/animations/client-graphs.json') }}
  </div>
</template>
<script setup>
import { useWhiteboxDocuments } from "./stores/documents"

const documentsStore = useWhiteboxDocuments()
documentsStore.loadDocuments(['/web/translation'])
</script>