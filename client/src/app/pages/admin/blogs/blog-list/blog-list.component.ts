import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { PostService } from '../../../../core/services/post.service';
import { Post } from '../../../../core/models/post.model';

@Component({
  selector: 'app-blog-list',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './blog-list.component.html',
  styleUrl: './blog-list.component.css'
})
export class BlogListComponent implements OnInit {
  private postService = inject(PostService);
  
  posts: Post[] = [];
  loading = true;

  ngOnInit(): void {
    this.loadPosts();
  }

  loadPosts(): void {
    this.loading = true;
    this.postService.getPosts().subscribe({
      next: (data) => {
        this.posts = data;
        this.loading = false;
      },
      error: (err) => {
        console.error('Failed to load posts', err);
        this.loading = false;
      }
    });
  }

  deletePost(id: number): void {
    if (confirm('Are you sure you want to delete this blog post?')) {
      this.postService.deletePost(id).subscribe({
        next: () => {
          this.posts = this.posts.filter(p => p.id !== id);
        },
        error: (err) => console.error('Failed to delete post', err)
      });
    }
  }
}
