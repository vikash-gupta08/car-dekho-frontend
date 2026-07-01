import { HttpClient, HttpClientModule } from '@angular/common/http';
import { ChangeDetectorRef, Component, inject } from '@angular/core';
import { environment } from '../../environments/environment';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
// no longer using preference-change stream; API is triggered only by button

interface CarMatch {
  name: string;
  type: string;
  score: number;
  reason: string;
  isTopMatch?: boolean;
}

interface BackendCarRecommendation {
  name: string;
  type: string;
  matchScore: number;
  matchReason: string;
  topMatch?: boolean;
}

interface BackendCarResponse {
  success: boolean;
  message: string;
  recommendations: BackendCarRecommendation[];
}

@Component({
  selector: 'app-car-matchmaker',
  standalone: true,
  imports: [CommonModule, FormsModule, HttpClientModule],
  templateUrl: './car-matchmaker.html',
  styleUrls: ['./car-matchmaker.css'],
})
export class CarMatchmaker {
  private readonly http = inject(HttpClient);
  private readonly cdr = inject(ChangeDetectorRef);
  // Backend base URL comes from environment files. Falls back to localhost if missing.
  private readonly base = environment?.backendBaseUrl ?? 'http://localhost:8081';
  private readonly backendUrl = this.base + '/api/car-matchmaker/match';

  maxBudget: number = 15000;
  primaryUse: string = 'family';
  topPriority: string = 'fuel';
  isSubmitting = false;
  errorMessage = '';
  // preference changes no longer auto-submit
  vehicleShortlist: CarMatch[] = [
    {
      name: 'Apex Family Cruiser',
      type: 'Hybrid Mid-Size SUV',
      score: 98,
      reason: '★ Matches your 5-Star Safety priority perfectly.',
      isTopMatch: true,
    },
    {
      name: 'Volt Urban Wagon',
      type: 'All-Electric Crossover',
      score: 88,
      reason: 'Fits well within your budget limit.',
    },
    {
      name: 'Terra Ridge 4WD',
      type: 'Full-Size Adventure SUV',
      score: 74,
      reason: 'Excellent space, but higher daily running costs.',
    },
  ];

  submitPreferences(): void {
    this.isSubmitting = true;
    this.errorMessage = '';

    const requestPayload = {
      maxBudget: this.maxBudget,
      primaryUse: this.primaryUse,
      topPriority: this.topPriority,
    };

    this.http.post<BackendCarResponse>(this.backendUrl, requestPayload).subscribe({
      next: (response) => {
        if (response.success && response.recommendations?.length) {
          this.vehicleShortlist = this.buildVehicleShortlist(response.recommendations);
        } else {
          this.errorMessage = response.message || 'No matches were returned.';
          this.vehicleShortlist = this.buildVehicleShortlist([]);
        }
          finish();
      },
      error: () => {
        this.errorMessage = 'Could not fetch matches from the backend. Please make sure localhost:8080 is running.';
          finish();
      },
    });
      const start = Date.now();

      const finish = () => {
        const elapsed = Date.now() - start;
        const remaining = 1000 - elapsed;
        if (remaining > 0) {
          setTimeout(() => {
            this.isSubmitting = false;
            this.cdr.markForCheck();
          }, remaining);
        } else {
          this.isSubmitting = false;
          this.cdr.markForCheck();
        }
      };
  }

  // No lifecycle hooks required for auto-submission; API is called on button click only

  buildVehicleShortlist(recommendations: BackendCarRecommendation[]): CarMatch[] {
    const mapped = recommendations.map((car) => ({
      name: car.name,
      type: car.type,
      score: car.matchScore,
      reason: car.matchReason,
      isTopMatch: car.topMatch,
    }));

    const fallbackCars: CarMatch[] = [
      {
        name: 'Apex Family Cruiser',
        type: 'Hybrid Mid-Size SUV',
        score: 98,
        reason: '★ Matches your 5-Star Safety priority perfectly.',
        isTopMatch: true,
      },
      {
        name: 'Volt Urban Wagon',
        type: 'All-Electric Crossover',
        score: 88,
        reason: 'Fits well within your budget limit.',
      },
      {
        name: 'Terra Ridge 4WD',
        type: 'Full-Size Adventure SUV',
        score: 74,
        reason: 'Excellent space, but higher daily running costs.',
      },
    ];

    // If backend returns 0, show 3 fallback cards. If 1-3 results, show exactly those results.
    // If more than 3, show all (allow expansion).
    if (mapped.length === 0) {
      return fallbackCars.slice(0, 3);
    }

    if (mapped.length <= 3) {
      return mapped;
    }

    return mapped;
  }

  // Return the CSS class based on match score
  getScoreClass(score: number): string {
    if (score >= 95) {
      return 'score-green';
    } else if (score >= 50) {
      return 'score-blue';
    } else {
      return 'score-red';
    }
  }

  // preference changes are applied locally; submit when user clicks button
}
