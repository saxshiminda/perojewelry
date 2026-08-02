import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { PostService } from '../../../../core/services/post.service';
import { Post } from '../../../../core/models/post.model';

@Component({
  selector: 'app-blog-form',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './blog-form.component.html',
  styleUrl: './blog-form.component.css'
})
export class BlogFormComponent implements OnInit {
  private postService = inject(PostService);
  private http = inject(HttpClient);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  isEditMode = false;
  blogId?: number;
  blog: any = {
    title: '',
    excerpt: '',
    content: '',
    category: '',
    published: true,
    image_url: ''
  };
  
  categories = ['Craft & Process', 'Materials', 'Styling', 'Behind the Scenes', 'Drops'];
  
  loading = false;
  uploading = false;
  errorMessage = '';
  isDragging = false;

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.isEditMode = true;
      this.blogId = +id;
      this.loadBlog(this.blogId);
    }
  }

  loadBlog(id: number): void {
    this.loading = true;
    this.postService.getPost(id).subscribe({
      next: (data) => {
        this.blog = data || {
          title: '',
          excerpt: '',
          content: '',
          category: '',
          published: true,
          image_url: ''
        };
        // Fix seeded relative paths for edit mode
        if (this.blog.image_url && this.blog.image_url.startsWith('assets/')) {
          this.blog.image_url = '/' + this.blog.image_url;
        }
        this.loading = false;
      },
      error: () => {
        this.errorMessage = 'Failed to load blog post.';
        this.loading = false;
      }
    });
  }

  onFileSelect(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.uploadFile(input.files[0]);
      input.value = ''; 
    }
  }

  onDragOver(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragging = true;
  }

  onDragLeave(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragging = false;
  }

  onDrop(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragging = false;

    if (event.dataTransfer?.files && event.dataTransfer.files.length > 0) {
      const file = event.dataTransfer.files[0];
      if (file.type.startsWith('image/')) {
        this.uploadFile(file);
      }
    }
  }

  private uploadFile(file: File): void {
    this.uploading = true;
    const formData = new FormData();
    formData.append('image', file);

    this.http.post<{ image_url: string }>('/api/upload/image', formData, { withCredentials: true }).subscribe({
      next: (res) => {
        this.blog.image_url = res.image_url;
        this.uploading = false;
      },
      error: () => {
        this.errorMessage = `Failed to upload ${file.name}. Max 5MB, JPEG/PNG/GIF/WebP only.`;
        this.uploading = false;
      }
    });
  }

  removeImage(): void {
    this.blog.image_url = '';
  }

  onSubmit(): void {
    this.loading = true;
    this.errorMessage = '';

    if (!this.blog.title || !this.blog.content) {
      this.errorMessage = 'Title and content are required.';
      this.loading = false;
      return;
    }

    if (this.isEditMode && this.blogId) {
      this.postService.updatePost(this.blogId, this.blog).subscribe({
        next: () => this.router.navigate(['/admin/blogs']),
        error: () => {
          this.errorMessage = 'Failed to update blog post.';
          this.loading = false;
        }
      });
    } else {
      this.postService.createPost(this.blog).subscribe({
        next: () => this.router.navigate(['/admin/blogs']),
        error: () => {
          this.errorMessage = 'Failed to create blog post.';
          this.loading = false;
        }
      });
    }
  }
}
