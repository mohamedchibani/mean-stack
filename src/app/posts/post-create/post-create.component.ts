import { PostsService } from './../posts.service';
import { Component } from '@angular/core';
import { NgForm } from '@angular/forms';

@Component({
  selector: 'app-post-create',
  templateUrl: './post-create.component.html',
  styleUrls: ['./post-create.component.css'],
})
export class PostCreateComponent {
  entredTitle = '';
  entredContent = '';

  constructor(public postsService: PostsService) {}

  onAddPost(form: NgForm) {
    if (!form.valid) {
      return;
    }

    this.postsService.addPost(form.value.title, form.value.content);
    form.resetForm();
  }
}
