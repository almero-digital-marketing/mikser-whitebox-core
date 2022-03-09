<template>
  <div>
    <h1>WhiteBox Core</h1> 
    <button @click="increment">{{ count }}</button>
    <nav><router-link to="/">Home</router-link></nav>
    <nav><router-link :to="$href('/web/projects').link">Projects</router-link></nav>
    <router-view v-slot="{ Component }">
			<component :is="Component" />
		</router-view>
    <div class="debug">
      {{ $href('/web/translation') }}
      {{ $storage('/storage/animations/client-graphs.json') }}
    </div>
  </div>
</template>
<script setup>
import { useWhiteboxDocuments } from "./stores/documents"

let count = $ref(0)

function increment() {
  count++
}

const documentsStore = useWhiteboxDocuments()
documentsStore.loadDocuments(['/web/translation'])
</script>
<style>
.debug {
  opacity: .5;
}
</style>