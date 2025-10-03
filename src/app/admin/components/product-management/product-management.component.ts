import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { AdminService, Product } from '../../services/admin.service';

@Component({
  selector: 'app-product-management',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './product-management.component.html',
  styleUrls: ['./product-management.component.scss']
})
export class ProductManagementComponent implements OnInit {
  private adminService = inject(AdminService);
  private fb = inject(FormBuilder);

  products: Product[] = [];
  filteredProducts: Product[] = [];
  selectedProduct: Product | null = null;
  productForm: FormGroup;
  isEditing = false;
  searchTerm = '';
  categoryFilter = '';
  stockFilter = '';

  categories = ['shirts', 'pants', 'dresses', 'shoes', 'accessories', 'jackets'];
  stockFilters = [
    { value: '', label: 'All Stock Levels' },
    { value: 'in-stock', label: 'In Stock (>10)' },
    { value: 'low-stock', label: 'Low Stock (1-10)' },
    { value: 'out-of-stock', label: 'Out of Stock (0)' }
  ];

  constructor() {
    this.productForm = this.fb.group({
      name: ['', [Validators.required]],
      description: ['', [Validators.required]],
      price: [0, [Validators.required, Validators.min(0)]],
      stock: [0, [Validators.required, Validators.min(0)]],
      sku: ['', [Validators.required]],
      category: ['', [Validators.required]],
      imageUrl: [''],
      isActive: [true]
    });
  }

  ngOnInit(): void {
    this.loadProducts();
  }

  loadProducts(): void {
    this.adminService.getAllProducts().subscribe({
      next: (products: Product[]) => {
        this.products = products;
        this.filterProducts();
      },
      error: (error: any) => {
        console.error('Error loading products:', error);
      }
    });
  }

  filterProducts(): void {
    this.filteredProducts = this.products.filter(product => {
      const matchesSearch = !this.searchTerm || 
        product.name.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        product.sku.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        product.description.toLowerCase().includes(this.searchTerm.toLowerCase());
      
      const matchesCategory = !this.categoryFilter || product.category === this.categoryFilter;
      
      let matchesStock = true;
      if (this.stockFilter) {
        switch (this.stockFilter) {
          case 'in-stock':
            matchesStock = product.stock > 10;
            break;
          case 'low-stock':
            matchesStock = product.stock > 0 && product.stock <= 10;
            break;
          case 'out-of-stock':
            matchesStock = product.stock === 0;
            break;
        }
      }
      
      return matchesSearch && matchesCategory && matchesStock;
    });
  }

  onSearchChange(): void {
    this.filterProducts();
  }

  onCategoryFilterChange(): void {
    this.filterProducts();
  }

  onStockFilterChange(): void {
    this.filterProducts();
  }

  selectProduct(product: Product): void {
    this.selectedProduct = product;
    this.isEditing = true;
    this.productForm.patchValue({
      name: product.name,
      description: product.description,
      price: product.price,
      stock: product.stock,
      sku: product.sku,
      category: product.category,
      imageUrl: product.imageUrl,
      isActive: product.isActive
    });
  }

  createNewProduct(): void {
    this.selectedProduct = null;
    this.isEditing = true;
    this.productForm.reset({
      price: 0,
      stock: 0,
      isActive: true
    });
  }

  saveProduct(): void {
    if (this.productForm.valid) {
      const productData = this.productForm.value;
      
      if (this.selectedProduct) {
        // Update existing product
        const updatedProduct = { ...this.selectedProduct, ...productData };
        this.adminService.updateProduct(updatedProduct.id, updatedProduct).subscribe({
          next: () => {
            this.loadProducts();
            this.cancelEdit();
          },
          error: (error) => {
            console.error('Error updating product:', error);
          }
        });
      } else {
        // Create new product
        this.adminService.createProduct(productData).subscribe({
          next: () => {
            this.loadProducts();
            this.cancelEdit();
          },
          error: (error) => {
            console.error('Error creating product:', error);
          }
        });
      }
    }
  }

  deleteProduct(productId: number): void {
    if (confirm('Are you sure you want to delete this product?')) {
      this.adminService.deleteProduct(productId).subscribe({
        next: () => {
          this.loadProducts();
          if (this.selectedProduct?.id === productId) {
            this.cancelEdit();
          }
        },
        error: (error) => {
          console.error('Error deleting product:', error);
        }
      });
    }
  }

  toggleProductStatus(productId: number): void {
    const product = this.products.find(p => p.id === productId);
    if (product) {
      const updatedProduct = { ...product, isActive: !product.isActive };
      this.adminService.updateProduct(productId, updatedProduct).subscribe({
        next: () => {
          this.loadProducts();
        },
        error: (error) => {
          console.error('Error updating product status:', error);
        }
      });
    }
  }

  cancelEdit(): void {
    this.isEditing = false;
    this.selectedProduct = null;
    this.productForm.reset();
  }

  getTotalValue(): number {
    return this.filteredProducts.reduce((total, product) => total + (product.price * product.stock), 0);
  }

  getLowStockCount(): number {
    return this.filteredProducts.filter(product => product.stock <= 10 && product.stock > 0).length;
  }

  getOutOfStockCount(): number {
    return this.filteredProducts.filter(product => product.stock === 0).length;
  }

  generateSKU(): void {
    const timestamp = Date.now().toString().slice(-6);
    const randomStr = Math.random().toString(36).substr(2, 4).toUpperCase();
    this.productForm.patchValue({
      sku: `CLT-${randomStr}-${timestamp}`
    });
  }
}