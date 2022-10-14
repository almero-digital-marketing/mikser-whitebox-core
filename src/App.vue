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
    <h2>Search</h2>
    <input type="text" v-model="query" @keyup.enter="search"> <button @click="search">Search</button><br><br>
    <div class="debug">
      {{ $hits('projects') }}
    </div>
  </div>
</template>
<script setup>
import { ref, onMounted } from 'vue'

import { useWhiteboxDocuments } from "./stores/documents"
import { useWhiteboxSearches } from "./stores/searches"
import { metaField } from './lib/utils'
import { useWhiteboxTracking } from "./stores/tracking"

let count = ref(0)
let query = ref('') 
function increment() {
  count++
}

const documents = useWhiteboxDocuments()
documents.loadDocuments(['/web/translation'])

import { onDocumentChanged, onCollectionLoaded } from './lib/hooks'
onDocumentChanged((newValue, oldValue) => console.log('Document changed:', oldValue, '→', newValue))
onCollectionLoaded('items', (items) => console.log('Collection loaded:', items))

function search() {
  const searches = useWhiteboxSearches()
  searches.multiMatch('projects', {
    query: query.value,
    fields: [
      metaField('Project', 'company'), 
      metaField('Project', 'title'), 
      metaField('Project', 'overview')
    ],
    type: 'phrase_prefix'
  })
}

// searches.match('projects', {
//   [metaField('Project', 'company')]: {
//     query: 'Med Pro'
//   }
// })

onMounted(() => {
  const tracking = useWhiteboxTracking()
  tracking.start()
})

</script>
<style>
.debug {
  opacity: .5;
}
</style>