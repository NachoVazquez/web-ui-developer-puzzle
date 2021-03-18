import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Actions, createEffect, ofType, OnInitEffects } from '@ngrx/effects';
import { of } from 'rxjs';
import {
  catchError,
  concatMap,
  delay,
  exhaustMap,
  map,
  switchMap,
  tap,
} from 'rxjs/operators';
import { ReadingListItem } from '@tmo/shared/models';
import * as ReadingListActions from './reading-list.actions';
import { MatSnackBar } from '@angular/material/snack-bar';

@Injectable()
export class ReadingListEffects implements OnInitEffects {
  loadReadingList$ = createEffect(() =>
    this.actions$.pipe(
      ofType(ReadingListActions.init),
      exhaustMap(() =>
        this.http.get<ReadingListItem[]>('/api/reading-list').pipe(
          map((data) =>
            ReadingListActions.loadReadingListSuccess({ list: data })
          ),
          catchError((error) =>
            of(ReadingListActions.loadReadingListError({ error }))
          )
        )
      )
    )
  );

  addBook$ = createEffect(() =>
    this.actions$.pipe(
      ofType(ReadingListActions.addToReadingList),
      concatMap(({ book }) =>
        this.http.post('/api/reading-list', book).pipe(
          map(() => ReadingListActions.confirmedAddToReadingList({ book })),
          catchError(() =>
            of(ReadingListActions.failedAddToReadingList({ book }))
          )
        )
      )
    )
  );

  removeBook$ = createEffect(() =>
    this.actions$.pipe(
      ofType(ReadingListActions.removeFromReadingList),
      concatMap(({ item }) =>
        this.http.delete(`/api/reading-list/${item.bookId}`).pipe(
          map(() =>
            ReadingListActions.confirmedRemoveFromReadingList({ item })
          ),
          catchError(() =>
            of(ReadingListActions.failedRemoveFromReadingList({ item }))
          )
        )
      )
    )
  );

  confirmedRemoveFromReadingList$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(ReadingListActions.confirmedRemoveFromReadingList),
      switchMap(({ item }) =>
        this.snackbar
          .open(`The book ${item.title} was removed!`, 'Undo', {
            duration: 4000,
          })
          .onAction()
          .pipe(
            map(() => ReadingListActions.undoRemoveFromReadingList({ item }))
          )
      )
    );
  });

  undoRemoveFromReadingList$ = createEffect(() =>
    this.actions$.pipe(
      ofType(ReadingListActions.undoRemoveFromReadingList),
      map(({ item }) =>
        ReadingListActions.addToReadingList({
          book: { ...item, id: item.bookId },
        })
      )
    )
  );

  confirmedAddToReadingList$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(ReadingListActions.confirmedAddToReadingList),
      switchMap(({ book }) =>
        this.snackbar
          .open(`The book ${book.title} was added!`, 'Undo', { duration: 4000 })
          .onAction()
          .pipe(map(() => ReadingListActions.undoAddToReadingList({ book })))
      )
    );
  });

  undoAddToReadingList$ = createEffect(() =>
    this.actions$.pipe(
      ofType(ReadingListActions.undoAddToReadingList),
      map(({ book }) =>
        ReadingListActions.removeFromReadingList({
          item: { ...book, bookId: book.id },
        })
      )
    )
  );

  ngrxOnInitEffects() {
    return ReadingListActions.init();
  }

  constructor(
    private actions$: Actions,
    private http: HttpClient,
    private snackbar: MatSnackBar
  ) {}
}
