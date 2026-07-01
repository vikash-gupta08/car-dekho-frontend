import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';

import { CarMatchmaker } from './car-matchmaker';

describe('CarMatchmaker', () => {
  let component: CarMatchmaker;
  let fixture: ComponentFixture<CarMatchmaker>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CarMatchmaker],
    }).compileComponents();

    fixture = TestBed.createComponent(CarMatchmaker);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should build a shortlist with five recommendations when provided', () => {
    const recommendations = [
      { name: 'Apex Family Cruiser', type: 'Hybrid Mid-Size SUV', matchScore: 98, matchReason: 'Top choice', topMatch: true },
      { name: 'Volt Urban Wagon', type: 'All-Electric Crossover', matchScore: 88, matchReason: 'Budget fit' },
      { name: 'Terra Ridge 4WD', type: 'Full-Size Adventure SUV', matchScore: 74, matchReason: 'Good space' },
      { name: 'City Pulse', type: 'Compact Hatchback', matchScore: 69, matchReason: 'Great commute' },
      { name: 'Trailblazer X', type: 'Adventure SUV', matchScore: 63, matchReason: 'Strong off-road' },
    ];

    const shortlist = component.buildVehicleShortlist(recommendations as any);

    expect(shortlist.length).toBe(5);
    expect(shortlist[0].name).toBe('Apex Family Cruiser');
    expect(shortlist[0].isTopMatch).toBeTrue();
  });

  it('should pad the shortlist to three cards when the backend returns fewer items', () => {
    const recommendations = [
      { name: 'Apex Family Cruiser', type: 'Hybrid Mid-Size SUV', matchScore: 98, matchReason: 'Top choice', topMatch: true },
      { name: 'Volt Urban Wagon', type: 'All-Electric Crossover', matchScore: 88, matchReason: 'Budget fit' },
    ];

    const shortlist = component.buildVehicleShortlist(recommendations as any);

    expect(shortlist.length).toBe(3);
    expect(shortlist[0].name).toBe('Apex Family Cruiser');
    expect(shortlist[2].name).toBe('Terra Ridge 4WD');
  });
});
