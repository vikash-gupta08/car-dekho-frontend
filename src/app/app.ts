import { Component, signal } from '@angular/core';
import { CarMatchmaker } from './car-matchmaker/car-matchmaker';
// import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-root',
  imports: [CarMatchmaker],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  protected readonly title = signal('car-dekho');
}
