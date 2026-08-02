import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { PostService } from '../../../core/services/post.service';
import { Post } from '../../../core/models/post.model';

@Component({
  selector: 'app-blog-detail',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './blog-detail.component.html',
  styleUrl: './blog-detail.component.css'
})
export class BlogDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private postService = inject(PostService);
  
  post: Post | null = null;
  loading = true;
  recentPosts: Post[] = [];

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      const id = params.get('id');
      if (id) {
        this.loadPost(+id);
        this.loadRecent();
      }
    });
  }

  loadPost(id: number): void {
    this.loading = true;
    this.postService.getPost(id).subscribe({
      next: (data) => {
        this.post = data;
        this.loading = false;
      },
      error: (err) => {
        console.error('Failed to load post', err);
        this.loading = false;
      }
    });
  }

  loadRecent(): void {
    this.postService.getPosts().subscribe({
      next: (data) => {
        this.recentPosts = data.slice(0, 3);
      }
    });
  }

  getPostImage(post: Post | null): string {
    if (!post || !post.image_url) return 'assets/images/blog-1.png';
    if (post.image_url.startsWith('http')) return post.image_url;
    if (post.image_url.startsWith('assets/')) return '/' + post.image_url;
    if (post.image_url.startsWith('/')) return post.image_url;
    return `/storage/${post.image_url}`;
  }
}
