import { Component, OnInit, HostListener } from '@angular/core';
import {Category,CategoryService} from './category.service';
import {FormBuilder, FormControl, FormGroup,Validators} from '@angular/forms';
import {Router} from '@angular/router';
import {NotificationsService,SimpleNotificationsComponent} from "angular2-notifications";
import {FormSubscription} from "../helpers/form-subscription";
import {FormUpdate} from "../helpers/form-update";
import { Observable } from 'rxjs/Observable';
@Component({
  selector: 'app-category-form',
  templateUrl: './category-form.component.html',
  styles: []
})
export class CategoryFormComponent implements OnInit {
  category : Category;
  categoryForm : FormGroup;
  formSubscribe : FormSubscription;
  categories : Category[];
  model : string = 'category';
  imageL : string = 'imageL';
  imageS : string = 'imageS';
  public active = true;
  update : boolean = false;
  isUpdatedImageL : boolean = false;
  isUpdatedImageS : boolean = false;
  validationMessages = {
    'title' : {
      'required' : 'Category Name is required.',
      'minlength' : 'Category Mame must be at least 5 characters long.'
    },
    'desc' : {
      'required' : 'Category Description is required.',
      'minlength' : 'Category Description must be at least 10 characters long.'
    }
  };

  formErrors = {
    'title' : '',
    'desc' : ''
  };


  constructor(private categoryService : CategoryService,
              private router : Router,
              private _fb : FormBuilder,private notificationsService : NotificationsService) { }

  ngOnInit() {
    this.categoryForm = this._fb.group({
      title : ['',[Validators.required,Validators.minLength(5)]],
      desc : ['',[Validators.required,Validators.minLength(10)]],
      parent : [''],
      imageL : [''],
      imageS : [''],
      slug : ['']
    });

    this.formSubscribe = new FormSubscription(this.validationMessages,this.formErrors,this.categoryForm);

    var form = this.categoryForm.valueChanges;
    form.subscribe(data => this.formSubscribe.subscribeToFormChanges(data));
    this.formSubscribe.subscribeToFormChanges();

    this.loadCategories();
  }

  save(e) {
    this.category = this.categoryForm.value;

    if(!this.category.parent) {
      delete this.category.parent;
    }

    if(!this.category.slug) {
      delete this.category.slug;
    }

    if(!this.update) {
      this.categoryService.create(this.category).subscribe(
        data => {
          this.notificationsService.success('Category',`Category ${this.category.title} added successfully`);
          this.reset();
        },
        error => {
          this.notificationsService.error('Category',`Category ${this.category.title} cannot be added`);
        });
    } else {
      console.log(this.category);
      this.categoryService.update(this.category).subscribe(
        data => {
          this.notificationsService.success('Category',`Category ${this.category.title} updated successfully`);
          this.reset();
        },
        error => {
          this.notificationsService.error('Category',`Category ${this.category.title} cannot be updated`);
        });
    }

    if(e) {
      e.preventDefault();
    }
  }

  private reset() {
    this.category = null;
    this.loadCategories();
    this.categoryForm.reset();
    this.isUpdatedImageL = false;
    this.isUpdatedImageS = false;
  }

  setImage(data:any) {
    if(data && data.imageL) {
      if(this.category && this.category.imageL) {
        this.deleteImage(this.category.imageL);
      }

      this.categoryForm.controls['imageL'].patchValue(data.imageL);
      this.isUpdatedImageL = true;
    } else if (data && data.imageS) {
      if(this.category && this.category.imageS) {
        this.deleteImage(this.category.imageS);
      }
      this.categoryForm.controls['imageS'].patchValue(data.imageS);
      this.isUpdatedImageS = true;
    }

    this.category = this.categoryForm.value;
  }

  edit(category : Category) {
    this.update = true;
    let formUpdate = new FormUpdate();
    formUpdate.initFormGroup(this.categoryForm,category);
    this.category = category;
  }

  cancel() {
    this.update = false;
    let category : Category = this.categoryForm.value;
    this.category = null;
    this.categoryForm.reset();
    console.log(category);
    if(category && category.imageS) {
      this.deleteImage(category.imageS);
    }

    if(category && category.imageL) {
      this.deleteImage(category.imageL);
    }

  }

  canDeactivate() : Promise<boolean> | boolean {

    this.category = this.categoryForm.value;
    console.log(this.category);
    if(this.category && this.category.imageS && this.isUpdatedImageS) {
      this.deleteImage(this.category.imageS);
    }

    if(this.category && this.category.imageL && this.isUpdatedImageL) {
      this.deleteImage(this.category.imageL);
    }

    return true;
  }

  private isImageChanged(field : string) {
    console.log(`${field} : ${this.categoryForm.controls[field].touched}`);
    return this.categoryForm.controls[field].touched
  }

  private loadCategories() {
    this.categoryService.getCategories().subscribe( data => {this.categories = data}, error => {});
  }

  deleteCategory(category : Category) {
    if(category && category.imageS) {
      this.deleteImage(category.imageS,false);
    }

    if(category && category.imageL) {
      this.deleteImage(category.imageL,false);
    }

    this.categoryService.delete(category.categoryId).subscribe(
      data => {
        this.notificationsService.success('Category',`Category ${category.title} deleted successfully`);
        this.loadCategories();
      },
      error => {
        this.notificationsService.success('Category',`Category ${category.title} cannot be deleted.`);
      }
    );
  }

  private deleteImage(field : String,notify? : boolean) : void {
    this.categoryService.deleteImage(field.substr(field.lastIndexOf('/') + 1))
      .subscribe(data => {
        if(notify) {
          this.notificationsService.success('Category','Image deleted successfully');
        }

        },
        error => {
          if(notify){
            this.notificationsService.error('Category','Image cannot be deleted');
          }

        });
  }
}
