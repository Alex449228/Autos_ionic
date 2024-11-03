// maps.component.ts
import { Component, ElementRef, ViewChild, AfterViewInit } from '@angular/core';

declare var google: any;

@Component({
  selector: 'app-maps',
  templateUrl: './maps.component.html',
  styleUrls: ['./maps.component.scss'],
})
export class MapsComponent implements AfterViewInit {
  @ViewChild('map') mapElement: ElementRef;
  map: any;

  // Coordenadas de ejemplo (Ciudad de México)
  readonly LATITUDE = 21.839721;
  readonly LONGITUDE = -102.290450;

  constructor() { }

  ngAfterViewInit() {
    this.initMap();
  }

  initMap() {
    try {
      const coords = new google.maps.LatLng(this.LATITUDE, this.LONGITUDE);
      const mapOptions = {
        center: coords,
        zoom: 14,
        mapTypeId: google.maps.MapTypeId.ROADMAP
      };

      this.map = new google.maps.Map(this.mapElement.nativeElement, mapOptions);

      new google.maps.Marker({
        map: this.map,
        position: coords,
        animation: google.maps.Animation.DROP
      });
    } catch (error) {
      console.error('Error al cargar el mapa:', error);
    }
  }
}