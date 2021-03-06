import { Component, OnInit, Input } from '@angular/core';
import {FormBuilder, FormControl, FormGroup,FormArray,Validators} from '@angular/forms';
/*import {CategoryService} from '../category/category.module';*/
import {ProductService, Product} from "./product.service";
import {Router} from '@angular/router';
import {NotificationsService,SimpleNotificationsComponent} from "angular2-notifications";
import {FormSubscription} from "../helpers/form-subscription";
import {FormUpdate} from "../helpers/form-update";
import { Observable } from 'rxjs/Observable';
import {Image} from '../shared/image';
import {CategoryService,Category} from "../category/category.service";
import {Variation} from "./product.service";
import { FroalaEditorModule, FroalaViewModule } from 'angular-froala-wysiwyg';
import {User} from '../login/User';
import {AuthenticationService} from '../login/authentication.service';
@Component({
  selector: 'app-product-form',
  templateUrl: './product-form.component.html',
  styles: []
})
export class ProductFormComponent implements OnInit {
  @Input() category : string;
  @Input() variationValues : string[] = [];
  @Input() tag : string;
  product : Product;
  productForm : FormGroup;
  formSubscribe : FormSubscription;
  model : string = 'product';
  public active = true;
  update : boolean = false;
  categories : Category[];
  displayType : string[] = ['Checkbox','Radio','Dropdown','Text'];
  variations : Array<any>;
  variationForm : FormGroup;
  optionValues : string[][] = [];
  user : User;
  validationMessages = {
    'title' : {
      'required' : 'Product Name is required.',
      'minlength' : 'Product Name must be at least 5 characters long.'
    },
    'shortDescription' : {
      'required' : 'Product Description is required.',
      'minlength' : 'Product Description must be at least 20 characters long.'
    }
  };

  formErrors = {
    'title' : '',
    'shortDescription' : ''
  };

  variationValidationMessages = {
    name : 'Product variation name is required'
  };

  variationFormErrors = {
    name : ''
  };

  public editorOptions: Object = {
    placeholderText: 'Edit Your Content Here!',
    heightMin: 200,
    heightMax : 300
  };

  constructor(private productService : ProductService,
              private router : Router,
              private _fb : FormBuilder,
              private notificationsService : NotificationsService,
              private categoryService : CategoryService,
              private authService : AuthenticationService) { }

  ngOnInit() {
    this.buildForm();
    this.formSubscribe = new FormSubscription(this.validationMessages,this.formErrors,this.productForm);

    var form = this.productForm.valueChanges;
    form.subscribe(data => this.formSubscribe.subscribeToFormChanges(data));
    this.formSubscribe.subscribeToFormChanges();

    this.variationForm = this._fb.group({
      variation : this._fb.array([])
    });

    this.loadCategories();
    this.productService.getVariations().subscribe(data => { this.variations = data }, error => { console.log("Failed to load variations");})
    this.user = this.authService.loggedInUser();
  }

  buildForm() {
    this.productForm = this._fb.group({
      title : ['',[Validators.required,Validators.minLength(5)]],
      fullDescription : ['',[Validators.required,Validators.minLength(10)]],
      tags : this._fb.array([]),
      showOnHomePage : false,
      markAsNew : false,
      allowReviews : true,
      sku : '',
      stockQuantity : 0,
      displayStockAvailability : false,
      displayStockQuantity : true,
      notifyQuantityBelow : true,
      displayOrder : 0,
      published : false,
      relatedProducts : this._fb.array([]),
      attributes : this._fb.array([]),
      variations : this._fb.array([]),
      specifications : this._fb.array([]),
      shortDescription : '',
      categories : this._fb.array([]),
      images : this._fb.array([]),
      price : 0,
      salesPrice : 0,
      slug : '',
      createdBy : '',
      updatedBy : '',
      updatedOn : '',
      createdOn : ''
    });

  }

  reset() {
    this.product = null;
    this.buildForm();
  }

  /** Tags **/

  addTag() {
    const control = <FormArray>this.productForm.controls["tags"];
    control.push(this.initTag());
  }

  initTag() {
    return this._fb.control(this.tag);
  }

  deleteTag(i : number) {
    const control = <FormArray>this.productForm.controls["tags"];
    control.removeAt(i);
  }

  /** Category **/

  addCategory() {
    const control = <FormArray>this.productForm.controls["categories"];
    control.push(this.initCategory());
  }

  initCategory() {
    console.log(this.category);

    return this._fb.control(this.category);
  }

  deleteCategory(i : number) {
    const control = <FormArray>this.productForm.controls["categories"];
    control.removeAt(i);
  }

  private loadCategories() {
    this.categoryService.getCategories().subscribe( data => {this.categories = data}, error => { console.log("failed to load categories");});
  }

  initAttributes() {
    return this._fb.group({
      attributeName : ['',[Validators.required]],
      attributeType : ['',[Validators.required]],
      values : [this._fb.array([]),[Validators.required]],
      displayOrder : 0
    })
  }

  addAttributes() {
    const control = <FormArray>this.productForm.controls["attributes"];
    control.push(this.initAttributes());
  }



  save(e) {
    var userObj = {
      createdBy : this.user.userName,
      updatedBy : this.user.userName,
      };

    this.productForm.patchValue(userObj);
    this.product = this.productForm.value;

    if(!this.product.slug) {
      delete this.product.slug;
    }

    delete this.product.updatedOn;
    delete this.product.createdOn;
    console.log(this.product);
    if(!this.update) {
      this.productService.create(this.product).subscribe(
        data => {
          this.notificationsService.success('Product',`Product ${this.product.title} added successfully`);
          this.reset();
        },
        error => {
          this.notificationsService.error('Product',`Product ${this.product.title} cannot be added`);
        });
    } else {
      console.log(this.product);
      this.productService.update(this.product).subscribe(
        data => {
          this.notificationsService.success('Product',`Product ${this.product.title} updated successfully`);
          this.reset();
        },
        error => {
          this.notificationsService.error('Product',`Product ${this.product.title} cannot be updated`);
        });
    }

    if(e) {
      e.preventDefault();
    }
  }


  addVariation(index : any) {
    const control = <FormArray> this.variationForm.controls["variation"];
    control.push(this.addVariationGroup(index));
  }

  selectedVariation(name : string) {
    console.log(name);
    return this.variations.filter(variation => variation.name === name).map((variation : Variation) => variation.values);
  }

  addVariationGroup(index : any) {
    this.optionValues.push(this.variations[index].values);

    if(this.variations[index].name === 'Color') {
      this.variationValues.push('#fff');
    } else {
      this.variationValues.push('');
    }


    return this._fb.group({
      name : this.variations[index].name,
      values : this._fb.array([])
    });
  }

  deleteVariation(index:number){
    const control = <FormArray> this.variationForm.get('variation');
    control.removeAt(index);
  }


  addVariationValue(index : number) {
    const control = this.variationForm.get(`variation.${index}.values`) as FormArray;
    control.push(this.initVariationValue(index));
  }

  initVariationValue(index : number) {
    return this._fb.group({value : this.variationValues[index], price : 0, quantity : 0, visible : true});
  }

  deleteVariationValue(index1 : any,index2 : number){
    const control = this.variationForm.get(`variation.${index1}.values`) as FormArray;
    control.removeAt(index2);
  }

  saveVariations() {
    const variation = this.variationForm.get('variation') as FormArray;
    this.productForm.setControl('variations',variation);
    console.log(this.productForm.get('variations').value);
  }

  edit(product : Product) {
    console.log(product);
    this.reset();
    this.update = true;
    let formUpdate = new FormUpdate(this._fb);
    product.images.forEach(image => this.addImages(image));
    formUpdate.initFormGroup(this.productForm,product);
    this.product = product;
  }

  cancel() {
    if(this.update) {
      this.edit(this.product);
    } else {
      this.update = false;
      this.product = this.productForm.value;
      this.deleteImages(this.product);
      this.reset();
    }
  }

  canDeactivate() : Promise<boolean> | boolean {
    if(!this.update) {
      this.product = this.productForm.value;
      console.log(this.product);
      this.deleteImages(this.product);
    }
    return true;
  }


  initImage(image : Image) {
    return this._fb.group({
      url : image.url,
      type : image.type,
      width : image.width,
      height : image.height,
      displayOrder : image.displayOrder
    })
  }

  addImages(image : Image) {
    const control = <FormArray>this.productForm.controls["images"];
    control.push(this.initImage(image));
  }

  setImage(data:any) {
    if(data) {
      const image : Image = new Image(data);
      this.addImages(image);
    }

    this.product = this.productForm.value;
  }

  private deleteImages(product) {
    if(product && product.images) {
      product.images.forEach( (data : Image) => {
        this.deleteImage(data.url,false,false);
      });
    }
  }

  public deleteImage(field : string,notify : boolean = false,updateProduct : boolean = true) : void {
    this.productService.deleteImage(field.substr(field.lastIndexOf('/') + 1))
      .subscribe(data => {
          if(notify) {
            this.notificationsService.success('Category','Image deleted successfully');
          }

          /*if(updateProduct) {
            let images : Image[];
            images = this.product.images.filter(image => {
              return image.url.indexOf(field) === -1;
            });

            this.product.images = images;
            this.updateProduct(false);
            this.edit(this.product);
          }*/
        },
        error => {
          if(notify){
            this.notificationsService.error('Category','Image cannot be deleted');
          }
        });
  }
}
