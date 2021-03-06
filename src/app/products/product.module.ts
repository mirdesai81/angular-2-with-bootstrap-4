import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {RouterModule} from '@angular/router';
import {ProductCardComponent} from "./product-card.component";
import {ProductGridComponent} from "./product-grid.component";
import {ProductListComponent} from './product-list.component';
import {ProductSearchComponent} from './product-search.component';
import {CategoryModule} from '../category/category.module';
import {ProductService} from './product.service';
import { ProductViewComponent } from './product-view.component';
import {FormsModule,ReactiveFormsModule} from '@angular/forms';
import {NavbarModule} from "../navbar/navbar.module";
import {SharedModule} from "../shared/shared.module";
import { ProductFormComponent } from './product-form.component';
import { FroalaEditorModule, FroalaViewModule } from 'angular-froala-wysiwyg';
import {ColorPickerModule} from 'ngx-color-picker';
import {ProductStockQuantityPipe} from './product-stock-quantity.pipe';
import { ProductAdminListComponent } from './product-admin-list.component';
@NgModule({
  imports : [FormsModule,ReactiveFormsModule,CommonModule,
    RouterModule,CategoryModule,SharedModule,
    FroalaEditorModule.forRoot(),FroalaViewModule.forRoot(),
    ColorPickerModule],
  declarations : [ProductCardComponent,ProductGridComponent,ProductListComponent,ProductSearchComponent, ProductViewComponent, ProductFormComponent,ProductStockQuantityPipe, ProductAdminListComponent],
  exports : [ProductCardComponent,ProductGridComponent,ProductListComponent,ProductSearchComponent, ProductViewComponent,ProductStockQuantityPipe],
  providers : [ProductService]
})
export class ProductModule {}
