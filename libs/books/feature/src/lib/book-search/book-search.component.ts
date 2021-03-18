import {
  ChangeDetectionStrategy,
  Component,
  OnDestroy,
  OnInit,
} from '@angular/core';
import { Store } from '@ngrx/store';
import {
  addToReadingList,
  clearSearch,
  getAllBooks,
  ReadingListBook,
  searchBooks,
} from '@tmo/books/data-access';
import { FormBuilder, FormControl } from '@angular/forms';
import { Book } from '@tmo/shared/models';
import { BehaviorSubject, combineLatest, Observable, Subject } from 'rxjs';
import { trackByField } from '@tmo/shared/utils';
import {
  debounceTime,
  distinctUntilChanged,
  map,
  startWith,
  takeUntil,
} from 'rxjs/operators';

@Component({
  selector: 'tmo-book-search',
  templateUrl: './book-search.component.html',
  styleUrls: ['./book-search.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BookSearchComponent implements OnInit, OnDestroy {
  trackById = trackByField();

  onDestroy$ = new Subject<void>();

  submit$ = new BehaviorSubject<void>(null);

  constructor(
    private readonly store: Store,
    private readonly fb: FormBuilder
  ) {}

  get searchTermControl(): FormControl {
    return this.searchForm.get('term') as FormControl;
  }

  get searchTerm(): string {
    return this.searchForm.value.term;
  }
  books$: Observable<ReadingListBook[]>;

  searchForm = this.fb.group({
    term: '',
  });

  ngOnInit(): void {
    this.books$ = this.store.select(getAllBooks);

    combineLatest([this.searchTermControl.valueChanges, this.submit$])
      .pipe(
        map(([term]) => term),
        debounceTime(500),
        distinctUntilChanged(),
        takeUntil(this.onDestroy$)
      )
      .subscribe({
        next: (searchTerm) => {
          this.searchBooks(searchTerm);
        },
      });
  }

  addBookToReadingList(book: Book) {
    this.store.dispatch(addToReadingList({ book }));
  }

  searchExample() {
    const exampleTerm = 'javascript';
    this.searchForm.controls.term.setValue(exampleTerm);
  }

  forceSearchBooks(): void {
    this.submit$.next();
  }

  searchBooks(searchTerm = '') {
    if (searchTerm) {
      this.store.dispatch(searchBooks({ term: searchTerm }));
    } else {
      this.store.dispatch(clearSearch());
    }
  }

  ngOnDestroy(): void {
    this.onDestroy$.next();
    this.onDestroy$.complete();
    this.submit$.complete();
  }
}
