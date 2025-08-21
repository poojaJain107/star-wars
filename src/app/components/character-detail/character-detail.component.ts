import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Subject, forkJoin, of } from 'rxjs';
import { takeUntil, switchMap, catchError } from 'rxjs/operators';
import { SwapiService } from '../../services/swapi.service';
import { Character, Film, Species, Starship } from '../../models/characters.interface';
import { CommonModule, DatePipe } from '@angular/common';

// interface CharacterDetails {
//   character: Character;
//   films: Film[];
//   species: Species[];
//   starships: Starship[];
// }

@Component({
  selector: 'app-character-detail',
  standalone: true,
  imports: [CommonModule, DatePipe],
  templateUrl: './character-detail.component.html',
  styleUrls: ['./character-detail.component.scss']
})
export class CharacterDetailComponent implements OnInit, OnDestroy {
  characterDetails: any | null = null;
  loading = true;
  error: string | null = null;
  characterId: number = 0;

  private destroy$ = new Subject<void>();

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private swapiService: SwapiService
  ) { }

  ngOnInit(): void {
    this.route.params.pipe(
      takeUntil(this.destroy$),
      switchMap(params => {
        this.characterId = +params['id'];
        if (!this.characterId || this.characterId <= 0) {
          throw new Error('Invalid character ID');
        }
        return this.loadCharacterDetails(this.characterId);
      })
    ).subscribe({
      next: (details) => {
        this.characterDetails = details;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading character details:', error);
        this.error = 'Character not found or failed to load character details.';
        this.loading = false;
      }
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private loadCharacterDetails(id: number): any {
    return this.swapiService.getCharacterById(id).pipe(
      switchMap(character => {
        // Load related data in parallel
        const films$ = character.films.length > 0 
          ? forkJoin(character.films.map(url => this.swapiService.getResourceByUrl<Film>(url)))
          : of([]);

        const species$ = character.species.length > 0
          ? forkJoin(character.species.map(url => this.swapiService.getResourceByUrl<Species>(url)))
          : of([]);

        const starships$ = character.starships.length > 0
          ? forkJoin(character.starships.map(url => this.swapiService.getResourceByUrl<Starship>(url)))
          : of([]);

        return forkJoin({
          character: of(character),
          films: films$,
          species: species$,
          starships: starships$
        });
      }),
      catchError(error => {
        console.error('Error in loadCharacterDetails:', error);
        throw error;
      })
    );
  }

  goBack(): void {
    this.router.navigate(['/characters']);
  }

  getFilmDisplayName(film: Film): string {
    return `Episode ${film.episode_id}: ${film.title}`;
  }

  getCharacterPhysicalDescription(): string[] {
    if (!this.characterDetails?.character) return [];
    
    const char = this.characterDetails.character;
    const descriptions: string[] = [];

    if (char.height && char.height !== 'unknown') {
      descriptions.push(`Height: ${char.height} cm`);
    }
    
    if (char.mass && char.mass !== 'unknown') {
      descriptions.push(`Weight: ${char.mass} kg`);
    }
    
    if (char.hair_color && char.hair_color !== 'unknown' && char.hair_color !== 'n/a') {
      descriptions.push(`Hair: ${char.hair_color}`);
    }
    
    if (char.eye_color && char.eye_color !== 'unknown') {
      descriptions.push(`Eyes: ${char.eye_color}`);
    }
    
    if (char.skin_color && char.skin_color !== 'unknown') {
      descriptions.push(`Skin: ${char.skin_color}`);
    }

    return descriptions;
  }

  formatBirthYear(birthYear: string): string {
    if (!birthYear || birthYear === 'unknown') {
      return 'Unknown';
    }
    return birthYear;
  }

  formatGender(gender: string): string {
    if (!gender || gender === 'unknown') {
      return 'Unknown';
    }
    return gender.charAt(0).toUpperCase() + gender.slice(1);
  }
}