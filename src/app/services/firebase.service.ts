import { inject, Injectable } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import {
  createUserWithEmailAndPassword,
  getAuth,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  updateProfile,
} from 'firebase/auth';
import { User } from '../models/user.model';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import {
  getFirestore,
  setDoc,
  doc,
  getDoc,
  addDoc,
  collection,
  collectionData,
  query,
  updateDoc,
  deleteDoc,
} from '@angular/fire/firestore';
import { UtilsService } from './utils.service';
import { AngularFireStorage } from '@angular/fire/compat/storage';
import {
  getStorage,
  uploadString,
  ref,
  getDownloadURL,
  deleteObject,
} from 'firebase/storage';

@Injectable({
  providedIn: 'root',
})
export class FirebaseService {
  auth = inject(AngularFireAuth);
  firestore = inject(AngularFirestore);
  storage = inject(AngularFireStorage);
  utilsSvc = inject(UtilsService);

  // ======== Autenticación de los usuarios ===========
  getAuth() {
    return getAuth();
  }

  // ======== Acceder a la app ========
  signIn(user: User) {
    return signInWithEmailAndPassword(getAuth(), user.email, user.password);
  }

  // ======== Registrar o crear usuario ========
  signUp(user: User) {
    return createUserWithEmailAndPassword(getAuth(), user.email, user.password);
  }

  // ======== Actualizar el usuario ========
  updateUser(displayName: string) {
    return updateProfile(getAuth().currentUser, { displayName });
  }

  // ======== Enviar email para restablecer el password ========
  async sendRecoveryEmail(email: string) {
    try {
      await sendPasswordResetEmail(getAuth(), email);
    } catch (error) {
      if (error.code === 'auth/user-not-found') {
        throw new Error('user-not-found');
      } else if (error.code === 'auth/invalid-email') {
        throw new Error('invalid-email');
      } else {
        throw new Error('unknown-error');
      }
    }
  }

  // ======== Cerrar sesión ===========
  async signOut() {
    try {
      await getAuth().signOut(); // Espera a que se cierre la sesión
      localStorage.removeItem('user'); // Elimina el usuario del almacenamiento local
      this.utilsSvc.routerLink('/auth'); // Redirigir a la página de autenticación
    } catch (error) {
      console.error('Error al cerrar sesión: ', error); // Manejo de errores
    }
  }

  // ======== Base de datos ===========

  // ========== Mostrar datos de la publicacion ============
  getCollectionData(path: string, collectionQuery?: any) {
    const ref = collection(getFirestore(), path);
    return collectionData(query(ref, collectionQuery), { idField: 'id' });
  }

  setDocument(path: string, data: any) {
    return setDoc(doc(getFirestore(), path), data);
  }

  // ========== Actualizar ==========
  async updateDocument(path: string, data: any) {
    const user = this.utilsSvc.getFromLocalStorage('user');
    const dataWithSeller = {
      ...data,
      sellerName: user.name || user.displayName,
      sellerUid: user.uid,
      sellerEmail: user.email
    };
    return updateDoc(doc(getFirestore(), path), dataWithSeller);
  }

  // ========== Eliminar ==========
  deleteDocument(path: string) {
    return deleteDoc(doc(getFirestore(), path));
  }

  // ============== Obtener datos del usuario cuando ingresa ===================
  async getDocument(path: string) {
    return (await getDoc(doc(getFirestore(), path))).data();
  }

  // ========= Subir publicaciones ===========
  async addDocument(path: string, data: any) {
    const user = this.utilsSvc.getFromLocalStorage('user');
    const dataWithSeller = {
      ...data,
      sellerName: user.name || user.displayName,
      sellerUid: user.uid,
      sellerEmail: user.email
    };
    return addDoc(collection(getFirestore(), path), dataWithSeller);
  }

  // ========== Almacenamiento =============

  // ========== Subir imagenes ==============
  async uploadImage(path: string, data_url: string) {
    return uploadString(ref(getStorage(), path), data_url, 'data_url').then(
      () => {
        return getDownloadURL(ref(getStorage(), path));
      }
    );
  }

  // ============ Obtener ruta img con su URL ================
  async getFilePath(url: string) {
    return ref(getStorage(), url).fullPath;
  }

  // ========== Eliminar archivos storage =============
  deleteFile(path: string) {
    return deleteObject(ref(getStorage(), path));
  }
}
