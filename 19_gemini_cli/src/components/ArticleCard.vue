<script setup>
import { ref } from 'vue';

/**
 * ArticleCard Component
 * Displays a summary of an article with an image, title, content, author, and date.
 */

const props = defineProps({
  title: {
    type: String,
    required: true,
    default: 'Article Title'
  },
  content: {
    type: String,
    required: true,
    default: 'Article content summary goes here...'
  },
  image: {
    type: String,
    default: 'https://via.placeholder.com/300x200'
  },
  author: {
    type: String,
    default: 'Anonymous'
  },
  date: {
    type: String,
    default: new Date().toLocaleDateString()
  },
  link: {
    type: String,
    default: '#'
  }
});

const isLiked = ref(false);

const toggleLike = () => {
  isLiked.value = !isLiked.value;
};
</script>

<template>
  <div class="card article-card h-100 shadow-2-strong">
    <!-- Article Image -->
    <div class="bg-image hover-overlay ripple" data-mdb-ripple-init data-mdb-ripple-color="light">
      <img :src="image" class="img-fluid article-image" :alt="title" />
      <a :href="link">
        <div class="mask" style="background-color: rgba(251, 251, 251, 0.15);"></div>
      </a>
    </div>

    <!-- Card Body -->
    <div class="card-body">
      <h5 class="card-title fw-bold text-primary">{{ title }}</h5>
      <p class="card-text text-muted">
        {{ content }}
      </p>
      
      <!-- Metadata -->
      <div class="d-flex justify-content-between align-items-center mt-3 border-top pt-2">
        <small class="text-muted">By <span class="fw-bold">{{ author }}</span></small>
        <small class="text-muted">{{ date }}</small>
      </div>
    </div>

    <!-- Card Footer -->
    <div class="card-footer bg-transparent border-0 d-flex justify-content-between align-items-center">
      <a :href="link" class="btn btn-link btn-sm p-0 text-primary fw-bold" data-mdb-ripple-init>Read More</a>
      
      <!-- Interaction: Like Button -->
      <button 
        type="button" 
        class="btn btn-sm shadow-0 p-0" 
        @click="toggleLike"
        :class="isLiked ? 'text-danger' : 'text-muted'"
      >
        <i :class="isLiked ? 'fas fa-heart' : 'far fa-heart'"></i>
        <span class="ms-1">{{ isLiked ? 'Liked' : 'Like' }}</span>
      </button>
    </div>
  </div>
</template>

<style scoped>
.article-card {
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  border-radius: 12px;
  overflow: hidden;
}

.article-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 10px 20px rgba(0, 0, 0, 0.1);
}

.article-image {
  height: 200px;
  width: 100%;
  object-fit: cover;
}

.card-title {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  height: 3rem;
}

.card-text {
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
  height: 4.5rem;
}
</style>
