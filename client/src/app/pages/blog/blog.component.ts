import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { PostService } from '../../core/services/post.service';
import { Post } from '../../core/models/post.model';

@Component({
  selector: 'app-blog',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './blog.component.html',
  styleUrl: './blog.component.css'
})
export class BlogComponent implements OnInit {
  postService = inject(PostService);
  posts: Post[] = [];

  recentPosts: Post[] = [];

  ngOnInit() {
    this.postService.getPosts().subscribe((data: Post[]) => {
      this.posts = data;
      this.recentPosts = data.slice(0, 3);
    });
  }

  getPostImage(post: Post): string {
    if (!post || !post.image_url) return 'assets/images/blog-1.png';
    if (post.image_url.startsWith('http')) return post.image_url;
    if (post.image_url.startsWith('assets/')) return '/' + post.image_url;
    if (post.image_url.startsWith('/')) return post.image_url;
    return `/storage/${post.image_url}`;
  }
}
