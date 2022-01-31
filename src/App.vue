<template>
  <div>
    <h1>WhiteBox Core</h1> 
    {{ $document }}
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