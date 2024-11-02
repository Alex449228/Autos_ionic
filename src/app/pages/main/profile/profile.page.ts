import { Component, inject, OnInit } from '@angular/core';
import { User } from 'src/app/models/user.model';
import { Vehicle } from 'src/app/models/vehicle.model';
import { FirebaseService } from 'src/app/services/firebase.service';
import { UtilsService } from 'src/app/services/utils.service';
import { AddUpdateProductComponent } from 'src/app/shared/components/add-update-product/add-update-product.component';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.page.html',
  styleUrls: ['./profile.page.scss'],
})
export class ProfilePage implements OnInit {

  firebaseSvc = inject(FirebaseService);
  utilsSvc = inject(UtilsService);

  user: User;
  products: Vehicle[] = [];

  ngOnInit() {
    this.user = this.utilsSvc.getFromLocalStorage('user');
    this.getProducts();
  }

  getProducts() {
    let path = `users/${this.user.uid}/products`;

    this.firebaseSvc.getCollectionData(path).subscribe({
      next: (res: any) => {
        this.products = res;
      }
    });
  }

  async addUpdateProduct(product?: Vehicle) {
    let success = await this.utilsSvc.presentModal({
      component: AddUpdateProductComponent,
      cssClass: 'add-update-modal',
      componentProps: { product }
    });
    if (success) this.getProducts();
  }

  async confirmDeleteProduct(product: Vehicle) {
    this.utilsSvc.presentAlert({
      header: 'Eliminar Producto',
      message: '¿Quieres eliminar este producto?',
      buttons: [
        {
          text: 'Cancelar',
        }, {
          text: 'Si, eliminar',
          handler: () => {
            this.deleteProduct(product);
          }
        }
      ]
    });
  }

  async deleteProduct(product: Vehicle) {
    let path = `users/${this.user.uid}/products/${product.id}`;

    const loading = await this.utilsSvc.loading();
    await loading.present();

    let imagePath = await this.firebaseSvc.getFilePath(product.image);
    await this.firebaseSvc.deleteFile(imagePath);

    this.firebaseSvc
      .deleteDocument(path)
      .then(async (res) => {
        this.products = this.products.filter(p => p.id !== product.id);

        this.utilsSvc.presentToast({
          message: 'Producto eliminado exitosamente',
          duration: 1500,
          color: 'success',
          position: 'middle',
          icon: 'checkmark-circle-outline',
        });
      })
      .catch((error) => {
        console.log(error);

        this.utilsSvc.presentToast({
          message: error.message,
          duration: 2500,
          color: 'primary',
          position: 'middle',
          icon: 'alert-circle-outline',
        });
      })
      .finally(() => {
        loading.dismiss();
      });
  }
}
