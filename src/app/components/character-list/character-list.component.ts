import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { Subject, combineLatest } from 'rxjs';
import { takeUntil, map, startWith } from 'rxjs/operators';
import { SwapiService } from '../../services/swapi.service';
import { Character, Film, Species, FilterCriteria } from '../../models/characters.interface';
import { CommonModule } from '@angular/common';
import { FilterComponent } from '../filter/filter.component';

@Component({
  selector: 'app-character-list',
  standalone: true,
  imports: [CommonModule, FilterComponent],
  templateUrl: './character-list.component.html',
  styleUrls: ['./character-list.component.scss']
})
export class CharacterListComponent implements OnInit, OnDestroy {
  characters: Character[] = [];
  filteredCharacters: Character[] = [];
  films: Film[] = [];
  species: Species[] = [];
  
  loading = true;
  error: string | null = null;
  
  private destroy$ = new Subject<void>();
  private filterSubject = new Subject<FilterCriteria>();

  constructor(
    private swapiService: SwapiService,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.loadData();
    this.setupFiltering();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

   loadData(): void {
    combineLatest([
      this.swapiService.getAllCharacters(),
      this.swapiService.getAllFilms(),
      this.swapiService.getAllSpecies()
    ]).pipe(
      takeUntil(this.destroy$)
    ).subscribe({
      next: ([characters, films, species]) => {
        console.log('Characters:', characters, films, species);
        this.characters = characters;
        this.filteredCharacters = characters;
        this.films = films.sort((a, b) => a.episode_id - b.episode_id);
        this.species = species.sort((a, b) => a.name.localeCompare(b.name));
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading data:', error);
        this.error = 'Failed to load Star Wars characters. Please try again later.';
        this.loading = false;
      }
    });
  }

  private setupFiltering(): void {
    this.filterSubject.pipe(
      startWith({
        selectedFilm: '',
        selectedSpecies: '',
        birthYearStart: null,
        birthYearEnd: null
      } as FilterCriteria),
      map(filters => this.applyFilters(filters)),
      takeUntil(this.destroy$)
    ).subscribe(filtered => {
      this.filteredCharacters = filtered;
    });
  }

  private applyFilters(filters: FilterCriteria): Character[] {
    return this.characters.filter(character => {
      // Filter by film
      if (filters.selectedFilm && !character.films.includes(filters.selectedFilm)) {
        return false;
      }

      // Filter by species
      if (filters.selectedSpecies && !character.species.includes(filters.selectedSpecies)) {
        return false;
      }

      // Filter by birth year range
      if (filters.birthYearStart !== null || filters.birthYearEnd !== null) {
        const birthYear = this.parseBirthYear(character.birth_year);
        if (birthYear === null) return false;

        if (filters.birthYearStart !== null && birthYear < filters.birthYearStart) {
          return false;
        }

        if (filters.birthYearEnd !== null && birthYear > filters.birthYearEnd) {
          return false;
        }
      }

      return true;
    });
  }

  private parseBirthYear(birthYear: string): number | null {
    if (!birthYear || birthYear === 'unknown') return null;
    
    // Handle BBY (Before Battle of Yavin) and ABY (After Battle of Yavin)
    const match = birthYear.match(/^([0-9.]+)(BBY|ABY)$/i);
    if (!match) return null;
    
    const year = parseFloat(match[1]);
    const era = match[2].toUpperCase();
    
    // Convert to a single timeline (BBY = negative, ABY = positive)
    return era === 'BBY' ? -year : year;
  }

  onFilterChange(filters: FilterCriteria): void {
    this.filterSubject.next(filters);
  }

  onCharacterSelect(character: Character): void {
    console.log('Selected character:', character);
    const characterId = this.swapiService.extractIdFromUrl(character.url);
    this.router.navigate(['/characters', characterId]);
  }

  getCharacterDisplayName(character: Character): string {
    return character.name || 'Unknown Character';
  }

  trackByCharacterUrl(index: number, character: Character): string {
    return character.url;
  }
}