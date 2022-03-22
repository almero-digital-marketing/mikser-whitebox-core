<template>
    <div class="home">
        <h2>HOME</h2>
        {{ $document.meta.title }}
        <p>Projects: <strong>{{ $collections.items.loaded }}</strong> Count: <strong>{{ $collections.items.length }}</strong></p>
    </div>
</template>