<template>
  <div>
    TEST
    <router-view v-slot="{ Component }">
			<component :is="Component" />
		</router-view>
  </div>
</template>