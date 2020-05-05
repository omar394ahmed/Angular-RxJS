import { Component, ChangeDetectionStrategy } from '@angular/core';

import { ProductService } from '../product.service';
import { map, tap } from 'rxjs/operators';
import { SupplierService } from 'src/app/suppliers/supplier.service';

@Component({
  selector: 'pm-product-detail',
  templateUrl: './product-detail.component.html' 
})
export class ProductDetailComponent {
  pageTitle = 'Product Detail';
  errorMessage = '';
  

  constructor(private productService: ProductService , private supplierService : SupplierService) { }
  
  selectedProduct$ = this.productService.selectedproduct$
  suppliers$ = this.productService.ProductSupplier$ ;     
    
}
